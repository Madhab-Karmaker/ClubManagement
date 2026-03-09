import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import authService from "../services/auth.service";

interface AuthState {
  username: string | null;
  loading: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then((res) => setUsername(res.data.username ?? null))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (name: string) => setUsername(name);

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
