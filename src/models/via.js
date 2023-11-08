"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Via extends Model {
    static associate(models) {
      Via.belongsTo(models.GroupVia, {
        foreignKey: "groupViaId",
      });
      Via.hasMany(models.Product, {
        foreignKey: "viaId",
      });
    }
  }
  Via.init(
    {
      nameVia: { type: DataTypes.STRING, unique: true },
      groupViaId: DataTypes.INTEGER, //references CategoryVia
      price: DataTypes.INTEGER,
      discountPrice: DataTypes.INTEGER,
      discountCondition: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      descriptions: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Via",
    }
  );
  return Via;
};
