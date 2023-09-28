import express from "express";
import userController from "../controllers/userController";
import authMiddleware from "../middleware/authentication";
import {
  autoAuthMiddleware,
  loginAuthLimitMiddleware,
} from "../middleware/authentication";
let router = express.Router();

let initWebRoutes = (app) => {
  // *********API********************// USER????????????
  router.use(authMiddleware);
  router.post(
    "/api/login",
    userController.handleLogin
  );
  router.post("/api/register", userController.handleRegister);
  router.get("/api/logout", userController.handleLogOut);
  router.post("/api/changePassword", userController.handleChangePassword);
  router.get(
    "/api/autoLogin",
    autoAuthMiddleware,
    userController.handleAutoLogin
  );

  router.get("/refresh", userController.handleRefreshToken);
  router.get("/api/getAccountInfo", userController.getAccountInfo);
  // *********API********************// ADMIN????????????

  router.get("api/getAllUser", userController.getAllUser);

  return app.use("/", router);
};

module.exports = initWebRoutes;
