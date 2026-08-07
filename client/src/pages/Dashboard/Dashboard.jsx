import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  FaClipboardList,
  FaHeart,
  FaClock,
  FaMapMarkerAlt,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const quickLinks = [
    {
      title: t("myOrders"),
      description: t("quickOrdersDesc", { defaultValue: "Track and view your past orders" }),
      icon: <FaClipboardList size={28} />,
      path: "/dashboard/orders",
      color: "bg-blue-500",
      light: "bg-blue-50 text-blue-700",
    },
    {
      title: t("wishlist"),
      description: t("quickWishlistDesc", { defaultValue: "Items you've saved for later" }),
      icon: <FaHeart size={28} />,
      path: "/dashboard/wishlist",
      color: "bg-pink-500",
      light: "bg-pink-50 text-pink-700",
    },
    {
      title: t("pickupSlots"),
      description: t("quickSlotsDesc", { defaultValue: "Book or view your pickup slots" }),
      icon: <FaClock size={28} />,
      path: "/dashboard/slots",
      color: "bg-orange-500",
      light: "bg-orange-50 text-orange-700",
    },
    {
      title: t("addresses"),
      description: t("quickAddressesDesc", { defaultValue: "Manage your saved addresses" }),
      icon: <FaMapMarkerAlt size={28} />,
      path: "/dashboard/address",
      color: "bg-purple-500",
      light: "bg-purple-50 text-purple-700",
    },
    {
      title: t("settings"),
      description: t("quickSettingsDesc", { defaultValue: "Update your account preferences" }),
      icon: <FaCog size={28} />,
      path: "/dashboard/settings",
      color: "bg-gray-600",
      light: "bg-gray-100 text-gray-700",
    },
    {
      title: t("myProfile"),
      description: t("quickProfileDesc", { defaultValue: "View and edit your profile" }),
      icon: <FaUserCircle size={28} />,
      path: "/profile",
      color: "bg-green-600",
      light: "bg-green-50 text-green-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          {t("welcomeBackCustomer")} {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-green-100 mt-2">
          {t("dashboardBannerDesc", { defaultValue: "Manage your orders, wishlist, and pickup slots all from one place." })}
        </p>
        <div className="flex items-center gap-2 mt-4 bg-green-600/50 w-fit px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          <span className="text-sm text-green-100">{t("mobileNumber")}: {user?.mobile}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t("quickActions", { defaultValue: "Quick Actions" })}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex items-center gap-5 group"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${item.color} group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t("accountSummary", { defaultValue: "Account Summary" })}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">{t("profile", { defaultValue: "Name" })}</p>
            <p className="font-semibold text-gray-800 mt-1">{user?.name}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">{t("mobileNumber")}</p>
            <p className="font-semibold text-gray-800 mt-1">{user?.mobile}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">{t("accountType", { defaultValue: "Account Type" })}</p>
            <p className="font-semibold text-gray-800 mt-1">{t("customer", { defaultValue: "Customer" })}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">{t("memberSince", { defaultValue: "Member Since" })}</p>
            <p className="font-semibold text-gray-800 mt-1">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
