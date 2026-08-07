const { where } = require("sequelize");
const { Product, Cart, CartItem, Category } = require("../models");
const AppError = require("../utils/AppError");
const { calculateCartTotals, getActiveOffers, calculateProductOffer } = require("../utils/offerCalculator");

const adjustQuantityForOffers = async (product, targetQty) => {
    const activeOffers = await getActiveOffers();
    const offer = calculateProductOffer(product, activeOffers);
    
    if (offer && offer.offerType === "BUY_X_GET_Y") {
        const buyQty = Number(offer.buyQuantity || 1);
        const freeQty = Number(offer.freeQuantity || 0);
        
        if (buyQty > 0 && freeQty > 0) {
            const setSize = buyQty + freeQty;
            const remainder = targetQty % setSize;
            if (remainder >= buyQty) {
                const proposedQty = targetQty - remainder + setSize;
                if (proposedQty <= product.stock) {
                    targetQty = proposedQty;
                } else {
                    targetQty = product.stock;
                }
            }
        }
    }
    return targetQty;
};

const addToCart = async (userId, productId, quantity) => {
    //Check product exists
    const product = await Product.findOne({
        where: {
            id: productId,
            isActive: true,
        },
    });

    if (!product) {
        throw new AppError("Product not Found", 404);
    }

    // Find or create user's cart
    const [cart] = await Cart.findOrCreate({
        where: { userId },
        defaults: { userId }
    });

    // Check if product already exists in cart
    const existingItem = await CartItem.findOne({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    let newQuantity = quantity;
    if (existingItem) {
        newQuantity = existingItem.quantity + quantity;
    }

    // Apply auto-adjustment
    const adjustedQuantity = await adjustQuantityForOffers(product, newQuantity);

    if (adjustedQuantity > product.stock) {
        throw new AppError(
            `Only ${product.stock} item(s) available in stock`,
            400
        );
    }

    if (existingItem) {
        existingItem.quantity = adjustedQuantity;
        await existingItem.save();
        return existingItem;
    }

    const cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: adjustedQuantity,
    });

    return cartItem;
};

const getMyCart = async (userId, targetDateStr = null) => {
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
                        ],
                        attributes: [
                            "id",
                            "name_en",
                            "name_mr",
                            "price",
                            "stock",
                            "unit",
                            "image",
                            "isActive",
                            "categoryId"
                        ],
                    },
                ],
            },
        ],
    });

    if (!cart) {
        return {
            cartId: null,
            totalItems: 0,
            grandTotal: 0,
            subtotal: 0,
            discount: 0,
            savings: 0,
            items: [],
        };
    }

    const activeCartItems = cart.CartItems.filter((item) => item.Product && item.Product.isActive);
    const totals = await calculateCartTotals(activeCartItems, targetDateStr);

    const mappedItems = totals.items.map((it) => {
      const originalItem = activeCartItems.find((ci) => ci.id === it.cartItemId);
      return {
        id: it.cartItemId,
        productId: it.productId,
        name_en: it.name_en,
        name_mr: it.name_mr,
        name: it.name_en,
        image: originalItem.Product.image,
        unit: originalItem.Product.unit,
        price: it.originalPrice,
        finalPrice: it.finalPrice,
        stock: originalItem.Product.stock,
        quantity: it.quantity,
        subtotal: it.itemSubtotal,
        savings: it.savings,
        totalPrice: it.totalPrice,
        offerBadge: it.offerBadge,
        appliedOffer: it.appliedOffer,
        offerStartDate: it.offerStartDate,
        offerEndDate: it.offerEndDate,
      };
    });

    return {
      cartId: cart.id,
      totalItems: mappedItems.reduce((acc, cur) => acc + cur.quantity, 0),
      subtotal: totals.subtotal,
      discount: totals.discount,
      savings: totals.savings,
      grandTotal: totals.grandTotal,
      items: mappedItems,
    };
};

const updateCartQuantity = async (userId, productId, quantity) => {
    if (quantity < 1) {
        throw new AppError("Quantity must be at least 1", 400);
    }

    const cart = await Cart.findOne({
        where: { userId },
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }
    // Find cart item
    const cartItem = await CartItem.findOne({
        where: {
            cartId: cart.id,
            productId,
        },
        include: [
            {
                model: Product,
            },
        ],
    });

    if (!cartItem) {
        throw new AppError("Product not found in cart", 404);
    }

    if (!cartItem.Product.isActive) {
        throw new AppError("Product is no longer available", 400);
    }

    // Apply auto-adjustment
    const adjustedQuantity = await adjustQuantityForOffers(cartItem.Product, quantity);

    if (adjustedQuantity > cartItem.Product.stock) {
        throw new AppError(
            `Only ${cartItem.Product.stock} item(s) available in stock`,
            400
        );
    }

    cartItem.quantity = adjustedQuantity;

    await cartItem.save();

    return cartItem;

};

const removeFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({
        where: { userId },
    });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const cartItem = await CartItem.findOne({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (!cartItem) {
        throw new AppError("Product not found in cart", 404);
    }

    await cartItem.destroy();

    return ;
};

const clearCart = async (userId) => {
  // Find user's cart
  const cart = await Cart.findOne({
    where: { userId },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  // Delete all cart items
  await CartItem.destroy({
    where: {
      cartId: cart.id,
    },
  });

  return;
};



module.exports = {
    addToCart,
    getMyCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
}   