import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CategoryCard from "./CategoryCard";
import API from "../services/api";

function Categories() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        if (res.data.success) {
          const activeCats = res.data.data.filter(c => c.isActive);
          setCategories(activeCats);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [i18n.language]);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2
            className="
            text-4xl
            font-bold
            text-gray-800
            "
          >
            {t("shopByCategories")}
          </h2>

          <p
            className="
            text-gray-500
            mt-4
            text-lg
            "
          >
            {t("findEssentials")}
          </p>
        </div>

        {loading ? (
          <div className="text-center mt-14 text-gray-500 text-lg">{t("loadingCategories")}</div>
        ) : (
          <div
            className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-8
            mt-14
            "
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;
