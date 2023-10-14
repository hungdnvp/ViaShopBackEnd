"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CategoryVia extends Model {}
  CategoryVia.init(
    {
      categoryViaName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CategoryVia",
    }
  );
  return CategoryVia;
};
