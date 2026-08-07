import API from "./api";

/** Add a product to cart */
export const addToCart = (productId, quantity = 1) =>
  API.post("/cart", { productId, quantity }).then((r) => r.data);

/** Get current user's cart */
export const getMyCart = (date = null) =>
  API.get(date ? `/cart?date=${date}` : "/cart").then((r) => r.data);

/** Update quantity of a cart item */
export const updateCartQuantity = (productId, quantity) =>
  API.put(`/cart/${productId}`, { quantity }).then((r) => r.data);

/** Remove a product from cart */
export const removeFromCart = (productId) =>
  API.delete(`/cart/${productId}`).then((r) => r.data);

/** Clear entire cart */
export const clearCart = () =>
  API.delete("/cart").then((r) => r.data);
