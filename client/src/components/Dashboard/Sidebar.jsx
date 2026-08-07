import {
  FaHome,
  FaBoxOpen,
  FaHeart,
  FaClock,
  FaMapMarkerAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const menus = [
    {
      title: "Overview",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      title: "My Orders",
      icon: <FaBoxOpen />,
      path: "/dashboard/orders",
    },
    {
      title: "Wishlist",
      icon: <FaHeart />,
      path: "/dashboard/wishlist",
    },
    {
      title: "Pickup Slots",
      icon: <FaClock />,
      path: "/dashboard/slots",
    },
    {
      title: "Saved Addresses",
      icon: <FaMapMarkerAlt />,
      path: "/dashboard/address",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/dashboard/settings",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-green-700 to-green-800 text-white min-h-screen shadow-xl">
      {/* Logo */}
      <div className="px-8 py-8 border-b border-green-600">
        <h1 className="text-3xl font-bold">🛒 GrocyGo</h1>

        <p className="text-green-200 mt-2">Customer Dashboard</p>
      </div>

      {/* Menu */}

      <div className="mt-8 px-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.title}
            to={menu.path}
            end={menu.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-xl mb-3 transition-all duration-200 ${
                isActive
                  ? "bg-white text-green-700 font-semibold shadow-md"
                  : "hover:bg-green-600"
              }`
            }
          >
            <span className="text-lg">{menu.icon}</span>

            {menu.title}
          </NavLink>
        ))}
      </div>

      {/* Logout */}

      <div className="absolute bottom-8 w-72 px-4">
        <button
          onClick={handleLogout}
          className="
          w-full
          flex
          items-center
          gap-4
          px-5
          py-4
          rounded-xl
          bg-red-500
          hover:bg-red-600
          transition
          "
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
