const orderService = require("../services/orderService");

const checkout = async (req, res, next) => {
  try {
    const { slotId, paymentMethod } = req.body;

    const order = await orderService.checkout(
      req.user.id,
      slotId,
      paymentMethod
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);

    res.status(200).json({
      success: true,
      message: "My orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const data = await orderService.getAllOrders(req.query);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getAdminOrderById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await orderService.updatePaymentStatus(
      req.params.id,
      req.body.paymentStatus
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentMethod = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderPaymentMethod(
      req.params.id,
      req.body.paymentMethod
    );

    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, slotId } = req.body;

    const order = await orderService.updateOrder(id, items, slotId);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, slotId } = req.body;

    const checkOrder = await orderService.getOrderById(req.user.id, id);
    if (!checkOrder) {
      return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
    }
    if (checkOrder.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Only pending orders can be updated" });
    }

    const order = await orderService.updateOrder(id, items, slotId);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updatePaymentMethod,
  updateOrder,
  updateMyOrder,
};