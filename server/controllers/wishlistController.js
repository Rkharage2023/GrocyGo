const { Wishlist, Product, Category } = require("../models");
const AppError = require("../utils/AppError");

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          include: [{ model: Category, attributes: ["id", "name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        product: i.Product,
        createdAt: i.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const existing = await Wishlist.findOne({
      where: { userId, productId },
    });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({
        success: true,
        isWishlisted: false,
        message: "Removed from wishlist",
      });
    } else {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      await Wishlist.create({ userId, productId });
      return res.status(201).json({
        success: true,
        isWishlisted: true,
        message: "Added to wishlist ❤️",
      });
    }
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await Wishlist.destroy({
      where: { userId, productId },
    });

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};
