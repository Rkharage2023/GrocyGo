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

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Selling price must be greater than 0"),

  body("purchasePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Purchase price cannot be negative")
    .custom((value, { req }) => {
      if (value !== undefined && req.body.price !== undefined && parseFloat(value) > parseFloat(req.body.price)) {
        throw new Error("Purchase price cannot be greater than selling price");
      }
      return true;
    }),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative whole integer"),

  body("unit")
    .trim()
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