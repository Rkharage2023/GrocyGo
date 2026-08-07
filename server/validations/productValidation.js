const { body } = require("express-validator");

const createProductValidation = [
  body("name_en")
    .trim()
    .notEmpty()
    .withMessage("English product name is required"),

  body("name_mr")
    .trim()
    .notEmpty()
    .withMessage("Marathi product name is required"),

  body("description_en")
    .optional()
    .trim(),

  body("description_mr")
    .optional()
    .trim(),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),

  body("unit")
    .notEmpty()
    .withMessage("Unit is required"),

  body("categoryId")
    .isInt()
    .withMessage("Valid categoryId is required"),

  body("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords must be an array of strings"),
  body("keywords.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Keyword cannot be empty"),
];

module.exports = {
  createProductValidation,
};