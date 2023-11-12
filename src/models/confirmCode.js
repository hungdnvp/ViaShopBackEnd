"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConfirmCode extends Model {}
  ConfirmCode.init(
    {
      email: DataTypes.STRING,
      code: DataTypes.INTEGER, //references CategoryVia
      expiresAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ConfirmCode",
    }
  );
  return ConfirmCode;
};
