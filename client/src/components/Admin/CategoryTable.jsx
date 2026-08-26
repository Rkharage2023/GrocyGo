import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditCategoryModal from "./EditCategoryModal";
import DeleteModal from "./DeleteModal";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";

function CategoryTable({ categories, loading, onRefresh, onStatusToggle }) {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await API.delete(`/categories/${selectedCategory.id}`);
      if (res.data.success) {
        toast.success("Category deleted successfully");
        onRefresh();
      } else {
        toast.error(res.data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Image</th>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-400">
                Loading categories...
              </td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-400">
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition"
              >
                <td className="py-3 px-4">
                  {category.image && category.image.startsWith("http") ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-2xs"
                    />
                  ) : (
                    <span className="text-3xl">{category.image || "📦"}</span>
                  )}
                </td>

                <td className="py-3 px-4 font-semibold text-gray-800">
                  {category.name}
                </td>

                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                  {category.description || "N/A"}
                </td>

                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={async () => {
                      const newStatus = !category.isActive;
                      try {
                        const res = await API.put(`/categories/${category.id}`, {
                          isActive: newStatus
                        });
                        if (res.data.success) {
                          toast.success(
                            `Category status updated to ${newStatus ? "Active" : "Inactive"}`
                          );
                          if (onStatusToggle) {
                            onStatusToggle(category.id, newStatus);
                          } else if (onRefresh) {
                            onRefresh();
                          }
                        } else {
                          toast.error(
                            res.data.message || "Failed to update category status"
                          );
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error(
                          err.response?.data?.message || "Failed to update category status"
                        );
                      }
                    }}
                    className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer select-none active:scale-95 ${
                      category.isActive
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                    title={category.isActive ? "Click to set Inactive" : "Click to set Active"}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        category.isActive ? "bg-green-600 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    <span>{category.isActive ? "Active" : "Inactive"}</span>
                  </button>
              </td>

              <td>
                <button
                  onClick={() => handleEditClick(category)}
                  className="
                  text-blue-600
                  mr-4
                  hover:text-blue-800
                  text-lg
                  "
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => handleDeleteClick(category)}
                  className="
                  text-red-600
                  hover:text-red-800
                  text-lg
                  "
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          )))}
        </tbody>
      </table>

      {isEditOpen && selectedCategory && (
        <EditCategoryModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          category={selectedCategory}
          onRefresh={onRefresh}
        />
      )}

      {isDeleteOpen && selectedCategory && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={`Category "${selectedCategory.name}"`}
        />
      )}
    </div>
  );
}

export default CategoryTable;
