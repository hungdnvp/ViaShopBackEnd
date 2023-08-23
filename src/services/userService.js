import db from "../models/index";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/JWTAction";
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

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
            let data = {
              id: user.id,
              email: user.email,
              balance: user.balance,
            };
            let access_token = createToken(data);
            delete user.password;
            resolve({
              errCode: 0,
              errMessage: "OK",
              token: access_token,
              user: user,
            });
          } else {
            resolve({
              errCode: 3,
              errMessage: "Password is incorrect",
            });
          }
        } else {
          // mail lose
          resolve({
            errCode: 2,
            errMessage: `Your's Email isn't exist in system.`,
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMessage: `Your's Email isn't exist in system.`,
        });
      }
    } catch (e) {
      reject(e);
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
let getAccountInfoService = (userId) => {
  return new Promise(async (resolve, reject) => {
    if (!userId) resolve({ errCode: 1, errMessage: "missing parameter" });
    try {
      let user = await db.User.findOne({
        where: { id: userId },
        attributes: {
          exclude: ["password"],
        },
      });
      if (user) {
        console.log(user);
        resolve({
          errCode: 0,
          errMessage: "get info User success",
          user: user,
        });
      } else {
        resolve({ errCode: 1, errMessage: "userId not found" });
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
  getAccountInfoService: getAccountInfoService,
};
