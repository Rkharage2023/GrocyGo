import { FaClipboardList } from "react-icons/fa";

function RecentOrders() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
        <FaClipboardList className="text-blue-500" />
        Recent Orders
      </h3>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
          <FaClipboardList size={22} className="text-blue-300" />
        </div>
        <p className="text-gray-500 font-medium">No recent orders</p>
        <p className="text-gray-400 text-sm mt-1">Your order history will appear here.</p>
      </div>
    </div>
  );
}

export default RecentOrders;
