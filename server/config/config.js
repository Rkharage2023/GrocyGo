require("dotenv").config();

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
    seederStorage: "sequelize",   // <-- Add this
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

  production: process.env.DATABASE_URL
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