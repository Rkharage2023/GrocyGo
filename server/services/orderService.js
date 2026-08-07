const {
  sequelize,
  User,
  Cart,
  CartItem,
  Product,
  Order,
  OrderItem,
  Slot,
  Category,
} = require("../models");
const AppError = require("../utils/AppError");
const dayjs = require("dayjs");
const { calculateCartTotals } = require("../utils/offerCalculator");


const checkout = async (userId, slotId, paymentMethod = "CASH") => {
  // Start transaction
  const transaction = await sequelize.transaction();


  try {

    if (!slotId) {
      throw new AppError("Slot is required", 400);
    }

    if (paymentMethod !== "CASH") {
      throw new AppError(
        "Only Cash On Pickup is available",
        400
      );
    }

    const slot = await Slot.findOne({
      where: {
        id: slotId,
        isActive: true,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!slot) {
      throw new AppError("Invalid slot selected", 404);
    }

    const now = dayjs();
    const today = now.format("YYYY-MM-DD");
    const currentTimeStr = now.format("HH:mm:ss");

    if (
      slot.date < today ||
      (slot.date === today && slot.startTime < currentTimeStr)
    ) {
      throw new AppError("Selected slot has expired", 400);
    }

    if (slot.bookedCount >= slot.maxCapacity) {
      throw new AppError("Selected slot is full", 400);
    }

    // Find user's cart with products
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              include: [
                {
                  model: Category,
                  attributes: ["id", "name_en", "name_mr"]
                }
              ]
            },
          ],
        },
      ],
      transaction,
    });

    // Check if cart exists
    if (!cart) {
      throw new AppError("Cart is empty", 400);
    }

    // Check if cart has items
    if (cart.CartItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }
    console.log("Cart found successfully.");

    // Lock the products to prevent concurrent stock updates
    const productIds = cart.CartItems.map((item) => item.productId);
    const lockedProducts = await Product.findAll({
      where: { id: productIds },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Map locked products by ID for quick lookup
    const productMap = new Map(lockedProducts.map((p) => [p.id, p]));

    let totalAmount = 0;

    // Validate every product
    for (const item of cart.CartItems) {
      const product = productMap.get(item.productId);

      // Product deleted or inactive
      if (!product || !product.isActive) {
        throw new AppError(
          `Product "${product?.name || "Unknown"}" is unavailable`,
          400
        );
      }

      // Stock validation
      if (item.quantity > product.stock) {
        throw new AppError(
          `Only ${product.stock} item(s) of "${product.name}" available`,
          400
        );
      }

    }
    console.log("Stock validation successful.");

    // Calculate total amount using dynamic offer calculation based on pickup date
    const totals = await calculateCartTotals(cart.CartItems, slot.date);
    totalAmount = totals.grandTotal;
    console.log("Total Amount (after discount):", totalAmount);

    // Create Order
    const order = await Order.create(
      {
        userId,
        slotId,
        totalAmount,
        paymentMethod,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      {
        transaction,
      }
    );
    console.log("Order created:", order.id);

    // Create Order Items with offer calculations applied
    for (const item of cart.CartItems) {
      const product = productMap.get(item.productId);
      const computedItem = totals.items.find(it => it.productId === item.productId);

      const itemPrice = computedItem ? computedItem.finalPrice : Number(product.price);
      const itemSubtotal = computedItem ? computedItem.totalPrice : (Number(product.price) * item.quantity);

      const purchasePriceAtOrder = Number(product.purchasePrice || 0);
      const sellingPriceAtOrder = Number(product.price);
      const finalSellingPriceAtOrder = itemPrice;
      const discountAtOrder = sellingPriceAtOrder - finalSellingPriceAtOrder;

      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: itemPrice,
          subtotal: itemSubtotal,
          purchasePriceAtOrder,
          sellingPriceAtOrder,
          discountAtOrder,
          finalSellingPriceAtOrder
        },
        {
          transaction,
        }
      );
    }
    console.log("Order items created successfully.");

    // Reduce Product Stock
    for (const item of cart.CartItems) {
      await Product.decrement("stock", {
        by: item.quantity,
        where: {
          id: item.productId,
        },
        transaction,
      });
    }
    console.log("Product stock updated.");

    // Update Slot bookedCount
    await slot.increment("bookedCount", {
      by: 1,
      transaction,
    });

    // Clear Cart
    await CartItem.destroy({
      where: {
        cartId: cart.id,
      },
      transaction,
    });
    console.log("Cart cleared.");

    // Commit transaction
    await transaction.commit();
    console.log("Transaction committed successfully.");

    return order;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


const getMyOrders = async (userId) => {
  const orders = await Order.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: Slot,
        attributes: ["date", "startTime", "endTime"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return orders;
};


const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    where: {
      id: orderId,
      userId,
    },
    include: [

      {
        model: Slot,
        attributes: [
          "date",
          "startTime",
          "endTime"
        ]
      },

      {
        model: OrderItem,
        include: [
          {
            model: Product,
            attributes: [
              "id",
              "name_en",
              "name_mr",
              "image",
              "unit",
              "price",
            ],
          },
        ],
      },
    ],
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};


const cancelOrder = async (userId, orderId) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
      include: [
        {
          model: OrderItem,
        },
      ],
      transaction,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === "CANCELLED") {
      throw new AppError("Order is already cancelled", 400);
    }

    if (order.status !== "PENDING") {
      throw new AppError(
        "Only pending orders can be cancelled",
        400
      );
    }

    // Restore stock
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId, {
        transaction,
      });

      if (product) {
        await Product.increment("stock", {
          by: item.quantity,
          where: {
            id: item.productId,
          },
          transaction,
        });
      }
    }

    // Update Slot bookedCount
    const slot = await Slot.findByPk(order.slotId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (slot && slot.bookedCount > 0) {
      await slot.decrement("bookedCount", {
        by: 1,
        transaction,
      });
    }

    // Update order status
    order.status = "CANCELLED";
    await order.save({ transaction });

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


const getAllOrders = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
  } = query;

  const where = {};
  if (status) {
    where.status = status;
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Order.findAndCountAll({
    where,
    attributes: [
      "id",
      "userId",
      "totalAmount",
      "status",
      "paymentStatus",
      "paymentMethod",
      "createdAt",
    ],
    include: [
      {
        model: User,
        attributes: ["id", "name", "mobile"],
      },
      {
        model: Slot,
        attributes: ["date", "startTime", "endTime"],
      },
      {
        model: OrderItem,
        attributes: ["quantity", "purchasePriceAtOrder", "finalSellingPriceAtOrder", "subtotal"],
      }
    ],
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset: Number(offset),
  });

  return {
    totalOrders: count,
    currentPage: Number(page),
    totalPages: Math.ceil(count / limit),
    orders: rows,
  };
};

const getAdminOrderById = async (orderId) => {
  const order = await Order.findByPk(orderId, {
    attributes: [
      "id",
      "totalAmount",
      "status",
      "paymentStatus",
      "paymentMethod",
      "createdAt",
    ],
    include: [
      {
        model: User,
        attributes: ["id", "name", "mobile"],
      },
      {
        model: Slot,
        attributes: ["date", "startTime", "endTime"],
      },
      {
        model: OrderItem,
        attributes: [
          "id",
          "productId",
          "quantity",
          "price",
          "subtotal",
        ],
        include: [
          {
            model: Product,
            attributes: [
              "id",
              "name_en",
              "name_mr",
              "image",
              "unit",
              "price",
            ],
          },
        ],
      },
    ],
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

const updateOrderStatus = async (orderId, status) => {
  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
  ];

  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Prevent updates after completion/cancellation
  if (order.status === "COMPLETED") {
    throw new AppError(
      "Completed orders cannot be updated",
      400
    );
  }

  if (order.status === "CANCELLED") {
    throw new AppError(
      "Cancelled orders cannot be updated",
      400
    );
  }

  // Allowed transitions
  if (
    order.status === "PENDING" &&
    status !== "CONFIRMED"
  ) {
    throw new AppError(
      "Pending orders can only be confirmed",
      400
    );
  }

  if (
    order.status === "CONFIRMED" &&
    status !== "COMPLETED"
  ) {
    throw new AppError(
      "Confirmed orders can only be completed",
      400
    );
  }

  if (status === "COMPLETED" && order.paymentStatus !== "PAID") {
    throw new AppError(
      "Cannot mark order as COMPLETED because it has not been PAID yet",
      400
    );
  }

  order.status = status;

  await order.save();

  return order;
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
        },
      ],
      transaction,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === "COMPLETED" && paymentStatus !== "PAID") {
      throw new AppError(
        "Cannot change payment status of a COMPLETED order to unpaid",
        400
      );
    }

    if (order.status !== "CONFIRMED" && order.status !== "COMPLETED") {
      throw new AppError(
        "Payment can only be marked after the order is confirmed",
        400
      );
    }

    const validPaymentStatuses = ["PENDING", "PAID", "FAILED"];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      throw new AppError("Invalid payment status", 400);
    }

    order.paymentStatus = paymentStatus || "PAID";

    if (order.paymentStatus === "FAILED") {
      order.status = "CANCELLED";

      // Restore stock
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId, {
          transaction,
        });

        if (product) {
          await Product.increment("stock", {
            by: item.quantity,
            where: {
              id: item.productId,
            },
            transaction,
          });
        }
      }

      // Update Slot bookedCount
      const slot = await Slot.findByPk(order.slotId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (slot && slot.bookedCount > 0) {
        await slot.decrement("bookedCount", {
          by: 1,
          transaction,
        });
      }
    }

    await order.save({ transaction });
    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateOrderPaymentMethod = async (orderId, paymentMethod) => {
  const validMethods = ["ONLINE", "CASH"];
  if (!validMethods.includes(paymentMethod)) {
    throw new AppError("Invalid payment method", 400);
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    throw new AppError("Cannot change payment method of a completed or cancelled order", 400);
  }

  order.paymentMethod = paymentMethod;
  await order.save();

  return order;
};

const updateOrder = async (orderId, items = [], newSlotId = null) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      throw new AppError("Cannot edit a completed or cancelled order", 400);
    }

    if (!items || items.length === 0) {
      throw new AppError("Order must have at least one item", 400);
    }

    // Handle slot change
    if (newSlotId && newSlotId !== order.slotId) {
      const newSlot = await Slot.findByPk(newSlotId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!newSlot || !newSlot.isActive) {
        throw new AppError("Selected slot is unavailable", 400);
      }

      const now = dayjs();
      const today = now.format("YYYY-MM-DD");
      const currentTimeStr = now.format("HH:mm:ss");

      if (
        newSlot.date < today ||
        (newSlot.date === today && newSlot.startTime < currentTimeStr)
      ) {
        throw new AppError("Selected slot has expired", 400);
      }

      if (newSlot.bookedCount >= newSlot.maxCapacity) {
        throw new AppError("Selected slot is full", 400);
      }

      const oldSlot = await Slot.findByPk(order.slotId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (oldSlot && oldSlot.bookedCount > 0) {
        await oldSlot.decrement("bookedCount", { by: 1, transaction });
      }

      await newSlot.increment("bookedCount", { by: 1, transaction });
      
      order.slotId = newSlotId;
    }

    // 1. Restore stock of all existing order items
    for (const oldItem of order.OrderItems) {
      await Product.increment("stock", {
        by: oldItem.quantity,
        where: { id: oldItem.productId },
        transaction,
      });
    }

    // 2. Lock and validate all new products
    const productIds = items.map((item) => Number(item.productId));
    const lockedProducts = await Product.findAll({
      where: { id: productIds },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const productMap = new Map(lockedProducts.map((p) => [Number(p.id), p]));
    const validatedItems = [];
    
    // Construct mock cart items for offer calculation
    const mockCartItems = items.map((item) => ({
      id: `mock-${item.productId}`,
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      Product: productMap.get(Number(item.productId)),
    }));

    for (const item of mockCartItems) {
      const product = item.Product;

      if (!product || !product.isActive) {
        throw new AppError(`Product "${product?.name || "Unknown"}" is unavailable`, 400);
      }

      if (item.quantity > product.stock) {
        throw new AppError(
          `Only ${product.stock} item(s) of "${product.name}" available in stock`,
          400
        );
      }

      // Deduct stock
      await Product.decrement("stock", {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    // Calculate dynamic totals to retain proper pricing and profit margins
    const slot = await Slot.findByPk(order.slotId, { transaction });
    const totals = await calculateCartTotals(mockCartItems, slot ? slot.date : null);
    const totalAmount = totals.grandTotal;

    for (const item of mockCartItems) {
      const product = item.Product;
      const computedItem = totals.items.find(it => it.productId === item.productId);

      const itemPrice = computedItem ? computedItem.finalPrice : Number(product.price);
      const itemSubtotal = computedItem ? computedItem.totalPrice : (Number(product.price) * item.quantity);

      const purchasePriceAtOrder = Number(product.purchasePrice || 0);
      const sellingPriceAtOrder = Number(product.price);
      const finalSellingPriceAtOrder = itemPrice;
      const discountAtOrder = sellingPriceAtOrder - finalSellingPriceAtOrder;

      validatedItems.push({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemSubtotal,
        purchasePriceAtOrder,
        sellingPriceAtOrder,
        discountAtOrder,
        finalSellingPriceAtOrder
      });
    }

    // 3. Delete existing OrderItems and insert new ones
    await OrderItem.destroy({
      where: { orderId: order.id },
      transaction,
    });

    for (const valItem of validatedItems) {
      await OrderItem.create(valItem, { transaction });
    }

    // 4. Update order total amount
    order.totalAmount = totalAmount;
    await order.save({ transaction });

    await transaction.commit();

    // Return the updated order with associations
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "mobile"],
        },
        {
          model: Slot,
          attributes: ["date", "startTime", "endTime"],
        },
        {
          model: OrderItem,
          include: [{ model: Product }],
        },
      ],
    });

    return updatedOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getAllOrders,
  getOrderById,
  cancelOrder,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderPaymentMethod,
  updateOrder,
};