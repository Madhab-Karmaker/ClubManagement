import React from "react";

export type NavPage = "dashboard" | "members" | "roles" | "donations" | "profile";

interface NavItem {
  id: NavPage;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",  label: "Dashboard", icon: "🏠" },
  { id: "members",    label: "Members",   icon: "👥" },
  { id: "roles",      label: "Roles",     icon: "🎭" },
  { id: "donations",  label: "Donations", icon: "💰" },
  { id: "profile",    label: "Profile",   icon: "👤" },
];

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  username: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  username,
  onLogout,
  isOpen,
  onClose,
}) => {
  const handleNavigate = (page: NavPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`} aria-label="Navigation">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">🏛️</span>
            <span className="sidebar-brand-text">ClubManager</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => handleNavigate(item.id)}
              aria-current={activePage === item.id ? "page" : undefined}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{username}</span>
              <span className="sidebar-user-role">Member</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={onLogout}>
            ⬅ Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
