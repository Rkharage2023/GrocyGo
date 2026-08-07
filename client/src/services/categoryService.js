import API from "./api";

/** Fetch all categories */
export const getAllCategories = () =>
  API.get("/categories").then((r) => r.data);

/** Fetch a single category by ID */
export const getCategoryById = (id) =>
  API.get(`/categories/${id}`).then((r) => r.data);

/** Create a new category (Admin only) */
export const createCategory = (data) =>
  API.post("/categories", data).then((r) => r.data);

/** Update a category (Admin only) */
export const updateCategory = (id, data) =>
  API.put(`/categories/${id}`, data).then((r) => r.data);

/** Delete a category (Admin only) */
export const deleteCategory = (id) =>
  API.delete(`/categories/${id}`).then((r) => r.data);
