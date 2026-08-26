import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import * as cartService from "../services/cartService";
import { useTranslation } from "react-i18next";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { i18n } = useTranslation();
  const { isLoggedIn } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartDetails, setCartDetails] = useState({
    subtotal: 0,
    discount: 0,
    savings: 0,
    grandTotal: 0,
  });

  const fetchCart = async (date = null) => {
    if (!isLoggedIn) {
      setCartItems([]);
      setCartDetails({ subtotal: 0, discount: 0, savings: 0, grandTotal: 0 });
      return;
    }
    try {
      setCartLoading(true);
      const res = await cartService.getMyCart(date);
      if (res.success && res.data?.items) {
        setCartItems(res.data.items);
        setCartDetails({
          subtotal: res.data.subtotal || 0,
          discount: res.data.discount || 0,
          savings: res.data.savings || 0,
          grandTotal: res.data.grandTotal || 0,
        });
      } else {
        setCartItems([]);
        setCartDetails({ subtotal: 0, discount: 0, savings: 0, grandTotal: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCartItems([]);
      setCartDetails({ subtotal: 0, discount: 0, savings: 0, grandTotal: 0 });
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartService.addToCart(productId, quantity);
    await fetchCart();
    return res;
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    const res = await cartService.updateCartQuantity(productId, quantity);
    await fetchCart();
    return res;
  };

  const removeFromCart = async (productId) => {
    const res = await cartService.removeFromCart(productId);
    await fetchCart();
    return res;
  };

  const clearCart = async () => {
    const res = await cartService.clearCart();
    setCartItems([]);
    setCartDetails({ subtotal: 0, discount: 0, savings: 0, grandTotal: 0 });
    return res;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartDetails,
        cartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
