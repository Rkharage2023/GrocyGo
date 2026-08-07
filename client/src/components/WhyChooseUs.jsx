import { Clock3, ShieldCheck, Leaf, TimerOff } from "lucide-react";
import { useTranslation } from "react-i18next";

function WhyChooseUs() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <TimerOff size={35} />,
      title: t("noWaitingQueue"),
      description: t("noWaitingQueueDesc"),
    },
    {
      icon: <Clock3 size={35} />,
      title: t("flexiblePickupSlots"),
      description: t("flexiblePickupSlotsDesc"),
    },
    {
      icon: <Leaf size={35} />,
      title: t("freshDailyGroceries"),
      description: t("freshDailyGroceriesDesc"),
    },
    {
      icon: <ShieldCheck size={35} />,
      title: t("secureOrdering"),
      description: t("secureOrderingDesc"),
    },
  ];

  return (
    <section className="bg-green-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800">
            {t("whyChooseTitle")}
          </h2>

          <p className="text-gray-500 mt-4 text-lg">
            {t("whyChooseSubtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
              bg-white
              rounded-3xl
              p-8
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-2
              transition-all
              duration-300
              text-center
              "
            >
              <div
                className="
                w-20
                h-20
                rounded-full
                bg-green-100
                flex
                items-center
                justify-center
                mx-auto
                text-green-700
                "
              >
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mt-6">
                {feature.title}
              </h3>

              <p className="text-gray-500 mt-4 leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
