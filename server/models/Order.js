const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED"
      ),
      defaultValue: "PENDING",
    },

    paymentStatus: {
      type: DataTypes.ENUM(
        "PENDING",
        "PAID",
        "FAILED"
      ),
      defaultValue: "PENDING",
    },

    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "CASH",
    },

    slotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Order;