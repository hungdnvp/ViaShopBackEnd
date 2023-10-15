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

module.exports = {
  getAllUser: getAllUser,
};
