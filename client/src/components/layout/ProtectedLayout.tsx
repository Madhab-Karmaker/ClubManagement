import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import "../../assets/styles/dashboard.css";
import { useState } from "react";
import {
  BellIcon,
  ChevronDownIcon,
  MenuIcon,
  MessageIcon,
  SearchIcon,
} from "../ui/DashboardIcons";

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
  const initials = (username ?? "?").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout app-layout--premium">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        username={username ?? ""}
        onLogout={handleLogout}
      />

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="hamburger-btn topbar-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <MenuIcon className="topbar-menu-icon" />
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

          <div className="topbar-title-group">
            <span className="topbar-kicker">Club Management System</span>
            <span className="topbar-title">{pageTitle}</span>
          </div>

          <label className="topbar-search" aria-label="Search the dashboard">
            <SearchIcon className="topbar-search-icon" />
            <input type="search" placeholder="Search members, payments, roles..." />
          </label>

          <div className="topbar-actions">
            <button className="topbar-action-btn" aria-label="Messages">
              <MessageIcon className="topbar-action-icon" />
            </button>
            <button className="topbar-action-btn" aria-label="Notifications">
              <BellIcon className="topbar-action-icon" />
              <span className="topbar-notification-dot" />
            </button>
            <button className="topbar-user-chip" onClick={() => navigate("/profile")} aria-label="Open profile">
              <span className="topbar-user-avatar topbar-user-avatar--online">{initials}</span>
              <span className="topbar-user-chip__meta">
                <span className="topbar-user-chip__name">{username}</span>
                <span className="topbar-user-chip__role">Admin</span>
              </span>
              <ChevronDownIcon className="topbar-user-chip__chevron" />
            </button>
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
