const offerService = require("../services/offerService");

const createOffer = async (req, res, next) => {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (err) {
    next(err);
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await offerService.updateOffer(id, req.body);
    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (err) {
    next(err);
  }
};

const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await offerService.deleteOffer(id);
    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const assignProductsToOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    await offerService.assignProductsToOffer(id, productIds);
    res.status(200).json({
      success: true,
      message: "Products assigned to offer successfully",
    });
  } catch (err) {
    next(err);
  }
};

const assignCategoriesToOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryIds } = req.body;
    await offerService.assignCategoriesToOffer(id, categoryIds);
    res.status(200).json({
      success: true,
      message: "Categories assigned to offer successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await offerService.getOfferById(id);
    res.status(200).json({
      success: true,
      message: "Offer details retrieved successfully",
      data: offer,
    });
  } catch (err) {
    next(err);
  }
};

const getAllOffersAdmin = async (req, res, next) => {
  try {
    const offers = await offerService.getAllOffersAdmin();
    res.status(200).json({
      success: true,
      message: "All offers retrieved successfully",
      data: offers,
    });
  } catch (err) {
    next(err);
  }
};

const getHomepageOffers = async (req, res, next) => {
  try {
    const data = await offerService.getHomepageOffers();
    res.status(200).json({
      success: true,
      message: "Homepage offers retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
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
