import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

import {
  FaUserCircle,
  FaUser,
  FaTachometerAlt,
  FaSignOutAlt,
  FaShoppingBag,
} from "react-icons/fa";

function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);

  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);

  const [mobileMenu, setMobileMenu] = useState(false);

  const isDashboardOrAdmin =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-5">
        <div className="h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-11 h-11 rounded-full bg-green-600 flex items-center justify-center text-white text-xl">
              🛒
            </div>

            <div>
              <h1 className="text-2xl font-bold text-green-700">GrocyGo</h1>

              <p className="text-xs text-gray-500">{t("freshQueueFree")}</p>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="
              w-full
              bg-green-50
              border
              border-green-200
              rounded-full
              py-3
              pl-12
              pr-5
              outline-none
              focus:border-green-500
              focus:ring-2
              focus:ring-green-200
              transition
              "
            />
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/products"
              className="px-4 py-2 text-green-700 font-medium hover:bg-green-50 rounded-full transition"
            >
              🛍️ {t("shop")}
            </Link>
            <LanguageSwitcher />
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="
                px-6
                py-2.5
                bg-green-600
                text-white
                font-medium
                rounded-full
                hover:bg-green-700
                transition
                "
              >
                {t("login")}
              </Link>
            ) : (
              <>
                {/* Cart (Hidden on Dashboard and Admin routes) */}
                {!isDashboardOrAdmin && (
                  <Link
                    to="/cart"
                    className="
                      relative
                      p-3
                      rounded-full
                      hover:bg-green-50
                      transition
                    "
                  >
                    <ShoppingCart size={24} className="text-green-700" />

                    {cartCount > 0 && (
                      <span
                        className="
                          absolute
                          -top-1
                          -right-1
                          bg-orange-500
                          text-white
                          text-xs
                          w-5
                          h-5
                          rounded-full
                          flex
                          items-center
                          justify-center
                        "
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setOpenProfile(!openProfile)}
                    className="
                      w-11
                      h-11
                      rounded-full
                      bg-green-100
                      flex
                      items-center
                      justify-center
                      hover:bg-green-200
                      transition
                    "
                  >
                    <FaUserCircle size={28} className="text-green-700" />
                  </button>

                  {/* Dropdown */}
                  {openProfile && (
                    <div
                      className="
                        absolute
                        right-0
                        mt-3
                        w-56
                        bg-white
                        rounded-2xl
                        shadow-xl
                        border
                        border-green-100
                        overflow-hidden
                      "
                    >
                      <Link
                        to="/products"
                        className="
                          flex
                          items-center
                          gap-3
                          px-5
                          py-4
                          hover:bg-green-50
                          transition
                        "
                      >
                        <FaShoppingBag className="text-green-700" />
                        {t("shop")}
                      </Link>

                      <Link
                        to="/profile"
                        className="
                          flex
                          items-center
                          gap-3
                          px-5
                          py-4
                          hover:bg-green-50
                          transition
                        "
                      >
                        <FaUser className="text-green-700" />
                        {t("profile")}
                      </Link>

                      <Link
                        to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                        className="
                          flex
                          items-center
                          gap-3
                          px-5
                          py-4
                          hover:bg-green-50
                          transition
                        "
                      >
                        <FaTachometerAlt className="text-green-700" />
                        {user?.role === "ADMIN" ? t("adminPanel", { defaultValue: "Admin Panel" }) : t("dashboard")}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="
                          w-full
                          flex
                          items-center
                          gap-3
                          px-5
                          py-4
                          text-red-500
                          hover:bg-red-50
                          transition
                        "
                      >
                        <FaSignOutAlt />
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Right Side Group */}
          <div className="flex md:hidden items-center gap-4">
            {isLoggedIn && !isDashboardOrAdmin && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-green-50 transition"
              >
                <ShoppingCart size={24} className="text-green-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden"
            >
              <Menu size={28} className="text-green-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden py-4 border-t">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="
                w-full
                bg-green-50
                border
                border-green-200
                rounded-xl
                p-3
                mb-4
                outline-none
              "
            />

            {!isLoggedIn ? (
              <div className="space-y-4">
                <Link
                  to="/products"
                  className="
                    block
                    w-full
                    text-center
                    py-3
                    rounded-xl
                    bg-green-50
                    text-green-700
                    font-medium
                  "
                >
                  🛍️ {t("shop")}
                </Link>
                <Link
                  to="/login"
                  className="
                    block
                    w-full
                    text-center
                    py-3
                    rounded-xl
                    bg-green-600
                    text-white
                    font-medium
                  "
                >
                  {t("login")}
                </Link>
                <div className="pt-3 border-t border-gray-100 flex justify-center text-gray-800">
                  <LanguageSwitcher />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="pb-2 border-b border-gray-100 mb-2 flex justify-center text-gray-800">
                  <LanguageSwitcher />
                </div>

                <Link
                  to="/products"
                  className="block font-medium text-gray-700 hover:text-green-600 transition"
                >
                  🛍️ {t("shop")}
                </Link>

                <Link to={user?.role === "ADMIN" ? "/admin" : "/dashboard"} className="block font-medium">
                  {user?.role === "ADMIN" ? t("adminPanel", { defaultValue: "Admin Panel" }) : t("dashboard")}
                </Link>

                <Link to="/profile" className="block font-medium">
                  {t("profile")}
                </Link>

                <button onClick={handleLogout} className="text-red-500 block font-medium w-full text-left">
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
