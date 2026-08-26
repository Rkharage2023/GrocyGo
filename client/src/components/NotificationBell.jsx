import { useState, useEffect, useRef, useContext } from "react";
import { FaBell, FaShoppingBag, FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import API from "../services/api";

function NotificationBell() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const storageKey = user ? `grocygo_read_notifs_${user.id}` : "grocygo_read_notifs_guest";

  const getReadIds = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch (err) {
      console.error("Failed to save read notification state:", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const [ordersRes, offersRes] = await Promise.allSettled([
          API.get("/orders/my-orders"),
          API.get("/offers/homepage"),
        ]);

        const items = [];

        // 1. Process Orders
        if (ordersRes.status === "fulfilled" && ordersRes.value.data?.success) {
          const orders = ordersRes.value.data.data || [];
          orders.forEach((o) => {
            const timeStr = new Date(o.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            if (o.status === "CONFIRMED") {
              items.push({
                id: `order-confirmed-${o.id}`,
                type: "confirmed",
                title: `Order #${o.id} Confirmed 🛒`,
                message: `Your order for ₹${parseFloat(o.totalAmount).toFixed(0)} is confirmed! Pickup: ${o.Slot?.date || ""} (${o.Slot?.startTime?.slice(0, 5) || ""}-${o.Slot?.endTime?.slice(0, 5) || ""}).`,
                path: "/dashboard/orders",
                time: timeStr,
                createdAt: new Date(o.createdAt).getTime(),
              });
            } else if (o.status === "READY_FOR_PICKUP") {
              items.push({
                id: `order-pickup-${o.id}`,
                type: "pickup",
                title: `Ready for Pickup! 📦`,
                message: `Order #${o.id} is packed & ready for queue-free pickup at store!`,
                path: "/dashboard/orders",
                time: timeStr,
                createdAt: new Date(o.createdAt).getTime() + 1,
              });
            } else if (o.status === "PENDING") {
              items.push({
                id: `order-pending-${o.id}`,
                type: "pending",
                title: `Order #${o.id} Placed ⏳`,
                message: `Your order of ₹${parseFloat(o.totalAmount).toFixed(0)} is received and waiting for store review.`,
                path: "/dashboard/orders",
                time: timeStr,
                createdAt: new Date(o.createdAt).getTime(),
              });
            } else if (o.status === "COMPLETED") {
              items.push({
                id: `order-completed-${o.id}`,
                type: "completed",
                title: `Order #${o.id} Completed 🎉`,
                message: `Order #${o.id} was picked up successfully. Thank you for shopping with Dake Kirana Store!`,
                path: "/dashboard/orders",
                time: timeStr,
                createdAt: new Date(o.createdAt).getTime(),
              });
            } else if (o.status === "CANCELLED") {
              items.push({
                id: `order-cancelled-${o.id}`,
                type: "cancelled",
                title: `Order #${o.id} Cancelled ❌`,
                message: `Order #${o.id} was cancelled.`,
                path: "/dashboard/orders",
                time: timeStr,
                createdAt: new Date(o.createdAt).getTime(),
              });
            }
          });
        }

        // 2. Process Promotional Offers
        if (offersRes.status === "fulfilled" && offersRes.value.data?.success) {
          const offersData = offersRes.value.data.data || {};
          const allPromos = [
            ...(offersData.heroBanners || []),
            ...(offersData.todayOffers || []),
            ...(offersData.flashSales || []),
          ];

          // Deduplicate by ID
          const seen = new Set();
          allPromos.forEach((off) => {
            if (!off.id || seen.has(off.id)) return;
            seen.add(off.id);
            items.push({
              id: `offer-${off.id}`,
              type: "offer",
              title: `Offer: ${off.title} 🏷️`,
              message: off.description || "Exclusive discount deals active now! Tap to explore catalog.",
              path: "/products",
              time: "Active Promo",
              createdAt: new Date(off.updatedAt || off.createdAt || Date.now()).getTime(),
            });
          });
        }

        // Sort by newest first
        items.sort((a, b) => b.createdAt - a.createdAt);

        if (!isMounted) return;

        const readIds = getReadIds();
        const unread = items.filter((item) => !readIds.includes(item.id)).length;

        setNotifications(items);
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load customer notifications:", err);
      }
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLoggedIn, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoggedIn) return null;

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    saveReadIds(allIds);
    setUnreadCount(0);
  };

  const handleNotificationClick = (item) => {
    const readIds = getReadIds();
    if (!readIds.includes(item.id)) {
      const updated = [...readIds, item.id];
      saveReadIds(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpenNotifications(false);
    if (item.path) {
      navigate(item.path);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "pickup":
        return <FaBoxOpen className="text-orange-600" />;
      case "confirmed":
        return <FaShoppingBag className="text-green-600" />;
      case "completed":
        return <FaCheckCircle className="text-emerald-600" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      case "pending":
        return <FaClock className="text-amber-500" />;
      case "offer":
        return <FaTag className="text-purple-600" />;
      default:
        return <FaBell className="text-green-600" />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case "pickup":
        return "bg-orange-50";
      case "confirmed":
        return "bg-green-50";
      case "completed":
        return "bg-emerald-50";
      case "cancelled":
        return "bg-red-50";
      case "pending":
        return "bg-amber-50";
      case "offer":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  const readIds = getReadIds();

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setOpenNotifications(!openNotifications)}
        className="relative p-2.5 rounded-full hover:bg-green-50 text-gray-700 hover:text-green-700 transition focus:outline-none"
        title={t("notifications", { defaultValue: "Notifications" })}
      >
        <FaBell size={21} className="text-green-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {openNotifications && (
        <div className="fixed inset-x-3 top-16 sm:top-auto sm:inset-auto sm:absolute sm:right-0 sm:mt-3 sm:w-96 max-w-full bg-white border border-green-100 rounded-2xl shadow-2xl py-3 z-50 animate-fadeIn">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">
                {t("notifications", { defaultValue: "Notifications" })}
              </h3>
              <p className="text-[11px] text-gray-400">
                {t("notificationsSubtitle", { defaultValue: "Order updates & exclusive offers" })}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2.5 py-1 rounded-full transition"
              >
                {t("markAllRead", { defaultValue: "Mark all read" })}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs font-medium space-y-1">
                <p className="text-2xl">🔔</p>
                <p className="font-bold text-gray-700">
                  {t("noNotifications", { defaultValue: "No active notifications" })}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t("noNotificationsDesc", { defaultValue: "Order updates and special offers will appear here." })}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 hover:bg-green-50/60 transition cursor-pointer flex items-start gap-3 ${
                      !isRead ? "bg-green-50/30" : ""
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base shadow-sm ${getBgClass(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            !isRead ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 self-center"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
