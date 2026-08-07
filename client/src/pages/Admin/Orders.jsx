import { useState, useEffect } from "react";
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
  Ban,
  Search,
  User,
  Phone,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Receipt
} from "lucide-react";
import * as orderService from "../../services/orderService";
import API from "../../services/api";

const formatTime12h = (timeStr) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  let hr = parseInt(hour, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12;
  hr = hr ? hr : 12;
  return `${hr.toString().padStart(2, "0")}:${minute} ${ampm}`;
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Detail Modal State
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Bill Modal State
  const [showBillOrderId, setShowBillOrderId] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState(null);
  const [billLang, setBillLang] = useState("mr"); // "mr" | "en"
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [billMeta, setBillMeta] = useState({
    storeName: "GrocyGo",
    tagline: "",
    contact: "+91 98765 43210",
    email: "support@grocygo.com",
    gstin: "27AAAAA1111A1Z1",
    footerNote: "",
  });
  const [billEditData, setBillEditData] = useState(null);

  // Helpers
  const updBill = (key, val) => setBillEditData(p => ({ ...p, [key]: val }));
  const updBillItem = (idx, key, val) => setBillEditData(p => {
    const items = p.items.map((it, i) => i === idx ? { ...it, [key]: key === "price" || key === "quantity" ? parseFloat(val) || 0 : val } : it);
    return { ...p, items };
  });
  const addBillItem = () => setBillEditData(p => ({ ...p, items: [...p.items, { id: `new-${Date.now()}`, name: "", unit: "", price: 0, quantity: 1 }] }));
  const removeBillItem = (idx) => setBillEditData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  // Fetch Bill Details when showBillOrderId changes
  useEffect(() => {
    const fetchBillDetails = async () => {
      if (!showBillOrderId) {
        setBillDetails(null);
        setBillEditData(null);
        return;
      }
      try {
        setBillLoading(true);
        setBillError(null);
        const res = await orderService.getOrderByIdAdmin(showBillOrderId);
        if (res.success) {
          setBillDetails(res.data);
        } else {
          setBillError(res.message || "Failed to load bill details");
        }
      } catch (err) {
        console.error(err);
        setBillError(err.response?.data?.message || err.message || "Could not fetch bill details.");
      } finally {
        setBillLoading(false);
      }
    };

    fetchBillDetails();
  }, [showBillOrderId]);

  // Sync billEditData whenever billDetails loads
  useEffect(() => {
    if (!billDetails) { setBillEditData(null); return; }
    const slotText = billDetails.Slot
      ? `${new Date(billDetails.Slot.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • ${formatTime12h(billDetails.Slot.startTime)} - ${formatTime12h(billDetails.Slot.endTime)}`
      : "";
    const isMr = billLang === "mr";
    setBillEditData({
      invoiceId: `INV-${billDetails.id}`,
      dateTime: new Date(billDetails.createdAt).toLocaleString(isMr ? "mr-IN" : "en-IN"),
      paymentMethod: billDetails.paymentMethod || "",
      paymentStatus: billDetails.paymentStatus || "",
      customerName: billDetails.User?.name || "Customer",
      customerMobile: billDetails.User?.mobile || "N/A",
      pickupSlotText: slotText,
      totalAmount: parseFloat(billDetails.totalAmount || 0),
      items: (billDetails.OrderItems || []).map(item => {
        const p = item.Product;
        const initialName = isMr ? (p?.name_mr || p?.name || "Product") : (p?.name_en || p?.name || "Product");
        return {
          id: item.id,
          name: initialName,
          name_en: p?.name_en || p?.name || "Product",
          name_mr: p?.name_mr || p?.name || "Product",
          unit: p?.unit || "",
          price: parseFloat(item.price || 0),
          mrp: parseFloat(p?.price || item.price || 0),
          quantity: item.quantity,
          isCustom: false,
        };
      }),
      thankYouMsg: "",
      bringCopyMsg: "",
    });
  }, [billDetails]);

  // Translate product names when language switches
  useEffect(() => {
    if (!billEditData) return;
    setBillEditData(prev => {
      if (!prev) return prev;
      const isMr = billLang === "mr";
      const updatedItems = prev.items.map(item => {
        if (item.isCustom) return item;
        return {
          ...item,
          name: isMr ? (item.name_mr || item.name) : (item.name_en || item.name)
        };
      });
      return {
        ...prev,
        items: updatedItems
      };
    });
  }, [billLang]);

  // Status updates in modal/table
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});

  // Editing Items State
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editItemsState, setEditItemsState] = useState([]);
  const [allProductsForEdit, setAllProductsForEdit] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showAddProductDropdown, setShowAddProductDropdown] = useState(false);
  const [editItemsError, setEditItemsError] = useState(null);
  const [editItemsSaving, setEditItemsSaving] = useState(false);
  const [showOrderSearchSuggestions, setShowOrderSearchSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [activeAddProductIndex, setActiveAddProductIndex] = useState(-1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getAllOrdersAdmin();
      if (res.success) {
        setOrders(res.data?.orders || []);
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
  }, []);

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
        const res = await orderService.getOrderByIdAdmin(selectedOrderId);
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
  }, [selectedOrderId]);

  // Handle Order Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    const currentOrder = orders.find(o => o.id === orderId);

    // Enforce payment status is PAID for COMPLETED orders
    if (newStatus === "COMPLETED") {
      if (currentOrder && currentOrder.paymentStatus !== "PAID") {
        alert("Cannot mark order as COMPLETED because it has not been PAID yet.");
        return;
      }
    }

    // Prevent completed -> pending transition
    if (currentOrder && currentOrder.status === "COMPLETED" && newStatus === "PENDING") {
      alert("Cannot change status back to PENDING once it is COMPLETED.");
      return;
    }

    // Confirmation popup for marking as COMPLETED
    if (newStatus === "COMPLETED") {
      const confirmComplete = window.confirm("Are you sure you want to mark this order as COMPLETED?");
      if (!confirmComplete) {
        return;
      }
    }

    try {
      setStatusUpdateLoading(prev => ({ ...prev, [orderId]: true }));
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrderId === orderId) {
          setOrderDetails(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        alert(res.message || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to update order status");
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle Payment Status Update
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    const currentOrder = orders.find(o => o.id === orderId);

    // Enforce that a COMPLETED order cannot have its payment status changed to unpaid
    if (currentOrder && currentOrder.status === "COMPLETED" && newPaymentStatus !== "PAID") {
      alert("Cannot change payment status of a COMPLETED order to unpaid.");
      return;
    }

    // Confirmation popup for marking payment status as FAILED
    if (newPaymentStatus === "FAILED") {
      const confirmFailed = window.confirm("Are you sure you want to mark this order payment as FAILED?");
      if (!confirmFailed) {
        // Force state reload to revert the select element selection
        setOrders(prev => [...prev]);
        return;
      }
    }

    try {
      setStatusUpdateLoading(prev => ({ ...prev, [`pay-${orderId}`]: true }));
      const res = await orderService.updateOrderPaymentStatus(orderId, newPaymentStatus);
      if (res.success) {
        const updatedOrder = res.data;
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          paymentStatus: updatedOrder?.paymentStatus || newPaymentStatus,
          status: updatedOrder?.status || o.status
        } : o));
        if (selectedOrderId === orderId) {
          setOrderDetails(prev => prev ? {
            ...prev,
            paymentStatus: updatedOrder?.paymentStatus || newPaymentStatus,
            status: updatedOrder?.status || prev.status
          } : null);
        }
      } else {
        alert(res.message || "Failed to update payment status");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to update payment status");
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [`pay-${orderId}`]: false }));
    }
  };

  // Handle Payment Method Update
  const handlePaymentMethodChange = async (orderId, newPaymentMethod) => {
    try {
      setStatusUpdateLoading(prev => ({ ...prev, [`meth-${orderId}`]: true }));
      const res = await orderService.updateOrderPaymentMethod(orderId, newPaymentMethod);
      if (res.success) {
        const updatedOrder = res.data;
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          paymentMethod: updatedOrder?.paymentMethod || newPaymentMethod
        } : o));
        if (selectedOrderId === orderId) {
          setOrderDetails(prev => prev ? {
            ...prev,
            paymentMethod: updatedOrder?.paymentMethod || newPaymentMethod
          } : null);
        }
      } else {
        alert(res.message || "Failed to update payment method");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to update payment method");
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [`meth-${orderId}`]: false }));
    }
  };

  const handlePrint = (billDetails, lang = "en") => {
    if (!billDetails) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) { alert("Please allow popups to print invoices"); return; }

    const isMr = lang === "mr";
    
    // Use billEditData if available, otherwise build/fallback from billDetails
    const data = billEditData || {
      invoiceId: `INV-${billDetails.id}`,
      dateTime: new Date(billDetails.createdAt).toLocaleString(isMr ? "mr-IN" : "en-IN"),
      paymentMethod: billDetails.paymentMethod || "",
      paymentStatus: billDetails.paymentStatus || "",
      customerName: billDetails.User?.name || "Customer",
      customerMobile: billDetails.User?.mobile || "N/A",
      pickupSlotText: billDetails.Slot
        ? `${new Date(billDetails.Slot.date).toLocaleDateString(isMr ? "mr-IN" : "en-IN", { day: "numeric", month: "short" })} • ${formatTime12h(billDetails.Slot.startTime)} - ${formatTime12h(billDetails.Slot.endTime)}`
        : "",
      totalAmount: parseFloat(billDetails.totalAmount || 0),
      items: (billDetails.OrderItems || []).map(item => ({
        id: item.id,
        name: item.Product?.name || "Product",
        unit: item.Product?.unit || "",
        price: parseFloat(item.price || 0),
        mrp: parseFloat(item.Product?.price || item.price || 0),
        quantity: item.quantity,
      })),
      thankYouMsg: "",
      bringCopyMsg: "",
    };

    const L = isMr ? {
      invoiceNo: "बीजक क्रमांक", dateTime: "दिनांक/वेळ",
      paymentMethod: "पेमेंट पद्धत", paymentStatus: "पेमेंट स्थिती",
      customerDetails: "ग्राहक तपशील", name: "नाव", mobile: "मोबाईल",
      pickupSlot: "पिकअप वेळ", item: "उत्पादन", price: "किंमत",
      qty: "प्रमाण", total: "एकूण", totalItems: "एकूण वस्तू",
      subtotal: "उप-एकूण (M.R.P.)", offerSavings: "ऑफर बचत", grandTotal: "महाएकूण",
      youSavedBanner: "🎉 या ऑर्डरवर तुमची ₹SAVINGS ची बचत झाली!",
      thankYou: data.thankYouMsg || "GrocyGo सोबत खरेदी केल्याबद्दल आभारी आहोत!",
      bringCopy: data.bringCopyMsg || "पिकअप पडताळणीसाठी ही प्रत आणा.",
      tagline: billMeta.tagline || "प्रीमियम ऑनलाइन किराणा दुकान",
    } : {
      invoiceNo: "Invoice No", dateTime: "Date/Time",
      paymentMethod: "Payment Method", paymentStatus: "Payment Status",
      customerDetails: "Customer Details", name: "Name", mobile: "Mobile",
      pickupSlot: "Pickup Slot", item: "Item", price: "Price",
      qty: "Qty", total: "Total", totalItems: "Total Items",
      subtotal: "Subtotal (M.R.P.)", offerSavings: "Offer Savings", grandTotal: "Grand Total",
      youSavedBanner: "🎉 You saved ₹SAVINGS on this order!",
      thankYou: data.thankYouMsg || "Thank you for shopping with GrocyGo!",
      bringCopy: data.bringCopyMsg || "Please bring this copy for slot verification during pickup.",
      tagline: billMeta.tagline || "Premium Online Grocery Store",
    };

    const itemRows = (data.items || []).map((item, idx) => `
      <tr style="font-size: 12px; border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 10px 0; color: #9ca3af; text-align: left;">${idx + 1}</td>
        <td style="padding: 10px 0; font-family: sans-serif; font-weight: 500; color: #111827; text-align: left;">
          <div>
            <span>${item.name || "Product"}</span>
            ${item.mrp && item.mrp > item.price ? `<span style="font-size:10px;color:#6b7280;margin-left:4px;">(MRP: &#8377;${item.mrp.toFixed(2)})</span>` : ""}
          </div>
          <div style="font-size: 10px; color: #9ca3af; font-family: monospace; margin-top: 2px;">${item.unit || ""}</div>
        </td>
        <td style="padding: 10px 0; text-align: right; color: #4b5563;">&#8377;${parseFloat(item.price || 0).toFixed(2)}</td>
        <td style="padding: 10px 0; text-align: center; color: #4b5563;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">&#8377;${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const totalItems = (data.items || []).reduce((s, i) => s + i.quantity, 0);
    const mrpSubtotal = (data.items || []).reduce((s, i) => s + ((i.mrp || i.price) * i.quantity), 0);
    const actualGrandTotal = data.totalAmount && data.totalAmount > 0 ? data.totalAmount : (data.items || []).reduce((s, i) => s + (i.price * i.quantity), 0);
    const offerSavings = Math.max(0, mrpSubtotal - actualGrandTotal);
    const footerHtml = billMeta.footerNote
      ? `<div style="padding-top:12px;border-top:1px dashed #d1d5db;font-size:10px;color:#374151;font-family:sans-serif;white-space:pre-wrap;">${billMeta.footerNote}</div>` : "";

    printWindow.document.write(`
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Invoice - ${billMeta.storeName}</title>
          <style>
            body { font-family: ${isMr ? "'Noto Sans Devanagari', " : ""}monospace; padding: 20px; color: #1f2937; background: #fff; max-width: 450px; margin: 0 auto; }
            .flex { display: flex; } .justify-between { justify-content: space-between; }
            .font-bold { font-weight: bold; } .font-semibold { font-weight: 600; } .font-extrabold { font-weight: 800; }
            .text-xs { font-size: 12px; } .text-base { font-size: 16px; } .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; font-family: sans-serif; font-size: 10px; text-transform: uppercase; color: #6b7280; }
          </style>
        </head>
        <body>
          <div style="text-align:center;border-bottom:1px dashed #d1d5db;padding-bottom:16px;">
            <h2 style="font-size:24px;font-weight:800;margin:0;font-family:sans-serif;color:#111827;">${billMeta.storeName}</h2>
            <p style="font-size:10px;color:#6b7280;margin:4px 0 0;font-family:sans-serif;">${L.tagline}</p>
            <p style="font-size:10px;color:#6b7280;margin:4px 0 0;">Contact: ${billMeta.contact} &bull; ${billMeta.email}</p>
            <p style="font-size:10px;color:#6b7280;margin:2px 0 0;">GSTIN: ${billMeta.gstin}</p>
          </div>
          <div style="padding:16px 0;border-bottom:1px dashed #d1d5db;">
            <div class="flex justify-between text-xs"><span style="color:#6b7280;">${L.invoiceNo}:</span><span class="font-bold">${data.invoiceId}</span></div>
            <div class="flex justify-between text-xs" style="margin-top:4px;"><span style="color:#6b7280;">${L.dateTime}:</span><span>${data.dateTime}</span></div>
            <div class="flex justify-between text-xs" style="margin-top:4px;"><span style="color:#6b7280;">${L.paymentMethod}:</span><span class="font-bold">${data.paymentMethod}</span></div>
            <div class="flex justify-between text-xs" style="margin-top:4px;"><span style="color:#6b7280;">${L.paymentStatus}:</span><span class="font-bold">${data.paymentStatus}</span></div>
          </div>
          <div style="padding:16px 0;border-bottom:1px dashed #d1d5db;">
            <div style="font-weight:bold;font-family:sans-serif;font-size:10px;text-transform:uppercase;color:#111827;padding-bottom:4px;">${L.customerDetails}</div>
            <div class="flex justify-between text-xs"><span style="color:#6b7280;">${L.name}:</span><span class="font-semibold">${data.customerName}</span></div>
            <div class="flex justify-between text-xs" style="margin-top:4px;"><span style="color:#6b7280;">${L.mobile}:</span><span>${data.customerMobile}</span></div>
            ${data.pickupSlotText ? `<div class="flex justify-between text-xs" style="margin-top:6px;padding-top:6px;border-top:1px solid #f3f4f6;"><span style="color:#6b7280;">${L.pickupSlot}:</span><span style="text-align:right;">${data.pickupSlotText}</span></div>` : ""}
          </div>
          <div style="padding:16px 0;">
            <table>
              <thead><tr>
                <th style="text-align:left;width:30px;">#</th>
                <th style="text-align:left;">${L.item}</th>
                <th style="text-align:right;width:70px;">${L.price}</th>
                <th style="text-align:center;width:50px;">${L.qty}</th>
                <th style="text-align:right;width:80px;">${L.total}</th>
              </tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
          </div>
          <div style="padding-top:16px;border-top:1px dashed #d1d5db;">
            <div class="flex justify-between text-xs" style="color:#6b7280;"><span>${L.totalItems}:</span><span style="font-weight:bold;color:#111827;">${totalItems}</span></div>
            <div class="flex justify-between text-xs" style="color:#6b7280;margin-top:4px;"><span>${L.subtotal}:</span><span style="color:#111827;">&#8377;${mrpSubtotal.toFixed(2)}</span></div>
            ${offerSavings > 0 ? `<div class="flex justify-between text-xs font-bold" style="color:#16a34a;margin-top:4px;"><span>${L.offerSavings}:</span><span>-&#8377;${offerSavings.toFixed(2)}</span></div>` : ""}
            <div class="flex justify-between text-base font-extrabold" style="margin-top:8px;border-top:3px double #d1d5db;border-bottom:3px double #d1d5db;padding:8px 0;color:#111827;">
              <span>${L.grandTotal}:</span>
              <span style="color:#15803d;">&#8377;${actualGrandTotal.toFixed(2)}</span>
            </div>
            ${offerSavings > 0 ? `
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px;margin-top:10px;text-align:center;color:#15803d;font-weight:bold;font-size:12px;font-family:sans-serif;">
              ${L.youSavedBanner.replace("SAVINGS", offerSavings.toFixed(2))}
            </div>
            ` : ""}
          </div>
          ${footerHtml}
          <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px dashed #d1d5db;color:#9ca3af;font-size:10px;font-family:sans-serif;">
            <p style="font-weight:bold;color:#4b5563;margin:0;">${L.thankYou}</p>
            <p style="margin:4px 0 0 0;">${L.bringCopy}</p>
          </div>
          <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

      const res = await orderService.updateOrderAdmin(orderDetails.id, payload);
      if (res.success) {
        setOrderDetails(res.data);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderDetails.id
              ? { ...o, totalAmount: res.data.totalAmount, OrderItems: res.data.OrderItems }
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

  // Status Badge Helper
  const getStatusSelectStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200 focus:ring-green-400";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200 focus:ring-red-400";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-400";
    }
  };

  // Payment Status Badge Helper
  const getPaymentSelectStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-300 focus:ring-green-500";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-300 focus:ring-red-500";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 focus:ring-gray-400";
    }
  };

  // Statistics Calculations
  // Filter by selected date (order creation date)
  const dateFilteredOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const createdDate = new Date(order.createdAt).setHours(0,0,0,0);
    let pass = true;
    if (startDate) {
      pass = pass && createdDate >= new Date(startDate).setHours(0,0,0,0);
    }
    if (endDate) {
      pass = pass && createdDate <= new Date(endDate).setHours(23,59,59,999);
    }
    return pass;
  });

  const stats = {
    total: dateFilteredOrders.length,
    pending: dateFilteredOrders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length,
    confirmed: dateFilteredOrders.filter(o => o.status === "CONFIRMED").length,
    completed: dateFilteredOrders.filter(o => o.status === "COMPLETED").length,
    cancelled: dateFilteredOrders.filter(o => o.status === "CANCELLED").length,
    revenue: dateFilteredOrders
      .filter(o => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0)
  };

  // Filters & Search logic
  const filteredOrders = dateFilteredOrders.filter((order) => {
    const matchesTab = activeTab === "ALL" || order.status === activeTab;

    const matchesPayment = paymentFilter === "ALL" || order.paymentStatus === paymentFilter;
    const matchesPaymentMethod = paymentMethodFilter === "ALL" || order.paymentMethod === paymentMethodFilter;

    let matchesDate = true;
    if (dateFilter !== "ALL") {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "TODAY") {
        matchesDate = orderDate >= today;
      } else if (dateFilter === "YESTERDAY") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        matchesDate = orderDate >= yesterday && orderDate < today;
      } else if (dateFilter === "LAST_7_DAYS") {
        const last7 = new Date();
        last7.setDate(last7.getDate() - 7);
        last7.setHours(0, 0, 0, 0);
        matchesDate = orderDate >= last7;
      }
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toString().includes(term) ||
      (order.User?.name || "").toLowerCase().includes(term) ||
      (order.User?.mobile || "").includes(term) ||
      (order.User?.email || "").toLowerCase().includes(term);

    return matchesTab && matchesPayment && matchesPaymentMethod && matchesDate && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-green-700 font-medium">Loading store orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
        <p className="text-gray-500 mt-2 text-base">Monitor customer baskets, coordinate pickups, and update checkout statuses.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
          <AlertTriangle className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-400">Total Orders</p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-400">Pending Orders</p>
            <h3 className="text-3xl font-extrabold text-yellow-600 mt-1">{stats.pending}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-400">Completed Orders</p>
            <h3 className="text-3xl font-extrabold text-green-600 mt-1">{stats.completed}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-400">Cancelled Orders</p>
            <h3 className="text-3xl font-extrabold text-red-600 mt-1">{stats.cancelled}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <Ban size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-400">Paid Revenue</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">₹{stats.revenue.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search bar & Date Filter */}
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-4 max-w-2xl">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, mobile..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowOrderSearchSuggestions(true);
                  setActiveSuggestionIndex(-1);
                }}
                onFocus={() => setShowOrderSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOrderSearchSuggestions(false), 200)}
                onKeyDown={(e) => {
                  const suggestions = orders
                    .filter(o => 
                      o.id.toString().includes(searchTerm) || 
                      (o.User?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.User?.mobile || "").includes(searchTerm)
                    )
                    .slice(0, 5);
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
                      let label = `Order #${selected.id}`;
                      if ((selected.User?.name || "").toLowerCase().includes(searchTerm.toLowerCase())) {
                        label = selected.User.name;
                      } else if ((selected.User?.mobile || "").includes(searchTerm)) {
                        label = selected.User.mobile;
                      }
                      const fillValue = label.startsWith("Order #") ? selected.id.toString() : label;
                      setSearchTerm(fillValue);
                      setShowOrderSearchSuggestions(false);
                    }
                  } else if (e.key === "Escape") {
                    setShowOrderSearchSuggestions(false);
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              />
              {showOrderSearchSuggestions && searchTerm && orders.filter(o => 
                o.id.toString().includes(searchTerm) || 
                (o.User?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (o.User?.mobile || "").includes(searchTerm)
              ).length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50 max-h-56">
                  {orders
                    .filter(o => 
                      o.id.toString().includes(searchTerm) || 
                      (o.User?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.User?.mobile || "").includes(searchTerm)
                    )
                    .slice(0, 5)
                    .map((order, idx) => {
                      let label = `Order #${order.id}`;
                      let subLabel = order.User?.name || "Unknown Customer";
                      if ((order.User?.name || "").toLowerCase().includes(searchTerm.toLowerCase())) {
                        label = order.User.name;
                        subLabel = `Order #${order.id} • ${order.User.mobile || ""}`;
                      } else if ((order.User?.mobile || "").includes(searchTerm)) {
                        label = order.User.mobile;
                        subLabel = `Order #${order.id} • ${order.User.name}`;
                      }

                      const fillValue = label.startsWith("Order #") ? order.id.toString() : label;

                      return (
                        <button
                          key={order.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchTerm(fillValue);
                            setShowOrderSearchSuggestions(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition flex items-center justify-between text-gray-700 font-medium ${
                            idx === activeSuggestionIndex ? "bg-green-100 text-green-950 font-semibold" : "hover:bg-green-50/50"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{label}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{subLabel}</span>
                          </div>
                          <span className="text-green-700 font-bold text-[10px]">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition cursor-pointer"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2.5 rounded-2xl font-bold transition flex items-center gap-1"
                  title="Clear Dates"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition ${activeTab === tab
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition text-gray-700 cursor-pointer animate-none"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition text-gray-700 cursor-pointer animate-none"
            >
              <option value="ALL">All Methods</option>
              <option value="ONLINE">Online</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition text-gray-700 cursor-pointer animate-none"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm text-left text-gray-500 min-w-[900px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-700 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4">Order ID</th>
                <th scope="col" className="px-6 py-4">Date</th>
                <th scope="col" className="px-6 py-4">Customer</th>
                <th scope="col" className="px-6 py-4">Amount</th>
                <th scope="col" className="px-6 py-4 text-center">Order Status</th>
                <th scope="col" className="px-6 py-4 text-center">Payment Method</th>
                <th scope="col" className="px-6 py-4 text-center">Payment Status</th>
                <th scope="col" className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        {order.Slot && (
                          <span className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                            <Clock size={12} /> {new Date(order.Slot.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} | {formatTime12h(order.Slot.startTime)} - {formatTime12h(order.Slot.endTime)}
                          </span>
                        )}
                        {!order.Slot && (
                          <span className="text-[10px] text-red-500 font-semibold italic">No Slot Selected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <p className="font-semibold">{order.User?.name || "Unknown User"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.User?.mobile || "No Mobile"}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700 whitespace-nowrap">
                      ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={statusUpdateLoading[order.id] || order.status === "CANCELLED" || order.status === "COMPLETED"}
                        className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition ${getStatusSelectStyle(
                          order.status
                        )}`}
                      >
                        <option value="PENDING" disabled={order.status === "COMPLETED"}>PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        {order.status === "CANCELLED" && (
                          <option value="CANCELLED">CANCELLED</option>
                        )}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={order.paymentMethod || "CASH"}
                        onChange={(e) => handlePaymentMethodChange(order.id, e.target.value)}
                        disabled={statusUpdateLoading[`meth-${order.id}`] || order.status === "COMPLETED" || order.status === "CANCELLED"}
                        className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition ${order.paymentMethod === 'ONLINE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                      >
                        <option value="CASH">CASH</option>
                        <option value="ONLINE">ONLINE</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        disabled={statusUpdateLoading[`pay-${order.id}`] || order.status === "COMPLETED" || order.status === "CANCELLED"}
                        className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition ${getPaymentSelectStyle(
                          order.paymentStatus
                        )}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-gray-200"
                        >
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={() => setShowBillOrderId(order.id)}
                          className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-green-200"
                        >
                          <Receipt size={14} /> Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-white border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Order Details #{selectedOrderId}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Line items, Customer contact, and Status update actions</p>
              </div>
              <button
                onClick={() => { setSelectedOrderId(null); setIsEditingItems(false); }}
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
                  <p className="text-green-700 font-medium text-sm">Fetching items...</p>
                </div>
              )}

              {detailsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>{detailsError}</span>
                </div>
              )}

              {orderDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Items */}
                  <div className="md:col-span-2 space-y-4">
                    {!isEditingItems ? (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-green-600" />
                            Items Summary ({orderDetails.OrderItems?.length || 0})
                          </h4>
                          {orderDetails.status !== "COMPLETED" && orderDetails.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={startEditing}
                              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-bold border border-green-200 transition"
                            >
                              Edit Items
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

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                          <span className="font-bold text-gray-700">Total Bill:</span>
                          <span className="text-xl font-extrabold text-green-700">₹{parseFloat(orderDetails.totalAmount || 0).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          <ShoppingBag size={18} className="text-green-600" />
                          Edit Items ({editItemsState.length})
                        </h4>
                        <div className="space-y-3">
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
                                  {item.Product?.name || "Product Unavailable"}
                                </h5>
                                <p className="text-xs text-gray-400">{item.Product?.unit || ""}</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">₹{parseFloat(item.price || 0).toFixed(2)} each</p>
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
                        <div className="relative border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Add product to order</label>
                          <input
                            type="text"
                            placeholder="Search product to add..."
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
                                <div className="p-3 text-xs text-gray-400 text-center italic">No in-stock products match search</div>
                              )}
                            </div>
                          )}
                        </div>

                        {editItemsError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                            {editItemsError}
                          </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                          <span className="font-bold text-gray-700">Estimated Total:</span>
                          <span className="text-xl font-extrabold text-green-700">₹{editItemsState.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.quantity, 0).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-3 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingItems(false)}
                            className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEditedItems}
                            disabled={editItemsSaving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            {editItemsSaving ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : null}
                            Save Changes
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Customer & Status */}
                  <div className="space-y-6">
                    {/* Customer details card */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
                        <User size={16} className="text-green-600" />
                        Customer Contact
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase">Name</p>
                          <p className="font-bold text-gray-800 mt-0.5">{orderDetails.User?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase">Mobile</p>
                          <p className="font-medium text-gray-700 mt-0.5 flex items-center gap-1.5">
                            <Phone size={13} className="text-gray-400" />
                            {orderDetails.User?.mobile || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Slot card */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
                        <Calendar size={16} className="text-green-600" />
                        Selected Pickup Slot
                      </h4>
                      {orderDetails.Slot ? (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Date</p>
                            <p className="font-bold text-gray-800 mt-0.5">
                              {new Date(orderDetails.Slot.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Time Range</p>
                            <p className="font-medium text-gray-800 mt-0.5">
                              {formatTime12h(orderDetails.Slot.startTime)} - {formatTime12h(orderDetails.Slot.endTime)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-red-500 font-semibold italic">No Slot selected</p>
                      )}
                    </div>

                    {/* Quick status updates */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard size={16} className="text-green-600" />
                        Update Status
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-400 block mb-1">Order Status</label>
                          <select
                            value={orderDetails.status}
                            onChange={(e) => handleStatusChange(orderDetails.id, e.target.value)}
                            disabled={statusUpdateLoading[orderDetails.id] || orderDetails.status === "CANCELLED" || orderDetails.status === "COMPLETED"}
                            className={`w-full text-sm font-bold rounded-xl p-2.5 border outline-none cursor-pointer focus:ring-2 transition ${getStatusSelectStyle(
                              orderDetails.status
                            )}`}
                          >
                            <option value="PENDING" disabled={orderDetails.status === "COMPLETED"}>PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            {orderDetails.status === "CANCELLED" && (
                              <option value="CANCELLED">CANCELLED</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-400 block mb-1">Payment Status</label>
                          <select
                            value={orderDetails.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(orderDetails.id, e.target.value)}
                            disabled={statusUpdateLoading[`pay-${orderDetails.id}`] || orderDetails.status === "COMPLETED" || orderDetails.status === "CANCELLED"}
                            className={`w-full text-sm font-bold rounded-xl p-2.5 border outline-none cursor-pointer focus:ring-2 transition ${getPaymentSelectStyle(
                              orderDetails.paymentStatus
                            )}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {orderDetails && (
                <button
                  onClick={() => setShowBillOrderId(orderDetails.id)}
                  className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition animate-none"
                >
                  <Receipt size={14} /> Print Bill
                </button>
              )}
              <button
                onClick={() => { setSelectedOrderId(null); setIsEditingItems(false); }}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Preview & Print Modal */}
      {showBillOrderId && (() => {
        const isMr = billLang === "mr";
        const L = isMr ? {
          invoiceNo: "बीजक क्रमांक", dateTime: "दिनांक/वेळ",
          paymentMethod: "पेमेंट पद्धत", paymentStatus: "पेमेंट स्थिती",
          customerDetails: "ग्राहक तपशील", name: "नाव", mobile: "मोबाईल",
          pickupSlot: "पिकअप वेळ", item: "उत्पादन", price: "किंमत",
          qty: "प्रमाण", total: "एकूण", totalItems: "एकूण वस्तू",
          subtotal: "उप-एकूण (M.R.P.)", offerSavings: "ऑफर बचत", grandTotal: "महाएकूण",
          youSavedBanner: "🎉 या ऑर्डरवर तुमची ₹SAVINGS ची बचत झाली!",
          thankYou: "GrocyGo सोबत खरेदी केल्याबद्दल आभारी आहोत!",
          bringCopy: "पिकअप पडताळणीसाठी ही प्रत आणा.",
          tagline: billMeta.tagline || "प्रीमियम ऑनलाइन किराणा दुकान",
          printBtn: "बिल प्रिंट करा",
        } : {
          invoiceNo: "Invoice No", dateTime: "Date/Time",
          paymentMethod: "Payment Method", paymentStatus: "Payment Status",
          customerDetails: "Customer Details", name: "Name", mobile: "Mobile",
          pickupSlot: "Pickup Slot", item: "Item", price: "Price",
          qty: "Qty", total: "Total", totalItems: "Total Items",
          subtotal: "Subtotal (M.R.P.)", offerSavings: "Offer Savings", grandTotal: "Grand Total",
          youSavedBanner: "🎉 You saved ₹SAVINGS on this order!",
          thankYou: "Thank you for shopping with GrocyGo!",
          bringCopy: "Please bring this copy for slot verification during pickup.",
          tagline: billMeta.tagline || "Premium Online Grocery Store",
          printBtn: "Print Bill",
        };
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn no-print">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-scaleUp">

              {/* Modal Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between no-print flex-wrap gap-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Generate Bill</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Preview and print checkout invoice</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Language Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                    <button onClick={() => setBillLang("mr")} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${billLang === "mr" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:bg-gray-200"}`}>मराठी</button>
                    <button onClick={() => setBillLang("en")} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${billLang === "en" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:bg-gray-200"}`}>English</button>
                  </div>
                  {/* Edit Bill Toggle */}
                  <button
                    onClick={() => setIsEditingBill(prev => !prev)}
                    className={`p-2 rounded-xl transition text-xs font-bold flex items-center gap-1 border ${isEditingBill ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  >
                    <Info size={14} /> {isEditingBill ? "Hide Edit" : "Edit Bill"}
                  </button>
                  <button onClick={() => { setShowBillOrderId(null); setIsEditingBill(false); }} className="p-1.5 rounded-xl hover:bg-gray-200 transition text-gray-500">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Edit Panel */}
              {isEditingBill && (
                <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/60 no-print grid grid-cols-2 gap-3">
                  <div className="col-span-2"><p className="text-xs font-bold text-amber-700 uppercase tracking-wider">✏️ Edit Bill Information</p></div>
                  {[
                    { label: "Store Name", key: "storeName" },
                    { label: isMr ? "Tagline (मराठी optional)" : "Tagline", key: "tagline" },
                    { label: "Contact No.", key: "contact" },
                    { label: "Email", key: "email" },
                    { label: "GSTIN", key: "gstin" },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                      <input type="text" value={billMeta[key]} onChange={e => setBillMeta(p => ({ ...p, [key]: e.target.value }))}
                        className="border border-amber-200 bg-white rounded-xl px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition" />
                    </div>
                  ))}
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Footer Note (optional)</label>
                    <textarea rows={2} value={billMeta.footerNote} onChange={e => setBillMeta(p => ({ ...p, footerNote: e.target.value }))}
                      placeholder="e.g. terms & conditions, custom message..."
                      className="border border-amber-200 bg-white rounded-xl px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition resize-none" />
                  </div>
                </div>
              )}

              {/* Preview Area */}
              <div className="p-8 overflow-y-auto flex-1 bg-gray-100/50 flex justify-center items-start">
                {billLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-green-700 font-medium text-sm">Preparing invoice...</p>
                  </div>
                )}
                {billError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2 w-full max-w-md">
                    <AlertTriangle size={18} className="shrink-0" /><span>{billError}</span>
                  </div>
                )}
                {billEditData && (
                  <div id="printable-bill" className="bg-white shadow-lg border border-gray-200 p-8 w-full max-w-lg rounded-2xl font-mono text-xs text-gray-800 h-fit">
                    {/* Store Header */}
                    <div className="text-center space-y-1.5 pb-6 border-b border-dashed border-gray-300">
                      <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 font-sans">{billMeta.storeName}</h2>
                      <p className="text-[10px] text-gray-500 font-sans">{L.tagline}</p>
                      <p className="text-[10px] text-gray-500">Contact: {billMeta.contact} • {billMeta.email}</p>
                      <p className="text-[10px] text-gray-500">GSTIN: {billMeta.gstin}</p>
                    </div>
                    {/* Invoice Meta */}
                    <div className="py-4 border-b border-dashed border-gray-300 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.invoiceNo}:</span>
                        <input
                          type="text"
                          value={billEditData.invoiceId}
                          onChange={e => updBill("invoiceId", e.target.value)}
                          className="text-right font-bold bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.dateTime}:</span>
                        <input
                          type="text"
                          value={billEditData.dateTime}
                          onChange={e => updBill("dateTime", e.target.value)}
                          className="text-right bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.paymentMethod}:</span>
                        <select
                          value={billEditData.paymentMethod}
                          onChange={e => updBill("paymentMethod", e.target.value)}
                          className="text-right font-bold bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2 cursor-pointer appearance-none"
                        >
                          <option value="CASH">CASH</option>
                          <option value="ONLINE">ONLINE</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.paymentStatus}:</span>
                        <select
                          value={billEditData.paymentStatus}
                          onChange={e => updBill("paymentStatus", e.target.value)}
                          className="text-right font-bold bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2 cursor-pointer appearance-none"
                        >
                          <option value="PAID">PAID</option>
                          <option value="PENDING">PENDING</option>
                          <option value="FAILED">FAILED</option>
                        </select>
                      </div>
                    </div>
                    {/* Customer */}
                    <div className="py-4 border-b border-dashed border-gray-300 space-y-2">
                      <div className="font-bold font-sans text-gray-900 uppercase tracking-wider text-[10px] pb-1">{L.customerDetails}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.name}:</span>
                        <input
                          type="text"
                          value={billEditData.customerName}
                          onChange={e => updBill("customerName", e.target.value)}
                          className="text-right font-semibold bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.mobile}:</span>
                        <input
                          type="text"
                          value={billEditData.customerMobile}
                          onChange={e => updBill("customerMobile", e.target.value)}
                          className="text-right bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-sans">{L.pickupSlot}:</span>
                        <input
                          type="text"
                          value={billEditData.pickupSlotText}
                          onChange={e => updBill("pickupSlotText", e.target.value)}
                          className="text-right bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition w-1/2 text-xs"
                        />
                      </div>
                    </div>
                    {/* Items */}
                    <div className="py-4">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500 font-sans uppercase text-[10px]">
                            <th className="pb-2 w-8">#</th>
                            <th className="pb-2">{L.item}</th>
                            <th className="pb-2 text-right w-16">{L.price}</th>
                            <th className="pb-2 text-center w-12">{L.qty}</th>
                            <th className="pb-2 text-right w-20">{L.total}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {billEditData.items?.map((item, idx) => (
                            <tr key={item.id} className="text-xs">
                              <td className="py-2.5 text-gray-400 align-top pt-3">{idx + 1}</td>
                              <td className="py-2 pr-2 font-sans font-medium text-gray-900">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={e => updBillItem(idx, "name", e.target.value)}
                                    className="bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none font-semibold text-gray-900 transition w-auto min-w-[60px]"
                                  />
                                  {item.mrp && parseFloat(item.mrp) > parseFloat(item.price || 0) && (
                                    <span className="text-[10px] text-gray-500 font-normal shrink-0">
                                      (MRP: ₹{parseFloat(item.mrp).toFixed(2)})
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Unit"
                                  value={item.unit}
                                  onChange={e => updBillItem(idx, "unit", e.target.value)}
                                  className="w-full bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none text-[10px] text-gray-400 font-mono mt-0.5 transition"
                                />
                              </td>
                              <td className="py-2 text-right font-mono text-gray-600 align-top pt-2.5">
                                <div className="inline-flex items-center justify-end">
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.price}
                                    onChange={e => updBillItem(idx, "price", e.target.value)}
                                    className="w-14 bg-transparent text-left border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-0.5 py-0.5 outline-none transition"
                                  />
                                </div>
                              </td>
                              <td className="py-2 text-center font-mono text-gray-600 align-top pt-2.5">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={e => updBillItem(idx, "quantity", e.target.value)}
                                  className="w-10 bg-transparent text-center border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none transition"
                                />
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-gray-900 align-top pt-2.5 pr-1">
                                <div className="flex items-center justify-end gap-1">
                                  <span>₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                                  <button
                                    onClick={() => removeBillItem(idx)}
                                    className="text-red-500 hover:text-red-700 p-0.5 hover:bg-red-50 rounded transition no-print shrink-0"
                                    title="Remove Item"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-start mt-3 no-print">
                        <button
                          onClick={addBillItem}
                          className="text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1 shadow-sm"
                        >
                          + Add Item
                        </button>
                      </div>
                    </div>
                    {/* Summary */}
                    {(() => {
                      const totalItems = billEditData.items?.reduce((s, i) => s + (parseInt(i.quantity, 10) || 0), 0) || 0;
                      const mrpSubtotal = billEditData.items?.reduce((s, i) => s + ((parseFloat(i.mrp || i.price || 0)) * (parseInt(i.quantity, 10) || 0)), 0) || 0;
                      const actualGrandTotal = parseFloat(billEditData.totalAmount || 0) > 0 ? parseFloat(billEditData.totalAmount) : (billEditData.items?.reduce((s, i) => s + (parseFloat(i.price || 0) * (parseInt(i.quantity, 10) || 0)), 0) || 0);
                      const offerSavings = Math.max(0, mrpSubtotal - actualGrandTotal);
                      return (
                        <div className="pt-4 border-t border-dashed border-gray-300 space-y-2 font-sans">
                          <div className="flex justify-between text-gray-500"><span>{L.totalItems}:</span><span className="font-mono text-gray-800 font-semibold">{totalItems}</span></div>
                          <div className="flex justify-between text-gray-500"><span>{L.subtotal}:</span><span className="font-mono text-gray-800">₹{mrpSubtotal.toFixed(2)}</span></div>
                          {offerSavings > 0 && (
                            <div className="flex justify-between font-bold text-green-600"><span>{L.offerSavings}:</span><span className="font-mono">-₹{offerSavings.toFixed(2)}</span></div>
                          )}
                          <div className="flex justify-between text-base font-extrabold text-gray-950 pt-2 border-t border-double border-gray-300">
                            <span>{L.grandTotal}:</span>
                            <span className="font-mono text-green-700">₹{actualGrandTotal.toFixed(2)}</span>
                          </div>
                          {offerSavings > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mt-2 text-center text-green-800 font-bold text-xs">
                              {L.youSavedBanner.replace("SAVINGS", offerSavings.toFixed(2))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {/* Custom Footer Note */}
                    {billMeta.footerNote && (
                      <div className="pt-4 border-t border-dashed border-gray-300 text-xs text-gray-700 font-sans whitespace-pre-wrap">{billMeta.footerNote}</div>
                    )}
                    {/* Thank you */}
                    <div className="text-center font-sans space-y-1.5 pt-8 border-t border-dashed border-gray-300 text-gray-400 text-[10px]">
                      <input
                        type="text"
                        placeholder={L.thankYou}
                        value={billEditData.thankYouMsg}
                        onChange={e => updBill("thankYouMsg", e.target.value)}
                        className="w-full bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none font-bold text-gray-600 text-center transition"
                      />
                      <input
                        type="text"
                        placeholder={L.bringCopy}
                        value={billEditData.bringCopyMsg}
                        onChange={e => updBill("bringCopyMsg", e.target.value)}
                        className="w-full bg-transparent border-b border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 outline-none text-gray-500 text-center transition mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 no-print">
                <button onClick={() => { setShowBillOrderId(null); setIsEditingBill(false); }} className="px-5 py-2.5 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition">Close</button>
                {billDetails && (
                  <button onClick={() => handlePrint(billDetails, billLang)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
                    <Receipt size={14} /> {L.printBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default AdminOrders;
