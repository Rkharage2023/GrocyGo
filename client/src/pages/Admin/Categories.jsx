import { FaPlus } from "react-icons/fa";
import CategoryTable from "../../components/Admin/CategoryTable";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddCategoryModal from "../../components/Admin/AddCategoryModal";
import API from "../../services/api";

function Categories() {
  const location = useLocation();
  const [openModal, setOpenModal] = useState(location.state?.openAdd || false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories?includeInactive=true");
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestions = searchQuery
    ? categories
        .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Category Management
          </h1>
          <p className="text-gray-500 mt-2">Manage grocery categories.</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <FaPlus />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="mt-8 relative w-full md:w-96">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
            setActiveSuggestionIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveSuggestionIndex(prev => Math.max(prev - 1, -1));
            } else if (e.key === "Enter") {
              if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                e.preventDefault();
                setSearchQuery(suggestions[activeSuggestionIndex].name);
                setShowSuggestions(false);
              }
            } else if (e.key === "Escape") {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search categories..."
          className="border px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-green-500 w-full text-gray-700 bg-white"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50 max-h-48">
            {suggestions.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchQuery(cat.name);
                  setShowSuggestions(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs transition flex items-center justify-between text-gray-700 font-medium ${
                  idx === activeSuggestionIndex ? "bg-green-50" : "hover:bg-green-50/50"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] font-bold ${cat.isActive ? "text-green-600" : "text-gray-400"}`}>
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-8">
        <CategoryTable 
          categories={filteredCategories} 
          loading={loading} 
          onRefresh={fetchCategories} 
        />
        <AddCategoryModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onRefresh={fetchCategories}
        />
      </div>
    </div>
  );
}

export default Categories;
