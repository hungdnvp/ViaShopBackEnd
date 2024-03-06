import db from "../models/index";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/JWTAction";
import sendEmail from "./emailService";
import moment from "moment";
require("dotenv").config();

const mustache = require("mustache");
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const API_CHECK_BANKING = process.env.API_CHECK_BANKING;
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs");
const path = require("path");

const subjectMailRegister = "Chào mừng bạn đến với [TK10000đ]";
const subjectMailConfirm = "Đặt Lại Mật Khẩu - [TK10000đ]";
const templateMailRegisterPath = path.join(
  __dirname,
  "templateMailRegister.html"
);
const templateMailConfirmPath = path.join(
  __dirname,
  "templateMailConfirm.html"
);
const templateMailRegister = fs.readFileSync(templateMailRegisterPath, "utf-8");
const templateMailConfirm = fs.readFileSync(templateMailConfirmPath, "utf-8");

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
      // axios // =>>>>>>>>>> valid email api checker
      //   .get(
      //     `https://emailvalidation.abstractapi.com/v1/?api_key=395e56f28925475294ae17a7da7ce615&email=${data.email}`
      //   )
      //   .then(async (response) => {
      //     if (response.status === 200) {
      //       let check = response.data.is_smtp_valid.value;
      //       if (check) {
      //         let hashPass = await hashPassword(data.password);
      //         await db.User.create({
      //           email: data.email,
      //           password: hashPass,
      //           username: data.username,
      //           phonenumber: data.phonenumber,
      //           balance: 0,
      //           role: "user",
      //         });
      //         const replaceMail = {
      //           username: data.username,
      //           email: data.email,
      //           phonenumber: data.phonenumber,
      //         };
      //         const mailContent = mustache.render(
      //           templateMailRegister,
      //           replaceMail
      //         );
      //         await sendEmail(data.email, subjectMailRegister, mailContent);
      //         resolve({
      //           errCode: 0,
      //           errMessage: "OK",
      //         });
      //       } else {
      //         resolve({
      //           errCode: -1,
      //           errMessage: "Email không hợp lệ",
      //         });
      //       }
      //     } else {
      //       resolve({
      //         errCode: -1,
      //         errMessage: "Lỗi xử lí, vui lòng thử lại !!!",
      //       });
      //     }
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     resolve({
      //       errCode: -1,
      //       errMessage: "Lỗi đăng kí",
      //     });
      //   });
      let hashPass = await hashPassword(data.password);
      await db.User.create({
        email: data.email,
        password: hashPass,
        username: data.username,
        phonenumber: data.phonenumber,
        balance: 0,
        role: "user",
      });
      const replaceMail = {
        username: data.username,
        email: data.email,
        phonenumber: data.phonenumber,
      };
      const mailContent = mustache.render(templateMailRegister, replaceMail);
      await sendEmail(data.email, subjectMailRegister, mailContent);
      resolve({
        errCode: 0,
        errMessage: "OK",
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

let changePasswordService = (email, currentPass, newPass, code = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        let changePass = false;
        let errMess =
          "mã xác nhận không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại";
        if (code) {
          let checkCode = await db.ConfirmCode.findOne({
            where: {
              email: email,
              code: code,
              expiresAt: {
                [db.Sequelize.Op.gte]: new Date(), // Kiểm tra xem expiresAt có lớn hơn hoặc bằng thời điểm hiện tại hay không
              },
            },
          });
          if (checkCode) {
            changePass = true;
          }
        } else {
          changePass = await bcrypt.compareSync(currentPass, user.password); // check pass
          errMess = "Mật khẩu hiện tại không chính xác, vui lòng kiểm tra lại";
        }
        if (changePass) {
          let hashNewPass = await hashPassword(newPass);
          await db.User.update(
            {
              password: hashNewPass,
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
            errMessage: errMess,
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMessage: "Email không tồn tại trong hệ thống",
        });
      }
    } catch (e) {
      console.log("changePass error");
      reject(e);
    }
  });
};
const generateRandomCode = () => {
  const min = 100000; // Giá trị nhỏ nhất (6 chữ số)
  const max = 999999; // Giá trị lớn nhất (6 chữ số)

  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomCode;
};

let forGotPass = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // find email
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        const code = generateRandomCode();
        const replaceMail = {
          username: user.username,
          code: code,
        };
        const expiresAt = new Date(); // Lấy thời điểm hiện tại
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        let checkConfirm = await db.ConfirmCode.findOrCreate({
          where: { email: email },
          defaults: {
            email: email,
            code: code,
            expiresAt: expiresAt,
          },
        });
        if (!checkConfirm[1]) {
          // neu da ton tai confirm cua tai khoan nay -> update code, expiresAt
          await db.ConfirmCode.update(
            {
              code: code,
              expiresAt: expiresAt,
            },
            {
              where: { email: email },
            }
          );
        }
        const mailContent = mustache.render(templateMailConfirm, replaceMail);
        await sendEmail(email, subjectMailConfirm, mailContent);
        resolve({
          errCode: 0,
          errMessage: "Vui lòng kiểm tra hộp thư Email để nhận mã xác nhận!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Email không tồn tại trong hệ thống",
        });
      }
    } catch (e) {
      console.log("error forgot password");
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
          exclude: ["password", "updatedAt", "role"],
        },
      });
      if (userInfo) {
        let formatDate = moment(userInfo.createdAt).format("YYYY-MM-DD");
        userInfo.createdAt = formatDate;
        resolve({
          errCode: 0,
          errMessage: "success",
          user: userInfo,
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
let getAllViaOfGroup = (idGroup, pagination) => {
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
      const page = pagination.current || 1;
      const limit = pagination.pageSize || 10;
      try {
        const data = await db.Via.findAll({
          attributes: {
            exclude: "updatedAt",
          },
          include: {
            model: db.GroupVia,
            attributes: ["groupViaName"],
          },
          nest: true,
          raw: true,
          offset: (page - 1) * limit,
          limit: limit,
        });
        const totalCount = await db.Via.count();
        // console.log(data);
        resolve({
          errCode: 0,
          data: data,
          total: totalCount,
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
      console.log("getVia Infor err");
      reject(e);
    }
  });
};
let getAllGroupVia = (groupViaId = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = null;
      if (groupViaId) {
        data = await db.GroupVia.findOne({
          where: { id: groupViaId },
          attributes: {
            exclude: ["updatedAt"],
          },
        });
      } else {
        data = await db.GroupVia.findAll({
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
        } else {
          resolve({
            errCode: 1,
            errMessage: "account not found",
          });
        }
      }
      resolve({
        errCode: 0,
        data: data,
      });
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
        let isPay = await db.User.increment(
          { balance: -totalPayMent },
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
            { status: "sold", owner: data.email },
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

let viewTransaction = (email, current, pageSize) => {
  return new Promise(async (resolve, reject) => {
    const page = current || 1;
    const limit = pageSize || 10;
    try {
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        let tempDetail = [];
        let tempInfor = "";
        let response = [];
        await db.Transaction.findAll({
          where: { userId: user.id },
          attributes: {
            exclude: ["id", "viaId", "updatedAt"],
          },
          offset: (page - 1) * limit,
          limit: limit,
          order: [["createdAt", "DESC"]],
        })
          .then((data) => {
            data.forEach((item, index) => {
              tempDetail = JSON.parse(item.detail);
              tempDetail.map((item) => (tempInfor += item.information + "\n"));
              data[index].detail = tempInfor.trim();
            });
            response = data;
          })
          .catch((error) => {
            console.log("error transaction list");
            resolve({
              errCode: 1,
              errMessage: "lỗi xử lý",
            });
          });
        const totalCount = await db.Transaction.count({
          where: { userId: user.id },
        });
        // response.map((item,index)=>{

        // })
        resolve({
          errCode: 0,
          data: response,
          total: totalCount,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "user Error!",
        });
      }
    } catch (e) {
      console.log("view Transaction err");
      reject(e);
    }
  });
};

let viewDeposit = (email, current, pageSize) => {
  return new Promise(async (resolve, reject) => {
    const page = current || 1;
    const limit = pageSize || 10;
    try {
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        let response = await db.Deposit.findAll({
          where: { userId: user.id },
          attributes: {
            exclude: ["id", "userId", "updatedAt"],
          },
          offset: (page - 1) * limit,
          limit: limit,
          order: [["createdAt", "DESC"]],
        });

        const totalCount = await db.Deposit.count({
          where: { userId: user.id },
        });
        // response.map((item,index)=>{

        // })
        resolve({
          errCode: 0,
          data: response,
          total: totalCount,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "user Error!",
        });
      }
    } catch (e) {
      console.log("view Deposit err");
      reject(e);
    }
  });
};
let publicMoney = (email, money, codeBanking) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(API_CHECK_BANKING);
      const result = await response.json();
      const currentDate = new Date(); // Lấy ngày hiện tại
      const currentDateString = currentDate.toISOString().slice(0, 10);
      let isOk = false;
      // Kiểm tra dữ liệu ở đây
      if (!result.error) {
        let data = result.data;
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          let date_banking = item["Ngày diễn ra"].split(" ")[0];
          let description = item["Mô tả"];
          if (
            date_banking === currentDateString &&
            description.includes(codeBanking)
          ) {
            console.log("cộng tiền");
            isOk = true;
            break;
          }
        }
      }
      if (isOk) {
        let userInfo = await db.User.findOne({
          where: { email: email },
          attributes: {
            exclude: ["password", "updatedAt", "role"],
          },
        });
        if (userInfo) {
          await db.Deposit.create({
            userId: userInfo.id,
            money: money,
            typePublish: "user",
          });
          resolve({
            errCode: 0,
            errMessage: "OK",
          });
        }
      }
    } catch (error) {
      console.log("public Money from User err");
      reject(e);
    }
  });
};
module.exports = {
  registerService: registerService,
  loginService: loginService,
  changePasswordService: changePasswordService,
  forGotPass: forGotPass,

  refreshTokenService: refreshTokenService,
  getAccountInfo: getAccountInfo,
  getAllViaOfGroup: getAllViaOfGroup,
  getViaInfor: getViaInfor,
  getAllGroupVia: getAllGroupVia,
  payMent: payMent,

  viewTransaction: viewTransaction,
  viewDeposit: viewDeposit,

  publicMoney: publicMoney,
};
