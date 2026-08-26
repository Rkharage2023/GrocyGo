import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaCalendarCheck, FaShoppingBag, FaArrowRight, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import * as orderService from "../../services/orderService";
import { useTranslation } from "react-i18next";

function PickupSlots() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderService.getMyOrders();
        if (res.success) {
          // Filter orders that have slot information associated
          const ordersWithSlots = (res.data || [])
            .filter((order) => order.Slot)
            .map((order) => ({
              orderId: order.id,
              status: order.status,
              paymentStatus: order.paymentStatus,
              totalAmount: order.totalAmount,
              date: order.Slot.date,
              startTime: order.Slot.startTime,
              endTime: order.Slot.endTime,
              createdAt: order.createdAt,
            }));
          
          // Sort slots: upcoming first, then past
          ordersWithSlots.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateB - dateA; // Descending by default
          });

          setBookings(ordersWithSlots);
        } else {
          setError(res.message || "Failed to load pickup slots.");
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load pickup slots."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    let hr = parseInt(hour, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12;
    hr = hr ? hr : 12;
    return `${hr.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  // Find next upcoming active pickup slot (today or future, status not cancelled/completed)
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingBooking = [...bookings]
    .reverse() // check oldest to newest to find the closest upcoming one
    .find((b) => {
      const isFutureOrToday = b.date >= todayStr;
      const isActive = b.status === "PENDING" || b.status === "CONFIRMED";
      return isFutureOrToday && isActive;
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t("pickupSlots")} ⏰</h1>
        <p className="text-gray-500 mt-1">{t("slotsDesc", { defaultValue: "Booked grocery pickup times and schedule history." })}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
          <FaExclamationTriangle className="shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-green-700 font-medium">{t("loadingSlots", { defaultValue: "Loading pickup slots..." })}</p>
        </div>
      ) : (
        <>
          {/* Highlight Card for Upcoming Slot */}
          {upcomingBooking ? (
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-lg shadow-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  {t("upcomingPickup", { defaultValue: "Upcoming Pickup" })}
                </span>
                <h2 className="text-3xl font-extrabold">
                  {new Date(upcomingBooking.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex items-center gap-4 text-orange-50">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <FaClock />
                    <span>
                      {formatTime12h(upcomingBooking.startTime)} - {formatTime12h(upcomingBooking.endTime)}
                    </span>
                  </div>
                  <span className="text-orange-300">•</span>
                  <span className="text-sm font-semibold">{t("orderNo", { defaultValue: "Order #" })}{upcomingBooking.orderId}</span>
                </div>
              </div>

              <Link
                to="/dashboard/orders"
                className="bg-white text-orange-600 font-bold px-6 py-3.5 rounded-xl text-sm hover:bg-orange-50 transition flex items-center justify-center gap-2 self-start md:self-auto shrink-0 shadow-md"
              >
                {t("viewOrderDetails", { defaultValue: "View Order Details" })} <FaArrowRight />
              </Link>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-blue-800 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-blue-600">
                <FaCalendarAlt size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{t("noActiveSlots", { defaultValue: "No Active Pickup Slots" })}</h3>
                <p className="text-xs text-blue-700/80 mt-1 max-w-md">
                  {t("noActiveSlotsDesc", { defaultValue: "You don't have any pending grocery pickups scheduled. When you shop and checkout in your cart, you can schedule a convenient queue-free pickup time!" })}
                </p>
                <Link
                  to="/products"
                  className="mt-3.5 inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  {t("startShopping")}
                </Link>
              </div>
            </div>
          )}

          {/* Bookings History */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{t("bookingHistory", { defaultValue: "Booking History" })}</h2>

            {bookings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <FaCalendarCheck size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-bold text-sm">{t("noBookingsFound", { defaultValue: "No bookings record found" })}</p>
                <p className="text-gray-400 text-xs mt-1">{t("noBookingsDesc", { defaultValue: "Your slot reservation details will appear here once you place an order." })}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.orderId}
                    className="p-5 border border-gray-100 rounded-2xl hover:shadow-sm transition-all duration-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0 text-green-600">
                        <FaClock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {new Date(booking.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            weekday: "short",
                          })}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          {t("timing", { defaultValue: "Timing" })}: {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{t("orderNo", { defaultValue: "Order #" })}{booking.orderId} • {t("total", { defaultValue: "Total" })}: ₹{parseFloat(booking.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                        {booking.status === "PENDING"
                          ? t("pending", { defaultValue: "PENDING" })
                          : booking.status === "CONFIRMED"
                          ? t("confirmed", { defaultValue: "CONFIRMED" })
                          : booking.status === "COMPLETED"
                          ? t("completed", { defaultValue: "COMPLETED" })
                          : booking.status === "CANCELLED"
                          ? t("cancelled", { defaultValue: "CANCELLED" })
                          : booking.status}
                      </span>
                      <Link
                        to="/dashboard/orders"
                        className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        {t("details", { defaultValue: "Details" })} <FaArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PickupSlots;