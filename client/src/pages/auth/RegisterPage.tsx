import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import userService from "../../services/user.service";
import "../../assets/styles/auth.css";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await userService.register({ username, email, password });
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
            <h2>Join the Club</h2>
            <p>Create your account and get started today.</p>
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
              <h1>Create account</h1>
              <p>Fill in the details below to get started</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
