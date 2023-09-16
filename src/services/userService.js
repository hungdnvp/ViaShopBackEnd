import db from "../models/index";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/JWTAction";
import moment from "moment";
require("dotenv").config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};
let checkUserName = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { username: username },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};
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
      // check email
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already in used, Plz try another email",
        });
      } else {
        let hashPass = await hashPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPass,
          username: data.username,
          phonenumber: data.phonenumber,
          balance: 0,
          role: "user",
        });
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let loginService = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isExistUserName = await checkUserName(username);
      if (isExistUserName) {
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
              // da ton tai token
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
                      {
                        where: { userId: user.id },
                      },
                      { refreshToken: refreshToken }
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

            resolve({
              errCode: 0,
              accessToken: accessToken,
              refreshToken: New_refreshToken,
              // user: user,
            });
          } else {
            resolve({
              errCode: 2,
              errMessage: "Password is incorrect",
            });
          }
        } else {
          // mail lose
          resolve({
            errCode: 1,
            errMessage: `Email không tồn tại trong hệ thống.`,
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMessage: `Tên tài khoản không tồn tại trong hệ thống`,
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

            as: "userRefreshTokens",
            attributes: ["email"],
          },
        ],
        raw: true,
        nest: true,
      });
      console.log(foundUser);
      if (!foundUser) resolve({ errCode: -1 });

      jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err || foundUser.userRefreshTokens.email !== decoded.email)
          resolve({ errCode: -2 });
        const accessToken = createToken({ email: decoded.email }, "12h");
        resolve({ accessToken });
      });
    } catch (err) {
      reject(err);
    }
  });
};
let getAllUserService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email
      let users = await db.User.findAll({
        where: { role: "user" },
        attributes: {
          exclude: ["password"],
        },
      });
      resolve({
        errCode: 0,
        errMessage: "OK",
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};
let changePasswordService = (userId, currentPass, newPass) => {
  return new Promise(async (resolve, reject) => {
    try {
      // check email
      let user = await db.User.findOne({
        where: { id: userId },
        raw: true,
      });
      if (user) {
        let check = await bcrypt.compareSync(currentPass, user.password); // check pass
        if (check) {
          let hasNewPass = await hashPassword(newPass);
          await db.User.update(
            {
              password: hasNewPass,
            },
            { where: { id: userId } }
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
let getAccountInfo = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userInfo = await db.User.findOne({
        where: { id: userId },
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
      reject(e);
    }
  });
};
module.exports = {
  registerService: registerService,
  loginService: loginService,
  getAllUserService: getAllUserService,
  changePasswordService: changePasswordService,
  refreshTokenService: refreshTokenService,
  getAccountInfo: getAccountInfo,
};
