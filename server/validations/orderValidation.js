const { body } = require("express-validator");

const checkoutValidation = [
  body("slotId")
    .notEmpty()
    .withMessage("Slot ID is required")
    .isInt()
    .withMessage("Slot ID must be an integer"),
  body("paymentMethod")
    .optional()
    .isIn(["CASH"])
    .withMessage("Supported payment method is CASH only"),
];

module.exports = {
  checkoutValidation,
};
