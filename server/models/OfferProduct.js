const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OfferProduct = sequelize.define(
  "OfferProduct",
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "offer_products",
    timestamps: true,
  }
);

module.exports = OfferProduct;
