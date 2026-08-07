"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_keywords", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      keyword: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add unique composite index on productId + keyword to prevent duplicate keywords per product
    await queryInterface.addIndex("product_keywords", ["productId", "keyword"], {
      unique: true,
    });

    // Add index on keyword for fast global search lookups
    await queryInterface.addIndex("product_keywords", ["keyword"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_keywords");
  },
};
