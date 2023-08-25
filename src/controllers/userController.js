import userService from "../services/userService";

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
    if (Data.errCode === 0) {
      return res
        .cookie("access_token", Data.token, { httpOnly: true })
        .status(200)
        .json({
          errCode: 0,
          errMessage: "login success",
          user: Data.user,
        });
    } else {
      return res.status(201).json(Data);
    }
  } catch (e) {}
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
  return res.cookie("access_token", {}, { maxAge: 1 }).status(200).json({
    errCode: 0,
    errMessage: "logout success",
  });
};
let handleChangePassword = async (req, res) => {
  let userId = req.body.userId;
  let currentPass = req.body.currentPass;
  let newPass = req.body.newPass;
  if (!currentPass || !newPass || !userId) {
    return res
      .status(200)
      .json({ errCode: 1, errMessage: "Missing require parameter" });
  } else {
    try {
      let data = await userService.changePasswordService(
        userId,
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
module.exports = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  getAllUser: getAllUser,
  handleLogOut,
  handleChangePassword: handleChangePassword,
};
