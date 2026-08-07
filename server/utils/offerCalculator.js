const { Op } = require("sequelize");
const { Offer, Product, Category } = require("../models");

/**
 * Fetch all active offers from the database with their product/category associations.
 * Cached or fetched once per request pipeline to prevent database roundtrips.
 */
const getActiveOffers = async (targetDateStr = null) => {
  let targetDate = new Date();
  if (targetDateStr) {
    // If it's a simple YYYY-MM-DD string, append time to evaluate against end of day
    targetDate = targetDateStr.includes("T") ? new Date(targetDateStr) : new Date(`${targetDateStr}T23:59:59`);
  }
  
  return await Offer.findAll({
    where: {
      isActive: true,
      startDate: { [Op.lte]: targetDate },
      endDate: { [Op.gte]: targetDate },
    },
    include: [
      {
        model: Product,
        attributes: ["id"],
        through: { attributes: [] },
      },
      {
        model: Category,
        attributes: ["id"],
        through: { attributes: [] },
      },
    ],
    order: [
      ["priority", "DESC"],
      ["id", "DESC"],
    ],
  });
};

/**
 * Calculates the best offer for a single product from a pre-fetched list of active offers.
 * Handles priority hierarchy: Product-specific offers > Category-specific offers.
 */
const calculateProductOffer = (product, activeOffers) => {
  if (!product) return null;

  const originalPrice = parseFloat(product.price);
  if (isNaN(originalPrice) || originalPrice <= 0) return null;

  // 1. Separate product-specific and category-specific offers that apply to this item
  const productOffers = [];
  const categoryOffers = [];

  for (const offer of activeOffers) {
    // Check product mapping
    const hasProduct = offer.Products?.some((p) => p.id === product.id);
    if (hasProduct) {
      productOffers.push(offer);
      continue;
    }

    // Check category mapping
    const hasCategory = offer.Categories?.some((c) => c.id === product.categoryId);
    if (hasCategory) {
      categoryOffers.push(offer);
    }
  }

  // 2. Select the applicable set: Product offers take priority over Category offers
  const applicableOffers = productOffers.length > 0 ? productOffers : categoryOffers;

  if (applicableOffers.length === 0) {
    return null; // No offers apply
  }

  // 3. Find the best offer from the list
  // The activeOffers list is already sorted by priority DESC, id DESC.
  // In case there are multiple offers with the same highest priority, we evaluate if one provides a larger discount.
  let bestOffer = applicableOffers[0];
  const highestPriority = bestOffer.priority;

  for (let i = 1; i < applicableOffers.length; i++) {
    const offer = applicableOffers[i];
    if (offer.priority < highestPriority) {
      break; // Since list is sorted by priority, we can stop if priority drops
    }
    
    // If priorities are equal, compare discount amounts
    const valCurrent = parseFloat(offer.discountValue || 0);
    const valBest = parseFloat(bestOffer.discountValue || 0);
    if (valCurrent > valBest) {
      bestOffer = offer;
    }
  }

  return bestOffer;
};

/**
 * Dynamically computes the dynamic price details for a product.
 * Returns finalPrice, discount amount, savings, badge, endsIn, etc.
 */
const getProductPriceDetails = (product, activeOffers) => {
  const originalPrice = parseFloat(product.price || 0);
  const result = {
    originalPrice,
    finalPrice: originalPrice,
    discount: 0,
    discountPercentage: 0,
    savings: 0,
    offerBadge: null,
    offerTitle: null,
    offerDescription: null,
    offerEndsIn: null,
    offerEndDate: null,
  };

  const offer = calculateProductOffer(product, activeOffers);
  if (!offer) {
    return result;
  }

  result.offerTitle = offer.title;
  result.offerDescription = offer.description;
  result.offerStartDate = offer.startDate;
  result.offerEndDate = offer.endDate;
  
  const end = new Date(offer.endDate).getTime();
  const now = new Date().getTime();
  result.offerEndsIn = Math.max(0, end - now);

  const discountVal = parseFloat(offer.discountValue || 0);

  if (offer.offerType === "PERCENTAGE_DISCOUNT") {
    const calculatedDiscount = originalPrice * (discountVal / 100);
    result.discount = parseFloat(calculatedDiscount.toFixed(2));
    result.finalPrice = parseFloat(Math.max(0, originalPrice - result.discount).toFixed(2));
    result.discountPercentage = Math.round(discountVal);
    result.offerBadge = `${result.discountPercentage}% OFF`;
  } else if (offer.offerType === "FIXED_DISCOUNT") {
    result.discount = parseFloat(discountVal.toFixed(2));
    result.finalPrice = parseFloat(Math.max(0, originalPrice - result.discount).toFixed(2));
    result.discountPercentage = Math.round((result.discount / originalPrice) * 100);
    result.offerBadge = `₹${Math.round(discountVal)} OFF`;
  } else if (offer.offerType === "BUY_X_GET_Y") {
    // For general listing, final unit price is not discounted directly, 
    // but we badge it e.g., "Buy 2 Get 1 Free"
    result.offerBadge = `Buy ${offer.buyQuantity} Get ${offer.freeQuantity} Free`;
  } else if (offer.offerType === "FLASH_SALE" || offer.offerType === "FESTIVAL_OFFER") {
    // Treat based on discountType
    if (offer.discountType === "PERCENTAGE") {
      const calculatedDiscount = originalPrice * (discountVal / 100);
      result.discount = parseFloat(calculatedDiscount.toFixed(2));
      result.finalPrice = parseFloat(Math.max(0, originalPrice - result.discount).toFixed(2));
      result.discountPercentage = Math.round(discountVal);
      result.offerBadge = `${result.discountPercentage}% OFF`;
    } else if (offer.discountType === "FIXED") {
      result.discount = parseFloat(discountVal.toFixed(2));
      result.finalPrice = parseFloat(Math.max(0, originalPrice - result.discount).toFixed(2));
      result.discountPercentage = Math.round((result.discount / originalPrice) * 100);
      result.offerBadge = `₹${Math.round(discountVal)} OFF`;
    } else if (offer.discountType === "FREE_QTY") {
      result.offerBadge = `Buy ${offer.buyQuantity} Get ${offer.freeQuantity} Free`;
    }
  }

  result.savings = result.discount;
  return result;
};

/**
 * Calculates cart calculations dynamically.
 * Computes subtotal, discount, savings, grand total.
 * Recalculates Buy X Get Y offers based on item quantities.
 */
const calculateCartTotals = async (cartItems, targetDateStr = null) => {
  const activeOffers = await getActiveOffers(targetDateStr);
  
  let subtotal = 0;
  let totalSavings = 0;
  const items = [];

  for (const item of cartItems) {
    const product = item.Product;
    if (!product) continue;

    const originalPrice = parseFloat(product.price);
    const quantity = parseInt(item.quantity || 1, 10);
    const itemSubtotal = originalPrice * quantity;
    subtotal += itemSubtotal;

    // Get offer details for this unit
    const details = getProductPriceDetails(product, activeOffers);
    const offer = calculateProductOffer(product, activeOffers);

    let finalItemPrice = originalPrice;
    let itemSavings = 0;
    let appliedOfferText = null;

    if (offer) {
      appliedOfferText = offer.title;
      // Handle unit-level discount vs quantity-level discount (Buy X Get Y)
      if (offer.offerType === "BUY_X_GET_Y" || (offer.offerType === "FESTIVAL_OFFER" && offer.discountType === "FREE_QTY")) {
        const setSize = (offer.buyQuantity || 1) + (offer.freeQuantity || 0);
        const freeItems = Math.floor(quantity / setSize) * (offer.freeQuantity || 0);
        itemSavings = freeItems * originalPrice;
        finalItemPrice = originalPrice; // unit price remains same, savings deducted in total
      } else {
        // Unit-level discount (percentage or fixed)
        finalItemPrice = details.finalPrice;
        itemSavings = details.discount * quantity;
      }
    }

    totalSavings += itemSavings;
    items.push({
      cartItemId: item.id,
      productId: product.id,
      name_en: product.name_en,
      name_mr: product.name_mr,
      quantity,
      originalPrice,
      finalPrice: finalItemPrice,
      itemSubtotal,
      savings: itemSavings,
      totalPrice: itemSubtotal - itemSavings,
      offerBadge: details.offerBadge,
      appliedOffer: appliedOfferText,
      offerStartDate: details.offerStartDate,
      offerEndDate: details.offerEndDate,
    });
  }

  const grandTotal = Math.max(0, subtotal - totalSavings);

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(totalSavings.toFixed(2)),
    savings: parseFloat(totalSavings.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
  };
};

module.exports = {
  getActiveOffers,
  getProductPriceDetails,
  calculateCartTotals,
  calculateProductOffer,
};
