import express from "express";
import authMiddleware from "../middleware/JWTAction";
import userController from '../controllers/userController';
let router = express.Router();

let initWebRoutes = (app) =>{

    // *********API********************// USER????????????
    router.post('/api/login',userController.handleLogin);
    router.post('/api/register',userController.handleRegister);

    // *********API********************// ADMIN????????????





    router.get('api/getAllUser', userController.getAllUser);
    return app.use("/",router);
}

module.exports =  initWebRoutes;