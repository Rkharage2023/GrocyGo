import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import API from "../services/api";

function TrendingProducts() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products?limit=4");
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      } catch (err) {
        console.error("Error fetching trending products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [i18n.language]);

  return (
    <section className="bg-green-50 py-10 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end">
          <div>
            <h2
              className="
              text-2xl
              sm:text-4xl
              font-extrabold
              text-gray-800
              "
            >
              {t("trendingProducts")}
            </h2>

            <p
              className="
              text-gray-500
              mt-1.5 sm:mt-3
              text-xs sm:text-base
              "
            >
              {t("trendingProductsDesc")}
            </p>
          </div>

          <Link
            to="/products"
            className="
            text-green-700
            font-bold
            text-xs sm:text-sm
            hover:underline
            shrink-0
            "
          >
            {t("viewAll")} &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center mt-8 sm:mt-14 text-gray-500 text-sm sm:text-lg">{t("loadingProducts")}</div>
        ) : (
          <div
            className="
            grid
            grid-cols-2
            sm:grid-cols-2
            lg:grid-cols-4
            gap-3 sm:gap-8
            mt-8 sm:mt-14
            "
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendingProducts;
