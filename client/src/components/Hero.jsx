import { Link } from "react-router-dom";
import { ShoppingBasket, Clock3, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-br from-green-50 via-white to-orange-50 overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Left */}
          <div>
            <span
              className="
              inline-flex
              items-center
              gap-2
              bg-green-100
              text-green-700
              px-3.5
              py-1.5
              rounded-full
              text-xs sm:text-sm
              font-bold
              "
            >
              {t("heroBadge")}
            </span>

            <h1
              className="
              text-3xl
              sm:text-5xl
              lg:text-6xl
              font-extrabold
              text-gray-800
              mt-4 sm:mt-6
              leading-tight
              "
            >
              {t("heroTitle")}
              <span className="text-green-600 block sm:inline">{t("heroTitleWaiting")}</span>
            </h1>

            <p
              className="
              text-gray-600
              text-sm sm:text-lg
              mt-3 sm:mt-6
              leading-relaxed sm:leading-8
              max-w-xl
              "
            >
              {t("heroSubtitle")}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <Link
                to="/products"
                className="
                bg-green-600
                text-white
                px-6 sm:px-8
                py-3.5 sm:py-4
                rounded-2xl
                font-bold
                text-sm sm:text-base
                text-center
                hover:bg-green-700
                transition shadow-sm
                "
              >
                {t("shopNow")}
              </Link>

              <Link
                to="/products"
                className="
                border
                border-green-600
                text-green-700
                px-6 sm:px-8
                py-3.5 sm:py-4
                rounded-2xl
                font-bold
                text-sm sm:text-base
                text-center
                hover:bg-green-50
                transition
                "
              >
                {t("exploreCategories")}
              </Link>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 mt-12">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <ShoppingBasket className="text-green-600" size={30} />

                <h3 className="font-semibold mt-3">{t("freshProducts")}</h3>

                <p className="text-sm text-gray-500 mt-2">
                  {t("freshProductsDesc")}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <Clock3 className="text-orange-500" size={30} />

                <h3 className="font-semibold mt-3">{t("bookSlot")}</h3>

                <p className="text-sm text-gray-500 mt-2">
                  {t("bookSlotDesc")}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <Truck className="text-green-600" size={30} />

                <h3 className="font-semibold mt-3">{t("noWaiting")}</h3>

                <p className="text-sm text-gray-500 mt-2">
                  {t("noWaitingDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center">
            <div
              className="
              w-[280px]
              h-[280px]
              sm:w-[350px]
              sm:h-[350px]
              lg:w-[400px]
              lg:h-[400px]
              bg-gradient-to-br
              from-green-100
              to-orange-100
              rounded-full
              flex
              items-center
              justify-center
              shadow-xl
              transition-all
              duration-300
              "
            >
              <div className="text-center p-4">
                <div className="text-6xl sm:text-8xl">🛒</div>

                <h2
                  className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                  text-green-700
                  mt-3
                  "
                >
                  {t("storeName", { defaultValue: "Dake Kirana Store" })}
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 mt-1">{t("orderBookPickup")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
