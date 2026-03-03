import React, { useState } from "react";
import api from "./services/api";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState<{ status: number; data: any } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setServerResponse(null);
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });
      setServerResponse({ status: response.status, data: response.data });
      console.log("Login success:", response.data);
      // If your backend returns a JWT: localStorage.setItem("token", response.data.token);
    } catch (err: any) {
      const status = err.response?.status ?? 0;
      const data = err.response?.data ?? err.message;
      setServerResponse({ status, data });
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {serverResponse && (
        <div style={{ marginTop: 24, padding: 12, background: "#f5f5f5", borderRadius: 6, fontSize: 13 }}>
          <strong>Server Response</strong>
          <div style={{ marginTop: 6 }}>
            <span style={{ color: serverResponse.status >= 200 && serverResponse.status < 300 ? "green" : "red" }}>
              Status: {serverResponse.status}
            </span>
          </div>
          <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(serverResponse.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
