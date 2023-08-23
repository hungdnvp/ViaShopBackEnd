import userService from "../services/userService";

let handleRegister = async (req, res) => {
  let message = await userService.registerService(req.body);
  return res.status(200).json(message);
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
  }
  return res.status(201).json(Data);
};
let getAllUser = async (req, res) => {
  try {
    let data = await userService.getAllUserService();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({
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
let getAccountInfo = async (req, res) => {
  console.log(req);
  let userId = req.query.userId;
  try {
    let data = await userService.getAccountInfo(userId);
    return res.status(200).json(data);
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
  getAllUser: getAllUser,
  handleLogOut,
  getAccountInfo: getAccountInfo,
};
