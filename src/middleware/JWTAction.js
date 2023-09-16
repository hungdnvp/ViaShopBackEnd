import jwt from "jsonwebtoken";
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const createToken = (data, expire = "12h", KEY = JWT_SECRET) => {
  let token = "";
  if (data && expire) {
    token = jwt.sign(data, KEY, { expiresIn: expire });
  } else {
    console.log("missing data parameter create token");
  }
  return token;
};

const verifyToken = (token, KEY = JWT_SECRET) => {
  let result = { isValid: false, data: {} };
  if (token) {
    try {
      let verify = jwt.verify(token, KEY);
      result.isValid = true;
      result.data = verify;
    } catch (err) {
      console.log("error verify token");
    }
  } else {
    console.log("missing token parameter verify");
  }
  return result;
};

module.exports = {
  createToken,
  verifyToken,
};
