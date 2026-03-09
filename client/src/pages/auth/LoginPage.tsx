import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/auth.css";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.login({ username, password });
      login(username);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split">
        {/* Left branding panel — hidden on mobile */}
        <div className="auth-split-left">
          <div className="auth-split-brand">
            <div className="logo-icon logo-icon-lg">🏛️</div>
            <h2>Club Management</h2>
            <p>Everything your club needs, in one place.</p>
            <ul className="auth-features">
              <li>👥 Member management</li>
              <li>🎭 Event tracking</li>
              <li>💰 Donation records</li>
              <li>🔐 Role-based access control</li>
            </ul>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-split-right">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-icon">🏛️</div>
              <h1>Welcome back</h1>
              <p>Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Signing in\u2026" : "Sign In"}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account?{" "}
              <Link to="/register">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

