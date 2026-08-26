import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { FaUserCircle, FaPhoneAlt, FaEdit, FaShieldAlt } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/ConfirmModal";

function Settings() {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, logoutAll } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleLogoutAllPrompt = () => {
    setIsConfirmOpen(true);
  };

  const handleLogoutAllConfirm = async () => {
    setIsConfirmOpen(false);
    try {
      await logoutAll();
      toast.success("Logged out from all devices successfully.");
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout from all devices", err);
      toast.error("Failed to log out from all devices.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t("settings")}</h1>
        <p className="text-gray-500 mt-1">{t("quickSettingsDesc", { defaultValue: "Manage your account preferences." })}</p>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaUserCircle className="text-green-600" />
          {t("accountInfo", { defaultValue: "Account Information" })}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaUserCircle className="text-green-600 text-xl shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t("fullName", { defaultValue: "Full Name" })}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{user?.name || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaPhoneAlt className="text-green-600 text-xl shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t("mobileNumber")}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{user?.mobile || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaShieldAlt className="text-green-600 text-xl shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t("accountRole", { defaultValue: "Account Role" })}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{t("customer", { defaultValue: "Customer" })}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <FaEdit />
            {t("editProfile", { defaultValue: "Edit Profile" })}
          </Link>
        </div>
      </div>

      {/* Security & Sessions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FaShieldAlt className="text-red-600" />
          {t("securitySessions", { defaultValue: "Security & Sessions" })}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          {t("securitySessionsDesc", { defaultValue: "Suspect unauthorized access? You can force log out from all active sessions on other devices." })}
        </p>
        <button
          onClick={handleLogoutAllPrompt}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          {t("logoutAllDevices", { defaultValue: "Logout From All Devices" })}
        </button>
      </div>

      {/* App Preferences */}
      <AppPreferencesBlock t={t} />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Logout From All Devices"
        message="Are you sure you want to log out from all devices? This will invalidate all your other active sessions."
        type="danger"
        confirmText="Yes, Logout All"
        cancelText="Cancel"
        onConfirm={handleLogoutAllConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

function AppPreferencesBlock({ t }) {
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem("grocygo_customer_prefs");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      orderSms: true,
      promotionalEmail: true,
      soundEffects: true,
      compactView: false,
    };
  });

  const [toast, setToast] = useState("");

  const toggle = (key) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("grocygo_customer_prefs", JSON.stringify(updated));
      return updated;
    });
    setToast(t("preferencesSaved", { defaultValue: "Preference updated!" }));
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-green-600 text-white px-5 py-2.5 rounded-2xl shadow-lg font-semibold animate-bounce text-sm">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{t("appPreferences", { defaultValue: "App Preferences" })}</h2>
        <p className="text-gray-500 text-sm">
          {t("preferencesDesc", { defaultValue: "Customize notification alerts and display preferences." })}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{t("orderSmsAlerts", { defaultValue: "Order SMS Alerts" })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t("orderSmsDesc", { defaultValue: "Receive instant SMS updates for pickup slot status." })}</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.orderSms}
            onChange={() => toggle("orderSms")}
            className="w-5 h-5 text-green-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{t("offerNotifications", { defaultValue: "Promotional Offer Alerts" })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t("offerNotifDesc", { defaultValue: "Get notified about festive discount sales." })}</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.promotionalEmail}
            onChange={() => toggle("promotionalEmail")}
            className="w-5 h-5 text-green-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{t("compactLayout", { defaultValue: "Compact Table View" })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t("compactLayoutDesc", { defaultValue: "Display dense order history lists." })}</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.compactView}
            onChange={() => toggle("compactView")}
            className="w-5 h-5 text-green-600 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
