import { ShoppingBasket, ShoppingCart, Clock3, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <ShoppingBasket size={38} />,
      title: t("browseProducts"),
      description: t("browseProductsDesc"),
    },
    {
      icon: <ShoppingCart size={38} />,
      title: t("addToCart"),
      description: t("addToCartDesc"),
    },
    {
      icon: <Clock3 size={38} />,
      title: t("bookPickupSlot"),
      description: t("bookPickupSlotDesc"),
    },
    {
      icon: <Smile size={38} />,
      title: t("collectNoWaiting"),
      description: t("collectNoWaitingDesc"),
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800">
            {t("howItWorksTitle")}
          </h2>

          <p className="text-gray-500 mt-4 text-lg">
            {t("howItWorksSubtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="
              bg-green-50
              rounded-3xl
              p-8
              text-center
              shadow-sm
              hover:shadow-lg
              hover:-translate-y-2
              transition-all
              duration-300
              "
            >
              <div
                className="
                w-20
                h-20
                rounded-full
                bg-white
                flex
                items-center
                justify-center
                mx-auto
                text-green-700
                shadow-md
                "
              >
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mt-6">
                {step.title}
              </h3>

              <p className="text-gray-500 mt-4 leading-7">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div
          className="
          mt-20
          bg-gradient-to-r
          from-green-600
          to-green-700
          rounded-3xl
          p-10
          text-center
          text-white
          "
        >
          <h3 className="text-3xl font-bold">
            {t("skipQueueSaveTime")}
          </h3>

          <p className="mt-4 text-green-100 text-lg">
            {t("orderOnlineCollect")}
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
