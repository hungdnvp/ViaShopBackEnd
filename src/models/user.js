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
      User.hasOne(models.RefreshToken, {
        foreignKey: "userId",
      });
    }
    // User.belongsTo(models.Allcode, {foreignKey: 'gender', targetKey:'keyMap', as: 'genderData'})
    // User.hasOne(models.Markdown, {foreignKey: 'doctorId'})
  }
  User.init(
    {
      email: { type: DataTypes.STRING, unique: true },
      password: DataTypes.STRING,
      username: { type: DataTypes.STRING, unique: true },
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
