import React, { useState } from "react";
import authService from "../../services/auth.service";
import Layout from "../../components/layout/Layout";
import type { NavPage } from "../../components/layout/Sidebar";

export interface DashboardPageProps {
  username: string;
  onLogout: () => void;
}

/* ─── Page content renderers ─────────────────────────────── */
const DashboardHome: React.FC<{ username: string; onNavigate: (p: NavPage) => void }> = ({
  username,
  onNavigate,
}) => (
  <>
    <div className="page-welcome">
      <h2>Welcome back, {username}! 👋</h2>
      <p>Here's an overview of your Club Management system.</p>
    </div>

    <div className="stat-cards">
      <div className="stat-card" onClick={() => onNavigate("members")}>
        <div className="stat-card-icon blue">👥</div>
        <div className="stat-card-info">
          <h3>Members</h3>
          <p>Manage club members</p>
        </div>
      </div>
      <div className="stat-card" onClick={() => onNavigate("roles")}>
        <div className="stat-card-icon purple">🎭</div>
        <div className="stat-card-info">
          <h3>Roles</h3>
          <p>Manage user roles</p>
        </div>
      </div>
      <div className="stat-card" onClick={() => onNavigate("donations")}>
        <div className="stat-card-icon green">💰</div>
        <div className="stat-card-info">
          <h3>Donations</h3>
          <p>Track donations</p>
        </div>
      </div>
      <div className="stat-card" onClick={() => onNavigate("profile")}>
        <div className="stat-card-icon orange">👤</div>
        <div className="stat-card-info">
          <h3>Profile</h3>
          <p>View your profile</p>
        </div>
      </div>
    </div>
  </>
);

const PlaceholderPage: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
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

/* ─── Page metadata ──────────────────────────────────────── */
const PAGE_META: Record<NavPage, { title: string; icon: string; description: string }> = {
  dashboard:  { title: "Dashboard",  icon: "🏠", description: "Overview of your club" },
  members:    { title: "Members",    icon: "👥", description: "View and manage club members" },
  roles:      { title: "Roles",      icon: "🎭", description: "Manage user roles and permissions" },
  donations:  { title: "Donations",  icon: "💰", description: "Track and manage donations" },
  profile:    { title: "Profile",    icon: "👤", description: "View and edit your profile" },
};

/* ─── Main component ─────────────────────────────────────── */
const DashboardPage: React.FC<DashboardPageProps> = ({ username, onLogout }) => {
  const [activePage, setActivePage] = useState<NavPage>("dashboard");

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // silently ignore
    } finally {
      onLogout();
    }
  };

  const meta = PAGE_META[activePage];

  return (
    <Layout
      username={username}
      onLogout={handleLogout}
      activePage={activePage}
      onNavigate={setActivePage}
      pageTitle={meta.title}
    >
      {activePage === "dashboard" ? (
        <DashboardHome username={username} onNavigate={setActivePage} />
      ) : (
        <PlaceholderPage
          icon={meta.icon}
          title={meta.title}
          description={meta.description}
        />
      )}
    </Layout>
  );
};

export default DashboardPage;
