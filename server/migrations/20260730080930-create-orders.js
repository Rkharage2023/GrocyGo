"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      slotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "slots",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "CONFIRMED",
          "COMPLETED",
          "CANCELLED"
        ),
        defaultValue: "PENDING",
      },

      paymentStatus: {
        type: Sequelize.ENUM(
          "PENDING",
          "PAID",
          "FAILED"
        ),
        defaultValue: "PENDING",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("orders", ["userId"]);
    await queryInterface.addIndex("orders", ["slotId"]);
    await queryInterface.addIndex("orders", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("orders");
  },
};