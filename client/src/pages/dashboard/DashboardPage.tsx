import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DashboardPage: React.FC = () => {
  const { username } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="page-welcome">
        <h2>Welcome back, {username}! 👋</h2>
        <p>Here's an overview of your Club Management system.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card" onClick={() => navigate("/members")}>
          <div className="stat-card-icon blue">👥</div>
          <div className="stat-card-info">
            <h3>Members</h3>
            <p>Manage club members</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate("/roles")}>
          <div className="stat-card-icon purple">🎭</div>
          <div className="stat-card-info">
            <h3>Roles</h3>
            <p>Manage user roles</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate("/donations")}>
          <div className="stat-card-icon green">💰</div>
          <div className="stat-card-info">
            <h3>Donations</h3>
            <p>Track donations</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate("/profile")}>
          <div className="stat-card-icon orange">👤</div>
          <div className="stat-card-info">
            <h3>Profile</h3>
            <p>View your profile</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

