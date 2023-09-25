import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const autoAuthMiddleware = (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies || !cookies?.refreshToken) {
    res.status(401).json({ errCode: -1 });
  } else {
    const refreshToken = cookies.refreshToken;
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ errCode: -1 }); //invalid token
      req.email = decoded.email;
      next();
    });
  }
};
export const loginAuthLimitMiddleware = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes in milliseconds
  max: 10,
  message: "Quá 10 lần trong giới hạn 10 phút!",
  standardHeaders: true,
  legacyHeaders: false,
});

const authMiddleware = (req, res, next) => {
  const nonCheckPath = [
    "/api/login",
    "/api/register",
    "/api/autoLogin",
    "/refresh",
    "/api/logout",
  ];
  if (nonCheckPath.includes(req.path)) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ errCode: -1 });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ errCode: -1 }); //invalid token
    // req.user = decoded.username;
    next();
  });
};

export default authMiddleware;
