import apiClient from "../api/apiClient";

export interface LoginPayload {
  username: string;
  password: string;
}

const authService = {
  /** Validates credentials and establishes a session. */
  login: (data: LoginPayload) =>
    apiClient.post<{ message: string }>("/api/auth/login", data),

  /** Ends the current session. */
  logout: () =>
    apiClient.post<{ message: string }>("/api/auth/logout"),
};

export default authService;
