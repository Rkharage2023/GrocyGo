"use strict";

module.exports = {
  async up(queryInterface) {

    const categories = [
      "Fruits",
      "Vegetables",
      "Dairy",
      "Bakery",
      "Beverages",
      "Snacks",
      "Grains & Pulses",
      "Oil & Ghee",
      "Spices",
      "Personal Care",
    ];

    for (const category of categories) {

      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE name = ?`,
        {
          replacements: [category],
        }
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert("categories", [
          {
            name: category,
            image: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};