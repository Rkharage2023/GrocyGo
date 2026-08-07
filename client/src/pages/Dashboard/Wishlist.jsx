import { FaHeart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Wishlist() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t("wishlist")}</h1>
        <p className="text-gray-500 mt-1">{t("quickWishlistDesc", { defaultValue: "Products you've saved for later." })}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-5">
          <FaHeart size={36} className="text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">{t("wishlistEmpty", { defaultValue: "Your Wishlist is Empty" })}</h2>
        <p className="text-gray-400 mt-2 max-w-sm">
          {t("wishlistEmptyDesc", { defaultValue: "Browse our store and save your favourite products here. They'll be waiting for you when you're ready to buy." })}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-medium">
          🚧 {t("comingSoon", { defaultValue: "Feature coming soon" })}
        </span>
      </div>
    </div>
  );
}

export default Wishlist;
