const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { checkout,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    updatePaymentMethod,
    updateOrder,
    updateMyOrder
} = require("../controllers/orderController");

const { checkoutValidation } = require("../validations/orderValidation");
const validationMiddleware = require("../middleware/validationMiddleware");

// CUSTOMER ROUTES
router.post("/checkout", authMiddleware, checkoutValidation, validationMiddleware, checkout);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.put("/:id", authMiddleware, updateMyOrder);

// ADMIN ROUTES
router.get(
    "/admin/orders",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);

router.get(
    "/admin/orders/:id",
    authMiddleware,
    adminMiddleware,
    getAdminOrderById
);

router.patch(
  "/admin/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

router.patch(
  "/admin/orders/:id/payment-status",
  authMiddleware,
  adminMiddleware,
  updatePaymentStatus
);

router.patch(
  "/admin/orders/:id/payment-method",
  authMiddleware,
  adminMiddleware,
  updatePaymentMethod
);

router.put(
  "/admin/orders/:id",
  authMiddleware,
  adminMiddleware,
  updateOrder
);

module.exports = router;