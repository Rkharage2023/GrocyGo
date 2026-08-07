import API from "./api";

export const getAllOffersAdmin = () =>
  API.get("/offers").then((r) => r.data);

export const getOfferById = (id) =>
  API.get(`/offers/${id}`).then((r) => r.data);

export const createOffer = (offerData) =>
  API.post("/offers", offerData).then((r) => r.data);

export const updateOffer = (id, offerData) =>
  API.put(`/offers/${id}`, offerData).then((r) => r.data);

export const deleteOffer = (id) =>
  API.delete(`/offers/${id}`).then((r) => r.data);

export const assignProductsToOffer = (id, productIds) =>
  API.post(`/offers/${id}/assign-products`, { productIds }).then((r) => r.data);

export const assignCategoriesToOffer = (id, categoryIds) =>
  API.post(`/offers/${id}/assign-categories`, { categoryIds }).then((r) => r.data);

export const getHomepageOffers = () =>
  API.get("/offers/homepage").then((r) => r.data);
