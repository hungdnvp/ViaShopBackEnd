import db from "../models/index";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/JWTAction";
import moment from "moment";
require("dotenv").config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const jwt = require("jsonwebtoken");
const salt = bcrypt.genSaltSync(10);

let getAllUserService = (page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        where: { role: "user" },
        attributes: {
          exclude: ["password", "updatedAt", "role"],
        },
        offset: (page - 1) * limit,
        limit: limit,
      });
      const totalCount = await db.User.count({
        where: { role: "user" },
      });
      if (users) {
        resolve({
          errCode: 0,
          errMessage: "success",
          data: users,
          total: totalCount,
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
      console.log("user get all via err");

      reject(e);
    }
  });
};
const viewProduct = (viaId, pagination) => {
  return new Promise(async (resolve, reject) => {
    const page = pagination.current || 1;
    const limit = pagination.pageSize || 10;
    try {
      let data = await db.Product.findAll({
        where: { viaId: viaId },
        attributes: {
          exclude: "updatedAt",
        },
        offset: (page - 1) * limit,
        limit: limit,
      });
      if (data && data.length > 0) {
        data.map((item, index) => {
          let formatDate = moment(data.createdAt).format("YYYY-MM-DD");
          item.createdAt = formatDate;
        });
      }
      const totalCount = await db.Product.count({
        where: { viaId: viaId },
      });
      // console.log(data);
      resolve({
        errCode: 0,
        data: data,
        total: totalCount,
      });
    } catch (e) {
      console.log("view Product error");
      reject(e);
    }
  });
};
const publicMoney = (idUser, money, type) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.Deposit.create({
        userId: idUser,
        money: money,
        typePublish: type,
      });
      // await db.User.increment({ balance: money }, { where: { id: idUser } });
      resolve({
        errCode: 0,
        errMessage: "OK",
      });
    } catch (e) {
      console.log("public Money from admin err");
      reject(e);
    }
  });
};
const getLabelDashboard = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let totalUser = await db.User.count({
        where: { role: "user" },
      });
      let totalDeposit = 100000000;
      let totalSoldProduct = await db.Product.count({
        where: { status: "sold" },
      });
      let totalDepositMonth = 99999999;
      resolve({
        errCode: 0,
        totalUser,
        totalDeposit,
        totalSoldProduct,
        totalDepositMonth,
      });
    } catch (e) {
      console.log("get Label DashBoard err");
      reject(e);
    }
  });
};
module.exports = {
  getAllUserService: getAllUserService,
  addGroupVia: addGroupVia,
  addVia: addVia,
  editVia: editVia,
  editGroupVia: editGroupVia,
  bulkCreateProducts: bulkCreateProducts,
  viewProduct: viewProduct,
  publicMoney: publicMoney,
  getLabelDashboard: getLabelDashboard,
};
