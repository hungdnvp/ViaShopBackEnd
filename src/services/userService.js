import db from "../models/index";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/JWTAction";
import sendEmail from "./emailService";
import moment from "moment";
import axios from "axios";
require("dotenv").config();

const mustache = require("mustache");
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs");
const path = require("path");

const subjectMailRegister = "Chào mừng bạn đến với [TK10000đ]";
const templateMailRegisterPath = path.join(
  __dirname,
  "templateMailRegister.html"
);
const templateMailRegister = fs.readFileSync(templateMailRegisterPath, "utf-8");
let hashPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPass = await bcrypt.hashSync(password, salt);
      resolve(hashPass);
    } catch (e) {
      reject(e);
    }
  });
};

let registerService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      axios
        .get(
          `https://emailvalidation.abstractapi.com/v1/?api_key=395e56f28925475294ae17a7da7ce615&email=${data.email}`
        )
        .then(async (response) => {
          let check = response.data.is_smtp_valid.value;
          if (check) {
            const replaceMail = {
              username: data.username,
              email: data.email,
              phonenumber: data.phonenumber,
            };
            const mailContent = mustache.render(
              templateMailRegister,
              replaceMail
            );

            let hashPass = await hashPassword(data.password);
            await db.User.create({
              email: data.email,
              password: hashPass,
              username: data.username,
              phonenumber: data.phonenumber,
              balance: 0,
              role: "user",
            });
            await sendEmail(data.email, subjectMailRegister, mailContent);
            resolve({
              errCode: 0,
              errMessage: "OK",
            });
          } else {
            resolve({
              errCode: -1,
              errMessage: "Email không hợp lệ",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          resolve({
            errCode: -1,
            errMessage: "Lỗi đăng kí",
          });
        });
    } catch (e) {
      console.log("create user error");
      reject(e);
    }
  });
};

let loginService = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { username: username },
        raw: true,
      });
      if (user) {
        let check = await bcrypt.compareSync(password, user.password); // check pass
        if (check) {
          const accessToken = createToken({ email: user.email }, "12h");
          const existRefreshToken = await db.RefreshToken.findOne({
            where: { userId: user.id },
            attributes: ["refreshToken"],
          });
          let New_refreshToken = null;
          if (existRefreshToken) {
            // da ton tai refreshToken -> kiem tra het han
            New_refreshToken = existRefreshToken.refreshToken;
            jwt.verify(
              existRefreshToken.refreshToken,
              JWT_REFRESH_SECRET,
              async (err, decoded) => {
                if (err) {
                  // token het han
                  const refreshToken = createToken(
                    { email: user.email },
                    "30d",
                    JWT_REFRESH_SECRET
                  );
                  New_refreshToken = refreshToken;
                  // update refreshToken
                  await db.RefreshToken.update(
                    { refreshToken: refreshToken },
                    {
                      where: { userId: user.id },
                    }
                  );
                }
              }
            );
          } else {
            // chua ton tai refreshToken
            const refreshToken = createToken(
              { email: user.email },
              "30d",
              JWT_REFRESH_SECRET
            );
            New_refreshToken = refreshToken;
            await db.RefreshToken.create({
              userId: user.id,
              refreshToken: refreshToken,
            });
          }
          if (user.email === process.env.EMAIL_ADMIN) {
            resolve({
              errCode: 0,
              accessToken: accessToken,
              refreshToken: New_refreshToken,
              email: user.email,
              authAdmin: true,
            });
          } else {
            resolve({
              errCode: 0,
              accessToken: accessToken,
              refreshToken: New_refreshToken,
              email: user.email,
            });
          }
        } else {
          resolve({
            errCode: 2,
            errMessage: "Password is incorrect",
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMessage: "Tên tài khoản không tồn tại trong hệ thống",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let refreshTokenService = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const foundUser = await db.RefreshToken.findOne({
        where: { refreshToken: token },
        include: [
          {
            model: db.User,
            attributes: ["email"],
          },
        ],
        raw: true,
        nest: true,
      });
      if (!foundUser) resolve({ errCode: -1 });
      jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err || foundUser.User.email !== decoded.email)
          resolve({ errCode: -2 });
        const accessToken = createToken({ email: decoded.email }, "12h");
        if (decoded.email === process.env.EMAIL_ADMIN) {
          resolve({
            accessToken: accessToken,
            email: decoded.email,
            authAdmin: true,
          });
        } else
          resolve({
            accessToken: accessToken,
            email: decoded.email,
          });
      });
    } catch (err) {
      reject(err);
    }
  });
};

let changePasswordService = (email, currentPass, newPass) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        let check = await bcrypt.compareSync(currentPass, user.password); // check pass
        if (check) {
          let hasNewPass = await hashPassword(newPass);
          await db.User.update(
            {
              password: hasNewPass,
            },
            { where: { email: email } }
          );

          resolve({
            errCode: 0,
            errMessage: "Đổi mật khẩu thành công",
          });
        } else {
          resolve({
            errCode: 1,
            errMessage: "Mật khẩu hiện tại không chính xác",
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMessage: "Error from server",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getAccountInfo = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userInfo = await db.User.findOne({
        where: { email: email },
        attributes: {
          exclude: ["password", "updatedAt"],
        },
      });
      if (userInfo) {
        let formatDate = moment(userInfo.createdAt).format("YYYY-MM-DD");
        userInfo.createdAt = formatDate;
        resolve({
          errCode: 0,
          errMessage: "success",
          data: userInfo,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "account not found",
        });
      }
    } catch (e) {
      console.log("get account info err");
      reject(e);
    }
  });
};
let getAllViaOfGroup = (idGroup) => {
  return new Promise(async (resolve, reject) => {
    if (idGroup) {
      try {
        let response = await db.Via.findAll({
          where: { groupViaId: idGroup },
          attributes: {
            exclude: "updatedAt",
          },
        });
        resolve({
          errCode: 0,
          data: response,
        });
      } catch (e) {
        console.log("user get via by group id err");
        reject(e);
      }
    } else {
      try {
        const data = await db.Via.findAll({
          attributes: {
            exclude: "updatedAt",
          },
        });
        resolve({
          errCode: 0,
          data: data,
        });
      } catch (e) {
        console.log("user get all via err");
        reject(e);
      }
    }
  });
};
let getViaInfor = (idVia) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await db.Via.findOne({
        where: { id: idVia },
        attributes: {
          exclude: "updatedAt",
        },
      });
      resolve({
        errCode: 0,
        data: response,
      });
    } catch (e) {
      console.log("user get via by group id err");
      reject(e);
    }
  });
};
let getAllGroupVia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.GroupVia.findAll({
        attributes: {
          exclude: ["updatedAt"],
        },
      });
      if (data) {
        data.forEach((item, index, arr) => {
          if (item.image) {
            arr[index].image = Buffer.from(item.image).toString("binary");
          }
          // console.log(item.image);
        });

        resolve({
          errCode: 0,
          data: data,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "account not found",
        });
      }
    } catch (err) {
      console.log("get all group via error");
      reject(err);
    }
  });
};
let payMent = (data) => {
  /*
    // data = {email, viaId, quantity, }
  */
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: data.email },
        attributes: ["id", "balance"],
      });
      let via = await db.Via.findOne({
        where: { id: data.viaId },
      });
      let totalPayMent = via.price * data.quantity;
      let products = [];
      let listIdProduct = [];
      await db.Product.findAll({
        where: { viaId: data.viaId, status: "unsold" },
        attributes: ["id", "information"],
        order: [["id", "ASC"]],
        limit: data.quantity,
      })
        .then((data) => {
          console.log(data);
          data.forEach((item) => {
            products.push(item);
            listIdProduct.push(item.id);
          });
        })
        .catch((error) => {
          console.log(error);
          resolve({
            errCode: 1,
            errMessage: "không thể tạo giao dịch",
          });
        });
      if (
        !user ||
        !via ||
        !products ||
        products.length !== data.quantity ||
        user?.balance < totalPayMent
      ) {
        resolve({
          errCode: 1,
          errMessage: "không thể tạo giao dịch",
        });
      } else {
        // ----------- TRU TIEN ------
        let isPay = await db.User.update(
          { balance: user.balance - totalPayMent },
          { where: { id: user.id } }
        );
        if (isPay.length > 0) {
          console.log("number of products:", isPay.length);
          ////               CREATE TRANSACTION
          const currentTimestamp = new Date().getTime();
          let timeReverse = currentTimestamp
            .toString()
            .split("")
            .reverse()
            .join("");
          const code = (data.viaId + timeReverse).slice(0, 9);
          const detail = JSON.stringify(products);

          await db.Transaction.create({
            code: code,
            userId: user.id,
            viaId: via.id,
            viaName: via.nameVia,
            quantity: data.quantity,
            totalPayment: totalPayMent,
            detail: detail,
          });
          //    UPDATE STATUS SOLD PRODUCT
          await db.Product.update(
            { status: "sold" },
            {
              where: {
                id: listIdProduct, // Same as using `id: { [Op.in]: [1,2,3] }`
              },
            }
          );
          resolve({
            errCode: 0,
            errMessage: `Bạn đã thanh toán ${totalPayMent} đ. Vui lòng truy cập lịch sử mua hàng để xem đơn hàng !!`,
          });
        }
      }
    } catch (err) {
      console.log("payment error");
      reject(err);
    }
  });
};
module.exports = {
  registerService: registerService,
  loginService: loginService,
  changePasswordService: changePasswordService,
  refreshTokenService: refreshTokenService,
  getAccountInfo: getAccountInfo,
  getAllViaOfGroup: getAllViaOfGroup,
  getViaInfor: getViaInfor,
  getAllGroupVia: getAllGroupVia,
  payMent: payMent,
};
