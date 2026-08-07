import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaUserShield, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";

function Settings() {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-2">Admin panel configuration and preferences.</p>
      </div>

      {/* Admin Account Info */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaUserShield className="text-green-600" />
          Admin Account
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaUserShield className="text-green-600 text-xl shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Name</p>
              <p className="font-semibold text-gray-800 mt-0.5">{user?.name || "Admin"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaPhoneAlt className="text-green-600 text-xl shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mobile</p>
              <p className="font-semibold text-gray-800 mt-0.5">{user?.mobile || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <FaShieldAlt className="text-green-600 text-xl shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
              <p className="font-semibold text-gray-800 mt-0.5">{user?.role || "ADMIN"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">System Settings</h2>
        <p className="text-gray-400 text-sm">
          Store configuration, notification settings, and system preferences will
          be manageable here.
        </p>
        <span className="mt-4 inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium">
          🚧 System settings coming soon
        </span>
      </div>
    </div>
  );
}

export default Settings;
