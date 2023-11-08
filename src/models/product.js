"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Via, {
        foreignKey: "viaId",
      });
    }
    // User.belongsTo(models.Allcode, {foreignKey: 'gender', targetKey:'keyMap', as: 'genderData'})
    // User.hasOne(models.Markdown, {foreignKey: 'doctorId'})
  }
  Product.init(
    {
      information: DataTypes.STRING,
      viaId: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
