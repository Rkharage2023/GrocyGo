const { body } = require("express-validator");

const sendOtpValidation = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid mobile number format. Must be a 10-digit number starting with 6-9"),
];

const verifyOtpValidation = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid mobile number format"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .matches(/^\d{6}$/)
    .withMessage("OTP must be a 6-digit number"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .matches(/^[a-zA-Z\s.-]{2,50}$/)
    .withMessage("Name can only contain letters, spaces, dots, and hyphens (2 to 50 characters)"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Address must be at least 5 characters long"),
];

module.exports = {
  sendOtpValidation,
  verifyOtpValidation,
  updateProfileValidation,
};
