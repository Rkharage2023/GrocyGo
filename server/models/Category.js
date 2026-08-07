const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    name_mr: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("name_en");
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  }
);

module.exports = Category;