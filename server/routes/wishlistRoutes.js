const express = require("express");
const router = express.Router();
const { getWishlist, toggleWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getWishlist);
router.post("/:productId", authMiddleware, toggleWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);

module.exports = router;
