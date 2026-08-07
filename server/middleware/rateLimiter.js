const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// Strict rate limiter for OTP endpoints: 5 requests per 5 minutes per IP by default
const otpLimiter = rateLimit({
  windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== "production", // Skip in development/testing
  message: {
    success: false,
    message: "Too many OTP requests from this IP, please try again after 5 minutes.",
  },
  handler: (req, res, next, options) => {
    logger.warn(`OTP Rate limit exceeded - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
});

module.exports = {
  otpLimiter,
};
