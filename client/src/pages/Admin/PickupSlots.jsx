import { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaSave, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaShoppingBag, 
  FaUser, 
  FaPhone, 
  FaSync,
  FaTrash
} from "react-icons/fa";
import * as slotService from "../../services/slotService";
import * as orderService from "../../services/orderService";

function AdminPickupSlots() {
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    openingTime: "09:00",
    closingTime: "21:00",
    breakStartTime: "13:00",
    breakEndTime: "14:00",
    interval: "30",
    maxCapacity: "15",
  });

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await slotService.getAllSlots();
      if (res.success) {
        setSlots(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await orderService.getAllOrdersAdmin();
      if (res.success) {
        setOrders(res.data?.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchSlots(), fetchOrders()]);
  };

  const handleDeleteSlot = async (slotId) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    if (!window.confirm("Are you sure you want to permanently delete this slot?")) {
      return;
    }

    try {
      const res = await slotService.deleteSlot(slotId);
      if (res.success) {
        setSuccessMsg("Slot deleted successfully!");
        fetchSlots();
      } else {
        setErrorMsg(res.message || "Failed to delete slot.");
      }
    } catch (err) {
      console.error("Failed to delete slot:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "An error occurred while deleting the slot."
      );
    }
  };

  const handleBulkDelete = async (date) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    if (!window.confirm(`Are you sure you want to permanently delete ALL slots for ${formatDateDDMMYYYY(date)}? Booked slots will be kept.`)) {
      return;
    }

    try {
      const res = await slotService.bulkDeleteSlots(date);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchSlots();
      } else {
        setErrorMsg(res.message || "Failed to delete slots.");
      }
    } catch (err) {
      console.error("Failed to delete slots:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "An error occurred while deleting slots."
      );
    }
  };

  const handleBulkStatusToggle = async (date, isActive) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    const actionText = isActive ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${actionText} ALL slots for ${formatDateDDMMYYYY(date)}?`)) {
      return;
    }

    try {
      const res = await slotService.bulkUpdateSlotStatus(date, isActive);
      if (res.success) {
        setSuccessMsg(res.message);
        fetchSlots();
      } else {
        setErrorMsg(res.message || "Failed to update slots status.");
      }
    } catch (err) {
      console.error("Failed to update slots status:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "An error occurred while updating slots status."
      );
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        openingTime: `${formData.openingTime}:00`,
        closingTime: `${formData.closingTime}:00`,
        breakStartTime: formData.breakStartTime ? `${formData.breakStartTime}:00` : null,
        breakEndTime: formData.breakEndTime ? `${formData.breakEndTime}:00` : null,
        interval: parseInt(formData.interval, 10),
        maxCapacity: parseInt(formData.maxCapacity, 10),
      };

      const res = await slotService.generateSlots(payload);
      if (res.success) {
        setSuccessMsg(`Successfully generated ${res.data.totalSlots} slots!`);
        fetchSlots();
      } else {
        setErrorMsg(res.message || "Failed to generate slots.");
      }
    } catch (err) {
      console.error("Error generating slots:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "An error occurred while generating slots."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    let hr = parseInt(hour, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12;
    hr = hr ? hr : 12;
    return `${hr.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const formatDateDDMMYYYY = (dateVal) => {
    if (!dateVal) return "";
    const str = String(dateVal).split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [yyyy, mm, dd] = str.split("-");
      return `${dd}-${mm}-${yyyy}`;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const nowTimeStr = new Date().toTimeString().split(" ")[0];

  const filteredSlots = slots.filter((slot) => slot.date === selectedDate);

  const sortedSlots = [...filteredSlots].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  const filteredOrders = orders.filter((order) => order.Slot && order.Slot.date === selectedDate);

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.Slot.startTime !== b.Slot.startTime) {
      return a.Slot.startTime.localeCompare(b.Slot.startTime);
    }
    return b.id - a.id;
  });

  const getStatusBadgeStyle = (status) => {
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

  const getPaymentBadgeStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          Pickup Schedule Management
        </h1>
        <p className="text-gray-500 mt-2">
          Configure pickup timings and bulk generate slots for customers.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-green-600" /> Generate Slots
            </h2>

            {successMsg && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm flex items-center gap-2">
                <FaCheckCircle className="shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
                <FaExclamationTriangle className="shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block">Opening Time</label>
                  <input
                    type="time"
                    name="openingTime"
                    required
                    value={formData.openingTime}
                    onChange={handleChange}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block">Closing Time</label>
                  <input
                    type="time"
                    name="closingTime"
                    required
                    value={formData.closingTime}
                    onChange={handleChange}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block">Break Start</label>
                  <input
                    type="time"
                    name="breakStartTime"
                    value={formData.breakStartTime}
                    onChange={handleChange}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block">Break End</label>
                  <input
                    type="time"
                    name="breakEndTime"
                    value={formData.breakEndTime}
                    onChange={handleChange}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block">Slot Interval (Minutes)</label>
                <select
                  name="interval"
                  value={formData.interval}
                  onChange={handleChange}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block">Max Customers per Slot</label>
                <input
                  type="number"
                  name="maxCapacity"
                  required
                  min="1"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md shadow-green-100"
            >
              {submitLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaSave /> Generate Slots
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Slots */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Pickup Slots
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Scheduled slots for {formatDateDDMMYYYY(selectedDate)} ({sortedSlots.length})
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
                  />
                  <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-xl">
                    {formatDateDDMMYYYY(selectedDate)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 animate-scaleUp"
                  title="Refresh Slots & Orders"
                >
                  <FaSync /> Refresh
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkStatusToggle(selectedDate, false)}
                  disabled={sortedSlots.length === 0}
                  className="text-xs bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
                  title="Deactivate All Slots for this Date"
                >
                  Deactivate All (Day)
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkDelete(selectedDate)}
                  disabled={sortedSlots.length === 0}
                  className="text-xs bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 border border-red-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5"
                  title="Delete All Slots for this Date"
                >
                  <FaTrash /> Delete All (Day)
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-green-700 font-medium">Loading slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <FaClock className="mx-auto text-gray-300 text-3xl mb-2 animate-pulse" />
                <p className="text-gray-400 text-sm font-semibold">No slots generated yet</p>
                <p className="text-gray-400 text-xs mt-1">Use the generator form on the left to set up pickup times.</p>
              </div>
            ) : sortedSlots.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <FaClock className="mx-auto text-gray-300 text-3xl mb-2" />
                <p className="text-gray-400 text-sm font-semibold">No slots for this date</p>
                <p className="text-gray-400 text-xs mt-1">Try changing the date above or generate slots for this date range.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[300px] overflow-y-auto pr-1">
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Timing</th>
                        <th className="pb-3">Bookings</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedSlots.map((slot) => {
                        const isFull = slot.bookedCount >= slot.maxCapacity;
                        const isPast = slot.date === todayStr && slot.endTime < nowTimeStr;
                        return (
                          <tr key={slot.id} className={`hover:bg-gray-50/40 transition-colors ${isPast ? "opacity-60 bg-gray-50/30" : ""}`}>
                            <td className="py-3 pl-2 text-gray-700 font-medium flex items-center gap-1.5 flex-wrap">
                              <FaClock className="text-gray-300 text-xs" />
                              <span>
                                {formatDateDDMMYYYY(slot.date)} • {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
                              </span>
                              {isPast && (
                                <span className="text-[9px] bg-gray-200 text-gray-600 font-bold px-1.5 py-0.5 rounded">
                                  Past
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-gray-700">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold ${isFull ? "text-red-600" : "text-green-700"}`}>
                                  {slot.bookedCount}
                                </span>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-500">{slot.maxCapacity}</span>
                                <span className="text-xs text-gray-400 font-medium">booked</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <select
                                value={slot.isActive ? "true" : "false"}
                                onChange={async (e) => {
                                  const newStatus = e.target.value === "true";
                                  try {
                                    const res = await slotService.updateSlot(slot.id, {
                                      isActive: newStatus
                                    });
                                    if (res.success) {
                                      fetchSlots();
                                    } else {
                                      alert(res.message || "Failed to update slot status");
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    alert(err.response?.data?.message || "Failed to update slot status");
                                  }
                                }}
                                className={`text-[10px] font-bold rounded-full px-2.5 py-1 border outline-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition ${
                                  slot.isActive
                                    ? "bg-green-50 text-green-700 border-green-200 focus:ring-green-400"
                                    : "bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-400"
                                }`}
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="text-red-600 hover:text-red-800 text-sm p-1.5 transition hover:bg-red-50 rounded-xl"
                                title="Delete Slot"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaShoppingBag className="text-green-600" /> Booked Orders
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Customer pickups scheduled for {formatDateDDMMYYYY(selectedDate)} ({sortedOrders.length})
              </p>
            </div>

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-green-700 font-medium">Loading orders...</p>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <FaShoppingBag className="mx-auto text-gray-300 text-3xl mb-2" />
                <p className="text-gray-400 text-sm font-semibold">No orders for this date</p>
                <p className="text-gray-400 text-xs mt-1">Customers haven't booked any slots on this day yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto pr-1">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Order</th>
                        <th className="pb-3">Slot Date & timing</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-center">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="py-3 pl-2 font-bold text-gray-900">
                            #{order.id}
                          </td>
                          <td className="py-3 text-gray-600 font-medium">
                            <div className="font-semibold text-gray-800">{formatDateDDMMYYYY(order.Slot?.date)}</div>
                            <div className="text-xs text-gray-400">{formatTime12h(order.Slot?.startTime)} - {formatTime12h(order.Slot?.endTime)}</div>
                          </td>
                          <td className="py-3 text-gray-700">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-gray-800 flex items-center gap-1">
                                <FaUser className="text-[10px] text-gray-400" />
                                {order.User?.name || "N/A"}
                              </span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <FaPhone className="text-[9px]" />
                                {order.User?.mobile || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 font-bold text-green-700">
                            ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${getStatusBadgeStyle(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 border ${getPaymentBadgeStyle(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPickupSlots;