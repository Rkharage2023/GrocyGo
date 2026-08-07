import { useContext } from "react";
import { CartContext } from "../context/CartContext";

/**
 * useCart hook — convenience wrapper around CartContext.
 */
export function useCart() {
  return useContext(CartContext);
}
