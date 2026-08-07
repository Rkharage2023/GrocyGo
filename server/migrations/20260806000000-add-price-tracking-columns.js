"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add purchasePrice to products table
    await queryInterface.addColumn("products", "purchasePrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });

    // Add pricing tracking columns to order_items table
    await queryInterface.addColumn("order_items", "purchasePriceAtOrder", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn("order_items", "sellingPriceAtOrder", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn("order_items", "discountAtOrder", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn("order_items", "finalSellingPriceAtOrder", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("products", "purchasePrice");
    await queryInterface.removeColumn("order_items", "purchasePriceAtOrder");
    await queryInterface.removeColumn("order_items", "sellingPriceAtOrder");
    await queryInterface.removeColumn("order_items", "discountAtOrder");
    await queryInterface.removeColumn("order_items", "finalSellingPriceAtOrder");
  },
};
