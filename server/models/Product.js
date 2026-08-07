const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
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

    description_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    description_mr: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    description: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("description_en");
      },
    },

    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    unit: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;