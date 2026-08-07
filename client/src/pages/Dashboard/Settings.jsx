import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { FaUserCircle, FaPhoneAlt, FaEdit, FaShieldAlt } from "react-icons/fa";

function Settings() {
  const { t } = useTranslation();
  const { user, logoutAll } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoutAll = async () => {
    if (window.confirm(t("confirmLogoutAll", { defaultValue: "Are you sure you want to log out from all devices? This will invalidate all your other active sessions." }))) {
      try {
        await logoutAll();
        navigate("/login");
      } catch (err) {
        console.error("Failed to logout from all devices", err);
      }
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
          onClick={handleLogoutAll}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          {t("logoutAllDevices", { defaultValue: "Logout From All Devices" })}
        </button>
      </div>

      {/* App Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t("appPreferences", { defaultValue: "App Preferences" })}</h2>
        <p className="text-gray-400 text-sm">
          {t("preferencesDesc", { defaultValue: "Notification settings, theme preferences, and more will be available here soon." })}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium">
          🚧 {t("comingSoon", { defaultValue: "More settings coming soon" })}
        </span>
      </div>
    </div>
  );
}

export default Settings;
