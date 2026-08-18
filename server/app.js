const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const logger = require("./utils/logger");

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const cloudinaryRoutes = require("./routes/cloudinaryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const slotRoutes = require("./routes/slotRoutes");
const offerRoutes = require("./routes/offerRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");
const localizationMiddleware = require("./middleware/localizationMiddleware");

const app = express();

// Trust Proxy (Required for Render / Reverse Proxy)
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet());

// Compress Response
app.use(compression());

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://grocy-go-livid.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Accept-Language"],
  })
);

// HTTP Request Logging (Morgan streamed to Winston)
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(
  morgan(
    process.env.NODE_ENV === "production" ? "combined" : "dev",
    { stream: morganStream }
  )
);

// Cookie Parser
app.use(cookieParser());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Localization Middleware
app.use(localizationMiddleware);

// Health Check Route (Useful for Deployment)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GrocyGo Backend Running Successfully 🚀",
  });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Global Error Handler (Always Last)
app.use(errorMiddleware);

module.exports = app;