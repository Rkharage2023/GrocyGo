import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * PublicOnlyRoute — wraps routes that should NOT be accessible while logged in (e.g. /login, /register).
 * If the user is already authenticated, redirects to the appropriate page:
 *   - Admin → /admin
 *   - User  → /
 */
function PublicOnlyRoute() {
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

  if (isLoggedIn) {
    return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
