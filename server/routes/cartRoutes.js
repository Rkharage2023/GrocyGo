const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addToCart , getMyCart, updateCartQuantity, removeFromCart, clearCart } = require("../controllers/cartController");

const { addToCartValidation, updateCartQuantityValidation } = require("../validations/cartValidation");
const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addToCartValidation, validationMiddleware, addToCart);
router.get("/", authMiddleware, getMyCart);
router.put("/:productId", authMiddleware, updateCartQuantityValidation, validationMiddleware, updateCartQuantity);
router.delete("/:productId", authMiddleware, removeFromCart);
router.delete("/", authMiddleware, clearCart);

module.exports = router;