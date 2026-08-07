import { useState, useEffect } from "react";
import { FaTimes, FaCloud } from "react-icons/fa";
import API from "../../services/api";
import CloudinaryGalleryModal from "./CloudinaryGalleryModal";

const UNIT_OPTIONS = [
  "1kg",
  "500g",
  "250g",
  "200g",
  "150g",
  "100g",
  "50g",
  "10g",
  "1L",
  "750ml",
  "500ml",
  "250ml",
  "1 pc",
  "2 pcs",
  "4 pcs",
  "6 pcs",
  "12 pcs",
  "Pack",
  "Tray",
  "Other"
];

function EditProductModal({ isOpen, onClose, product, onRefresh, categories }) {
  const [nameEn, setNameEn] = useState("");
  const [nameMr, setNameMr] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionMr, setDescriptionMr] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cloudinaryProducts, setCloudinaryProducts] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadCloudinary = async () => {
        try {
          const res = await API.get("/cloudinary/images");
          if (res.data.success) {
            setCloudinaryProducts(res.data.data.products);
          }
        } catch (err) {
          console.error("Failed to load Cloudinary product images", err);
        }
      };
      loadCloudinary();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setNameEn(product.name_en || "");
      setNameMr(product.name_mr || "");
      setPurchasePrice(product.purchasePrice || "");
      setPrice(product.price || "");
      setStock(product.stock || "0");
      
      const existingUnit = product.unit || "";
      if (UNIT_OPTIONS.includes(existingUnit)) {
        setUnit(existingUnit);
        setCustomUnit("");
      } else {
        setUnit("Other");
        setCustomUnit(existingUnit);
      }

      setCategoryId(product.categoryId || "");
      setDescriptionEn(product.description_en || "");
      setDescriptionMr(product.description_mr || "");
      setImage(product.image || "");
      setIsActive(product.isActive !== false);

      if (product.ProductKeywords) {
        setKeywords(product.ProductKeywords.map(k => k.keyword));
      } else {
        setKeywords([]);
      }
      setKeywordInput("");

      setTimeout(() => setHasLoaded(true), 100);
    } else {
      setHasLoaded(false);
    }
  }, [product, isOpen]);

  const normalize = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
  };

  const autoSelectImage = (prodName, catId) => {
    // Only auto-select if the modal is open, has loaded database values,
    // and Cloudinary data is present
    if (!hasLoaded || !prodName || !cloudinaryProducts.length) return;

    const selectedCat = categories.find((c) => c.id === parseInt(catId));
    const catName = selectedCat ? selectedCat.name : "";
    const normTyped = normalize(prodName);
    
    let match = null;
    if (catName) {
      const normCat = normalize(catName);
      const categorySpecificProducts = cloudinaryProducts.filter((p) => {
        const normFolder = normalize(p.folderName);
        return normFolder === normCat || normFolder.includes(normCat) || normCat.includes(normFolder);
      });
      
      match = categorySpecificProducts.find((p) => normalize(p.folderName) === normTyped);
    }

    if (!match) {
      match = cloudinaryProducts.find((p) => normalize(p.folderName) === normTyped);
    }

    if (!match) {
      match = cloudinaryProducts.find((p) => {
        const normFolder = normalize(p.folderName);
        return normTyped.includes(normFolder) || normFolder.includes(normTyped);
      });
    }

    if (!match) {
      match = cloudinaryProducts.find((p) => {
        const normFile = normalize(p.filename);
        return normTyped.includes(normFile) || normFile.includes(normTyped);
      });
    }

    if (match) {
      setImage(match.url);
    }
  };

  useEffect(() => {
    autoSelectImage(nameEn, categoryId);
  }, [nameEn, categoryId, cloudinaryProducts, hasLoaded]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalUnit = unit === "Other" ? customUnit.trim() : unit.trim();

    if (!nameEn.trim() || !nameMr.trim() || !purchasePrice || !price || !stock || !finalUnit || !categoryId || !image.trim()) {
      alert("All fields marked with * are required");
      return;
    }

    const purchasePriceNum = parseFloat(purchasePrice);
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(purchasePriceNum) || purchasePriceNum < 0) {
      alert("Purchase Price must be a positive number or 0");
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Selling Price must be a number greater than 0");
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      alert("Stock must be a positive integer or 0");
      return;
    }

    try {
      setLoading(true);
      await API.put(`/products/${product.id}`, {
        name_en: nameEn.trim(),
        name_mr: nameMr.trim(),
        purchasePrice: purchasePriceNum,
        price: priceNum,
        stock: stockNum,
        unit: finalUnit,
        categoryId: parseInt(categoryId),
        description_en: descriptionEn.trim(),
        description_mr: descriptionMr.trim(),
        image: image.trim(),
        isActive: isActive,
        keywords,
      });

      alert("Product updated successfully!");
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Product Name (English) */}
            <div>
              <label className="font-medium text-gray-700">Product Name (English) *</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Enter English Name"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            {/* Product Name (Marathi) */}
            <div>
              <label className="font-medium text-gray-700">Product Name (Marathi) *</label>
              <input
                type="text"
                value={nameMr}
                onChange={(e) => setNameMr(e.target.value)}
                placeholder="मराठी नाव प्रविष्ट करा"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">Purchase Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Purchase Price"
                  className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-gray-700">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Selling Price"
                  className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="font-medium text-gray-700">Stock *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            {/* Unit */}
            <div>
              <label className="font-medium text-gray-700">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                required
              >
                <option value="">Select Unit</option>
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="font-medium text-gray-700">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Unit Specification */}
            {unit === "Other" && (
              <div className="col-span-2">
                <label className="font-medium text-gray-700">Specify Custom Unit *</label>
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="Enter custom unit (e.g. 73g, 1.5kg)"
                  className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
            )}
          </div>

          {/* Description (English) */}
          <div>
            <label className="font-medium text-gray-700">Description (English)</label>
            <textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Enter Product Description in English"
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
            />
          </div>

          {/* Description (Marathi) */}
          <div>
            <label className="font-medium text-gray-700">Description (Marathi)</label>
            <textarea
              value={descriptionMr}
              onChange={(e) => setDescriptionMr(e.target.value)}
              placeholder="मराठीत उत्पादन वर्णन प्रविष्ट करा"
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
            />
          </div>

          {/* Search Keywords */}
          <div>
            <label className="font-medium text-gray-700">Search Keywords (for multilingual search)</label>
            <div className="mt-2 border rounded-xl p-2.5 focus-within:ring-2 focus-within:ring-green-500 bg-white transition min-h-[46px] flex flex-wrap gap-2 items-center">
              {keywords.map((kw, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                  {kw}
                  <button
                    type="button"
                    onClick={() => setKeywords(prev => prev.filter((_, idx) => idx !== index))}
                    className="text-green-500 hover:text-green-700 font-extrabold transition focus:outline-none text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = keywordInput.trim();
                    if (val && !keywords.includes(val)) {
                      setKeywords(prev => [...prev, val]);
                    }
                    setKeywordInput("");
                  }
                }}
                placeholder={keywords.length === 0 ? "Type keyword & press Enter/comma (e.g. potato, बटाटा)" : "Add more..."}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-xs font-semibold text-gray-700"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Press Enter or comma to add each keyword (e.g., english, marathi, synonyms, etc.)</p>
          </div>

          {/* Image/Emoji */}
          <div>
            <label className="font-medium text-gray-700">Product Image URL / Emoji *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Enter emoji (e.g. 🥭) or Cloudinary URL"
                className="flex-1 mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="mt-2 bg-green-550 border border-green-600 hover:bg-green-50 text-green-700 font-semibold px-4 rounded-xl flex items-center gap-1.5 transition text-sm shadow-sm"
              >
                <FaCloud /> Gallery
              </button>
            </div>

            {/* Preview */}
            {image && (
              <div className="mt-3 p-3 bg-gray-50 border rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {image.startsWith("http") ? (
                  <img
                    src={image}
                    className="w-14 h-14 object-cover rounded-lg border bg-white"
                    alt="Preview"
                  />
                ) : (
                  <span className="text-4xl p-1 bg-white border rounded-lg">{image}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500">Image Preview</p>
                  <p className="text-xs text-gray-700 truncate font-mono">{image}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 accent-green-600 cursor-pointer"
            />
            <label htmlFor="isActive" className="font-medium text-gray-700 cursor-pointer">
              Product is Active
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {galleryOpen && (
        <CloudinaryGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          onSelect={(url) => {
            setImage(url);
            setGalleryOpen(false);
          }}
          initialTab="products"
          currentCategoryName={
            categories.find((c) => c.id === parseInt(categoryId))?.name || ""
          }
        />
      )}
    </div>
  );
}

export default EditProductModal;
