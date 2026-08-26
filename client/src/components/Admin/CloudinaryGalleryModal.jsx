import { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaFolderOpen, FaCloud } from "react-icons/fa";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";

function CloudinaryGalleryModal({ isOpen, onClose, onSelect, initialTab = "products", currentCategoryName = "" }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(initialTab); // "products" or "categories"
  const [images, setImages] = useState({ categories: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCloudinaryImages();
      setSelectedFolder(""); // Default to "All Folders" so images are always visible immediately
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchCloudinaryImages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cloudinary/images");
      if (res.data.success) {
        setImages(res.data.data);
      }
    } catch (err) {
      console.error("Error loading Cloudinary images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("target", activeTab);

    try {
      setUploading(true);
      const res = await API.post("/cloudinary/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Image uploaded successfully!");
        await fetchCloudinaryImages();
        if (res.data.data.url) {
          onSelect(res.data.data.url);
        }
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Helper to normalize strings for comparison
  const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

  // Determine current image list with automatic fallbacks so gallery never appears empty if images exist
  const productsList = (images.products && images.products.length > 0) ? images.products : (images.all || []);
  const categoriesList = (images.categories && images.categories.length > 0) ? images.categories : (images.all || []);

  const rawList = activeTab === "products" ? productsList : categoriesList;
  const currentList = rawList.length > 0 ? rawList : (images.all || []);

  const uniqueFolders = [
    ...new Set(currentList.map((img) => img.folderName || "")),
  ].filter(Boolean).sort();

  let filteredImages = currentList.filter((img) => {
    const filename = img.filename || "";
    const folderName = img.folderName || "";
    const matchesSearch =
      !searchQuery ||
      filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folderName.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFolder) {
      const normSelected = normalize(selectedFolder);
      const normImgFolder = normalize(folderName);
      
      const matchesFolder =
        normImgFolder === normSelected ||
        normImgFolder.includes(normSelected) ||
        normSelected.includes(normImgFolder);
        
      return matchesSearch && matchesFolder;
    }

    return matchesSearch;
  });

  // Safety fallback: if a folder filter yields 0 items, display all items matching search query
  if (selectedFolder && filteredImages.length === 0 && currentList.length > 0) {
    filteredImages = currentList.filter((img) => {
      const filename = img.filename || "";
      const folderName = img.folderName || "";
      return (
        !searchQuery ||
        filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-green-50">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2.5 rounded-xl text-white">
              <FaCloud className="text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cloudinary Image Library</h2>
              <p className="text-sm text-gray-500">Browse and select images directly from your Cloudinary storage.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Filters and Tabs */}
        <div className="p-6 border-b bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-gray-200/80 rounded-xl w-fit">
            <button
              onClick={() => {
                setActiveTab("products");
                setSearchQuery("");
              }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "products"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab("categories");
                setSearchQuery("");
              }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "categories"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Categories
            </button>
          </div>

          {/* Search and Folder filter */}
          <div className="flex flex-1 md:justify-end gap-3 flex-wrap items-center">
            {/* Folder Dropdown */}
            <div className="relative min-w-[180px]">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-700 bg-white"
              >
                <option value="">All Folders</option>
                {uniqueFolders.map((f) => (
                  <option key={f} value={f}>
                    {f.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-700"
              />
              <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>

            {/* Upload Button */}
            <label className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition text-sm shadow-sm cursor-pointer ${uploading ? "opacity-75 cursor-not-allowed" : ""}`}>
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaCloud /> Upload Image
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Content grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <span className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold text-gray-700">Accessing Cloudinary media...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
              <FaFolderOpen size={48} className="text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No images found</p>
              <p className="text-sm text-gray-400 mt-1">Try resetting filters or searching with another keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredImages.map((img) => (
                <div
                  key={img.public_id}
                  onClick={() => onSelect(img.url)}
                  className="group bg-white rounded-2xl border hover:border-green-500 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden border-b">
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <span className="bg-green-600 text-white font-semibold px-4 py-1.5 rounded-full text-xs shadow-md">
                        Use Image
                      </span>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <p className="text-xs font-bold text-gray-700 truncate" title={img.filename || ""}>
                      {(img.filename || "").replace(/_[a-z0-9]+$/i, "").replace(/_/g, " ")}
                    </p>
                    <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mt-1 truncate">
                      {(img.folderName || "").replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-500">
          <p>
            Showing <strong className="text-gray-700">{filteredImages.length}</strong> of{" "}
            <strong className="text-gray-700">{currentList.length}</strong> items in Cloudinary
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border rounded-xl hover:bg-gray-100 font-semibold text-gray-700 bg-white shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CloudinaryGalleryModal;
