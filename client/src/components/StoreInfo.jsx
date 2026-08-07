import { Clock3, Phone, MapPin, ShoppingBasket } from "lucide-react";
import { useTranslation } from "react-i18next";

function StoreInfo() {
  const { t } = useTranslation();

  return (
    <section className="bg-green-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800">{t("visitOurStore")}</h2>

          <p className="text-gray-500 mt-4 text-lg">
            {t("orderOnlineCollectDesc")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Clock3 className="text-green-700" size={30} />
            </div>

            <h3 className="font-bold text-xl mt-6">{t("storeTiming")}</h3>

            <p className="text-gray-500 mt-3">{t("storeTimingVal")}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingBasket className="text-green-700" size={30} />
            </div>

            <h3 className="font-bold text-xl mt-6">{t("pickupTiming")}</h3>

            <p className="text-gray-500 mt-3">{t("pickupTimingVal")}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="text-green-700" size={30} />
            </div>

            <h3 className="font-bold text-xl mt-6">{t("contact")}</h3>

            <p className="text-gray-500 mt-3">+91 98765 43210</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <MapPin className="text-green-700" size={30} />
            </div>

            <h3 className="font-bold text-xl mt-6">{t("location")}</h3>

            <p className="text-gray-500 mt-3">{t("locationVal")}</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="
          mt-20
          rounded-3xl
          bg-gradient-to-r
          from-green-600
          to-green-700
          p-12
          text-center
          text-white
          "
        >
          <h2 className="text-4xl font-bold">{t("readyToSkip")}</h2>

          <p className="mt-5 text-green-100 text-lg">
            {t("shopCollectNoWaiting")}
          </p>

          <button
            className="
            mt-8
            bg-white
            text-green-700
            px-8
            py-4
            rounded-2xl
            font-semibold
            hover:scale-105
            transition
            "
          >
            {t("startShopping")}
          </button>
        </div>
      </div>
    </section>
  );
}

export default StoreInfo;
