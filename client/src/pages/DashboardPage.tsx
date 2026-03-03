import React from "react";
import authService from "../services/auth.service";
import "../auth.css";

export interface DashboardPageProps {
  username: string;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ username, onLogout }) => {
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // silently ignore logout errors
    } finally {
      onLogout();
    }
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span>🏛️</span> Club Management
        </div>
        <div className="nav-right">
          <span className="nav-user">
            Signed in as <span>{username}</span>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        <div className="dashboard-welcome">
          <h2>Welcome back, {username}! 👋</h2>
          <p>You're signed in to the Club Management system.</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Members</h3>
            <p>Manage club members</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">🎭</div>
            <h3>Roles</h3>
            <p>Manage user roles</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Donations</h3>
            <p>Track donations</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>Profile</h3>
            <p>View your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
