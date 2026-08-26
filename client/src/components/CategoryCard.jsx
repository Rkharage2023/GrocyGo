import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  const { i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const displayName = i18n.language === "mr"
    ? (category.name_mr || category.name_en || category.name)
    : (category.name_en || category.name || category.name_mr);

  return (
    <Link
      to={`/products?categoryId=${category.id}`}
      className="
      bg-white
      rounded-2xl sm:rounded-3xl
      p-3.5 sm:p-6
      shadow-xs hover:shadow-lg
      hover:-translate-y-1.5
      transition-all duration-300
      cursor-pointer
      flex flex-col items-center text-center
      border border-gray-100 h-full justify-between
      "
    >
      <div className="flex flex-col items-center w-full">
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-green-50/80 flex items-center justify-center text-3xl sm:text-5xl overflow-hidden border border-green-100/50 shadow-2xs">
          {category.image && category.image.startsWith("http") && !imgError ? (
            <img
              src={category.image}
              className="w-full h-full object-cover"
              alt={displayName}
              onError={() => setImgError(true)}
            />
          ) : (
            category.image && !category.image.startsWith("http") ? category.image : "🛍️"
          )}
        </div>

        <h3 className="mt-2.5 sm:mt-5 text-xs sm:text-lg font-bold text-gray-800 line-clamp-1 w-full">
          {displayName}
        </h3>

        {category.description && (
          <p className="text-[10px] sm:text-sm text-gray-400 mt-1 sm:mt-2 line-clamp-2">{category.description}</p>
        )}
      </div>
    </Link>
  );
}

export default CategoryCard;
