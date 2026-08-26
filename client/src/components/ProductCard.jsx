import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Heart } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const activeWish = isWishlisted(product.id);

  const translateBadge = (badge) => {
    if (!badge) return "";
    const buyGetMatch = badge.match(/Buy\s+(\d+)\s+Get\s+(\d+)\s+Free/i);
    if (buyGetMatch) {
      return t("buyXGetYFree", { buy: buyGetMatch[1], get: buyGetMatch[2], defaultValue: badge });
    }
    const percentMatch = badge.match(/(\d+)%\s+OFF/i);
    if (percentMatch) {
      return t("percentageOff", { value: percentMatch[1], defaultValue: badge });
    }
    const fixedMatch = badge.match(/₹(\d+)\s+OFF/i);
    if (fixedMatch) {
      return t("fixedOff", { value: fixedMatch[1], defaultValue: badge });
    }
    return badge;
  };

  const handleAdd = async () => {
    if (!isLoggedIn) {
      toast.warning("Please login to add items to cart!");
      return;
    }
    if (product.stock === 0) return;
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between border border-gray-100 h-full">
      {/* Badges */}
      <div className="flex justify-between items-center mb-1 w-full gap-1">
        {product.offerBadge ? (
          <span className="bg-rose-600 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-extrabold tracking-wide uppercase shadow-2xs truncate">
            {translateBadge(product.offerBadge)}
          </span>
        ) : (
          <span />
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="bg-orange-100 text-orange-600 text-[9px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold shrink-0">
            {t("lowStock")}
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-red-100 text-red-600 text-[9px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold shrink-0">
            {t("outOfStock")}
          </span>
        )}
      </div>

      {/* Product image + info */}
      <div className="text-center mt-1 sm:mt-2 flex-1 flex flex-col items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 shadow-2xs relative group">
          {product.image && product.image.startsWith("http") && !imgError ? (
            <img
              src={product.image}
              className="w-full h-full object-cover"
              alt={product.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-5xl sm:text-7xl">{imgError ? "📦" : (product.image || "📦")}</span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
              activeWish ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-white/80 text-gray-400 hover:text-rose-500"
            }`}
            title={activeWish ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} className="sm:w-4 sm:h-4" fill={activeWish ? "currentColor" : "none"} />
          </button>
        </div>

        <h3 className="mt-3 sm:mt-5 text-sm sm:text-lg font-bold text-gray-800 line-clamp-1 w-full">
          {i18n.language === "mr"
            ? (product.name_mr || product.name_en || product.name)
            : (product.name_en || product.name || product.name_mr)}
        </h3>

        {/* Unit */}
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {product.unit === "Loose (सुट्टा)" || product.unit === "Loose"
              ? (i18n.language === "mr" ? "सुट्टा किराणा" : "Loose Kirana")
              : product.unit}
          </span>
        </div>

        {/* Pricing (MRP vs Kirana Selling Price) */}
        <div className="mt-2 sm:mt-3 flex flex-col items-center">
          {product.discount > 0 ? (
            <div className="space-y-0.5 text-center">
              <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-wrap">
                <span className="line-through text-gray-400 text-[10px] sm:text-xs font-medium">
                  ₹{parseFloat(product.originalPrice).toFixed(0)}
                </span>
                <span className="text-base sm:text-2xl font-black text-green-700">
                  ₹{parseFloat(product.finalPrice).toFixed(0)}
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide inline-block shadow-2xs">
                {t("savePrefix", { value: parseFloat(product.discount).toFixed(0), defaultValue: `Save ₹${parseFloat(product.discount).toFixed(0)}` })}
              </p>
            </div>
          ) : product.mrp && parseFloat(product.mrp) > parseFloat(product.price) ? (
            <div className="space-y-0.5 text-center">
              <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-wrap">
                <span className="line-through text-gray-400 text-[10px] sm:text-xs font-medium">
                  ₹{parseFloat(product.mrp).toFixed(0)}
                </span>
                <span className="text-base sm:text-2xl font-black text-green-700">
                  ₹{parseFloat(product.price).toFixed(0)}
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide inline-block shadow-2xs">
                {t("savePrefix", { value: (parseFloat(product.mrp) - parseFloat(product.price)).toFixed(0), defaultValue: `Save ₹${(parseFloat(product.mrp) - parseFloat(product.price)).toFixed(0)}` })}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-[10px] text-gray-400 block font-medium">Kirana Rate</span>
              <span className="text-base sm:text-2xl font-black text-green-700">
                ₹{parseFloat(product.price).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAdd}
        disabled={product.stock === 0 || adding}
        className={`w-full mt-3 sm:mt-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs
          ${added
            ? "bg-green-100 text-green-700"
            : "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          }`}
      >
        {adding ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
            {added ? t("added") : t("addToCart")}
          </>
        )}
      </button>
    </div>
  );
}

export default ProductCard;

