import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import MembersPagePremium from "../pages/members/MembersPagePremium.tsx";
import RolesPage from "../pages/roles/RolesPage";
import PaymentMethodsPage from "../pages/paymentmethods/PaymentMethodsPage";
import DonationDashboard from "../pages/donations/DonationDashboard.tsx";
import DonationCategoriesPage from "../pages/donations/DonationCategoriesPage.tsx";
import EventsPage from "../pages/events/EventsPage";
import MembershipPage from "../pages/membership/MembershipPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import ReportsPage from "../pages/reports/ReportsPage";
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

const AppRouter = () => (
  <Routes>
    {/* Auth routes */}
    <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
    <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

    {/* Protected routes — wrapped in the shared sidebar layout */}
    <Route element={<RequireAuth><ProtectedLayout /></RequireAuth>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/members" element={<MembersPagePremium />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/payment-methods" element={<PaymentMethodsPage />} />
      <Route path="/donations" element={<DonationDashboard />} />
      <Route path="/donation-categories" element={<DonationCategoriesPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/profile" element={<PlaceholderPage icon="👤" title="Profile" description="View and edit your profile" />} />
      <Route path="/settings" element={<PlaceholderPage icon="⚙️" title="Settings" description="Configure system settings" />} />
      <Route path="/donor-profiles" element={<PlaceholderPage icon="🎯" title="Donor Profiles" description="View donor analytics and profiles" />} />
    </Route>

    {/* Default */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRouter;
