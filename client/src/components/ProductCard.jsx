import { useState, useContext } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { useTranslation } from "react-i18next";

function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

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
      alert("Please login to add items to cart!");
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
    <div className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
      {/* Badges */}
      <div className="flex justify-between items-center mb-1 w-full">
        {product.offerBadge ? (
          <span className="bg-rose-600 text-white text-[10px] px-2.5 py-1 rounded-full font-extrabold tracking-wide uppercase shadow-sm">
            {translateBadge(product.offerBadge)}
          </span>
        ) : (
          <span />
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-medium">
            {t("lowStock")}
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium">
            {t("outOfStock")}
          </span>
        )}
      </div>

      {/* Product image + info */}
      <div className="text-center mt-2 flex-1 flex flex-col items-center">
        <div className="w-32 h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border shadow-sm relative group">
          {product.image && product.image.startsWith("http") ? (
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
          ) : (
            <span className="text-7xl">{product.image || "📦"}</span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              activeWish ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-white/80 text-gray-400 hover:text-rose-500"
            }`}
            title={activeWish ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={15} fill={activeWish ? "currentColor" : "none"} />
          </button>
        </div>

        <h3 className="mt-5 text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h3>

        {/* Unit & Loose badge */}
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {product.unit === "Loose (सुट्टा)" || product.unit === "Loose"
              ? (i18n.language === "mr" ? "सुट्टा किराणा" : "Loose Kirana")
              : product.unit}
          </span>
        </div>

        {/* Pricing (MRP vs Kirana Selling Price) */}
        <div className="mt-3 flex flex-col items-center">
          {product.discount > 0 ? (
            <div className="space-y-0.5 text-center">
              <div className="flex items-center gap-2 justify-center">
                <span className="line-through text-gray-400 text-xs font-medium">
                  M.R.P. ₹{parseFloat(product.originalPrice).toFixed(2)}
                </span>
                <span className="text-2xl font-black text-green-700">
                  ₹{parseFloat(product.finalPrice).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide inline-block shadow-sm">
                {t("savePrefix", { value: parseFloat(product.discount).toFixed(2), defaultValue: `Save ₹${parseFloat(product.discount).toFixed(2)}` })}
              </p>
            </div>
          ) : product.mrp && parseFloat(product.mrp) > parseFloat(product.price) ? (
            <div className="space-y-0.5 text-center">
              <div className="flex items-center gap-2 justify-center">
                <span className="line-through text-gray-400 text-xs font-medium">
                  M.R.P. ₹{parseFloat(product.mrp).toFixed(2)}
                </span>
                <span className="text-2xl font-black text-green-700">
                  ₹{parseFloat(product.price).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide inline-block shadow-sm">
                {t("savePrefix", { value: (parseFloat(product.mrp) - parseFloat(product.price)).toFixed(2), defaultValue: `Save ₹${(parseFloat(product.mrp) - parseFloat(product.price)).toFixed(2)}` })}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xs text-gray-400 block font-medium">Kirana Rate</span>
              <span className="text-2xl font-black text-green-700">
                ₹{parseFloat(product.price).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAdd}
        disabled={product.stock === 0 || adding}
        className={`w-full mt-6 py-3 rounded-2xl font-semibold transition flex items-center justify-center gap-2
          ${added
            ? "bg-green-100 text-green-700"
            : "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          }`}
      >
        {adding ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <ShoppingCart size={16} />
            {added ? t("added") : t("addToCart")}
          </>
        )}
      </button>
    </div>
  );
}

export default ProductCard;

