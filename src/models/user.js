"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.RefreshToken, {
        foreignKey: "userId",
        as: "userRefreshTokens",
      });
    }
    // User.belongsTo(models.Allcode, {foreignKey: 'gender', targetKey:'keyMap', as: 'genderData'})
    // User.hasOne(models.Markdown, {foreignKey: 'doctorId'})
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      username: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      balance: DataTypes.INTEGER,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
