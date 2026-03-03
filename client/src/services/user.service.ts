import apiClient from "../api/apiClient";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  roles: string[];
}

const userService = {
  /** Registers a new user (assigns the default Member role). */
  register: (data: RegisterPayload) =>
    apiClient.post<{ message: string; username: string; email: string }>(
      "/api/user/register",
      data
    ),

  /** Retrieves all users; pass true to include soft-deleted accounts. */
  getAll: (includeDeleted = false) =>
    apiClient.get<UserResponse[]>("/api/user", {
      params: { includeDeleted },
    }),

  /** Soft-deletes a user by ID. */
  remove: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/user/${id}`),
};

export default userService;
