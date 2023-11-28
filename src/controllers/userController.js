import userService from "../services/userService";
import { verifyToken, createToken } from "../middleware/JWTAction";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

let handleRegister = async (req, res) => {
  try {
    let message = await userService.registerService(req.body);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "lỗi đăng kí, tài khoản hoặc email đã tồn tại!",
    });
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
      let authAdmin = Data.email === process.env.EMAIL_ADMIN ? true : false;
      return res
        .cookie("refreshToken", Data.refreshToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          // secure
          sameSite: "Strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json(Data);
    } else {
      return res.status(401).json(Data);
    }
  } catch (e) {
    console.log(e);
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
  if (req.email === process.env.EMAIL_ADMIN) {
    return res
      .status(200)
      .json({ accessToken: accessToken, email: req.email, authAdmin: true });
  } else {
    return res.status(200).json({ accessToken: accessToken, email: req.email });
  }
};
let handleRefreshToken = async (req, res) => {
  console.log("get /refresh token");
  const cookies = req.cookies;
  if (!cookies.refreshToken) return res.status(401).json({ errCode: -100 });
  const refreshToken = cookies.refreshToken;
  let data = await userService.refreshTokenService(refreshToken); //
  if (data && data.accessToken) res.json(data);
  else {
    return res.cookie("refreshToken", {}, { maxAge: 1 }).status(200).json({
      errCode: 0,
      errMessage: "logout success",
    });
  }
};
let handleChangePassword = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let email = verifyToken(token)?.data.email || null;
  let currentPass = req.body.currentPass;
  let newPass = req.body.newPass;
  if (!currentPass || !newPass || !email) {
    return res
      .status(500)
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
let handleforGotPass = async (req, res) => {
  let email = req.query.email;
  if (!email) {
    return res
      .status(500)
      .json({ errCode: 1, errMessage: "Vui lòng cung cấp email hợp lệ" });
  } else {
    try {
      let data = await userService.forGotPass(email);
      const status = data.errCode === 0 ? 200 : 500;
      return res.status(status).json(data);
    } catch (e) {
      return res
        .status(500)
        .json({ errCode: -1, errMessage: "lỗi xử lí, Emai không hợp lệ" });
    }
  }
};
let confirmForGotPass = async (req, res) => {
  let email = req.body.email;
  let newPass = req.body.newPass;
  let code = req.body.code;
  let currentPass = null;
  if (!code || !newPass || !email) {
    return res
      .status(500)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let data = await userService.changePasswordService(
        email,
        currentPass,
        newPass,
        code
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
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let email = verifyToken(token)?.data.email || null;
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
let getAllViaOfGroup = async (req, res) => {
  let groupId = req.body.groupId || null;
  let pagination = req.body.pagination;
  try {
    let data = await userService.getAllViaOfGroup(groupId, pagination);
    return res.status(200).json(data);
  } catch (e) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};
let getViaInfor = async (req, res) => {
  let idVia = req.query.idVia;
  if (!idVia) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Missing require parameter" });
  }
  try {
    let data = await userService.getViaInfor(idVia);
    return res.status(200).json(data);
  } catch (e) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
};
let getAllGroupVia = async (req, res) => {
  let groupViaId = req.query.groupId || null;
  try {
    let response = await userService.getAllGroupVia(groupViaId);
    if (response?.errCode === 0) {
      // console.log(response);
      return res.status(200).json(response.data);
    } else {
      return res
        .status(500)
        .json({ errCode: -1, errMessage: "Error from server" });
    }
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let payMent = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let email = verifyToken(token)?.data.email || null;
  let viaId = req.body.viaId;
  let quantity = parseInt(req.body.quantity);
  if (!email || !viaId || !quantity || quantity < 1) {
    return res
      .status(200)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let response = await userService.payMent({
        email: email,
        viaId: viaId,
        quantity: quantity,
      });
      if (response?.errCode === 0) {
        return res.status(200).json(response);
      } else {
        return res.status(500).json({
          errCode: response?.errCode || -1,
          errMessage: response?.errMessage || "Error from server",
        });
      }
    } catch (e) {
      console.log("error controler payment");
      return res.status(500).json({
        errCode: -1,
        errMessage: "Error from server",
      });
    }
  }
};
let viewTransaction = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let email = verifyToken(token)?.data.email || null;
  let current = req.query.current;
  let pageSize = req.query.pageSize;

  if (!pageSize || !current || !email) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
  try {
    current = parseInt(current);
    pageSize = parseInt(pageSize);

    let response = await userService.viewTransaction(email, current, pageSize);
    if (response.errCode === 0) {
      return res.status(200).json(response);
    } else
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

let viewDeposit = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  let email = verifyToken(token)?.data.email || null;
  let current = req.query.current;
  let pageSize = req.query.pageSize;

  if (!pageSize || !current || !email) {
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Error from server" });
  }
  try {
    current = parseInt(current);
    pageSize = parseInt(pageSize);

    let response = await userService.viewDeposit(email, current, pageSize);
    if (response.errCode === 0) {
      return res.status(200).json(response);
    } else
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
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  handleLogOut: handleLogOut,
  handleChangePassword: handleChangePassword,
  handleforGotPass: handleforGotPass,
  confirmForGotPass: confirmForGotPass,
  handleAutoLogin: handleAutoLogin,
  getAccountInfo: getAccountInfo,
  handleRefreshToken: handleRefreshToken,
  getAllViaOfGroup: getAllViaOfGroup,
  getViaInfor: getViaInfor,
  getAllGroupVia: getAllGroupVia,
  payMent: payMent,
  viewTransaction: viewTransaction,
  viewDeposit: viewDeposit,
};
