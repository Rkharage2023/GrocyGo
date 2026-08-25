import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaUserShield, FaPhoneAlt, FaShieldAlt, FaStore, FaClock, FaExclamationTriangle, FaSave, FaCheckCircle } from "react-icons/fa";

function Settings() {
  const { user } = useContext(AuthContext);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("grocygo_admin_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      storeName: "Dake Kirana Store",
      storeNameMr: "डाके किराणा स्टोअर्स",
      contactPhone: "9604822360",
      contactEmail: "dakekirana@gmail.com",
      storeAddress: "MFQ4+MJ4, BHAJI MARKET, IGM Rd, near ANAA RAMGONDA SCHOOL, Ichalkaranji, Maharashtra 416115",
      operatingHours: "Morning: 9:15 AM - 1:30 PM | Evening: 3:30 PM - 8:30 PM",
      lowStockThreshold: 5,
      minOrderAmount: 100,
      enableAutoNotifications: true,
    };
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("grocygo_admin_settings", JSON.stringify(settings));
    setTimeout(() => {
      setSaving(false);
      setToast("Store settings saved successfully! ⚙️");
      setTimeout(() => setToast(""), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold animate-bounce">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold text-gray-800">Store Settings</h1>
        <p className="text-gray-500 mt-2">Manage store preferences, operations, and thresholds.</p>
      </div>

      {/* Admin Account Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaUserShield className="text-green-600" />
          Admin Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaUserShield className="text-green-600 text-xl shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Name</p>
              <p className="font-bold text-gray-800 mt-0.5">{user?.name || "Admin"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaPhoneAlt className="text-green-600 text-xl shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Mobile</p>
              <p className="font-bold text-gray-800 mt-0.5">{user?.mobile || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaShieldAlt className="text-green-600 text-xl shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Role</p>
              <p className="font-bold text-gray-800 mt-0.5">{user?.role || "ADMIN"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FaStore className="text-orange-500" />
          Store Operational Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Store Name (English)
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Store Name (मराठी)
            </label>
            <input
              type="text"
              value={settings.storeNameMr || ""}
              onChange={(e) => handleChange("storeNameMr", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Store Support Contact Phone
            </label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Store Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail || ""}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Store Address
            </label>
            <textarea
              rows={2}
              value={settings.storeAddress || ""}
              onChange={(e) => handleChange("storeAddress", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Pickup Operating Hours
            </label>
            <input
              type="text"
              value={settings.operatingHours}
              onChange={(e) => handleChange("operatingHours", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Low Stock Warning Alert Threshold (Units)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.lowStockThreshold}
              onChange={(e) => handleChange("lowStockThreshold", parseInt(e.target.value, 10) || 5)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Minimum Order Basket Total (₹)
            </label>
            <input
              type="number"
              min="0"
              value={settings.minOrderAmount}
              onChange={(e) => handleChange("minOrderAmount", parseInt(e.target.value, 10) || 0)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="autoNotif"
              checked={settings.enableAutoNotifications}
              onChange={(e) => handleChange("enableAutoNotifications", e.target.checked)}
              className="w-5 h-5 text-green-600 rounded cursor-pointer"
            />
            <label htmlFor="autoNotif" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Enable Automatic Low Stock & Order Alerts
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-md shadow-green-100 disabled:opacity-50"
          >
            <FaSave />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
