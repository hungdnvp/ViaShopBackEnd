"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {}
  Deposit.init(
    {
      userId: DataTypes.INTEGER,
      money: DataTypes.INTEGER,
      typePublish: DataTypes.STRING,
      method: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Deposit",
    }
  );
  return Deposit;
};
