const { body } = require("express-validator");

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const createSlotValidation = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .matches(dateRegex)
    .withMessage("Date must be in YYYY-MM-DD format"),
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(timeRegex)
    .withMessage("Start time must be in HH:MM or HH:MM:SS format"),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .matches(timeRegex)
    .withMessage("End time must be in HH:MM or HH:MM:SS format")
    .custom((val, { req }) => {
      if (req.body.startTime && val <= req.body.startTime) {
        throw new Error("End time must be strictly after start time");
      }
      return true;
    }),
  body("maxCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max capacity must be at least 1"),
];

const generateSlotsValidation = [
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .matches(dateRegex)
    .withMessage("Start date must be in YYYY-MM-DD format"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .matches(dateRegex)
    .withMessage("End date must be in YYYY-MM-DD format"),
  body("openingTime")
    .notEmpty()
    .withMessage("Opening time is required")
    .matches(timeRegex)
    .withMessage("Opening time must be in HH:MM or HH:MM:SS format"),
  body("closingTime")
    .notEmpty()
    .withMessage("Closing time is required")
    .matches(timeRegex)
    .withMessage("Closing time must be in HH:MM or HH:MM:SS format"),
  body("interval")
    .notEmpty()
    .withMessage("Interval is required")
    .isInt({ min: 5, max: 240 })
    .withMessage("Interval must be an integer between 5 and 240 minutes"),
  body("maxCapacity")
    .notEmpty()
    .withMessage("Max capacity is required")
    .isInt({ min: 1 })
    .withMessage("Max capacity must be at least 1"),
];

const updateSlotValidation = [
  body("date")
    .optional()
    .matches(dateRegex)
    .withMessage("Date must be in YYYY-MM-DD format"),
  body("startTime")
    .optional()
    .matches(timeRegex)
    .withMessage("Start time must be in HH:MM or HH:MM:SS format"),
  body("endTime")
    .optional()
    .matches(timeRegex)
    .withMessage("End time must be in HH:MM or HH:MM:SS format"),
  body("maxCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max capacity must be at least 1"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  createSlotValidation,
  generateSlotsValidation,
  updateSlotValidation,
};
