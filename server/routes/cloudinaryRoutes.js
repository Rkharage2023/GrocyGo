const express = require("express");
const router = express.Router();
const { getCloudinaryImages, uploadImage } = require("../controllers/cloudinaryController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Route to get mapped Cloudinary images (admin only)
router.get("/images", authMiddleware, adminMiddleware, getCloudinaryImages);

// Route to upload a local image to Cloudinary (admin only)
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  uploadImage
);

module.exports = router;
