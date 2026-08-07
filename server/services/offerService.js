const { Offer, Product, Category, OfferProduct, OfferCategory } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");

const createOffer = async (data) => {
  return await Offer.create(data);
};

const updateOffer = async (id, data) => {
  const offer = await Offer.findByPk(id);
  if (!offer) {
    throw new AppError("Offer not found", 404);
  }
  return await offer.update(data);
};

const deleteOffer = async (id) => {
  const offer = await Offer.findByPk(id);
  if (!offer) {
    throw new AppError("Offer not found", 404);
  }
  await offer.destroy();
  return true;
};

const assignProductsToOffer = async (offerId, productIds) => {
  const offer = await Offer.findByPk(offerId);
  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  // Clear existing mappings
  await OfferProduct.destroy({ where: { offerId } });

  // Map and insert new mappings
  if (Array.isArray(productIds) && productIds.length > 0) {
    const records = productIds.map((pid) => ({
      offerId,
      productId: pid,
    }));
    await OfferProduct.bulkCreate(records);
  }
  return true;
};

const assignCategoriesToOffer = async (offerId, categoryIds) => {
  const offer = await Offer.findByPk(offerId);
  if (!offer) {
    throw new AppError("Offer not found", 404);
  }

  // Clear existing mappings
  await OfferCategory.destroy({ where: { offerId } });

  // Map and insert new mappings
  if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    const records = categoryIds.map((cid) => ({
      offerId,
      categoryId: cid,
    }));
    await OfferCategory.bulkCreate(records);
  }
  return true;
};

const getOfferById = async (id) => {
  const offer = await Offer.findByPk(id, {
    include: [
      {
        model: Product,
        attributes: ["id", "name_en", "name_mr", "price", "image"],
        through: { attributes: [] },
      },
      {
        model: Category,
        attributes: ["id", "name_en", "name_mr", "image"],
        through: { attributes: [] },
      },
    ],
  });
  if (!offer) {
    throw new AppError("Offer not found", 404);
  }
  return offer;
};

const getAllOffersAdmin = async () => {
  return await Offer.findAll({
    include: [
      {
        model: Product,
        attributes: ["id", "name_en"],
        through: { attributes: [] },
      },
      {
        model: Category,
        attributes: ["id", "name_en"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getHomepageOffers = async () => {
  const now = new Date();
  const activeOffers = await Offer.findAll({
    where: {
      isActive: true,
      startDate: { [Op.lte]: now },
      endDate: { [Op.gte]: now },
    },
    include: [
      {
        model: Product,
        attributes: ["id", "name_en", "name_mr", "price", "image", "categoryId", "stock", "unit", "isActive"],
        through: { attributes: [] },
      },
      {
        model: Category,
        attributes: ["id", "name_en", "name_mr"],
        through: { attributes: [] },
        include: [
          {
            model: Product,
            attributes: ["id", "name_en", "name_mr", "price", "image", "categoryId", "stock", "unit", "isActive"],
          }
        ]
      }
    ],
    order: [
      ["priority", "DESC"],
      ["id", "DESC"],
    ],
  });

  const processedOffers = activeOffers.map((offer) => {
    const o = offer.toJSON();
    const directProducts = (o.Products || []).filter(p => p.isActive);
    const categoryProducts = [];
    
    if (o.Categories) {
      o.Categories.forEach((cat) => {
        if (cat.Products) {
          cat.Products.forEach((p) => {
            if (p.isActive) {
              categoryProducts.push(p);
            }
          });
        }
      });
    }
    
    const productMap = new Map();
    directProducts.forEach(p => productMap.set(p.id, p));
    categoryProducts.forEach(p => productMap.set(p.id, p));
    
    o.Products = Array.from(productMap.values());
    return o;
  });

  // Filter out by categories or types
  const heroBanners = processedOffers.filter(
    (o) => o.isActive
  );
  
  const todayOffers = processedOffers.filter(
    (o) => o.offerType === "PERCENTAGE_DISCOUNT" || o.offerType === "FIXED_DISCOUNT" || o.offerType === "BUY_X_GET_Y" || o.offerType === "BANNER_ONLY"
  );
  
  const festivalOffers = processedOffers.filter(
    (o) => o.offerType === "FESTIVAL_OFFER"
  );
  
  const flashSales = processedOffers.filter(
    (o) => o.offerType === "FLASH_SALE"
  );

  return {
    heroBanners,
    todayOffers,
    festivalOffers,
    flashSales,
    allActiveOffers: processedOffers,
  };
};

module.exports = {
  createOffer,
  updateOffer,
  deleteOffer,
  assignProductsToOffer,
  assignCategoriesToOffer,
  getOfferById,
  getAllOffersAdmin,
  getHomepageOffers,
};
