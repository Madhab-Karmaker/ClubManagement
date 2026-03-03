import axios from "axios";

// In development the Vite proxy forwards /api/* → https://localhost:7290
// so we use a relative baseURL here (works for both dev and production builds).
const apiClient = axios.create({
  baseURL: "/",
  withCredentials: true, // needed for cookie-based auth
});

// Attach the JWT token (if any) to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
