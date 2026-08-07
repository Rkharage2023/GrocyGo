import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaTag, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function OfferCarousel({ banners = [] }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // 4 seconds auto-slide
    return () => clearInterval(interval);
  }, [banners, isHovered]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6 select-none">
      {/* Main Banner Slider Frame (Amazon & Flipkart inspired proportions) */}
      <div 
        className="relative h-44 sm:h-60 md:h-72 lg:h-[320px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-gradient-to-r from-green-950 via-green-900 to-emerald-950 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {banners.map((slide, idx) => {
          const isActive = idx === currentIndex;
          
          // Format discount badge text
          let discountBadge = "";
          if (slide.discountValue) {
            discountBadge = slide.discountType === "PERCENTAGE" 
              ? `${Math.round(slide.discountValue)}% OFF`
              : `₹${Math.round(slide.discountValue)} OFF`;
          } else if (slide.buyQuantity && slide.freeQuantity) {
            `Buy ${slide.buyQuantity} Get ${slide.freeQuantity} Free`;
          }

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Poster Image Sized According to Banner */}
              {slide.bannerImage ? (
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={slide.bannerImage}
                    alt={slide.title}
                    className="w-full h-full object-cover object-right md:object-center transform group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent md:w-3/4" />
                </div>
              ) : (
                /* Fallback Graphic Banner if no poster uploaded */
                <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900 flex items-center justify-between p-8 md:p-12 overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute right-1/3 -top-10 w-60 h-60 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />
                </div>
              )}

              {/* Offer Details Floating Content */}
              <div className="absolute left-4 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 max-w-[75%] sm:max-w-md md:max-w-lg z-20 flex flex-col items-start space-y-2 sm:space-y-3">
                {/* Offer Type / Discount Tag */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 tracking-wider">
                    <FaTag className="text-[10px]" />
                    {discountBadge || t(slide.offerType, { defaultValue: slide.offerType?.replace("_", " ") || "SPECIAL OFFER" })}
                  </span>
                  {parseFloat(slide.minimumPurchase) > 0 && (
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                      Min. ₹{slide.minimumPurchase}
                    </span>
                  )}
                </div>

                {/* Offer Title */}
                <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                  {slide.title}
                </h2>

                {/* Description */}
                {slide.description && (
                  <p className="text-gray-200 text-xs sm:text-sm line-clamp-2 drop-shadow hidden sm:block max-w-xl">
                    {slide.description}
                  </p>
                )}

                {/* CTA Shop Now Button */}
                <Link
                  to="/products"
                  className="mt-3 sm:mt-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs sm:text-sm font-extrabold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-green-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>{t("shopOfferNow", { defaultValue: "Shop Deals Now" })}</span>
                  <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows (Amazon/Flipkart Style) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Offer"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg border border-gray-100 transition-all z-30 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <FaChevronLeft className="text-xs sm:text-sm" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next Offer"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg border border-gray-100 transition-all z-30 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <FaChevronRight className="text-xs sm:text-sm" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-30 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "bg-amber-400 w-6 sm:w-8" : "bg-white/50 hover:bg-white/80 w-2"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OfferCarousel;
