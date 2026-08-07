import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Addresses() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t("addresses")}</h1>
          <p className="text-gray-500 mt-1">{t("quickAddressesDesc", { defaultValue: "Manage your delivery addresses." })}</p>
        </div>
        <button
          onClick={() => alert(t("comingSoon", { defaultValue: "Feature coming soon!" }))}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
        >
          <FaPlus size={14} /> {t("addAddress", { defaultValue: "Add Address" })}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-5">
          <FaMapMarkerAlt size={36} className="text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">{t("noAddresses", { defaultValue: "No Addresses Saved" })}</h2>
        <p className="text-gray-400 mt-2 max-w-sm">
          {t("noAddressesDesc", { defaultValue: "Add your delivery address so you can quickly place orders in the future." })}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-medium">
          🚧 {t("comingSoon", { defaultValue: "Feature coming soon" })}
        </span>
      </div>
    </div>
  );
}

export default Addresses;
