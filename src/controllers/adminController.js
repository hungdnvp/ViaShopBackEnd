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
  let groupViaName = req.query.groupViaName;
  if (!groupViaName) {
    return res
      .status(403)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let response = await adminService.addGroupVia(groupViaName);
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
module.exports = {
  getAllUser: getAllUser,
  addGroupVia: addGroupVia,
  getAllGroupVia: getAllGroupVia,
};
