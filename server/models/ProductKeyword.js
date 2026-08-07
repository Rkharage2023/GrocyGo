const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductKeyword = sequelize.define(
  "ProductKeyword",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        if (val) {
          this.setDataValue("keyword", val.trim().toLowerCase());
        }
      },
    },
  },
  {
    tableName: "product_keywords",
    timestamps: true,
  }
);

module.exports = ProductKeyword;
