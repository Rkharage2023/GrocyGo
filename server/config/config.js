require("dotenv").config();

const isUrlValid =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith("mysql://") ||
    process.env.DATABASE_URL.startsWith("mysql2://") ||
    process.env.DATABASE_URL.startsWith("mariadb://"));

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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

    migrationStorage: "sequelize",
    seederStorage: "sequelize",
  },

  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",

    migrationStorage: "sequelize",
    seederStorage: "sequelize",
  },

  production: isUrlValid
    ? {
        use_env_variable: "DATABASE_URL",
        dialect: "mysql",
        migrationStorage: "sequelize",
        seederStorage: "sequelize",
      }
    : {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        migrationStorage: "sequelize",
        seederStorage: "sequelize",
      },
};