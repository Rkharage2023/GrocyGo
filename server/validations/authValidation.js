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
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be between 4 and 6 characters"),
];

module.exports = {
  sendOtpValidation,
  verifyOtpValidation,
};
