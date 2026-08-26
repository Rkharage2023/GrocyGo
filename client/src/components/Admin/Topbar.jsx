import { FaBell, FaUserCircle, FaSearch, FaArrowLeft, FaSignOutAlt, FaCog, FaBars } from "react-icons/fa";
import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";


import API from "../../services/api";

function Topbar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [openNotifications, setOpenNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          API.get("/products?limit=1000"),
          API.get("/orders/admin/orders?limit=10"),
        ]);
        const items = [];
        
        if (prodRes.data?.success) {
          const lowStock = (prodRes.data.data?.products || []).filter(p => p.stock <= 5);
          lowStock.slice(0, 3).forEach(p => {
            items.push({
              id: `stock-${p.id}`,
              type: "stock",
              title: "Low Stock Warning ⚠️",
              message: `${p.name} has only ${p.stock} ${p.unit} remaining.`,
              path: "/admin/products",
              time: "Action required",
            });
          });
        }

        if (orderRes.data?.success) {
          const pendingOrders = (orderRes.data.data?.orders || orderRes.data.data || []).filter(o => o.status === "PENDING");
          pendingOrders.slice(0, 3).forEach(o => {
            items.push({
              id: `order-${o.id}`,
              type: "order",
              title: `Pending Order #${o.id} 📦`,
              message: `Order #${o.id} requires review and confirmation.`,
              path: "/admin/orders",
              time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          });
        }

        setNotifications(items);
        setUnreadCount(items.length);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Toggle Sidebar Button for Mobile */}
        <button
          onClick={toggleSidebar}
          title="Open Menu"
          className="p-2 md:p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition lg:hidden"
        >
          <FaBars size={16} />
        </button>

        <button
          onClick={() => navigate(-1)}
          title="Go Back"
          className="hidden md:flex items-center gap-2 px-2.5 md:px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition text-sm font-medium"
        >
          <FaArrowLeft size={13} />
          <span>Back</span>
        </button>
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 leading-tight">Admin Panel</h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Welcome back, {user?.name || "Admin"} 👋
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
          <FaSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={handleSearchSubmit}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-72 pl-11 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
        </form>



        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotifications(!openNotifications)}
            className="relative p-3 rounded-full hover:bg-gray-100 transition"
            title="Notifications"
          >
            <FaBell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                  <p className="text-[11px] text-gray-400">Store alerts & activity updates</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2.5 py-1 rounded-full transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs font-medium">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setOpenNotifications(false);
                        navigate(item.path);
                      }}
                      className="p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                        item.type === "stock" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {item.type === "stock" ? "⚠️" : "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-gray-800 text-xs truncate">{item.title}</p>
                          <span className="text-[10px] text-gray-400 shrink-0 font-medium">{item.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition"
          >
            <FaUserCircle size={40} className="text-green-700" />
            <div className="text-left">
              <p className="font-semibold text-gray-800 text-sm leading-none">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-none">Administrator</p>
            </div>
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
              <Link
                to="/"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpenDropdown(false)}
              >
                Store Home
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpenDropdown(false)}
              >
                My Profile
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpenDropdown(false)}
              >
                Settings
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
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
