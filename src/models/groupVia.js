"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupVia extends Model {
    static associate(models) {
      GroupVia.hasMany(models.Via, {
        foreignKey: "groupViaId",
        as: "groupViaData",
      });
    }
  }
  GroupVia.init(
    {
      groupViaName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "GroupVia",
    }
  );
  return GroupVia;
};
