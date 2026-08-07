const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Slot = sequelize.define(
  "Slot",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },

    bookedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
  tableName: "slots",
  timestamps: true,

  indexes: [
    {
      unique: true,
      fields: ["date", "startTime", "endTime"],
    },
  ],
}
);

module.exports = Slot;