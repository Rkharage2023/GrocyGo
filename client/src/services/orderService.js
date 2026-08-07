import API from "./api";

/** Place order from current user's cart */
export const checkout = (slotId, paymentMethod = "CASH") =>
  API.post("/orders/checkout", { slotId, paymentMethod }).then((r) => r.data);

/** Get logged in user's orders */
export const getMyOrders = () =>
  API.get("/orders/my-orders").then((r) => r.data);

/** Get order details by ID */
export const getOrderById = (orderId) =>
  API.get(`/orders/${orderId}`).then((r) => r.data);

/** Cancel a pending order */
export const cancelOrder = (orderId) =>
  API.put(`/orders/${orderId}/cancel`).then((r) => r.data);

/** Admin: Get all orders */
export const getAllOrdersAdmin = (limit = 1000) =>
  API.get("/orders/admin/orders", { params: { limit } }).then((r) => r.data);

/** Admin: Get details for any order */
export const getOrderByIdAdmin = (orderId) =>
  API.get(`/orders/admin/orders/${orderId}`).then((r) => r.data);

/** Admin: Update order status */
export const updateOrderStatus = (orderId, status) =>
  API.patch(`/orders/admin/orders/${orderId}/status`, { status }).then((r) => r.data);

/** Admin: Update order payment status */
export const updateOrderPaymentStatus = (orderId, paymentStatus) =>
  API.patch(`/orders/admin/orders/${orderId}/payment-status`, { paymentStatus }).then((r) => r.data);

/** Admin: Update order payment method */
export const updateOrderPaymentMethod = (orderId, paymentMethod) =>
  API.patch(`/orders/admin/orders/${orderId}/payment-method`, { paymentMethod }).then((r) => r.data);

/** Admin: Update order items and quantities */
export const updateOrderAdmin = (orderId, items, slotId) =>
  API.put(`/orders/admin/orders/${orderId}`, { items, slotId }).then((r) => r.data);

/** Customer: Update order items and quantities */
export const updateOrderCustomer = (orderId, items, slotId) =>
  API.put(`/orders/${orderId}`, { items, slotId }).then((r) => r.data);

