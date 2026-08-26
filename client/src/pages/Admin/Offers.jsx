import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaGift, FaFolder, FaShoppingBag, FaCalendarAlt, FaToggleOn, FaToggleOff, FaCloud, FaImage } from "react-icons/fa";
import * as offerService from "../../services/offerService";
import * as productService from "../../services/productService";
import API from "../../services/api";
import CloudinaryGalleryModal from "../../components/Admin/CloudinaryGalleryModal";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/ConfirmModal";

function AdminOffers() {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Confirm Modal state
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, offerId: null });

  // Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isAssignProdModalOpen, setIsAssignProdModalOpen] = useState(false);
  const [isAssignCatModalOpen, setIsAssignCatModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Selected for associations
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Form State
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offerType, setOfferType] = useState("PERCENTAGE_DISCOUNT");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumPurchase, setMinimumPurchase] = useState("0");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [freeQuantity, setFreeQuantity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("0");
  const [bannerImage, setBannerImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Assign Product/Category States
  const [assignedProductIds, setAssignedProductIds] = useState([]);
  const [assignedCategoryIds, setAssignedCategoryIds] = useState([]);
  const [prodSearchTerm, setProdSearchTerm] = useState("");

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await offerService.getAllOffersAdmin();
      if (res.success) {
        setOffers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsAndCategories = async () => {
    try {
      const prodRes = await productService.getAllProducts({ limit: 1000 });
      if (prodRes.success) {
        setProducts(prodRes.data?.products || []);
      }
      const catRes = await API.get("/categories");
      if (catRes.data?.success) {
        setCategories(catRes.data?.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchProductsAndCategories();
  }, []);

  const openCreateModal = () => {
    setEditingOfferId(null);
    setTitle("");
    setDescription("");
    setOfferType("PERCENTAGE_DISCOUNT");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinimumPurchase("0");
    setBuyQuantity("");
    setFreeQuantity("");
    
    // Set default dates
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7); // Default 1 week
    
    setStartDate(start.toISOString().split("T")[0] + "T00:00");
    setEndDate(end.toISOString().split("T")[0] + "T23:59");
    
    setPriority("0");
    setBannerImage("");
    setIsActive(true);
    setIsOfferModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOfferId(offer.id);
    setTitle(offer.title);
    setDescription(offer.description || "");
    setOfferType(offer.offerType);
    setDiscountType(offer.discountType);
    setDiscountValue(offer.discountValue || "");
    setMinimumPurchase(offer.minimumPurchase || "0");
    setBuyQuantity(offer.buyQuantity || "");
    setFreeQuantity(offer.freeQuantity || "");
    
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    
    setStartDate(new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setEndDate(new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    
    setPriority(offer.priority.toString());
    setBannerImage(offer.bannerImage || "");
    setIsActive(offer.isActive);
    setIsOfferModalOpen(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Offer Title is required");
      return;
    }

    if (!startDate || !endDate) {
      toast.warning("Start Date and End Date are required");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.warning("End Date must be strictly after Start Date");
      return;
    }

    if (discountType === "PERCENTAGE" && (parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100)) {
      toast.warning("Percentage discount value must be between 1% and 100%");
      return;
    }

    const payload = {
      title,
      description: description || null,
      offerType,
      discountType,
      discountValue: discountValue ? parseFloat(discountValue) : null,
      minimumPurchase: parseFloat(minimumPurchase) || 0,
      buyQuantity: buyQuantity ? parseInt(buyQuantity, 10) : null,
      freeQuantity: freeQuantity ? parseInt(freeQuantity, 10) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority: parseInt(priority, 10) || 0,
      bannerImage: bannerImage || null,
      isActive,
    };

    try {
      if (editingOfferId) {
        const res = await offerService.updateOffer(editingOfferId, payload);
        if (res.success) {
          toast.success("Offer updated successfully!");
        }
      } else {
        const res = await offerService.createOffer(payload);
        if (res.success) {
          toast.success("Offer created successfully!");
        }
      }
      setIsOfferModalOpen(false);
      fetchOffers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save offer");
    }
  };

  const handleDeleteOfferPrompt = (id) => {
    setDeleteConfirm({ isOpen: true, offerId: id });
  };

  const handleDeleteOfferConfirm = async () => {
    const id = deleteConfirm.offerId;
    setDeleteConfirm({ isOpen: false, offerId: null });
    if (!id) return;

    try {
      const res = await offerService.deleteOffer(id);
      if (res.success) {
        toast.success("Offer deleted successfully");
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete offer");
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      const res = await offerService.updateOffer(offer.id, {
        ...offer,
        isActive: !offer.isActive,
      });
      if (res.success) {
        toast.success(`Offer status changed to ${!offer.isActive ? "Active" : "Inactive"}`);
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, isActive: !offer.isActive } : o))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle status");
    }
  };

  const openAssignProducts = (offer) => {
    setSelectedOffer(offer);
    const assignedIds = offer.Products?.map((p) => p.id) || [];
    setAssignedProductIds(assignedIds);
    setProdSearchTerm("");
    setIsAssignProdModalOpen(true);
  };

  const handleSaveProducts = async () => {
    try {
      const res = await offerService.assignProductsToOffer(selectedOffer.id, assignedProductIds);
      if (res.success) {
        toast.success("Products mapped successfully!");
        setIsAssignProdModalOpen(false);
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign products");
    }
  };

  const openAssignCategories = (offer) => {
    setSelectedOffer(offer);
    const assignedIds = offer.Categories?.map((c) => c.id) || [];
    setAssignedCategoryIds(assignedIds);
    setIsAssignCatModalOpen(true);
  };

  const handleSaveCategories = async () => {
    try {
      const res = await offerService.assignCategoriesToOffer(selectedOffer.id, assignedCategoryIds);
      if (res.success) {
        toast.success("Categories mapped successfully!");
        setIsAssignCatModalOpen(false);
        fetchOffers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign categories");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name_en.toLowerCase().includes(prodSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Offer Management</h1>
          <p className="text-gray-500 mt-2">Create discount codes, flash sales, buy X get Y promotions, and banners.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-md transition"
        >
          <FaPlus /> Create Offer
        </button>
      </div>

      {/* Offers Listing */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          Loading promotions catalog...
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          No offers found. Click "Create Offer" to launch a campaign.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-4 pl-6">Campaign Info</th>
                <th>Type</th>
                <th>Discount Details</th>
                <th>Duration</th>
                <th className="text-center">Priority</th>
                <th className="text-center">Status</th>
                <th className="text-center">Mappings</th>
                <th className="text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {offers.map((offer) => {
                const startStr = new Date(offer.startDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });
                const endStr = new Date(offer.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={offer.id} className="hover:bg-gray-55/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {offer.bannerImage ? (
                          <img src={offer.bannerImage} className="w-16 h-10 object-cover rounded-lg border shadow-sm" alt="" />
                        ) : (
                          <div className="w-16 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <FaGift size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 leading-tight">{offer.title}</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">{offer.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-gray-600">{offer.offerType.replace("_", " ")}</td>
                    <td className="text-gray-700">
                      {offer.offerType === "BUY_X_GET_Y" ? (
                        <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-bold">
                          Buy {offer.buyQuantity} Get {offer.freeQuantity} Free
                        </span>
                      ) : (
                        <span className="font-bold text-green-700">
                          {offer.discountType === "PERCENTAGE" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                        </span>
                      )}
                      {parseFloat(offer.minimumPurchase) > 0 && (
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">Min. order ₹{offer.minimumPurchase}</p>
                      )}
                    </td>
                    <td className="text-xs text-gray-500">
                      <p className="font-semibold text-gray-700">{startStr} - {endStr}</p>
                    </td>
                    <td className="text-center font-bold text-gray-700">{offer.priority}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleStatus(offer)}
                        className={`text-2xl outline-none focus:outline-none transition ${
                          offer.isActive ? "text-green-600" : "text-gray-300"
                        }`}
                      >
                        {offer.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col gap-1.5 justify-center items-center">
                        <button
                          onClick={() => openAssignProducts(offer)}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                        >
                          <FaShoppingBag size={10} /> Products ({offer.Products?.length || 0})
                        </button>
                        <button
                          onClick={() => openAssignCategories(offer)}
                          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                        >
                          <FaFolder size={10} /> Categories ({offer.Categories?.length || 0})
                        </button>
                      </div>
                    </td>
                    <td className="text-center pr-6">
                      <div className="flex items-center justify-center gap-3.5">
                        <button
                          onClick={() => openEditModal(offer)}
                          className="text-blue-600 hover:text-blue-800 text-lg transition"
                          title="Edit Offer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteOfferPrompt(offer.id)}
                          className="text-red-500 hover:text-red-700 text-lg transition"
                          title="Delete Offer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Offer Form Modal (Create / Edit) */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">{editingOfferId ? "Edit Offer Campaign" : "New Offer Campaign"}</h2>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-gray-400 hover:text-red-500 font-bold"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="p-6 space-y-4">
              <div>
                <label className="font-semibold text-sm text-gray-700">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Festival Dhamaka 20% OFF"
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-sm text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details about this offer..."
                  className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-sm text-gray-700">Offer Type *</label>
                  <select
                    value={offerType}
                    onChange={(e) => {
                      setOfferType(e.target.value);
                      if (e.target.value === "BUY_X_GET_Y") {
                        setDiscountType("FREE_QTY");
                      } else if (e.target.value === "PERCENTAGE_DISCOUNT") {
                        setDiscountType("PERCENTAGE");
                      } else if (e.target.value === "FIXED_DISCOUNT") {
                        setDiscountType("FIXED");
                      }
                    }}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="PERCENTAGE_DISCOUNT">Percentage Discount</option>
                    <option value="FIXED_DISCOUNT">Fixed Discount</option>
                    <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-sm text-gray-700">Discount Type *</label>
                  <select
                    value={discountType}
                    disabled={offerType === "PERCENTAGE_DISCOUNT" || offerType === "FIXED_DISCOUNT" || offerType === "BUY_X_GET_Y"}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Flat Fixed</option>
                    <option value="FREE_QTY">Free Quantity</option>
                  </select>
                </div>
              </div>

              {discountType !== "FREE_QTY" && discountType !== "NONE" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-sm text-gray-700">
                      Discount Value ({discountType === "PERCENTAGE" ? "%" : "₹"}) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-sm text-gray-700">Min Purchase (₹)</label>
                    <input
                      type="number"
                      value={minimumPurchase}
                      onChange={(e) => setMinimumPurchase(e.target.value)}
                      className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {(discountType === "FREE_QTY" || offerType === "BUY_X_GET_Y") && (
                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 border border-orange-100 rounded-2xl">
                  <div>
                    <label className="font-semibold text-sm text-gray-700">Buy Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-sm text-gray-700">Free Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={freeQuantity}
                      onChange={(e) => setFreeQuantity(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-sm text-gray-700">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sm text-gray-700">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-sm text-gray-700">Priority Score</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="Higher wins"
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-sm text-gray-700">Offer Poster / Banner Image</label>
                  {bannerImage && (
                    <button
                      type="button"
                      onClick={() => setBannerImage("")}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="Paste Image URL or select poster from gallery..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition text-sm shrink-0 shadow-sm"
                  >
                    <FaCloud className="text-green-600" /> Select / Upload Poster
                  </button>
                </div>

                {bannerImage ? (
                  <div className="mt-3 relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group shadow-sm">
                    <img
                      src={bannerImage}
                      alt="Offer Poster Preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x200?text=Invalid+Image+URL";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      Poster Preview
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Upload or pick a landscape poster image for Amazon/Flipkart style display on user landing page.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="offer-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="offer-active" className="font-semibold text-sm text-gray-700 cursor-pointer">
                  Activate Offer Campaign immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-250 text-gray-500 font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  {editingOfferId ? "Update Campaign" : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Products Modal */}
      {isAssignProdModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Assign Products</h2>
                <p className="text-xs text-gray-400 mt-1">Select products for: "{selectedOffer.title}"</p>
              </div>
              <button
                onClick={() => setIsAssignProdModalOpen(false)}
                className="text-gray-400 hover:text-red-500 font-bold"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                value={prodSearchTerm}
                onChange={(e) => setProdSearchTerm(e.target.value)}
                placeholder="Search products by English name..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />

              <div className="border rounded-2xl max-h-60 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
                {filteredProducts.map((product) => {
                  const isChecked = assignedProductIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => {
                        if (isChecked) {
                          setAssignedProductIds(assignedProductIds.filter((id) => id !== product.id));
                        } else {
                          setAssignedProductIds([...assignedProductIds, product.id]);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        {product.image && (
                          <img src={product.image} className="w-8 h-8 object-cover rounded" alt="" />
                        )}
                        <div>
                          <p className="text-gray-700 font-bold">{product.name_en}</p>
                          <p className="text-[10px] text-gray-400">₹{parseFloat(product.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition ${
                        isChecked ? "bg-green-600 border-green-600 text-white" : "border-gray-300 text-transparent"
                      }`}>
                        <FaCheck size={8} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsAssignProdModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-250 text-gray-500 font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProducts}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  Save Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Categories Modal */}
      {isAssignCatModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Assign Categories</h2>
                <p className="text-xs text-gray-400 mt-1">Select categories for: "{selectedOffer.title}"</p>
              </div>
              <button
                onClick={() => setIsAssignCatModalOpen(false)}
                className="text-gray-400 hover:text-red-500 font-bold"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border rounded-2xl max-h-60 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
                {categories.map((cat) => {
                  const isChecked = assignedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (isChecked) {
                          setAssignedCategoryIds(assignedCategoryIds.filter((id) => id !== cat.id));
                        } else {
                          setAssignedCategoryIds([...assignedCategoryIds, cat.id]);
                        }
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-green-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {cat.image && !cat.image.startsWith("http") ? (
                          <span className="text-lg">{cat.image}</span>
                        ) : cat.image ? (
                          <img src={cat.image} className="w-8 h-8 object-cover rounded-full" alt="" />
                        ) : (
                          <span>📦</span>
                        )}
                        <span className="text-gray-700 font-bold pl-1">{cat.name_en}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition ${
                        isChecked ? "bg-green-600 border-green-600 text-white" : "border-gray-300 text-transparent"
                      }`}>
                        <FaCheck size={8} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsAssignCatModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-250 text-gray-500 font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategories}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  Save Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloudinary Image Gallery Modal */}
      <CloudinaryGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={(url) => {
          setBannerImage(url);
          setIsGalleryOpen(false);
        }}
        initialTab="products"
      />

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Offer"
        message="Are you sure you want to permanently delete this offer? This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteOfferConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, offerId: null })}
      />
    </div>
  );
}

export default AdminOffers;
