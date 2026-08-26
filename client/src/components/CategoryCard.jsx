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
      rounded-3xl
      p-6
      shadow-sm
      hover:shadow-lg
      hover:-translate-y-2
      transition-all
      duration-300
      cursor-pointer
      flex
      flex-col
      items-center
      text-center
      "
    >
      <div
        className="
        w-24
        h-24
        rounded-full
        bg-green-50
        flex
        items-center
        justify-center
        text-5xl
        overflow-hidden
        border
        "
      >
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

      <h3
        className="
        mt-5
        text-lg
        font-semibold
        text-gray-700
        "
      >
        {displayName}
      </h3>

      {category.description && (
        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{category.description}</p>
      )}
    </Link>
  );
}

export default CategoryCard;
