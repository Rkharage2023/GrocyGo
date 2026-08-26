import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { WishlistContext } from "../../context/WishlistContext";
import { CartContext } from "../../context/CartContext";

function Wishlist() {
  const { t } = useTranslation();
  const { wishlistItems, toggleWishlist, loading } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [movingId, setMovingId] = useState(null);
  const [toast, setToast] = useState("");

  const handleMoveToCart = async (product) => {
    try {
      setMovingId(product.id);
      await addToCart(product.id, 1);
      await toggleWishlist(product.id);
      setToast(`Moved ${product.name} to Cart! 🛒`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t("wishlist")} ❤️</h1>
        <p className="text-gray-500 mt-1">{t("quickWishlistDesc", { defaultValue: "Products you've saved for later." })}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-green-700 font-medium">Loading wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-5">
            <FaHeart size={36} className="text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">{t("wishlistEmpty", { defaultValue: "Your Wishlist is Empty" })}</h2>
          <p className="text-gray-400 mt-2 max-w-sm">
            {t("wishlistEmptyDesc", { defaultValue: "Browse our store and save your favourite products here. They'll be waiting for you when you're ready to buy." })}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product || {};
            if (!product.id) return null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-40 bg-gradient-to-br from-green-50 to-orange-50 rounded-xl flex items-center justify-center text-6xl relative overflow-hidden mb-4 border">
                    {product.image && product.image.startsWith("http") ? (
                      <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                    ) : (
                      product.image || "📦"
                    )}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 right-2 p-2 bg-rose-50 text-rose-600 rounded-full border border-rose-200 shadow-sm hover:bg-rose-100 transition"
                      title="Remove"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                    {i18n.language === "mr"
                      ? (product.Category?.name_mr || product.Category?.name_en || product.Category?.name || "General")
                      : (product.Category?.name_en || product.Category?.name || product.Category?.name_mr || "General")}
                  </p>
                  <h3 className="font-bold text-gray-800 text-lg mt-0.5 line-clamp-1">
                    {i18n.language === "mr"
                      ? (product.name_mr || product.name_en || product.name)
                      : (product.name_en || product.name || product.name_mr)}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{product.unit}</p>

                  <p className="text-xl font-extrabold text-green-700 mt-3">
                    ₹{parseFloat(product.price || 0).toFixed(2)}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={movingId === product.id || product.stock === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaShoppingCart size={13} />
                    {movingId === product.id ? "Moving..." : "Move to Cart"}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Remove item"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
