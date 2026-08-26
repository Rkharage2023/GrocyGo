import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  ClipboardList, 
  Eye, 
  X, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  ShoppingBag,
  Info,
  CheckCircle,
  Clock,
  Ban
} from "lucide-react";
import * as orderService from "../../services/orderService";
import * as slotService from "../../services/slotService";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";

function Orders() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;
    const matchesSearch = searchTerm === "" || order.id.toString().includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  // Detail Modal State
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Cancellation Confirmation Modal State
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Editing Items State
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editItemsState, setEditItemsState] = useState([]);
  const [allProductsForEdit, setAllProductsForEdit] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showAddProductDropdown, setShowAddProductDropdown] = useState(false);
  const [editItemsError, setEditItemsError] = useState(null);
  const [editItemsSaving, setEditItemsSaving] = useState(false);
  const [showOrderSuggestions, setShowOrderSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [activeAddProductIndex, setActiveAddProductIndex] = useState(-1);

  // Edit Slot State
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchSlotsForDate = async (dateStr) => {
    try {
      setSlotsLoading(true);
      const res = await slotService.getAvailableSlots(dateStr);
      if (res.success) {
        setAvailableSlots(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getMyOrders();
      if (res.success) {
        setOrders(res.data || []);
      } else {
        setError(res.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [i18n.language]);

  // Fetch Order Details when selectedOrderId changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedOrderId) {
        setOrderDetails(null);
        return;
      }
      try {
        setDetailsLoading(true);
        setDetailsError(null);
        const res = await orderService.getOrderById(selectedOrderId);
        if (res.success) {
          setOrderDetails(res.data);
        } else {
          setDetailsError(res.message || "Failed to load order details");
        }
      } catch (err) {
        console.error(err);
        setDetailsError(err.response?.data?.message || err.message || "Could not fetch details.");
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedOrderId, i18n.language]);

  const handleCloseDetailsModal = () => {
    if (isEditingItems) {
      toast.warning(t("pleaseSaveDetails", { defaultValue: "Please save the details before closing, or click 'Cancel' inside the editor to discard." }));
      return;
    }
    setSelectedOrderId(null);
  };

  // Handle Order Cancellation
  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;
    try {
      setCancelLoading(true);
      setCancelError(null);
      const res = await orderService.cancelOrder(cancellingOrderId);
      if (res.success) {
        // Update local list
        setOrders(prev => prev.map(o => o.id === cancellingOrderId ? { ...o, status: "CANCELLED" } : o));
        setCancellingOrderId(null);
      } else {
        setCancelError(res.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      setCancelError(err.response?.data?.message || err.message || "Could not cancel order.");
    } finally {
      setCancelLoading(false);
    }
  };

  const loadProductsForEdit = async () => {
    try {
      const res = await API.get("/products?limit=1000");
      if (res.data?.success) {
        setAllProductsForEdit(res.data.data?.products || []);
      }
    } catch (err) {
      console.error("Failed to load products for editing:", err);
    }
  };

  const startEditing = () => {
    setEditItemsState(
      orderDetails.OrderItems.map((item) => ({
        id: item.id,
        productId: item.productId || item.Product?.id,
        Product: item.Product,
        quantity: item.quantity,
        price: item.price,
      }))
    );
    setIsEditingItems(true);
    setEditItemsError(null);
    loadProductsForEdit();

    if (orderDetails.Slot) {
      setSelectedDate(orderDetails.Slot.date);
      setSelectedSlotId(orderDetails.slotId || orderDetails.Slot.id);
      fetchSlotsForDate(orderDetails.Slot.date);
    }
  };

  const handleEditQtyChange = (productId, newQty) => {
    if (newQty <= 0) {
      setEditItemsState((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setEditItemsState((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleAddNewItem = (product) => {
    const exists = editItemsState.find((item) => item.productId === product.id);
    if (exists) {
      handleEditQtyChange(product.id, exists.quantity + 1);
    } else {
      setEditItemsState((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          productId: product.id,
          Product: product,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
    setShowAddProductDropdown(false);
    setProductSearchQuery("");
  };

  const handleSaveEditedItems = async () => {
    if (editItemsState.length === 0) {
      setEditItemsError("Order must have at least one item. Cancel the order instead if needed.");
      return;
    }
    try {
      setEditItemsSaving(true);
      setEditItemsError(null);

      const payload = editItemsState.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await orderService.updateOrderCustomer(orderDetails.id, payload, selectedSlotId);
      if (res.success) {
        setOrderDetails(res.data);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderDetails.id
              ? { ...o, totalAmount: res.data.totalAmount, OrderItems: res.data.OrderItems, Slot: res.data.Slot }
              : o
          )
        );
        setIsEditingItems(false);
      } else {
        setEditItemsError(res.message || "Failed to update order");
      }
    } catch (err) {
      console.error(err);
      setEditItemsError(err.response?.data?.message || err.message || "Failed to update order");
    } finally {
      setEditItemsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle size={12} />
          {t("completed", { defaultValue: "COMPLETED" })}
        </span>
      );

    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <CheckCircle size={12} />
          {t("confirmed", { defaultValue: "CONFIRMED" })}
        </span>
      );

    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <Ban size={12} />
          {t("cancelled", { defaultValue: "CANCELLED" })}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          <Clock size={12} />
          {t("pending", { defaultValue: "PENDING" })}
        </span>
      );
  }
};

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {t("paid", { defaultValue: "PAID" })}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status === "PENDING" ? t("pending", { defaultValue: "PENDING" }) : status || t("pending", { defaultValue: "PENDING" })}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-green-700 font-medium">{t("loadingOrders", { defaultValue: "Loading your orders..." })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t("myOrders")} 📦</h1>
        <p className="text-gray-500 mt-1">{t("ordersDesc", { defaultValue: "Track and manage your order history." })}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
          <AlertTriangle className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 flex flex-col items-center text-center border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <ClipboardList size={44} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700">{t("noOrdersYet", { defaultValue: "No Orders Yet" })}</h2>
          <p className="text-gray-400 mt-2 max-w-sm">
            {t("noOrdersYetDesc", { defaultValue: "You haven't placed any orders yet. Browse our inventory to get started!" })}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={t("searchOrderPlaceholder", { defaultValue: "Search by Order ID..." })}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowOrderSuggestions(true);
                    setActiveSuggestionIndex(-1);
                  }}
                  onFocus={() => setShowOrderSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowOrderSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    const suggestions = orders.filter(o => o.id.toString().includes(searchTerm));
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSuggestionIndex(prev => Math.max(prev - 1, -1));
                    } else if (e.key === "Enter") {
                      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                        e.preventDefault();
                        const selected = suggestions[activeSuggestionIndex];
                        setSearchTerm(selected.id.toString());
                        setShowOrderSuggestions(false);
                      }
                    } else if (e.key === "Escape") {
                      setShowOrderSuggestions(false);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
                {showOrderSuggestions && searchTerm && orders.filter(o => o.id.toString().includes(searchTerm)).length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50 max-h-48">
                    {orders
                      .filter(o => o.id.toString().includes(searchTerm))
                      .slice(0, 5)
                      .map((order, idx) => (
                        <button
                          key={order.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchTerm(order.id.toString());
                            setShowOrderSuggestions(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition flex items-center justify-between text-gray-700 font-medium ${
                            idx === activeSuggestionIndex ? "bg-green-50" : "hover:bg-green-50/50"
                          }`}
                        >
                          <span>{t("orderNo", { defaultValue: "Order #" })}{order.id}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full shrink-0">
                {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((tab) => {
                  const getTabLabel = (tName) => {
                    switch (tName) {
                      case "ALL": return t("all", { defaultValue: "ALL" });
                      case "PENDING": return t("pending", { defaultValue: "PENDING" });
                      case "CONFIRMED": return t("confirmed", { defaultValue: "CONFIRMED" });
                      case "COMPLETED": return t("completed", { defaultValue: "COMPLETED" });
                      case "CANCELLED": return t("cancelled", { defaultValue: "CANCELLED" });
                      default: return tName;
                    }
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition shrink-0 ${
                        activeTab === tab
                          ? "bg-green-600 text-white shadow-xs"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {getTabLabel(tab)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-gray-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-700">{t("noOrdersMatchFilter", { defaultValue: "No orders match your filter" })}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">{t("tryDifferentFilter", { defaultValue: "Try a different status or clear the search." })}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6"
                >
                  {/* Left Side: Order Meta */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-gray-800">
                        {t("orderNo", { defaultValue: "Order #" })}{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={15} />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">{t("total", { defaultValue: "Total" })}:</span>
                        <span className="font-bold text-green-700">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm transition border border-gray-200"
                    >
                      <Eye size={16} /> {t("viewItems", { defaultValue: "View Items" })}
                    </button>

                    {order.status === "PENDING" && (
                      <button
                        onClick={() => setCancellingOrderId(order.id)}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm transition border border-red-100"
                      >
                        {t("cancelOrder", { defaultValue: "Cancel Order" })}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-white border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {t("orderDetails", { defaultValue: "Order Details" })} #{selectedOrderId}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{t("lineItemsInfo", { defaultValue: "Line items & information" })}</p>
              </div>
              <button
                onClick={handleCloseDetailsModal}
                className="p-1.5 rounded-xl hover:bg-gray-200 transition text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {detailsLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-green-700 font-medium text-sm">{t("fetchingItems", { defaultValue: "Fetching items..." })}</p>
                </div>
              )}

              {detailsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>{detailsError}</span>
                </div>
              )}

              {orderDetails && (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t("status", { defaultValue: "Status" })}</p>
                      <div className="mt-1">{getStatusBadge(orderDetails.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t("payment", { defaultValue: "Payment" })}</p>
                      <div className="mt-1">{getPaymentStatusBadge(orderDetails.paymentStatus)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t("total", { defaultValue: "Total Amount" })}</p>
                      <p className="text-base font-bold text-green-700 mt-1">₹{parseFloat(orderDetails.totalAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t("orderedOn", { defaultValue: "Ordered On" })}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {new Date(orderDetails.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    {!isEditingItems ? (
                      <>
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-green-600" />
                            {t("itemsSummary", { defaultValue: "Items Summary" })} ({orderDetails.OrderItems?.length || 0})
                          </h4>
                          {orderDetails.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={startEditing}
                              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-bold border border-green-200 transition"
                            >
                              {t("editItems", { defaultValue: "Edit Items" })}
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {orderDetails.OrderItems?.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm"
                            >
                              {/* Product Image */}
                              <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                                {item.Product?.image && item.Product.image.startsWith("http") ? (
                                  <img src={item.Product.image} className="w-full h-full object-cover" alt={item.Product?.name} />
                                ) : (
                                  item.Product?.image || "📦"
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-800 text-sm truncate">
                                  {item.Product?.name || "Product Unavailable"}
                                </h5>
                                <p className="text-xs text-gray-400">{item.Product?.unit || ""}</p>
                              </div>

                              {/* Calculation */}
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-gray-800">
                                  ₹{parseFloat(item.subtotal || 0).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ₹{parseFloat(item.price || 0).toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <ShoppingBag size={18} className="text-green-600" />
                          Edit Items ({editItemsState.length})
                        </h4>
                        <div className="space-y-3 mb-4">
                          {editItemsState.map((item) => (
                            <div
                              key={item.id || item.productId}
                              className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm"
                            >
                              {/* Product Image */}
                              <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                                {item.Product?.image && item.Product.image.startsWith("http") ? (
                                  <img src={item.Product.image} className="w-full h-full object-cover" alt={item.Product?.name} />
                                ) : (
                                  item.Product?.image || "📦"
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-800 text-sm truncate">
                                  {item.Product?.name || t("productUnavailable", { defaultValue: "Product Unavailable" })}
                                </h5>
                                <p className="text-xs text-gray-400">{item.Product?.unit || ""}</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">₹{parseFloat(item.price || 0).toFixed(2)} {t("each", { defaultValue: "each" })}</p>
                              </div>

                              {/* Quantity control */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditQtyChange(item.productId, item.quantity - 1)}
                                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600 transition"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleEditQtyChange(item.productId, item.quantity + 1)}
                                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600 transition"
                                >
                                  +
                                </button>
                              </div>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleEditQtyChange(item.productId, 0)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100 shrink-0"
                              >
                                <X size={16} className="text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Product Section */}
                        <div className="relative border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 mb-4">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t("addProductToOrder", { defaultValue: "Add product to order" })}</label>
                          <input
                            type="text"
                            placeholder={t("searchProductToAddPlaceholder", { defaultValue: "Search product to add..." })}
                            value={productSearchQuery}
                            onChange={(e) => {
                              setProductSearchQuery(e.target.value);
                              setShowAddProductDropdown(true);
                              setActiveAddProductIndex(-1);
                            }}
                            onFocus={() => setShowAddProductDropdown(true)}
                            onBlur={() => setTimeout(() => setShowAddProductDropdown(false), 200)}
                            onKeyDown={(e) => {
                              const suggestions = allProductsForEdit
                                .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) && p.isActive && p.stock > 0)
                                .slice(0, 5);
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setActiveAddProductIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                              } else if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setActiveAddProductIndex(prev => Math.max(prev - 1, -1));
                              } else if (e.key === "Enter") {
                                if (activeAddProductIndex >= 0 && suggestions[activeAddProductIndex]) {
                                  e.preventDefault();
                                  handleAddNewItem(suggestions[activeAddProductIndex]);
                                  setProductSearchQuery("");
                                  setShowAddProductDropdown(false);
                                  setActiveAddProductIndex(-1);
                                }
                              } else if (e.key === "Escape") {
                                setShowAddProductDropdown(false);
                              }
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-green-500 transition"
                          />
                          {showAddProductDropdown && productSearchQuery && (
                            <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 divide-y divide-gray-50">
                              {allProductsForEdit
                                .filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) && p.isActive && p.stock > 0)
                                .slice(0, 5)
                                .map((product, idx) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleAddNewItem(product);
                                      setProductSearchQuery("");
                                      setShowAddProductDropdown(false);
                                      setActiveAddProductIndex(-1);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between ${
                                      idx === activeAddProductIndex ? "bg-green-100 text-green-950 font-semibold" : "hover:bg-green-50/50"
                                    }`}
                                  >
                                    <div>
                                      <span className="font-bold text-gray-800">{product.name}</span>
                                      <span className="text-gray-400 ml-1.5">({product.unit})</span>
                                    </div>
                                    <span className="font-semibold text-green-700">₹{parseFloat(product.price).toFixed(2)}</span>
                                  </button>
                                ))}
                              {allProductsForEdit.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) && p.isActive && p.stock > 0).length === 0 && (
                                <div className="p-3 text-xs text-gray-400 text-center italic">{t("noInStockProductsSearch", { defaultValue: "No in-stock products match search" })}</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Edit Pickup Slot Section */}
                        <div className="border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 mb-4">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t("changePickupSlot", { defaultValue: "Change Pickup Slot (Optional)" })}</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="date"
                              value={selectedDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedSlotId(null);
                                fetchSlotsForDate(e.target.value);
                              }}
                              className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-green-500 transition"
                            />
                            <select
                              value={selectedSlotId || ""}
                              onChange={(e) => setSelectedSlotId(e.target.value)}
                              disabled={slotsLoading || !selectedDate}
                              className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="" disabled>{t("selectSlot", { defaultValue: "Select a slot" })}</option>
                              {slotsLoading ? (
                                <option disabled>{t("loading", { defaultValue: "Loading..." })}</option>
                              ) : availableSlots.length === 0 ? (
                                <option disabled>{t("noSlotsAvailable", { defaultValue: "No slots available" })}</option>
                              ) : (
                                availableSlots.map(slot => {
                                  const isFull = slot.bookedCount >= slot.maxCapacity;
                                  const isCurrentSlot = slot.id === orderDetails.slotId || (orderDetails.Slot && slot.id === orderDetails.Slot.id);
                                  return (
                                    <option 
                                      key={slot.id} 
                                      value={slot.id} 
                                      disabled={isFull && !isCurrentSlot}
                                    >
                                      {slot.startTime} - {slot.endTime} {isFull && !isCurrentSlot ? "(Full)" : isCurrentSlot ? "(Current)" : ""}
                                    </option>
                                  );
                                })
                              )}
                            </select>
                          </div>
                        </div>

                        {editItemsError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold mb-4">
                            {editItemsError}
                          </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between mb-4">
                          <span className="font-bold text-gray-700">{t("estimatedTotal", { defaultValue: "Estimated Total" })}:</span>
                          <span className="text-xl font-extrabold text-green-700">₹{editItemsState.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.quantity, 0).toFixed(2)}</span>
                        </div>

                        {/* Buttons moved to main modal footer */}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {isEditingItems ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingItems(false)}
                    className="px-5 py-2.5 border rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition bg-white"
                  >
                    {t("cancel", { defaultValue: "Cancel" })}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedItems}
                    disabled={editItemsSaving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition"
                  >
                    {editItemsSaving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {t("saveChanges", { defaultValue: "Save Changes" })}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCloseDetailsModal}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  {t("closeDetails", { defaultValue: "Close Details" })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 animate-scaleUp">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-800">{t("cancelOrderQuestion", { id: cancellingOrderId, defaultValue: `Cancel Order #${cancellingOrderId}?` })}</h3>
            <p className="text-gray-500 text-sm mt-2">
              {t("cancelOrderConfirmMsg", { defaultValue: "Are you sure you want to cancel this order? This will release the products back to active inventory. This action cannot be undone." })}
            </p>

            {cancelError && (
              <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                {cancelError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCancellingOrderId(null)}
                disabled={cancelLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition"
              >
                {t("goBack", { defaultValue: "Go Back" })}
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5"
              >
                {cancelLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("cancelling", { defaultValue: "Cancelling..." })}
                  </>
                ) : (
                  t("confirmCancel", { defaultValue: "Confirm Cancel" })
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
