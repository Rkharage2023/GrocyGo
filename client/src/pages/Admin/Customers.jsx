import { useState, useEffect } from "react";
import { FaUsers, FaPhoneAlt, FaUserCircle, FaSearch, FaShoppingBag, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import API from "../../services/api";
import * as orderService from "../../services/orderService";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all registered customers from database API endpoint
        const res = await API.get("/customers");
        if (res.data?.success) {
          setCustomers(res.data.data || []);
        } else {
          // Fallback to order aggregation if endpoint fails
          const orderRes = await orderService.getAllOrdersAdmin();
          if (orderRes.success) {
            const orders = orderRes.data?.orders || [];
            const customerMap = {};
            orders.forEach((order) => {
              if (order.User) {
                const u = order.User;
                if (!customerMap[u.id]) {
                  customerMap[u.id] = {
                    id: u.id,
                    name: u.name,
                    mobile: u.mobile || u.phone || "N/A",
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrderDate: order.createdAt,
                    orders: [],
                  };
                }
                customerMap[u.id].orderCount += 1;
                if (order.status !== "CANCELLED") {
                  customerMap[u.id].totalSpent += parseFloat(order.totalAmount || 0);
                }
                if (new Date(order.createdAt) > new Date(customerMap[u.id].lastOrderDate)) {
                  customerMap[u.id].lastOrderDate = order.createdAt;
                }
                customerMap[u.id].orders.push(order);
              }
            });
            setCustomers(Object.values(customerMap));
          }
        }
      } catch (err) {
        console.error("Error gathering customer list:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Could not compile customer listings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersList();
  }, []);

  // Filter list by search term and selected date
  const filteredCustomers = customers.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      c.mobile.includes(term);

    const matchesDate = !selectedDate || c.orders.some(o => o.Slot && o.Slot.date === selectedDate);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Customer Directory</h1>
        <p className="text-gray-500 mt-2">View and manage all registered store customers based on active order metrics.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Search and Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
                setActiveSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                const suggestions = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveSuggestionIndex(prev => Math.max(prev - 1, -1));
                } else if (e.key === "Enter") {
                  if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                    e.preventDefault();
                    const selected = suggestions[activeSuggestionIndex];
                    const fillValue = selected.name.toLowerCase().includes(search.toLowerCase()) ? selected.name : selected.mobile;
                    setSearch(fillValue);
                    setShowSuggestions(false);
                  }
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {showSuggestions && search && customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search)).length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50 max-h-48">
                {customers
                  .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search))
                  .slice(0, 5)
                  .map((c, idx) => {
                    const fillValue = c.name.toLowerCase().includes(search.toLowerCase()) ? c.name : c.mobile;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearch(fillValue);
                          setShowSuggestions(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition flex items-center justify-between text-gray-700 font-medium ${
                          idx === activeSuggestionIndex ? "bg-green-50" : "hover:bg-green-50/50"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{c.name}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{c.mobile}</span>
                        </div>
                        <span className="text-green-700 font-bold text-[10px]">{c.orderCount} Orders</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Slot Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1"
                title="Clear Date"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-500 self-end md:self-center shrink-0">
          Showing <span className="text-gray-800">{filteredCustomers.length}</span> customers
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-green-700 font-medium">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
            <FaUsers size={36} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">No Customers Found</h2>
          <p className="text-gray-400 mt-2 max-w-sm">
            {search ? "No customers match your search filters." : "Customers will show up here once orders are placed."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="w-full">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 pl-6">Customer Info</th>
                  <th className="py-3.5">Mobile</th>
                  <th className="py-3.5">{selectedDate ? "Orders on Date" : "Orders Count"}</th>
                  <th className="py-3.5">{selectedDate ? "Spent on Date" : "Total Spent"}</th>
                  <th className="py-3.5 pr-6">{selectedDate ? "Slot Timings" : "Last Active"}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((customer) => {
                  let orderCount = customer.orderCount;
                  let totalSpent = customer.totalSpent;
                  let activeText = "";

                  if (!selectedDate) {
                    activeText = new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } else {
                    const dateOrders = customer.orders.filter(
                      (o) => o.Slot && o.Slot.date === selectedDate
                    );
                    orderCount = dateOrders.length;
                    totalSpent = dateOrders
                      .filter((o) => o.status !== "CANCELLED")
                      .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

                    const formatTime12h = (timeStr) => {
                      if (!timeStr) return "";
                      const [hour, minute] = timeStr.split(":");
                      let hr = parseInt(hour, 10);
                      const ampm = hr >= 12 ? "PM" : "AM";
                      hr = hr % 12;
                      hr = hr ? hr : 12;
                      return `${hr.toString().padStart(2, "0")}:${minute} ${ampm}`;
                    };

                    activeText = dateOrders
                      .map((o) =>
                        o.Slot
                          ? `${formatTime12h(o.Slot.startTime)} - ${formatTime12h(o.Slot.endTime)}`
                          : "No Slot"
                      )
                      .join(", ");
                  }

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/40 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 pl-6 flex items-center gap-3">
                        <FaUserCircle className="text-gray-300 text-3xl" />
                        <div>
                          <p className="font-bold text-gray-800">{customer.name}</p>
                          <p className="text-[10px] text-gray-400">ID: #{customer.id}</p>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <FaPhoneAlt size={11} className="text-gray-300" />
                          <span className="font-medium text-xs">{customer.mobile}</span>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <FaShoppingBag size={12} className="text-gray-300" />
                          <span className="font-semibold">{orderCount} order{orderCount !== 1 ? "s" : ""}</span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-4">
                        <div className="flex items-center gap-0.5 text-green-700 font-bold">
                          <span>₹</span>
                          <span>{totalSpent.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Last Active / Slot Timings */}
                      <td className="py-4 pr-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt size={12} className="text-gray-300" />
                          <span>{activeText}</span>
                        </div>
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
  );
}

export default AdminCustomers;
