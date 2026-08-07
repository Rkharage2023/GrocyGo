const { body } = require("express-validator");

const createOfferValidation = [
  body("title")
    .notEmpty()
    .withMessage("Offer title is required")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),
  
  body("offerType")
    .notEmpty()
    .withMessage("Offer type is required")
    .isIn(["PERCENTAGE_DISCOUNT", "FIXED_DISCOUNT", "BUY_X_GET_Y"])
    .withMessage("Invalid offer type"),

  body("discountType")
    .notEmpty()
    .withMessage("Discount type is required")
    .isIn(["PERCENTAGE", "FIXED", "FREE_QTY"])
    .withMessage("Invalid discount type"),

  body("discountValue")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.01 })
    .withMessage("Discount value must be greater than 0")
    .custom((val, { req }) => {
      if ((req.body.discountType === "PERCENTAGE" || req.body.offerType === "PERCENTAGE_DISCOUNT") && parseFloat(val) > 100) {
        throw new Error("Percentage discount cannot exceed 100%");
      }
      return true;
    }),

  body("minimumPurchase")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum purchase must be a positive number"),

  body("buyQuantity")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Buy quantity must be at least 1"),

  body("freeQuantity")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Free quantity must be at least 1"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((val, { req }) => {
      if (new Date(val) < new Date(req.body.startDate)) {
        throw new Error("End date must be on or after start date");
      }
      return true;
    }),

  body("priority")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Priority must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const updateOfferValidation = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Offer title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),
  
  body("offerType")
    .optional()
    .notEmpty()
    .withMessage("Offer type cannot be empty")
    .isIn(["PERCENTAGE_DISCOUNT", "FIXED_DISCOUNT", "BUY_X_GET_Y"])
    .withMessage("Invalid offer type"),

  body("discountType")
    .optional()
    .notEmpty()
    .withMessage("Discount type cannot be empty")
    .isIn(["PERCENTAGE", "FIXED", "FREE_QTY"])
    .withMessage("Invalid discount type"),

  body("discountValue")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.01 })
    .withMessage("Discount value must be greater than 0")
    .custom((val, { req }) => {
      const discountType = req.body.discountType;
      const offerType = req.body.offerType;
      if (val && (discountType === "PERCENTAGE" || offerType === "PERCENTAGE_DISCOUNT") && parseFloat(val) > 100) {
        throw new Error("Percentage discount cannot exceed 100%");
      }
      return true;
    }),

  body("minimumPurchase")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum purchase must be a positive number"),

  body("buyQuantity")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Buy quantity must be at least 1"),

  body("freeQuantity")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Free quantity must be at least 1"),

  body("startDate")
    .optional()
    .notEmpty()
    .withMessage("Start date cannot be empty")
    .isISO8601()
    .withMessage("Invalid start date format"),

  body("endDate")
    .optional()
    .notEmpty()
    .withMessage("End date cannot be empty")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((val, { req }) => {
      if (val && req.body.startDate) {
        if (new Date(val) < new Date(req.body.startDate)) {
          throw new Error("End date must be on or after start date");
        }
      }
      return true;
    }),

  body("priority")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Priority must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  createOfferValidation,
  updateOfferValidation,
};

