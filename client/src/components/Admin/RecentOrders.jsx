import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function RecentOrders({ orders = [] }) {
  const navigate = useNavigate();

  const statusColor = {
    PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
    COMPLETED: "bg-green-50 text-green-700 border border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border border-red-200",
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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>

        <button 
          onClick={() => navigate("/admin/orders")}
          className="text-green-600 font-bold hover:underline text-sm"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No recent orders.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Pickup Slot</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 font-bold text-gray-800">#{order.id}</td>

                  <td className="text-gray-700">{order.User?.name || "Guest"}</td>

                  <td className="text-green-700 font-semibold">
                    ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                  </td>

                  <td className="text-gray-500 text-xs">
                    {order.Slot ? (
                      <div>
                        <p className="font-medium text-gray-700">
                          {new Date(order.Slot.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        <p className="text-[10px]">
                          {formatTime12h(order.Slot.startTime)} - {formatTime12h(order.Slot.endTime)}
                        </p>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td className="py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        statusColor[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <button 
                      onClick={() => navigate("/admin/orders")}
                      className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 transition"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RecentOrders;
