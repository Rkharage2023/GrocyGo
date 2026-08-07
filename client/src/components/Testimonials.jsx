import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

function Testimonials() {
  const { t } = useTranslation();

  const reviews = [
    {
      name: t("shivaneePatil"),
      city: t("kolhapur"),
      review: t("review1"),
    },
    {
      name: t("riyaSharma"),
      city: t("pune"),
      review: t("review2"),
    },
    {
      name: t("amitDesai"),
      city: t("sangli"),
      review: t("review3"),
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800">
            {t("whatCustomersSay")}
          </h2>

          <p className="text-gray-500 mt-4 text-lg">
            {t("customerTrust")}
          </p>
        </div>

        {/* Reviews */}
        <div className="grid lg:grid-cols-3 gap-8 mt-16">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="
              bg-green-50
              rounded-3xl
              p-8
              shadow-sm
              hover:shadow-lg
              transition-all
              duration-300
              "
            >
              {/* Stars */}
              <div className="flex gap-1 text-yellow-500">
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
                <Star fill="currentColor" size={20} />
              </div>

              {/* Review */}
              <p className="text-gray-600 leading-8 mt-6">"{review.review}"</p>

              {/* User */}
              <div className="mt-8 flex items-center gap-4">
                <div
                  className="
                  w-14
                  h-14
                  rounded-full
                  bg-green-600
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-lg
                  "
                >
                  {review.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">{review.name}</h3>

                  <p className="text-sm text-gray-500">{review.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
