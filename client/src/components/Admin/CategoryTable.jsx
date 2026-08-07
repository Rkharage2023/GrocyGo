import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditCategoryModal from "./EditCategoryModal";
import DeleteModal from "./DeleteModal";
import API from "../../services/api";

function CategoryTable({ categories, loading, onRefresh }) {
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
      alert(res.data.message || "Category deleted successfully");
      setIsDeleteOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
        Loading categories table...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
        No categories found. Create a category to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="p-4">Image/Emoji</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b hover:bg-gray-50 text-center"
            >
              <td className="p-3">
                {category.image && category.image.startsWith("http") ? (
                  <img src={category.image} className="w-12 h-12 object-cover rounded-xl border bg-white mx-auto shadow-sm" alt={category.name} />
                ) : (
                  <span className="text-3xl">{category.image || "📦"}</span>
                )}
              </td>
              <td className="font-semibold text-gray-800">{category.name}</td>
              <td className="text-gray-500 max-w-xs truncate">{category.description || "No description"}</td>
              <td>
                <select
                  value={category.isActive ? "true" : "false"}
                  onChange={async (e) => {
                    const newStatus = e.target.value === "true";
                    try {
                      const res = await API.put(`/categories/${category.id}`, {
                        isActive: newStatus
                      });
                      if (res.data.success) {
                        onRefresh();
                      } else {
                        alert(res.data.message || "Failed to update category status");
                      }
                    } catch (err) {
                      console.error(err);
                      alert(err.response?.data?.message || "Failed to update category status");
                    }
                  }}
                  className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition ${
                    category.isActive
                      ? "bg-green-50 text-green-700 border-green-200 focus:ring-green-400"
                      : "bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-400"
                  }`}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
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
          ))}
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
