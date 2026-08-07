import {
  FaPlusCircle,
  FaTags,
  FaClipboardList,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Add Product",
      icon: <FaPlusCircle />,
      color: "bg-green-600",
      path: "/admin/products",
      state: { openAdd: true },
    },
    {
      title: "Add Category",
      icon: <FaTags />,
      color: "bg-orange-500",
      path: "/admin/categories",
      state: { openAdd: true },
    },
    {
      title: "View Orders",
      icon: <FaClipboardList />,
      color: "bg-blue-600",
      path: "/admin/orders",
    },
    {
      title: "Pickup Slots",
      icon: <FaClock />,
      color: "bg-purple-600",
      path: "/admin/slots",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path, { state: action.state })}
            className={`${action.color} text-white rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
          >
            <div className="text-4xl mb-4 flex justify-center">
              {action.icon}
            </div>

            <h3 className="font-semibold text-lg">
              {action.title}
            </h3>
          </button>
        ))}

      </div>

    </div>
  );
}

export default QuickActions;