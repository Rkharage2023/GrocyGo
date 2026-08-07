'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add isRevoked to refresh_tokens table
    await queryInterface.addColumn("refresh_tokens", "isRevoked", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    // Add description to categories table
    await queryInterface.addColumn("categories", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add paymentMethod to orders table
    await queryInterface.addColumn("orders", "paymentMethod", {
      type: Sequelize.ENUM("CASH"),
      defaultValue: "CASH",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns
    await queryInterface.removeColumn("refresh_tokens", "isRevoked");
    await queryInterface.removeColumn("categories", "description");
    await queryInterface.removeColumn("orders", "paymentMethod");
  }
};
