import express from "express";
import authMiddleware from "../middleware/JWTAction";
import userController from "../controllers/userController";
let router = express.Router();

function checkToken(req, res, next) {
  const nonCheckPath = ["/api/login", "/api/register"];
  if (nonCheckPath.includes(req.path)) return next();
}
let initWebRoutes = (app) => {
  // *********API********************// USER????????????
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);
  router.get("/api/logout", userController.handleLogOut);
  router.get("/api/getAccountInfo", userController.getAccountInfo);
  // *********API********************// ADMIN????????????

  router.get("api/getAllUser", userController.getAllUser);
  return app.use("/", router);
};

module.exports = initWebRoutes;
