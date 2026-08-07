const sequelize = require("./config/database");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(" Database connected successfully!");
  } catch (error) {
    console.error(" Database connection failed:", error.message);
  }
}

testConnection();