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

  /** Returns the current user if a valid session exists, otherwise throws. */
  me: () =>
    apiClient.get<{ username: string }>("/api/auth/me"),
};

export default authService;
