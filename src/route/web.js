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
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);
  router.get("/api/logout", userController.handleLogOut);
  router.get(
    "/api/autoLogin",
    autoAuthMiddleware,
    userController.handleAutoLogin
  );
  router.get("/refresh", userController.handleRefreshToken);
  router.post("/api/getVia", userController.getAllViaOfGroup);
  router.get("/api/getViaInfor", userController.getViaInfor);
  router.get("/api/getAllGroupVia", userController.getAllGroupVia);
  // *******       API ********* CLIENT PRIVATE **************//
  router.post("/api/changePassword", userController.handleChangePassword);
  router.get("/api/forGotPass", userController.handleforGotPass);
  router.post("/api/confirmForGotPass", userController.confirmForGotPass);
  router.get("/api/getAccountInfo", userController.getAccountInfo);
  router.post("/api/payMent", userController.payMent);
  router.get("/api/viewTransaction", userController.viewTransaction);
  router.get("/api/viewDeposit", userController.viewDeposit);

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
  router.post(
    "/adminApi/getAllVia",
    adminMiddleware,
    adminController.getAllVia
  );
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
  router.post(
    "/adminApi/viewProduct",
    adminMiddleware,
    adminController.viewProduct
  );
  router.get(
    "/apiAdmin/publicMoney",
    adminMiddleware,
    adminController.publicMoney
  );
  // ***************************      APP            ************//
  return app.use("/", router);
};

module.exports = initWebRoutes;
