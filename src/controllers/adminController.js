import adminService from "../services/adminService";
import { verifyToken, createToken } from "../middleware/JWTAction";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

let getAllUser = async (req, res) => {
  try {
    let response = await adminService.getAllUserService();
    if (response) {
      return res.status(200).json(response.data);
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
  try {
    let response = await adminService.getAllVia();
    return res.status(200).json(response);
  } catch (e) {
    console.log("error edit via controler");
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
module.exports = {
  getAllUser: getAllUser,
  addGroupVia: addGroupVia,
  getAllGroupVia: getAllGroupVia,
  addVia: addVia,
  getAllVia: getAllVia,
  editVia: editVia,
  editGroupVia: editGroupVia,
  bulkCreateProducts: bulkCreateProducts,
};
