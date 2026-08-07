const { Sequelize } = require("sequelize");
require("dotenv").config();

const isUrlValid =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith("mysql://") ||
    process.env.DATABASE_URL.startsWith("mysql2://") ||
    process.env.DATABASE_URL.startsWith("mariadb://"));

const sequelize = isUrlValid
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        charset: "utf8mb4",
      },
      define: {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      },
      pool: {
        max: 50,
        min: 5,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
          charset: "utf8mb4",
        },
        define: {
          charset: "utf8mb4",
          collate: "utf8mb4_unicode_ci",
        },
        pool: {
          max: 50,
          min: 5,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

module.exports = sequelize;