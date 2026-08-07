"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- Categories Table Changes ---
    // 1. Rename name to name_en
    await queryInterface.renameColumn("categories", "name", "name_en");
    
    // 2. Add name_mr as nullable initially
    await queryInterface.addColumn("categories", "name_mr", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    // 3. Copy existing name_en values to name_mr
    await queryInterface.sequelize.query("UPDATE categories SET name_mr = name_en");
    
    // 4. Change name_mr to not nullable
    await queryInterface.changeColumn("categories", "name_mr", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // --- Products Table Changes ---
    // 1. Remove index on name
    await queryInterface.removeIndex("products", ["name"]).catch(() => {});
    
    // 2. Rename name to name_en
    await queryInterface.renameColumn("products", "name", "name_en");
    
    // 3. Add name_mr as nullable initially
    await queryInterface.addColumn("products", "name_mr", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    // 4. Copy existing name_en to name_mr
    await queryInterface.sequelize.query("UPDATE products SET name_mr = name_en");
    
    // 5. Change name_mr to not nullable
    await queryInterface.changeColumn("products", "name_mr", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // 6. Rename description to description_en
    await queryInterface.renameColumn("products", "description", "description_en");
    
    // 7. Add description_mr
    await queryInterface.addColumn("products", "description_mr", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // 8. Copy existing description_en to description_mr
    await queryInterface.sequelize.query("UPDATE products SET description_mr = description_en");

    // 9. Recreate indexes for product name columns
    await queryInterface.addIndex("products", ["name_en"]);
    await queryInterface.addIndex("products", ["name_mr"]);
  },

  async down(queryInterface, Sequelize) {
    // --- Products Table Reversal ---
    await queryInterface.removeIndex("products", ["name_en"]).catch(() => {});
    await queryInterface.removeIndex("products", ["name_mr"]).catch(() => {});
    
    await queryInterface.removeColumn("products", "description_mr");
    await queryInterface.renameColumn("products", "description_en", "description");
    
    await queryInterface.removeColumn("products", "name_mr");
    await queryInterface.renameColumn("products", "name_en", "name");
    
    await queryInterface.addIndex("products", ["name"]);

    // --- Categories Table Reversal ---
    await queryInterface.removeColumn("categories", "name_mr");
    await queryInterface.renameColumn("categories", "name_en", "name");
  },
};
