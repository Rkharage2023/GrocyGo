import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import API from "../../services/api";

function LowStockProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await API.get("/products?limit=1000");
        if (res.data.success) {
          const lowStock = res.data.data.products.filter((p) => p.stock <= 5);
          setProducts(lowStock);
        }
      } catch (err) {
        console.error("Error loading low stock products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Low Stock Products</h2>
        <div className="text-center py-6 text-gray-500">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Low Stock Products</h2>

        <span className="text-red-500 font-semibold">
          {products.length} Alerts
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-6 text-gray-500">All products are well stocked!</div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center border rounded-xl p-4 hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>

                <div>
                  <h3 className="font-semibold">{product.name}</h3>

                  <p className="text-sm text-gray-500">{product.Category?.name || "N/A"}</p>
                </div>
              </div>

              <div>
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                  {product.stock} {product.unit} Left
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LowStockProducts;
