const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { createSlot , getAllSlots, generateSlots, getAvailableSlots, updateSlot, deleteSlot, bulkUpdateSlotStatus, bulkDeleteSlots} = require("../controllers/slotController");

const { createSlotValidation, generateSlotsValidation, updateSlotValidation } = require("../validations/slotValidation");
const validationMiddleware = require("../middleware/validationMiddleware");

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createSlotValidation,
  validationMiddleware,
  createSlot
);

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllSlots
);

router.post(
  "/generate",
  authMiddleware,
  adminMiddleware,
  generateSlotsValidation,
  validationMiddleware,
  generateSlots
);

router.get(
  "/available",
  authMiddleware,
  getAvailableSlots
);

router.put(
  "/bulk/status",
  authMiddleware,
  adminMiddleware,
  bulkUpdateSlotStatus
);

router.delete(
  "/bulk",
  authMiddleware,
  adminMiddleware,
  bulkDeleteSlots
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateSlotValidation,
  validationMiddleware,
  updateSlot
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteSlot
);

module.exports = router;