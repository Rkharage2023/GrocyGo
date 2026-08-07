import API from "./api";

/**
 * Product service — centralised API calls for products.
 * Admin-only mutations (create, update, delete) require a valid admin token
 * which is automatically attached by the Axios interceptor in api.js.
 */

/**
 * Fetch all products with optional filters.
 * @param {object} params - { page, limit, search, categoryId }
 */
export const getAllProducts = (params = {}) =>
  API.get("/products", { params }).then((r) => r.data);

/** Fetch a single product by ID. */
export const getProductById = (id) =>
  API.get(`/products/${id}`).then((r) => r.data);

/** Create a new product (Admin only). */
export const createProduct = (productData) =>
  API.post("/products", productData).then((r) => r.data);

/** Update an existing product (Admin only). */
export const updateProduct = (id, productData) =>
  API.put(`/products/${id}`, productData).then((r) => r.data);

/** Delete a product by ID (Admin only). */
export const deleteProduct = (id) =>
  API.delete(`/products/${id}`).then((r) => r.data);
