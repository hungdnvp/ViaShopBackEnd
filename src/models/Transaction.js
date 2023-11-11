"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  Transaction.init(
    {
      code: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      viaId: DataTypes.INTEGER,
      viaName: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      totalPayment: DataTypes.INTEGER,
      detail: DataTypes.STRING(3000),
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
