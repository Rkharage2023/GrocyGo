require("dotenv").config();

const app = require("./app");
const db = require("./models");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database Connected");

    // Ensure all model tables (User, Otp, RefreshToken, Cart, Order, Slot, etc.) are synced
    await db.sequelize.sync();
    console.log("✅ Database Models Synced Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database Connection / Sync Failed");
    console.error(error);
  }
}

startServer();