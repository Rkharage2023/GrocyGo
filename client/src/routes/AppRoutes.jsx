import { useContext } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import MainLayout from "../components/Layout/MainLayout";
import CustomerLayout from "../components/Layout/CustomerLayout";
import AdminLayout from "../components/Layout/AdminLayout";
import ProtectedRoute from "../components/Layout/ProtectedRoute";
import AdminRoute from "../components/Layout/AdminRoute";
import PublicOnlyRoute from "../components/Layout/PublicOnlyRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Products from "../pages/Products";
import Cart from "../pages/Cart";

import MyProfile from "../pages/Profile/MyProfile";
import EditProfile from "../pages/Profile/EditProfile";

import CustomerDashboard from "../pages/Dashboard/Dashboard";
import Orders from "../pages/Dashboard/Orders";
import Wishlist from "../pages/Dashboard/Wishlist";
import PickupSlots from "../pages/Dashboard/PickupSlots";
import Addresses from "../pages/Dashboard/Addresses";
import CustomerSettings from "../pages/Dashboard/Settings";

import AdminDashboard from "../pages/Admin/Dashboard";
import Categories from "../pages/Admin/Categories";
import AdminProducts from "../pages/Admin/Products";
import AdminOffers from "../pages/Admin/Offers";
import AdminOrders from "../pages/Admin/Orders";
import AdminCustomers from "../pages/Admin/Customers";
import AdminPickupSlots from "../pages/Admin/PickupSlots";
import AdminReports from "../pages/Admin/Reports";
import AdminSettings from "../pages/Admin/Settings";

function ProfileGuard() {
  const { user, isLoggedIn, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return null;
  }

  const isProfileIncomplete =
    isLoggedIn &&
    user?.role === "CUSTOMER" &&
    (!user?.name || user?.name === "User");

  if (isProfileIncomplete && location.pathname !== "/profile/edit") {
    return <Navigate to="/profile/edit" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProfileGuard />}>
        {/* ── Public pages with Navbar & Footer ───────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
        </Route>

        {/* ── Public-only routes (redirect if logged in) ──────── */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ── Protected: any logged-in user ────────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* Profile pages use MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Route>

          {/* Customer dashboard (non-admin users) */}
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/dashboard/orders" element={<Orders />} />
            <Route path="/dashboard/wishlist" element={<Wishlist />} />
            <Route path="/dashboard/slots" element={<PickupSlots />} />
            <Route path="/dashboard/address" element={<Addresses />} />
            <Route path="/dashboard/settings" element={<CustomerSettings />} />
          </Route>
        </Route>

        {/* ── Admin-only routes ────────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/slots" element={<AdminPickupSlots />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
