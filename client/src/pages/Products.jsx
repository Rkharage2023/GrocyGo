import { useState, useEffect, useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function ProductCard({ product, onAddToCart, adding }) {
  const { t } = useTranslation();
  const hasDiscount = product.discount > 0;

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="h-44 bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center text-6xl relative overflow-hidden">
        {product.image && product.image.startsWith("http") ? (
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        ) : (
          product.image || "🛍️"
        )}

        {product.offerBadge && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
            {translateBadge(product.offerBadge)}
          </span>
        )}

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
            {t("lowStock")}
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
            {t("outOfStock")}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">
          {product.Category?.name || t("generalCategory", { defaultValue: "General" })}
        </p>
        <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-gray-400 text-xs font-semibold">
                    ₹{parseFloat(product.originalPrice).toFixed(2)}
                  </span>
                  <span className="text-2xl font-black text-green-700">
                    ₹{parseFloat(product.finalPrice).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide">
                  {t("savePrefix", { value: parseFloat(product.discount).toFixed(2), defaultValue: `Save ₹${parseFloat(product.discount).toFixed(2)}` })}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-green-700">₹{parseFloat(product.price).toFixed(2)}</p>
            )}
            <p className="text-xs text-gray-450 mt-0.5 font-medium">{product.unit}</p>
          </div>

          <button
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0 || adding === product.id}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 self-end"
          >
            {adding === product.id ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={16} />
            )}
            {t("add")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Products() {
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [adding, setAdding] = useState(null);
  const [toast, setToast] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-DESC");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeOffers, setActiveOffers] = useState([]);

  // Suggestions State
  const [allProductsForSuggestions, setAllProductsForSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const fetchAllProductsForSuggestions = async () => {
    try {
      const res = await getAllProducts({ limit: 1000 });
      if (res.success) {
        setAllProductsForSuggestions(res.data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products for suggestions:", err);
    }
  };

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const [sort, order] = sortBy.split("-");
      const res = await getAllProducts({
        page,
        limit: 12,
        search,
        categoryId: selectedCategory,
        sort,
        order,
        inStock: inStockOnly ? "true" : "false",
        ...params
      });
      if (res.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotalProducts(res.data.totalProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.success) {
        setCategories(res.data.filter(c => c.isActive));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchActiveOffers = async () => {
    try {
      const res = await API.get("/offers/homepage");
      if (res.data?.success) {
        setActiveOffers(res.data.data.allActiveOffers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllProductsForSuggestions();
    fetchActiveOffers();
  }, [i18n.language]);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, search, sortBy, inStockOnly, i18n.language]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) {
      setToast(t("loginToViewCart", { defaultValue: "Please login to add items to cart!" }));
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      setAdding(productId);
      await addToCart(productId, 1);
      setToast(t("addedToCartToast", { defaultValue: "Added to cart! 🛒" }));
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setToast(err.response?.data?.message || t("failedAddToCart", { defaultValue: "Failed to add to cart" }));
      setTimeout(() => setToast(""), 3000);
    } finally {
      setAdding(null);
    }
  };

  // Debounce searchInput to update search state on keypress automatically
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const suggestions = (() => {
    if (!searchInput) return [];
    const query = searchInput.toLowerCase().trim();
    const matches = new Set();

    for (const p of allProductsForSuggestions) {
      if (p.name_en && p.name_en.toLowerCase().includes(query)) {
        matches.add(p.name_en);
      }
      if (p.name_mr && p.name_mr.toLowerCase().includes(query)) {
        matches.add(p.name_mr);
      }
      if (p.ProductKeywords) {
        for (const k of p.ProductKeywords) {
          if (k.keyword && k.keyword.toLowerCase().includes(query)) {
            matches.add(k.keyword);
          }
        }
      }
    }
    return Array.from(matches).slice(0, 5);
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold animate-bounce">
          {toast}
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-14 px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{t("freshGroceries")}</h1>
        <p className="mt-3 text-green-100 max-w-xl mx-auto">
          {t("orderFreshSubtitle")}
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-8 flex max-w-xl mx-auto gap-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
                setActiveSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveSuggestionIndex(prev => Math.max(prev - 1, -1));
                } else if (e.key === "Enter") {
                  if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                    e.preventDefault();
                    const selected = suggestions[activeSuggestionIndex];
                    setSearchInput(selected);
                    setSearch(selected);
                    setPage(1);
                    setShowSuggestions(false);
                  }
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              placeholder={t("searchPlaceholderProducts")}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50 max-h-56">
                {suggestions.map((kw, idx) => (
                  <button
                    key={kw}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents blur before click registers
                      setSearchInput(kw);
                      setSearch(kw);
                      setPage(1);
                      setShowSuggestions(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs transition flex items-center justify-between text-gray-700 font-medium ${
                      idx === activeSuggestionIndex ? "bg-green-50" : "hover:bg-green-50/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">🔍 {kw}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-semibold transition"
          >
            {t("search")}
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters (Visible on desktop/tablet) */}
          <aside className="hidden md:block md:w-56 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={16} className="text-green-600" /> {t("categories")}
              </h2>
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition ${
                  selectedCategory === ""
                    ? "bg-green-600 text-white"
                    : "hover:bg-green-50 text-gray-700"
                }`}
              >
                {t("allProducts")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id.toString())}
                  className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition ${
                    selectedCategory === cat.id.toString()
                      ? "bg-green-600 text-white"
                      : "hover:bg-green-50 text-gray-700"
                  }`}
                >
                  {cat.image && (
                    <span className="mr-2 inline-block align-middle">
                      {cat.image.startsWith("http") ? (
                        <img src={cat.image} className="w-5 h-5 object-cover rounded-full inline" alt="" />
                      ) : (
                        cat.image
                      )}
                    </span>
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Mobile Category Dropdown (Visible only on mobile/below md) */}
          <div className="md:hidden w-full mb-4 px-1">
            <label htmlFor="category-select" className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
              <Filter size={14} className="text-green-600" /> {t("categories")}
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition"
            >
              <option value="">{t("allProducts")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results count & Sort/Stock filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <p className="text-gray-500 text-sm font-semibold">
                  {loading ? t("loading") : `${totalProducts} ${t("productsFound")}`}
                </p>
                {search && (
                  <button
                    onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    {t("clearSearch")}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Stock filter */}
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  {t("inStockOnly")}
                </label>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:border-green-500 outline-none cursor-pointer shadow-sm"
                >
                  <option value="createdAt-DESC">{t("newest")}</option>
                  <option value="price-ASC">{t("priceLowHigh")}</option>
                  <option value="price-DESC">{t("priceHighLow")}</option>
                  <option value="name-ASC">{t("nameAsc")}</option>
                </select>
              </div>
            </div>

            {/* Category Offer Banner */}
            {selectedCategory && (() => {
              const currentCat = categories.find(c => c.id.toString() === selectedCategory);
              const catOffer = activeOffers.find(offer => offer.Categories?.some(cat => cat.id.toString() === selectedCategory));
              if (!currentCat || !catOffer) return null;
              
              return (
                <div className="bg-rose-50 border border-rose-250 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="text-rose-900 font-black text-lg flex items-center gap-1.5">
                      🎉 {currentCat.name} - {catOffer.discountType === "PERCENTAGE" || catOffer.offerType === "PERCENTAGE_DISCOUNT" ? t("percentageOff", { value: Math.round(catOffer.discountValue) }) : t("fixedOff", { value: Math.round(catOffer.discountValue) })}
                    </h3>
                    <p className="text-rose-600 text-xs mt-1.5 font-bold">
                      {catOffer.title} &bull; {catOffer.description || t("catalogPromoActive")}
                    </p>
                  </div>
                  <span className="text-[9px] bg-rose-600 text-white font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm shrink-0">
                    {t("offerActive")}
                  </span>
                </div>
              );
            })()}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-gray-700">{t("noProductsFound")}</h3>
                <p className="text-gray-400 mt-2">{t("noProductsTryDifferent")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    adding={adding}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2.5 border rounded-xl hover:bg-gray-100 disabled:opacity-40 font-semibold text-gray-700"
                >
                  <ChevronLeft size={18} /> {t("prev")}
                </button>
                <span className="text-gray-600 font-medium">
                  {t("pageOf", { current: page, total: totalPages })}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2.5 border rounded-xl hover:bg-gray-100 disabled:opacity-40 font-semibold text-gray-700"
                >
                  {t("next")} <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;

