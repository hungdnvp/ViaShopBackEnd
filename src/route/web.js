import express from "express";
import userController from "../controllers/userController";
import adminController from "../controllers/adminController";
import authMiddleware from "../middleware/authentication";
import {
  autoAuthMiddleware,
  loginAuthLimitMiddleware,
  adminMiddleware,
} from "../middleware/authentication";
let router = express.Router();

let initWebRoutes = (app) => {
  // *********API*****                  CLIENT COMMON                  ????????????
  router.use(authMiddleware);
  router.post(
    "/api/login",
    loginAuthLimitMiddleware,
    userController.handleLogin
  );
  router.post("/api/register", userController.handleRegister);
  router.get("/api/logout", userController.handleLogOut);
  router.get(
    "/api/autoLogin",
    autoAuthMiddleware,
    userController.handleAutoLogin
  );
  router.get("/refresh", userController.handleRefreshToken);
  router.get("/api/getVia", userController.getAllViaOfGroup);
  router.get("/api/getViaInfor", userController.getViaInfor);
  router.get("/api/getAllGroupVia", userController.getAllGroupVia);
  // *******       API ********* CLIENT PRIVATE **************//
  router.post("/api/changePassword", userController.handleChangePassword);
  router.get("/api/getAccountInfo", userController.getAccountInfo);
  router.post("/api/payMent", userController.payMent);

  // *********API********************// ADMIN????????????

  router.get(
    "/adminApi/getAllUser",
    adminMiddleware,
    adminController.getAllUser
  );
  router.get(
    "/adminApi/getAllGroupVia",
    adminMiddleware,
    adminController.getAllGroupVia
  );
  router.post(
    "/adminApi/addGroupVia",
    adminMiddleware,
    adminController.addGroupVia
  );
  router.post("/adminApi/addVia", adminMiddleware, adminController.addVia);
  router.get("/adminApi/getAllVia", adminMiddleware, adminController.getAllVia);
  router.post("/adminApi/editVia", adminMiddleware, adminController.editVia);
  router.post(
    "/adminApi/editGroupVia",
    adminMiddleware,
    adminController.editGroupVia
  );
  router.post(
    "/apiAdmin/importProducts",
    adminMiddleware,
    adminController.bulkCreateProducts
  );
  // ***************************      APP            ************//
  return app.use("/", router);
};

module.exports = initWebRoutes;
