import jwt from "jsonwebtoken";
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const nonCheckPath = ["/api/login", "/api/register", "/api/autoLogin"];
  if (nonCheckPath.includes(req.path)) return next();
  const cookie = req.cookies;
  if (cookie && cookie.access_token) {
    let token = cookie.access_token;
    // console.log("middleware token: ", token);
    jwt.verify(token, JWT_SECRET, function (err, data) {
      if (err) {
        console.log(err.message);
        return res.status(200).json({
          errCode: -1,
        });
      } else {
        console.log(data);
        return next();
      }
    });
  } else {
    return res.status(200).json({
      errCode: -1,
    });
  }
};
export default authMiddleware;
