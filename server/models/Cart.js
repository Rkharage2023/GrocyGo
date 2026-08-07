const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");

const Cart = sequelize.define(
    "Cart",
    {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement : true,
            primaryKey : true,
        },     
    },
    {
        tableName : "carts",
        timestamps : true,
    }
);

module.exports = Cart;