import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/connectDB";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import cors from "cors";
import cookieParser from "cookie-parser";
require("dotenv").config();

const fs = require("fs");
const https = require("https");
const port = process.env.PORT || 9090;

let app = express();
//config app
app.use(
  cors({
    origin: process.env.URL_FONT_END,
    credentials: true,
    allowedHeaders: [
      "set-cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
      "Authorization",
    ],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

viewEngine(app);
initWebRoutes(app);
connectDB();
https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(port, () => {
    //callback
    console.log("backend is running on the port: " + port);
  });

// app.listen(port, () => {
//   //callback
//   console.log("backend is running on the port: " + port);
// });
