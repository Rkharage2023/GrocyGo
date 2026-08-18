const express = require('express');
const router = express.Router();

const { profile, updateProfile, refreshToken, logout, logoutAll, sendOtp, verifyOtp } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Refresh Token Route
router.post("/refresh", refreshToken);

// Logout Route
router.post("/logout", logout);

// Logout All Devices Route
router.post("/logout-all", authMiddleware, logoutAll);

const { otpLimiter } = require("../middleware/rateLimiter");
const { sendOtpValidation, verifyOtpValidation, updateProfileValidation } = require("../validations/authValidation");
const validationMiddleware = require("../middleware/validationMiddleware");

// Profile Route
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfileValidation, validationMiddleware, updateProfile);

// OTP Routes
router.post("/send-otp", otpLimiter, sendOtpValidation, validationMiddleware, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtpValidation, validationMiddleware, verifyOtp);

module.exports = router;