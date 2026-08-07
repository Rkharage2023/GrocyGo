import { FaClock } from "react-icons/fa";

function NextPickupCard() {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <FaClock size={20} />
        </div>
        <h3 className="font-bold text-lg">Next Pickup</h3>
      </div>
      <p className="text-orange-100 text-sm">No upcoming pickup slots.</p>
      <button
        onClick={() => alert("Pickup slot booking coming soon!")}
        className="mt-4 bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition"
      >
        Book a Slot
      </button>
    </div>
  );
}

export default NextPickupCard;
