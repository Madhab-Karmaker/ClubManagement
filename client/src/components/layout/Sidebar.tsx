import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BellIcon,
  CalendarIcon,
  ChartIcon,
  ChevronDownIcon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  LogoutIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
} from "../ui/DashboardIcons";

interface NavItem {
  path?: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard",        label: "Dashboard",        icon: HomeIcon },
  { path: "/members",          label: "Members",          icon: UsersIcon },
  { path: "/roles",            label: "Roles",            icon: ShieldIcon },
  { path: "/events",           label: "Events",           icon: CalendarIcon },
  { path: "/membership",       label: "Membership",       icon: CreditCardIcon },
  { path: "/payment-methods",  label: "Payment Methods",  icon: CreditCardIcon },
  {
    label: "Donations",
    icon: ChartIcon,
    children: [
      { path: "/donations", label: "Donations Dashboard", icon: ChartIcon },
      { path: "/donation-categories", label: "Donation Categories", icon: TagIcon },
    ],
  },
  { path: "/donor-profiles",   label: "Donor Profiles",   icon: UsersIcon },
  { path: "/reports",          label: "Reports",          icon: FileTextIcon },
  { path: "/notifications",    label: "Notifications",    icon: BellIcon },
  { path: "/settings",         label: "Settings",         icon: SettingsIcon },
];

interface SidebarProps {
  username: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  username,
  onLogout,
  isOpen,
  onClose,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.label} className={`nav-group${depth > 0 ? " nested" : ""}`}>
          <button
            className={`sidebar-nav-item submenu-toggle${isExpanded ? " expanded" : ""}`}
            onClick={() => toggleExpand(item.label)}
          >
            <Icon className="nav-item-icon" />
            <span className="nav-item-label">{item.label}</span>
            <ChevronDownIcon className="submenu-arrow" />
          </button>
          {isExpanded && (
            <div className="submenu">
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path || "#"}
        className={({ isActive }) =>
          `sidebar-nav-item${isActive ? " active" : ""}${depth > 0 ? " submenu-item" : ""}`
        }
        onClick={onClose}
      >
        <Icon className="nav-item-icon" />
        <span className="nav-item-label">{item.label}</span>
      </NavLink>
    );
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
            <SparklesIcon className="sidebar-brand-icon" />
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
          {NAV_ITEMS.map((item) => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{username}</span>
              <span className="sidebar-user-role">Club Admin</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogoutIcon className="sidebar-logout-icon" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
