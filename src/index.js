import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/connectDB";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import cors from 'cors';
import cookieParser from "cookie-parser";
require('dotenv').config();
import {createToken, verifyToken} from './middleware/JWTAction';

let app = express();
//config app
app.use(cors({origin: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))



viewEngine(app);
initWebRoutes(app);
connectDB();
let port = process.env.PORT || 9090;
app.listen(port,()=>{
    //callback
    console.log('backend is running on the port: ' + port);
});