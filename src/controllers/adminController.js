import adminService from "../services/adminService";
import userService from "../services/userService";
import { verifyToken, createToken } from "../middleware/JWTAction";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

let getAllUser = async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;

  if (!page || !limit) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
  try {
    page = parseInt(page);
    limit = parseInt(limit);
    let response = await adminService.getAllUserService(page, limit);
    if (response) {
      return res.status(200).json(response);
    }
  } catch (err) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let addGroupVia = async (req, res) => {
  let data = req.body;
  if (!data?.groupViaName) {
    return res
      .status(403)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let response = await adminService.addGroupVia(data);
      return res.status(200).json(response);
    } catch (e) {
      return res
        .status(500)
        .json({ errCode: -1, errMessage: "Error from server" });
    }
  }
};
let getAllGroupVia = async (req, res) => {
  try {
    let response = await adminService.getAllGroupVia();
    if (response?.errCode === 0) {
      return res.status(200).json(response.data);
    }
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let addVia = async (req, res) => {
  let data = req.body;
  try {
    let response = await adminService.addVia(data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getAllVia = async (req, res) => {
  let pagination = req.body.pagination;
  try {
    let response = await userService.getAllViaOfGroup(null, pagination);
    return res.status(200).json(response);
  } catch (e) {
    console.log("error get all via admin controler");
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let editVia = async (req, res) => {
  let editData = req.body;
  try {
    let response = await adminService.editVia(editData);
    if (response?.errCode === 0) {
      return res.status(200).json(response.data);
    }
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let editGroupVia = async (req, res) => {
  let editData = req.body;
  try {
    let response = await adminService.editGroupVia(editData);
    if (response?.errCode === 0) {
      return res.status(200).json(response.data);
    }
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let bulkCreateProducts = async (req, res) => {
  let data = req.body;
  try {
    let response = await adminService.bulkCreateProducts(data);
    if (response?.errCode === 0) {
      return res.status(200).json(response.data);
    }
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let viewProduct = async (req, res) => {
  let viaId = req.body.viaId;
  let pagination = req.body.pagination;
  if (!viaId || !pagination) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
  try {
    let response = await adminService.viewProduct(viaId, pagination);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let publicMoney = async (req, res) => {
  let userId = req.query.userId;
  let money = req.query.money;
  let typePublish = req.query.type || "admin";
  if (!userId || !money) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
  try {
    money = parseInt(money);
    let response = await adminService.publicMoney(userId, money, typePublish);
    return res.status(200).json(response);
  } catch (e) {
    console.log("error public Money controler");
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
module.exports = {
  getAllUser: getAllUser,
  addGroupVia: addGroupVia,
  getAllGroupVia: getAllGroupVia,
  addVia: addVia,
  getAllVia: getAllVia,
  editVia: editVia,
  editGroupVia: editGroupVia,
  bulkCreateProducts: bulkCreateProducts,
  viewProduct: viewProduct,
  publicMoney: publicMoney,
};
