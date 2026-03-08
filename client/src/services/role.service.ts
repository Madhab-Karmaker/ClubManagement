import apiClient from "../api/apiClient";

export interface RoleResponse {
  id: string;
  name: string;
}

export interface CreateRolePayload {
  roleName: string;
}

export interface UserRolePayload {
  username: string;
  roleName: string;
}

const roleService = {
  /** Retrieves all roles defined in the system. */
  getAll: () => apiClient.get<RoleResponse[]>("/api/role"),

  /** Creates a new role. */
  create: (data: CreateRolePayload) =>
    apiClient.post<{ message: string }>("/api/role", data),

  /** Deletes a role by name. */
  delete: (roleName: string) =>
    apiClient.delete<{ message: string }>(`/api/role/${encodeURIComponent(roleName)}`),

  /** Assigns a role to a user. */
  assign: (data: UserRolePayload) =>
    apiClient.post<{ message: string }>("/api/role/assign", data),

  /** Removes a role from a user. */
  removeFromUser: (data: UserRolePayload) =>
    apiClient.post<{ message: string }>("/api/role/remove", data),
};

export default roleService;
