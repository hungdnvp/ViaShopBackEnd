"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupVia extends Model {
    static associate(models) {
      GroupVia.hasMany(models.Via, {
        foreignKey: "groupViaId",
      });
    }
  }
  GroupVia.init(
    {
      groupViaName: { type: DataTypes.STRING, unique: true },
    },
    {
      sequelize,
      modelName: "GroupVia",
    }
  );
  return GroupVia;
};
