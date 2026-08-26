import { createContext, useState, useContext, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3200) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:w-96 max-w-full z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all duration-300 animate-slideDown ${
              t.type === "success"
                ? "bg-green-800 text-white border-green-700 shadow-green-900/20"
                : t.type === "error"
                ? "bg-red-800 text-white border-red-700 shadow-red-900/20"
                : t.type === "warning"
                ? "bg-amber-800 text-white border-amber-700 shadow-amber-900/20"
                : "bg-gray-900 text-white border-gray-800 shadow-gray-900/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && <CheckCircle size={20} className="text-green-300 shrink-0" />}
              {t.type === "error" && <AlertTriangle size={20} className="text-red-300 shrink-0" />}
              {t.type === "warning" && <AlertTriangle size={20} className="text-amber-300 shrink-0" />}
              {t.type === "info" && <Info size={20} className="text-blue-300 shrink-0" />}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if component is rendered outside provider
    return {
      success: (msg) => console.log("Toast success:", msg),
      error: (msg) => console.error("Toast error:", msg),
      info: (msg) => console.log("Toast info:", msg),
      warning: (msg) => console.warn("Toast warning:", msg),
    };
  }
  return context;
}
