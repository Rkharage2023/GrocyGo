const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, getAllCustomers);

module.exports = router;
