const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OfferCategory = sequelize.define(
  "OfferCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "offer_categories",
    timestamps: true,
  }
);

module.exports = OfferCategory;
