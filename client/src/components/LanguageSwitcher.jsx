import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Globe } from "lucide-react";

function LanguageSwitcher() {
  const { language, changeLanguage } = useContext(LanguageContext);

  return (
    <div
      className="inline-flex items-center gap-0.5 bg-gradient-to-r from-green-50 to-green-100/60 border border-green-200/90 rounded-full p-1 shadow-2xs select-none"
      title="Switch Language / भाषा बदला"
    >
      <div className="pl-1.5 pr-0.5 text-green-700 hidden xs:flex items-center">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === "en"
            ? "bg-green-600 text-white shadow-sm scale-[1.02]"
            : "text-green-800/80 hover:text-green-950 hover:bg-green-100/70"
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("mr")}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === "mr"
            ? "bg-green-600 text-white shadow-sm scale-[1.02]"
            : "text-green-800/80 hover:text-green-950 hover:bg-green-100/70"
        }`}
      >
        मराठी
      </button>
    </div>
  );
}

export default LanguageSwitcher;
