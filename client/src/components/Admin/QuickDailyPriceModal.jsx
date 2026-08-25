import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaBolt, FaCheckCircle } from "react-icons/fa";
import API from "../../services/api";

function QuickDailyPriceModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [editedPrices, setEditedPrices] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchEssentialProducts();
    }
  }, [isOpen]);

  const fetchEssentialProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products?limit=100&includeInactive=true");
      if (res.data?.success) {
        const allProds = res.data.data.products || [];
        setProducts(allProds);
        
        // Initialize prices map
        const initialPrices = {};
        allProds.forEach(p => {
          initialPrices[p.id] = {
            price: p.price,
            purchasePrice: p.purchasePrice || p.price,
          };
        });
        setEditedPrices(initialPrices);
      }
    } catch (err) {
      console.error("Error fetching daily products for price updater:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id, field, value) => {
    setEditedPrices(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSuccessMsg("");

      // Filter changed prices only
      const updatePromises = products.map(async (p) => {
        const edited = editedPrices[p.id];
        if (edited) {
          const newPrice = parseFloat(edited.price);
          const newPurchase = parseFloat(edited.purchasePrice);
          if (newPrice !== parseFloat(p.price) || newPurchase !== parseFloat(p.purchasePrice)) {
            return API.put(`/products/${p.id}`, {
              price: newPrice,
              purchasePrice: newPurchase,
            });
          }
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      setSuccessMsg("⚡ All daily market commodity rates updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onRefresh();
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error updating prices:", err);
      alert("Failed to update some prices. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <FaBolt className="text-yellow-300" /> Quick Daily Price Updater (दैनंदिन भाव अपडेटर)
            </h2>
            <p className="text-green-100 text-xs mt-0.5">
              Update daily fluctuating market rates (Edible Oils, Ghee, Sugar, Atta, Grains) in 2 clicks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-green-100 border-b border-green-200 text-green-800 px-6 py-3 font-bold text-sm flex items-center gap-2 animate-fadeIn shrink-0">
            <FaCheckCircle className="text-green-600 text-lg" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500 font-medium">
              <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading items...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4">Item Name (इंग्रजी / मराठी)</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-center">Cost Price (खरेदी दर ₹)</th>
                  <th className="py-3 px-4 text-center">Selling Price (विक्री दर ₹)</th>
                  <th className="py-3 px-4 text-center">Margin (नफा)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((p) => {
                  const currentVals = editedPrices[p.id] || { price: p.price, purchasePrice: p.purchasePrice };
                  const cost = parseFloat(currentVals.purchasePrice || 0);
                  const sell = parseFloat(currentVals.price || 0);
                  const profit = sell - cost;
                  const marginPct = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-green-50/30 transition">
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        <div>{p.name_en}</div>
                        <div className="text-xs text-green-700 font-medium">{p.name_mr}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-gray-500">{p.unit}</td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={currentVals.purchasePrice}
                          onChange={(e) => handlePriceChange(p.id, "purchasePrice", e.target.value)}
                          className="w-24 text-center border border-gray-200 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold text-gray-700 bg-gray-50"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={currentVals.price}
                          onChange={(e) => handlePriceChange(p.id, "price", e.target.value)}
                          className="w-24 text-center border border-green-300 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-green-500 outline-none text-sm font-black text-green-800 bg-green-50/40"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-extrabold px-2 py-1 rounded-full ${profit >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          +₹{profit.toFixed(1)} ({marginPct}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            Tip: Changes made here take effect immediately for customer order calculations.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Prices...
                </>
              ) : (
                <>
                  <FaSave /> Save All Prices (२-क्लिक अपडेट)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickDailyPriceModal;
