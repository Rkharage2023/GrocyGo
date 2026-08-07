import { FaBell, FaUserCircle, FaSearch, FaArrowLeft, FaSignOutAlt, FaCog, FaBars } from "react-icons/fa";
import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Topbar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
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
        <div className="relative hidden lg:block">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-72 pl-11 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
        </div>

        {/* Notification */}
        <button className="relative p-3 rounded-full hover:bg-gray-100 transition">
          <FaBell size={20} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center">
            3
          </span>
        </button>

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
