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
let addGroupVia = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.GroupVia.create({
        groupViaName: data.groupViaName,
        image: data.image,
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
let editVia = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.Via.update(
        {
          nameVia: data.nameVia,
          price: data.price,
          discountPrice: data.discountPrice || null,
          discountCondition: data.discountCondition || null,
          descriptions: data.descriptions,
        },
        {
          where: { id: data.id },
        }
      );

      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (err) {
      console.log("edit via error");
      console.log(err);
      reject(err);
    }
  });
};
let editGroupVia = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.image) {
        await db.GroupVia.update(
          {
            groupViaName: data.groupViaName,
          },
          {
            where: { id: data.id },
          }
        );
      } else {
        await db.GroupVia.update(
          {
            groupViaName: data.groupViaName,
            image: data.image,
          },
          {
            where: { id: data.id },
          }
        );
      }

      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (err) {
      console.log("edit group VIa error");
      reject(err);
    }
  });
};
const bulkCreateProducts = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data || data.length < 1) {
        resolve({
          errCode: 1,
          errMessage: "Missing require parameter",
        });
      } else {
        await db.Product.bulkCreate(data);
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
module.exports = {
  getAllUserService: getAllUserService,
  getAllGroupVia: getAllGroupVia,
  addGroupVia: addGroupVia,
  addVia: addVia,
  getAllVia: getAllVia,
  editVia: editVia,
  editGroupVia: editGroupVia,
  bulkCreateProducts: bulkCreateProducts,
};
