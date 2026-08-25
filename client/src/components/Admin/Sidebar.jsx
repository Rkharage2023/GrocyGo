import {
  FaHome,
  FaTags,
  FaShoppingBasket,
  FaClipboardList,
  FaClock,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaPercentage,
} from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const menus = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin",
    },
    {
      title: "Categories",
      icon: <FaTags />,
      path: "/admin/categories",
    },
    {
      title: "Products",
      icon: <FaShoppingBasket />,
      path: "/admin/products",
    },
    {
      title: "Offers",
      icon: <FaPercentage />,
      path: "/admin/offers",
    },
    {
      title: "Orders",
      icon: <FaClipboardList />,
      path: "/admin/orders",
    },
    {
      title: "Pickup Slots",
      icon: <FaClock />,
      path: "/admin/slots",
    },
    {
      title: "Customers",
      icon: <FaUsers />,
      path: "/admin/customers",
    },
    {
      title: "Reports",
      icon: <FaChartBar />,
      path: "/admin/reports",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/admin/settings",
    },
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
        className={`w-72 bg-gradient-to-b from-green-700 to-green-900 text-white h-screen shadow-xl flex flex-col fixed inset-y-0 left-0 z-30 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setIsOpen && setIsOpen(false)}
          className="p-8 border-b border-green-600 block hover:bg-green-800/30 transition"
        >
          <h1 className="text-2xl font-bold">🛒 Dake Kirana Store</h1>
          <p className="text-green-200 mt-2">Admin Panel</p>
        </Link>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menus.map((menu) => (
            <NavLink
              key={menu.title}
              to={menu.path}
              end={menu.path === "/admin"}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-xl mb-3 transition-all ${isActive
                  ? "bg-white text-green-700 font-semibold"
                  : "hover:bg-green-600"
                }`
              }
            >
              {menu.icon}
              {menu.title}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-green-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 bg-red-500 hover:bg-red-600 px-5 py-4 rounded-xl transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
