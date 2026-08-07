import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * AdminRoute — wraps routes that require admin role.
 * If not logged in → redirect to /login.
 * If logged in but not admin → redirect to /dashboard.
 * Shows loading spinner while auth state is being resolved.
 */
function AdminRoute() {
  const { isLoggedIn, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-green-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default AdminRoute;
