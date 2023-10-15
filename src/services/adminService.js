import db from "../models/index";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/JWTAction";
import moment from "moment";
require("dotenv").config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);

let getAllUserService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        where: { role: "user" },
        attributes: {
          exclude: ["password", "updatedAt", "role"],
        },
      });
      if (users) {
        resolve({
          errCode: 0,
          errMessage: "success",
          data: users,
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
  getAllUserService: getAllUserService,
};
