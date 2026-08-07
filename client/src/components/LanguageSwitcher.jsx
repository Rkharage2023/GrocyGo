import { useContext, useState, useEffect, useRef } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";

function LanguageSwitcher() {
  const { language, changeLanguage } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "mr", label: "मराठी" },
    { code: "en", label: "English" },
  ];

  const activeLang = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200/80 rounded-full px-3.5 py-2 transition-all duration-200 hover:from-green-100 hover:to-green-100 text-green-800 font-bold text-xs shadow-sm hover:shadow active:scale-95 select-none"
      >
        <Globe className="text-green-700 w-4 h-4 shrink-0" />
        <span>{activeLang.label}</span>
        <ChevronDown
          className={`text-green-600 w-3 h-3 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-green-100 rounded-2xl shadow-xl py-1.5 z-[100] transition-all duration-150">
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ${
                  isSelected
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-green-50/50 hover:text-green-800"
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-green-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
