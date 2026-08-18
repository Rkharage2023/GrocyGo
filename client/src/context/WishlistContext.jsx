import { createContext, useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isLoggedIn) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get("/wishlist");
      if (res.data?.success) {
        const items = res.data.data || [];
        setWishlistItems(items);
        setWishlistIds(new Set(items.map((i) => i.productId)));
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isLoggedIn]);

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) return { success: false, message: "Please login to manage wishlist" };
    try {
      const res = await API.post(`/wishlist/${productId}`);
      if (res.data?.success) {
        await fetchWishlist();
        return res.data;
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      return { success: false, message: "Failed to update wishlist" };
    }
  };

  const isWishlisted = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        fetchWishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
