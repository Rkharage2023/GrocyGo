import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { FaBell, FaSignOutAlt, FaUserCircle, FaArrowLeft, FaBars, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

function Topbar({ toggleSidebar }) {
  const { t } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-3 md:px-8 flex items-center justify-between shadow-sm shrink-0 max-w-full overflow-hidden">
      {/* Left — Back button + welcome */}
      <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
        {/* Toggle Sidebar Button for Mobile */}
        <button
          onClick={toggleSidebar}
          title="Open Menu"
          className="p-2 md:p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition lg:hidden shrink-0"
        >
          <FaBars size={15} />
        </button>

        <button
          onClick={() => navigate(-1)}
          title="Go Back"
          className="hidden md:flex items-center gap-2 px-2.5 md:px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition text-sm font-medium shrink-0"
        >
          <FaArrowLeft size={13} />
          <span>{t("back")}</span>
        </button>
        <div className="text-gray-500 text-xs md:text-sm font-medium truncate max-w-[110px] sm:max-w-xs md:max-w-none">
          {t("welcomeBackCustomer")}{" "}
          <span className="text-green-700 font-bold">{user?.name?.split(" ")[0] || t("profile")}</span> 👋
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Shop Button */}
        <Link
          to="/products"
          className="px-3 py-2 text-green-700 font-semibold hover:bg-green-50 rounded-xl transition text-sm flex items-center gap-1.5 border border-green-200"
        >
          <span>🛍️</span>
          <span className="hidden sm:inline">{t("shop")}</span>
        </Link>

        {/* Language switcher drop down */}
        <div className="text-gray-800 select-none">
          <LanguageSwitcher />
        </div>

        {/* Cart Icon */}
        <Link
          to="/cart"
          title="Cart"
          className="relative w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition text-gray-500 hover:text-gray-700"
        >
          <FaShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-xl transition"
          >
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <FaUserCircle size={22} className="text-green-700" />
            </div>
            <div className="hidden md:block text-left text-sm">
              <p className="font-semibold text-gray-700 leading-tight">
                {user?.name || t("profile")}
              </p>
              <p className="text-gray-400 text-xs leading-none">
                {user?.mobile}
              </p>
            </div>
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
              <Link
                to="/"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpenDropdown(false)}
              >
                {t("storeHome")}
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpenDropdown(false)}
              >
                {t("shop")}
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpenDropdown(false)}
              >
                {t("myProfile")}
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => {
                  setOpenDropdown(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <FaSignOutAlt size={14} />
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
