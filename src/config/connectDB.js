require("dotenv").config();

const { Sequelize } = require("sequelize");
// Option 3: Passing parameters separately (other dialects)
const user_mysql = process.env.USER_MYSQL;
const pass_mysql = process.env.PASS_MYSQL;

const sequelize = new Sequelize("viashop", user_mysql, pass_mysql, {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false,
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = connectDB;
