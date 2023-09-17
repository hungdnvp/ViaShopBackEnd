import userService from "../services/userService";
import { verifyToken, createToken } from "../middleware/JWTAction";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

let handleRegister = async (req, res) => {
  try {
    let message = await userService.registerService(req.body);
    return res.status(200).json(message);
  } catch (e) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};

let handleLogin = async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.status(500).json({
      errCode: 1,
      errMessage: "Missing inputs parameter !",
    });
  }
  try {
    let Data = await userService.loginService(username, password);
    if (Data && Data.errCode === 0) {
      return res
        .cookie("refreshToken", Data.refreshToken, {
          path: "/",
          httpOnly: true,
          // secure
          sameSite: "Strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          accessToken: Data.accessToken,
          email: Data.email,
        });
    } else {
      return res.status(401).json(Data);
    }
  } catch (e) {
    console.log(e);
  }
};
let getAllUser = async (req, res) => {
  try {
    let data = await userService.getAllUserService();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let handleLogOut = async (req, res) => {
  return res.cookie("refreshToken", {}, { maxAge: 1 }).status(200).json({
    errCode: 0,
    errMessage: "logout success",
  });
};
let handleAutoLogin = (req, res) => {
  const accessToken = createToken({ email: req.email });
  return res.status(200).json({ accessToken: accessToken, email: req.email });
};
let handleRefreshToken = async (req, res) => {
  console.log("get /refresh token");
  const cookies = req.cookies;
  if (!cookies.refreshToken) return res.status(401).json({ errCode: -100 });
  const refreshToken = cookies.refreshToken;
  let data = await userService.refreshTokenService(refreshToken); //
  if (data && data.accessToken) res.json(data);
  else res.status(403).json({ errCode: -5 });
};
let handleChangePassword = async (req, res) => {
  // console.log(req.headers.cookie);
  let email = req.body.email;
  let currentPass = req.body.currentPass;
  let newPass = req.body.newPass;
  if (!currentPass || !newPass || !email) {
    return res
      .status(200)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let data = await userService.changePasswordService(
        email,
        currentPass,
        newPass
      );
      return res.status(200).json(data);
    } catch (e) {
      return res
        .status(500)
        .json({ errCode: -1, errMessage: "Error from server" });
    }
  }
};
let getAccountInfo = async (req, res) => {
  let email = req.query.email;
  if (!email) {
    return res
      .status(200)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let data = await userService.getAccountInfo(email);
      return res.status(200).json(data);
    } catch (e) {
      return res
        .status(500)
        .json({ errCode: -1, errMessage: "Error from server" });
    }
  }
};
module.exports = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  getAllUser: getAllUser,
  handleLogOut,
  handleChangePassword: handleChangePassword,
  handleAutoLogin: handleAutoLogin,
  getAccountInfo: getAccountInfo,
  handleRefreshToken: handleRefreshToken,
};
