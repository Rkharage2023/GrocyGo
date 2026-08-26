import { FaExclamationTriangle, FaTimes, FaCheck } from "react-icons/fa";

function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "Please confirm this action.",
  confirmText = "OK",
  cancelText = "Cancel",
  type = "warning", // "warning" | "danger" | "info"
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform transition-all animate-scaleUp">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            type === "danger"
              ? "bg-red-50 text-red-800 border-red-100"
              : type === "info"
              ? "bg-blue-50 text-blue-800 border-blue-100"
              : "bg-amber-50 text-amber-800 border-amber-100"
          }`}
        >
          <div className="flex items-center gap-2.5 font-extrabold text-base">
            <FaExclamationTriangle
              className={
                type === "danger"
                  ? "text-red-600"
                  : type === "info"
                  ? "text-blue-600"
                  : "text-amber-600"
              }
            />
            <span>{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-black/5 text-gray-500 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-md transition ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <FaCheck size={12} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
