import axios from "axios";

// Configure Axios instance with backend base URL
const api = axios.create({
  baseURL: "https://localhost:7290", // Update to your backend URL
  // You can add headers or withCredentials here if needed
});

// Example: GET request to an endpoint (replace '/api/endpoint' with your actual endpoint)
export const getExample = async () => {
  const response = await api.get("/api/endpoint");
  return response.data;
};

export default api;