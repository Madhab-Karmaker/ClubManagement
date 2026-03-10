import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import "../../assets/styles/dashboard.css";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/members":    "Members",
  "/roles":      "Roles",
  "/donations":  "Donations",
  "/profile":    "Profile",
};

const ProtectedLayout = () => {
  const { username, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Dashboard";
  const isHome = location.pathname === "/dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        username={username ?? ""}
        onLogout={handleLogout}
      />

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <span /><span /><span />
          </button>

          {!isHome && (
            <button
              className="back-btn"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
            >
              ← Back
            </button>
          )}

          <span className="topbar-title">{pageTitle}</span>

          <div className="topbar-user-avatar" title={username ?? ""}>
            {(username ?? "?").charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
