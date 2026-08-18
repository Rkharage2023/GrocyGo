const { User, Order, Slot } = require("../models");
const AppError = require("../utils/AppError");

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.findAll({
      where: { role: "CUSTOMER" },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Order,
          include: [{ model: Slot }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = customers.map((c) => {
      const orders = c.Orders || [];
      const orderCount = orders.length;
      const totalSpent = orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

      let lastOrderDate = c.createdAt;
      if (orders.length > 0) {
        const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        lastOrderDate = sorted[0].createdAt;
      }

      return {
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        address: c.address,
        createdAt: c.createdAt,
        orderCount,
        totalSpent,
        lastOrderDate,
        orders,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
};
