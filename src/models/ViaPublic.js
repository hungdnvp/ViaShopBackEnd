"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ViaPublic extends Model {}
  ViaPublic.init(
    {
      nameVia: DataTypes.STRING,
      categoryViaId: DataTypes.INTEGER, //references CategoryVia
      price: DataTypes.INTEGER,
      discountPrice: DataTypes.INTEGER,
      discountCondition: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      descriptions: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ViaPublic",
    }
  );
  return ViaPublic;
};
