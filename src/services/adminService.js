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
let addGroupVia = (groupViaName) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.GroupVia.create({
        groupViaName: groupViaName,
      });
      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      console.log("error create group via");
      reject(e);
    }
  });
};
let getAllGroupVia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await db.GroupVia.findAll({
        attributes: {
          exclude: ["updatedAt"],
        },
      });
      if (data) {
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
let addVia = (data) => {
  return new Promise(async (resolve, reject) => {
    console.log("data add via:", data);
    try {
      await db.Via.create({
        nameVia: data.nameVia,
        groupViaId: data.groupViaId,
        price: data.price,
        discountPrice: data.discountPrice,
        discountCondition: data.discountCondition,
        quantity: 0,
        descriptions: data.descriptions,
      });
      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      console.log("error create via");
      reject(e);
    }
  });
};
let getAllVia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await db.Via.findAll({
        attributes: {
          exclude: ["updatedAt"],
        },
        include: {
          model: db.GroupVia,
          attributes: ["groupViaName"],
        },
        raw: true,
        nest: true,
      });
      if (data) {
        resolve({
          errCode: 0,
          data: data,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Via not found or empty",
        });
      }
    } catch (err) {
      console.log("get all via error");
      reject(err);
    }
  });
};
module.exports = {
  getAllUserService: getAllUserService,
  getAllGroupVia: getAllGroupVia,
  addGroupVia: addGroupVia,
  addVia: addVia,
  getAllVia: getAllVia,
};
