const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");

const { createOfferValidation, updateOfferValidation } = require("../validations/offerValidation");
const {
  createOffer,
  updateOffer,
  deleteOffer,
  assignProductsToOffer,
  assignCategoriesToOffer,
  getOfferById,
  getAllOffersAdmin,
  getHomepageOffers,
} = require("../controllers/offerController");

// Customer / Public Routes
router.get("/homepage", getHomepageOffers);

// Admin-only CRUD Routes
router.post("/", authMiddleware, adminMiddleware, createOfferValidation, validationMiddleware, createOffer);
router.get("/", authMiddleware, adminMiddleware, getAllOffersAdmin);
router.get("/:id", authMiddleware, adminMiddleware, getOfferById);
router.put("/:id", authMiddleware, adminMiddleware, updateOfferValidation, validationMiddleware, updateOffer);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOffer);
router.post("/:id/assign-products", authMiddleware, adminMiddleware, assignProductsToOffer);
router.post("/:id/assign-categories", authMiddleware, adminMiddleware, assignCategoriesToOffer);

module.exports = router;
