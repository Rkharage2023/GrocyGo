const { body } = require("express-validator");

const createCategoryValidation = [
  body("name_en")
    .trim()
    .notEmpty()
    .withMessage("English category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("English category name must be between 2 and 50 characters"),

  body("name_mr")
    .trim()
    .notEmpty()
    .withMessage("Marathi category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Marathi category name must be between 2 and 50 characters"),
];

const updateCategoryValidation = [
  body("name_en")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("English category name cannot be empty if provided")
    .isLength({ min: 2, max: 50 })
    .withMessage("English category name must be between 2 and 50 characters"),

  body("name_mr")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Marathi category name cannot be empty if provided")
    .isLength({ min: 2, max: 50 })
    .withMessage("Marathi category name must be between 2 and 50 characters"),
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
};
