import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-5">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-green-600 flex items-center justify-center text-white text-lg sm:text-xl shadow-xs">
              🛒
            </div>

            <div>
              <h1 className="text-base sm:text-2xl font-black text-green-700 leading-tight">
                {t("storeName", { defaultValue: "Dake Kirana Store" })}
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">{t("freshQueueFree")}</p>
            </div>
          </Link>

          {/* Right Side (Desktop) */}
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
                className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition"
              >
                {t("login")}
              </Link>
            ) : (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Cart (Hidden on Dashboard and Admin routes) */}
                {!isDashboardOrAdmin && (
                  <Link
                    to="/cart"
                    className="relative p-3 rounded-full hover:bg-green-50 transition text-gray-700"
                  >
                    <ShoppingCart size={22} className="text-green-700" />
                    {cartCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setOpenProfile(!openProfile)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-green-50 transition"
                  >
                    <FaUserCircle className="text-3xl text-green-700" />
                  </button>

                  {openProfile && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn divide-y divide-gray-50">
                      <div className="px-5 py-3">
                        <p className="font-bold text-gray-800 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.mobile}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setOpenProfile(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition"
                        >
                          <FaUser className="text-green-700" />
                          {t("profile")}
                        </Link>

                        <Link
                          to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                          onClick={() => setOpenProfile(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition"
                        >
                          <FaTachometerAlt className="text-green-700" />
                          {user?.role === "ADMIN" ? t("adminPanel", { defaultValue: "Admin Panel" }) : t("dashboard")}
                        </Link>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            setOpenProfile(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <FaSignOutAlt />
                          {t("logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Right Side Group */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-3">
            {isLoggedIn && (
              <>
                <NotificationBell />
                {!isDashboardOrAdmin && (
                  <Link
                    to="/cart"
                    className="relative p-2 rounded-full hover:bg-green-50 transition text-gray-700"
                  >
                    <ShoppingCart size={22} className="text-green-700" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
              </>
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-green-700 transition"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            {!isLoggedIn ? (
              <div className="space-y-3">
                <Link
                  to="/products"
                  onClick={() => setMobileMenu(false)}
                  className="block w-full text-center py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm"
                >
                  🛍️ {t("shop")}
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenu(false)}
                  className="block w-full text-center py-3 rounded-xl bg-green-600 text-white font-bold text-sm shadow-sm"
                >
                  {t("login")}
                </Link>
                <div className="pt-3 border-t border-gray-100 flex justify-center text-gray-800">
                  <LanguageSwitcher />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="pb-3 border-b border-gray-100 mb-2 flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-bold text-gray-800 text-sm">{user?.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{user?.mobile}</p>
                  </div>
                  <LanguageSwitcher />
                </div>

                <Link
                  to="/products"
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 transition"
                >
                  🛍️ {t("shop")}
                </Link>

                <Link
                  to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 transition"
                >
                  <FaTachometerAlt className="text-green-700" />
                  {user?.role === "ADMIN" ? t("adminPanel", { defaultValue: "Admin Panel" }) : t("dashboard")}
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 transition"
                >
                  <FaUser className="text-green-700" />
                  {t("profile")}
                </Link>

                <button
                  onClick={() => {
                    setMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition text-left"
                >
                  <FaSignOutAlt />
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
