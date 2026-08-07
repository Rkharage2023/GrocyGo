const express = require("express");

const router = express.Router();

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { createCategoryValidation, updateCategoryValidation } = require("../validations/categoryValidation");
const validationMiddleware = require("../middleware/validationMiddleware");

// Create Category
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCategoryValidation,
    validationMiddleware,
    createCategory
);

// Get All Categories
router.get("/", getAllCategories);

// Get Category by ID
router.get("/:id", getCategoryById);

// Update Category
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateCategoryValidation,
    validationMiddleware,
    updateCategory
);

// Delete Category
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteCategory
);

module.exports = router;