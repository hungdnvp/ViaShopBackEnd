"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Via extends Model {
    static associate(models) {
      Via.belongsTo(models.GroupVia, {
        foreignKey: "groupViaId",
        targetKey: "id",
        as: "groupViaData",
      });
    }
  }
  Via.init(
    {
      nameVia: DataTypes.STRING,
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
