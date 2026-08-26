const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { createProductValidation, updateProductValidation } = require("../validations/productValidation");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");


// Create Product
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createProductValidation,
    validationMiddleware,
    createProduct
);

// get all products
router.get("/", getAllProducts);

router.get("/:id",getProductById);

//update product
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProductValidation,
  validationMiddleware,
  updateProduct
);

//delete Product

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;