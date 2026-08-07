"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const admins = [
      {
        name: "Admin",
        mobile: "9876543210",
        password: "123456",
        role: "ADMIN",
      }
    ];

    for (const admin of admins) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE mobile = ?`,
        {
          replacements: [admin.mobile],
        }
      );

      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);

        await queryInterface.bulkInsert("users", [
          {
            name: admin.name,
            mobile: admin.mobile,
            password: hashedPassword,
            role: admin.role,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      role: "ADMIN",
    });
  },
};