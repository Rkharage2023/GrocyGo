import { ShoppingBasket, Phone, MapPin, Mail, Clock } from "lucide-react";
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                w-12
                h-12
                rounded-full
                bg-green-600
                flex
                items-center
                justify-center
                "
              >
                <ShoppingBasket className="text-white" size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">{t("storeName", { defaultValue: "Dake Kirana Store" })}</h2>

                <p className="text-sm text-gray-400">{t("freshQueueFree")}</p>
              </div>
            </div>

            <p className="mt-6 leading-8 text-gray-400">
              {t("heroSubtitle")}
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white text-xl font-semibold">{t("company")}</h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link className="hover:text-green-400">{t("aboutUs")}</Link>

              <Link className="hover:text-green-400">{t("contactUs")}</Link>

              <Link className="hover:text-green-400">{t("careers")}</Link>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-white text-xl font-semibold">{t("profile")}</h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link to="/dashboard/orders" className="hover:text-green-400">{t("myOrders")}</Link>

              <Link to="/dashboard/wishlist" className="hover:text-green-400">{t("wishlist")}</Link>

              <Link className="hover:text-green-400">{t("helpCenter")}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-xl font-semibold">{t("contact")}</h3>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3 items-center">
                <Phone className="text-green-500 shrink-0" size={18} />
                <p>+91 {t("storePhone", { defaultValue: "9604822360" })}</p>
              </div>

              <div className="flex gap-3 items-center">
                <Mail className="text-green-500 shrink-0" size={18} />
                <p>{t("storeEmail", { defaultValue: "dakekirana@gmail.com" })}</p>
              </div>

              <div className="flex gap-3 items-start">
                <Clock className="text-green-500 shrink-0 mt-1" size={18} />
                <div>
                  <p className="font-semibold text-white">{t("storeTiming")}</p>
                  <p className="text-xs text-gray-400">{t("storeTimingVal")}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MapPin className="text-green-500 shrink-0 mt-1" size={18} />
                <p className="text-xs leading-relaxed">{t("storeAddress")}</p>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-4 mt-8">
              <button
                className="
  w-12
  h-12
  rounded-full
  bg-gray-800
  flex
  items-center
  justify-center
  hover:bg-green-600
  transition
  "
              >
                <FaInstagram size={20} />
              </button>

              <button
                className="
  w-12
  h-12
  rounded-full
  bg-gray-800
  flex
  items-center
  justify-center
  hover:bg-green-600
  transition
  "
              >
                <FaFacebookF size={18} />
              </button>

              <button
                className="
  w-12
  h-12
  rounded-full
  bg-gray-800
  flex
  items-center
  justify-center
  hover:bg-green-600
  transition
  "
              >
                <FaLinkedinIn size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
          border-t
          border-gray-800
          mt-14
          pt-8
          text-center
          "
        >
          <p className="text-gray-500">{t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
