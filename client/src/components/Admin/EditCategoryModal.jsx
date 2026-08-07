import { useState, useEffect } from "react";
import { FaTimes, FaCloud } from "react-icons/fa";
import API from "../../services/api";
import CloudinaryGalleryModal from "./CloudinaryGalleryModal";

function EditCategoryModal({ isOpen, onClose, category, onRefresh }) {
  const [nameEn, setNameEn] = useState("");
  const [nameMr, setNameMr] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cloudinaryCategories, setCloudinaryCategories] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadCloudinary = async () => {
        try {
          const res = await API.get("/cloudinary/images");
          if (res.data.success) {
            setCloudinaryCategories(res.data.data.categories);
          }
        } catch (err) {
          console.error("Failed to load Cloudinary category images", err);
        }
      };
      loadCloudinary();
    }
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      setNameEn(category.name_en || "");
      setNameMr(category.name_mr || "");
      setDescription(category.description || "");
      setImage(category.image || "");
      setTimeout(() => setHasLoaded(true), 100);
    } else {
      setHasLoaded(false);
    }
  }, [category, isOpen]);

  const normalize = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
  };

  const autoSelectImage = (catName) => {
    if (!hasLoaded || !catName || !cloudinaryCategories.length) return;
    const normTyped = normalize(catName);

    let match = cloudinaryCategories.find((c) => normalize(c.folderName) === normTyped);

    if (!match) {
      match = cloudinaryCategories.find((c) => {
        const normFolder = normalize(c.folderName);
        return normTyped.includes(normFolder) || normFolder.includes(normTyped);
      });
    }

    if (!match) {
      match = cloudinaryCategories.find((c) => {
        const normFile = normalize(c.filename);
        return normTyped.includes(normFile) || normFile.includes(normTyped);
      });
    }

    if (match) {
      setImage(match.url);
    }
  };

  useEffect(() => {
    autoSelectImage(nameEn);
  }, [nameEn, cloudinaryCategories, hasLoaded]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameEn.trim() || !nameMr.trim()) {
      alert("English and Marathi category names are required");
      return;
    }

    try {
      setLoading(true);
      await API.put(`/categories/${category.id}`, {
        name_en: nameEn.trim(),
        name_mr: nameMr.trim(),
        description: description.trim(),
        image: image.trim() || "📦",
      });

      alert("Category updated successfully!");
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Name (English) */}
          <div>
            <label className="font-medium text-gray-700">Category Name (English) *</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Enter English Name"
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          {/* Category Name (Marathi) */}
          <div>
            <label className="font-medium text-gray-700">Category Name (Marathi) *</label>
            <input
              type="text"
              value={nameMr}
              onChange={(e) => setNameMr(e.target.value)}
              placeholder="मराठी नाव प्रविष्ट करा"
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Category Description"
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
            />
          </div>

          {/* Image/Emoji */}
          <div>
            <label className="font-medium text-gray-700">Category Image URL / Emoji *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Enter emoji (e.g. 🥦) or Cloudinary URL"
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
          initialTab="categories"
          currentCategoryName={nameEn}
        />
      )}
    </div>
  );
}

export default EditCategoryModal;
