import { useState, useContext } from "react";
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaBuilding } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/ConfirmModal";

function Addresses() {
  const { t } = useTranslation();
  const toastNotification = useToast();
  const { user, updateProfile } = useContext(AuthContext);

  const [openModal, setOpenModal] = useState(false);
  const [addressLine, setAddressLine] = useState(user?.address || "");
  const [city, setCity] = useState("Pune");
  const [pincode, setPincode] = useState("411001");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!addressLine.trim() || addressLine.trim().length < 5) {
      setError("Please enter a valid street address (at least 5 characters).");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const fullAddress = `${addressLine.trim()}, ${city.trim()} - ${pincode.trim()}`;
      await updateProfile(user?.name || "User", fullAddress);
      toastNotification.success("Delivery address updated successfully!");
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to update address.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearPrompt = () => {
    setIsConfirmOpen(true);
  };

  const handleClearConfirm = async () => {
    setIsConfirmOpen(false);
    try {
      await updateProfile(user?.name || "User", "");
      setAddressLine("");
      toastNotification.success("Delivery address removed.");
    } catch (err) {
      console.error(err);
      toastNotification.error("Failed to remove address.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-green-700 text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-center text-sm transition-all duration-300 animate-slideDown flex items-center justify-center gap-2 border border-green-600">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t("addresses")}</h1>
          <p className="text-gray-500 mt-1">{t("quickAddressesDesc", { defaultValue: "Manage your delivery addresses." })}</p>
        </div>
        <button
          onClick={() => {
            setAddressLine(user?.address || "");
            setError(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-sm"
        >
          <FaPlus size={14} /> {user?.address ? "Edit Address" : t("addAddress", { defaultValue: "Add Address" })}
        </button>
      </div>

      {/* Address Content */}
      {!user?.address ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-5">
            <FaMapMarkerAlt size={36} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">{t("noAddresses", { defaultValue: "No Addresses Saved" })}</h2>
          <p className="text-gray-400 mt-2 max-w-sm">
            {t("noAddressesDesc", { defaultValue: "Add your delivery address so you can quickly place orders in the future." })}
          </p>
          <button
            onClick={() => setOpenModal(true)}
            className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <FaPlus size={14} /> Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <FaCheck size={10} /> Default Delivery Address
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <FaBuilding size={12} /> Home
                </span>
              </div>

              <div className="pt-2">
                <h3 className="font-bold text-gray-800 text-base">{user.name}</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{user.address}</p>
                {user.mobile && (
                  <p className="text-xs text-gray-400 mt-2 font-medium">Phone: {user.mobile}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={() => {
                  setAddressLine(user.address);
                  setOpenModal(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:bg-green-50 px-3 py-2 rounded-xl transition border border-green-200"
              >
                <FaEdit size={12} /> Edit
              </button>
              <button
                onClick={handleClearPrompt}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition border border-red-100"
              >
                <FaTrash size={12} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-5 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FaMapMarkerAlt /> {user?.address ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-white/80 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  Street Address / House No. *
                </label>
                <textarea
                  rows={3}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Flat 302, Green Acres Apt, M.G. Road"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition shadow-md shadow-green-100 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Address Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Remove Delivery Address"
        message="Are you sure you want to remove this saved delivery address?"
        type="danger"
        confirmText="Yes, Remove"
        cancelText="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

export default Addresses;
