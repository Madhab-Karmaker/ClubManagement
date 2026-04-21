import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import MembersPage from "../pages/members/MembersPage";
import RolesPage from "../pages/roles/RolesPage";
import DonationDashboard from "../pages/donations/DonationDashboard";
import ProtectedLayout from "../components/layout/ProtectedLayout";

/** Redirects unauthenticated users to /login */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { username, loading } = useAuth();
  if (loading) return null;
  return username ? <>{children}</> : <Navigate to="/login" replace />;
};

/** Redirects already-logged-in users away from auth pages */
const RedirectIfAuth = ({ children }: { children: React.ReactNode }) => {
  const { username, loading } = useAuth();
  if (loading) return null;
  return username ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRouter = () => (
  <Routes>
    {/* Auth routes */}
    <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
    <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

    {/* Protected routes — wrapped in the shared sidebar layout */}
    <Route element={<RequireAuth><ProtectedLayout /></RequireAuth>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/donations" element={<DonationDashboard />} />
      <Route path="/profile" element={<PlaceholderPage icon="👤" title="Profile" description="View and edit your profile" />} />
    </Route>

    {/* Default */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const PlaceholderPage = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <>
    <div className="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <div className="page-placeholder">
      <div className="placeholder-icon">{icon}</div>
      <h3>Coming Soon</h3>
      <p>This section is under construction. Check back later!</p>
    </div>
  </>
);

export default AppRouter;
