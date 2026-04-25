import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../../assets/styles/dashboard.css";

interface LayoutProps {
  username: string;
  onLogout: () => void;
  pageTitle: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  username,
  onLogout,
  pageTitle,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        username={username}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        {/* Top bar */}
        <header className="app-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <span />
            <span />
            <span />
          </button>

          <span className="topbar-title">{pageTitle}</span>

          <div className="topbar-user-avatar" title={username}>
            {username.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
