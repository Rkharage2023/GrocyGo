import {
  FaHome,
  FaClipboardList,
  FaHeart,
  FaClock,
  FaMapMarkerAlt,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaTachometerAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

function CustomerSidebar({ isOpen, setIsOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const menus = [
    { title: t("storeHome"), icon: <FaHome />, path: "/" },
    { title: t("dashboard"), icon: <FaTachometerAlt />, path: "/dashboard" },
    { title: t("myOrders"), icon: <FaClipboardList />, path: "/dashboard/orders" },
    { title: t("wishlist"), icon: <FaHeart />, path: "/dashboard/wishlist" },
    { title: t("pickupSlots"), icon: <FaClock />, path: "/dashboard/slots" },
    { title: t("addresses"), icon: <FaMapMarkerAlt />, path: "/dashboard/address" },
    { title: t("settings"), icon: <FaCog />, path: "/dashboard/settings" },
  ];

  const handleLogout = () => {
    if (setIsOpen) setIsOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`w-72 bg-gradient-to-b from-green-700 to-green-900 text-white h-screen shadow-xl flex flex-col fixed inset-y-0 left-0 z-30 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User Info */}
        <div className="p-8 border-b border-green-600">
          <div className="flex items-center gap-3">
            <FaUserCircle size={48} className="text-green-200 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{user?.name || t("profile")}</h2>
              <p className="text-green-200 text-sm truncate">{user?.mobile}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-green-600/50 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-green-300 rounded-full" />
            {t("customerAccount")}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menus.map((menu) => (
            <NavLink
              key={menu.title}
              to={menu.path}
              end={menu.path === "/dashboard"}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-xl mb-2 transition-all font-medium ${
                  isActive
                    ? "bg-white text-green-700 font-semibold shadow-md"
                    : "hover:bg-green-600/60 text-green-100"
                }`
              }
            >
              <span className="text-base">{menu.icon}</span>
              {menu.title}
            </NavLink>
          ))}
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-green-600 space-y-2">
          <NavLink
            to="/profile"
            onClick={() => setIsOpen && setIsOpen(false)}
            className="flex items-center gap-4 px-5 py-3 rounded-xl hover:bg-green-600/60 text-green-100 transition font-medium"
          >
            <FaUserCircle />
            {t("myProfile")}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl transition font-medium"
          >
            <FaSignOutAlt />
            {t("logout")}
          </button>
        </div>
      </aside>
    </>
  );
}

export default CustomerSidebar;
