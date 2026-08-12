import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CheckCircle, AlertTriangle } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import * as orderService from "../services/orderService";
import * as slotService from "../services/slotService";

function Cart() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);
  const { cartItems, cartDetails, cartLoading, updateQuantity, removeFromCart, clearCart, fetchCart } = useContext(CartContext);

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [tempQuantities, setTempQuantities] = useState({});
  // Snapshot of cart data saved just before cart is cleared on successful checkout
  const [billSnapshot, setBillSnapshot] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [slotsError, setSlotsError] = useState(null);
  const [offerWarningMsg, setOfferWarningMsg] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!isLoggedIn) return;
      try {
        setSlotsLoading(true);
        setSlotsError(null);
        const res = await slotService.getAvailableSlots(selectedDate);
        if (res.success) {
          setAvailableSlots(res.data || []);
          setSelectedSlotId(null);
        } else {
          setSlotsError(res.message || "Failed to load slots");
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Error loading slots:", err);
        setSlotsError(
          err.response?.data?.message || "Could not load pickup slots."
        );
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, isLoggedIn]);

  const handleDateChange = (newDateStr) => {
    // Check for offers that expire before the selected date
    const selectedTime = new Date(newDateStr + "T12:00:00").getTime(); // Use noon to avoid timezone edge cases

    const expiringItems = cartItems.filter((item) => {
      if (item.savings > 0 && item.offerEndDate && item.offerStartDate) {
        const start = new Date(item.offerStartDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(item.offerEndDate);
        end.setHours(23, 59, 59, 999);
        
        return selectedTime < start.getTime() || selectedTime > end.getTime();
      }
      return false;
    });

    if (expiringItems.length > 0) {
      const msgs = expiringItems.map(
        (item) =>
          `• ${item.name}: valid from ${formatSlotDate(item.offerStartDate)} to ${formatSlotDate(
            item.offerEndDate
          )}`
      );
      setOfferWarningMsg(
        `Offers removed for this pickup date:\n${msgs.join("\n")}`
      );
      setTimeout(() => setOfferWarningMsg(null), 5000);
    }

    setSelectedDate(newDateStr);
    const todayStr = new Date().toISOString().split("T")[0];
    fetchCart(newDateStr === todayStr ? null : newDateStr);
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    let hr = parseInt(hour, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12;
    hr = hr ? hr : 12;
    return `${hr.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  const formatSlotDate = (dateVal) => {
    if (!dateVal || typeof dateVal !== "string") return "";
    try {
      const formattedIso = dateVal.includes("T") ? dateVal : `${dateVal}T00:00:00`;
      return new Date(formattedIso).toLocaleDateString(i18n?.language === "mr" ? "mr-IN" : "en-IN", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const handleCheckout = async () => {
    if (!selectedSlotId) {
      setCheckoutError("Please select a pickup slot before placing your order.");
      return;
    }
    try {
      setIsCheckoutLoading(true);
      setCheckoutError(null);

      // Flush any pending temp quantities
      const pendingItemIds = Object.keys(tempQuantities);
      if (pendingItemIds.length > 0) {
        for (const itemId of pendingItemIds) {
          const item = cartItems.find((i) => i.id === parseInt(itemId, 10));
          if (item) {
            const rawVal = tempQuantities[itemId];
            let val = parseInt(rawVal, 10);
            if (isNaN(val) || val < 1) val = 1;
            const maxStock = item.stock || 999;
            let finalVal = val > maxStock ? maxStock : val;
            await updateQuantity(item.productId, finalVal);
          }
        }
        setTempQuantities({});
      }

      // Snapshot cart & totals BEFORE clearing
      const snapshotItems = cartItems.map((item) => ({ ...item }));
      const snapshotDetails = { ...cartDetails };
      const snapshotSlot = availableSlots.find((s) => s.id === selectedSlotId);

      const res = await orderService.checkout(selectedSlotId, "CASH");
      if (res.success) {
        setBillSnapshot({ items: snapshotItems, details: snapshotDetails, slot: snapshotSlot });
        setCheckoutSuccessOrder(res.data);
        clearCart();
      } else {
        setCheckoutError(res.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while placing your order."
      );
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700">{t("pleaseLogin")}</h2>
          <p className="text-gray-400 mt-2 mb-6">{t("loginToViewCart")}</p>
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-green-700 font-medium">{t("loadingCart")}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !checkoutSuccessOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={52} className="text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700">{t("cartEmptyTitle")}</h2>
          <p className="text-gray-400 mt-2 mb-8 max-w-sm mx-auto">
            {t("browseFreshText")}
          </p>
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            {t("shopNow")}
          </Link>
        </div>
      </div>
    );
  }

  const getDynamicQty = (item) => {
    const tempVal = tempQuantities[item.id];
    if (tempVal === undefined) return item.quantity;
    if (tempVal === "") return 0;
    const val = parseInt(tempVal, 10);
    return isNaN(val) ? 0 : val;
  };

  const getDynamicItemTotal = (item) => {
    const price = parseFloat(item.price || 0);
    return price * getDynamicQty(item);
  };

  const getDynamicCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + getDynamicItemTotal(item), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-200 transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t("cartTitle")}</h1>
              <p className="text-gray-500">{t("itemCount", { count: cartItems.length })}</p>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition font-medium text-sm"
          >
            <Trash2 size={16} /> {t("clearAll")}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const price = parseFloat(item.price || 0);
              const itemTotal = getDynamicItemTotal(item);

              const hasDiscount = item.savings > 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-150 p-5 flex items-center gap-5"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-orange-50 rounded-xl flex items-center justify-center text-4xl shrink-0 overflow-hidden border border-gray-100 shadow-sm relative">
                    {item.image && item.image.startsWith("http") ? (
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      item.image || "📦"
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800 truncate">
                        {item.name}
                      </h3>
                      {item.offerBadge && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                          {item.offerBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">{item.unit}</p>

                    {item.appliedOffer && (
                      <p className="text-[10px] text-rose-500 font-bold mt-0.5">{t("appliedOffer")} {item.appliedOffer}</p>
                    )}

                    <div className="flex items-center gap-2 text-green-700 font-semibold mt-2.5 flex-wrap">
                      {hasDiscount ? (
                        <div className="flex items-center gap-1.5">
                          <span className="line-through text-gray-400 text-xs">₹{item.price.toFixed(2)}</span>
                          <span className="font-bold text-green-700">₹{item.finalPrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>₹{item.price.toFixed(2)}</span>
                      )}

                      <span className="text-gray-400">×</span>

                      <input
                        type="number"
                        min="1"
                        max={item.stock || 999}
                        value={tempQuantities[item.id] !== undefined ? tempQuantities[item.id] : item.quantity}
                        onFocus={(e) => {
                          e.target.select();
                          setTempQuantities((prev) => ({ ...prev, [item.id]: item.quantity.toString() }));
                        }}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          const val = parseInt(rawVal, 10);
                          const maxStock = item.stock || 999;
                          if (!isNaN(val) && val > maxStock) {
                            setTempQuantities((prev) => ({ ...prev, [item.id]: maxStock.toString() }));
                            updateQuantity(item.productId, maxStock);
                            return;
                          }
                          setTempQuantities((prev) => ({ ...prev, [item.id]: rawVal }));
                        }}
                        onBlur={() => {
                          const rawVal = tempQuantities[item.id];
                          if (rawVal === undefined) return;

                          let val = parseInt(rawVal, 10);
                          if (isNaN(val) || val < 1) {
                            val = 1;
                          }
                          const maxStock = item.stock || 999;
                          let finalVal = val;
                          if (val > maxStock) {
                            finalVal = maxStock;
                          }
                          updateQuantity(item.productId, finalVal);

                          setTempQuantities((prev) => {
                            const copy = { ...prev };
                            delete copy[item.id];
                            return copy;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                        className="w-16 h-8 text-center border-2 border-green-200 rounded-xl font-bold text-gray-800 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                      />

                      <span className="text-gray-400">=</span>

                      <div className="flex flex-col">
                        <span className={`text-gray-800 ${hasDiscount ? "line-through text-xs text-gray-400" : ""}`}>
                          ₹{item.subtotal.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-green-700 font-extrabold text-sm">
                            ₹{item.totalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove & Stock */}
                  <div className="flex flex-col items-center gap-1 shrink-0 self-start">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                    </button>
                    <span className={`text-xs font-bold whitespace-nowrap border px-2 py-0.5 rounded-md ${
                      item.stock < 10
                        ? "text-red-600 bg-red-50 border-red-100"
                        : "text-green-700 bg-green-50 border-green-100"
                    }`}>
                      {t("stockLabel")} {item.stock}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-5">{t("orderSummary", { defaultValue: "Order Summary" })}</h2>

              <div className="space-y-3 text-sm">
                {cartItems.map((item) => {
                  const qty = getDynamicQty(item);
                  const hasDiscount = item.savings > 0;
                  const originalTotal = item.price * qty;
                  const finalTotal = item.totalPrice;

                  return (
                    <div key={item.id} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[160px]">
                        {item.name} × {qty}
                      </span>
                      <span className="font-medium shrink-0 ml-2">
                        {hasDiscount ? (
                          <div className="text-right">
                            <span className="line-through text-gray-400 text-xs mr-1">
                              ₹{originalTotal.toFixed(2)}
                            </span>
                            <span className="text-green-700 font-bold">
                              ₹{finalTotal.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span>₹{originalTotal.toFixed(2)}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500 font-semibold">
                  <span>{t("subtotal")}</span>
                  <span>₹{cartDetails.subtotal.toFixed(2)}</span>
                </div>
                {cartDetails.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-black uppercase tracking-wide">
                    <span>{t("discountSavings")}</span>
                    <span>-₹{cartDetails.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{t("total", { defaultValue: "Total" })}</span>
                  <span className="text-green-700">₹{cartDetails.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Pickup Slot Selection */}
              <div className="border-t border-gray-100 mt-5 pt-5 space-y-4">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span className="text-orange-500">⏰</span> {t("selectPickupSlot", { defaultValue: "Select Pickup Slot" })}
                </h3>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-1 font-medium">{t("pickupDate", { defaultValue: "Pickup Date" })}</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                {slotsLoading ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-green-700">{t("loadingSlots", { defaultValue: "Loading slots..." })}</span>
                  </div>
                ) : slotsError ? (
                  <p className="text-xs text-red-500">{slotsError}</p>
                ) : (() => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const nowTimeStr = new Date().toTimeString().split(" ")[0];
                  const validSlots = availableSlots.filter((slot) => {
                    if (selectedDate === todayStr) {
                      return slot.startTime >= nowTimeStr;
                    }
                    return true;
                  });

                  if (validSlots.length === 0) {
                    return (
                      <p className="text-xs text-orange-500 bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                        {t("noSlotsAvailable", { defaultValue: "No slots available for this date." })}
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 block font-medium">{t("availableTimes", { defaultValue: "Available Times" })}</label>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                        {validSlots.map((slot) => {
                          const isSelected = selectedSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? "border-green-600 bg-green-50 text-green-800 font-bold shadow-sm"
                                  : "border-gray-200 hover:border-green-400 hover:bg-green-50/30 text-gray-700"
                              }`}
                            >
                              <span>
                                {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                slot.availableCapacity <= 5
                                  ? "bg-orange-50 text-orange-600 font-medium"
                                  : "bg-green-50 text-green-600"
                              }`}>
                                {slot.availableCapacity} {t("left", { defaultValue: "left" })}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {checkoutError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2 animate-shake">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <button
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-md shadow-green-200"
                onClick={handleCheckout}
                disabled={isCheckoutLoading || !selectedSlotId}
              >
                {isCheckoutLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("placingOrder", { defaultValue: "Placing Order..." })}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {t("placeOrder", { defaultValue: "Place Order" })}
                  </>
                )}
              </button>

              <Link
                to="/products"
                className="block mt-3 text-center text-green-600 hover:underline font-medium text-sm"
              >
                {t("continueShopping", { defaultValue: "← Continue Shopping" })}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Success / Bill Modal */}
      {checkoutSuccessOrder && billSnapshot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-6 text-center shrink-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold">{t("orderPlaced")}</h2>
              <p className="text-green-100 text-sm mt-1">{t("orderPlacedThankYou")}</p>
            </div>

            {/* Scrollable Bill Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Order Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{t("orderId")}</p>
                  <p className="font-bold text-gray-800 mt-0.5">#{checkoutSuccessOrder.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{t("orderStatus")}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mt-0.5">
                    {checkoutSuccessOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{t("paymentStatus")}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100 mt-0.5">
                    {checkoutSuccessOrder.paymentStatus}
                  </span>
                </div>
                {billSnapshot.slot && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">{t("pickupSlot", { defaultValue: "Pickup Slot" })}</p>
                    <p className="font-bold text-gray-800 mt-0.5 text-xs">
                      {formatSlotDate(billSnapshot.slot.date || selectedDate)
                        ? `${formatSlotDate(billSnapshot.slot.date || selectedDate)} • `
                        : ""}
                      {formatTime12h(billSnapshot.slot.startTime)} – {formatTime12h(billSnapshot.slot.endTime)}
                    </p>
                  </div>
                )}
              </div>

              {/* Item Breakdown */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t("itemsBought", { defaultValue: "Items Purchased" })}</h3>
                <div className="space-y-2">
                  {billSnapshot.items.map((item) => {
                    const unitPrice = parseFloat(item.finalPrice || item.price || 0);
                    const origPrice = parseFloat(item.price || 0);
                    const qty = item.quantity;
                    const lineTotal = (unitPrice * qty).toFixed(2);
                    const origTotal = (origPrice * qty).toFixed(2);
                    const hasSavings = item.savings > 0;
                    return (
                      <div key={item.id} className="flex items-start justify-between gap-2 text-sm py-2 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.unit} × {qty}</p>
                          {item.offerBadge && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded-full">
                              {item.offerBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-800">₹{lineTotal}</p>
                          {hasSavings && (
                            <p className="text-xs line-through text-gray-400">₹{origTotal}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t("subtotal")}</span>
                  <span>₹{parseFloat(billSnapshot.details.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(billSnapshot.details.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-600">
                    <span>{t("discountSavings")}</span>
                    <span>-₹{parseFloat(billSnapshot.details.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-lg text-gray-900 border-t border-gray-200 pt-2 mt-1">
                  <span>{t("total", { defaultValue: "Total" })}</span>
                  <span className="text-green-700">₹{parseFloat(billSnapshot.details.grandTotal || checkoutSuccessOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Savings Banner */}
              {parseFloat(billSnapshot.details.discount || 0) > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-green-700">🎉 {t("youSaved", { defaultValue: "You Saved" })} ₹{parseFloat(billSnapshot.details.discount).toFixed(2)}!</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">{t("savingsThanksToOffers", { defaultValue: "Thanks to GrocyGo offers on this order" })}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 pt-3 flex flex-col gap-2.5 shrink-0 border-t border-gray-100">
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-green-100"
              >
                {t("trackMyOrders")}
              </button>
              <button
                onClick={() => navigate("/products")}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold transition border border-gray-200"
              >
                {t("shopNow")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Warning Modal */}
      {offerWarningMsg && (
        <div className="fixed top-24 right-6 z-50 bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-xl font-medium animate-bounce max-w-sm border border-orange-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {offerWarningMsg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
