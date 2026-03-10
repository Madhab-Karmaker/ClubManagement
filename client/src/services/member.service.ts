import apiClient from "../api/apiClient";

export interface MemberResponse {
  memberId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  profilePhotoUrl: string | null;
  joinDate: string;
  expiryDate: string;
  isActive: boolean;
  userId: string | null;
  username: string | null;
  roles: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateMemberPayload {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  profilePhotoUrl?: string;
  joinDate: string;
  expiryDate: string;
  isActive: boolean;
  roles: string[];
}

export interface UpdateMemberPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profilePhotoUrl?: string;
  expiryDate?: string;
  isActive?: boolean;
  roles?: string[];
}

export interface MemberQueryParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

const memberService = {
  getAll: (params: MemberQueryParams = {}) =>
    apiClient.get<PagedResult<MemberResponse>>("/api/member", { params }),

  getById: (id: number) =>
    apiClient.get<MemberResponse>(`/api/member/${id}`),

  create: (data: CreateMemberPayload) =>
    apiClient.post<MemberResponse>("/api/member", data),

  update: (id: number, data: UpdateMemberPayload) =>
    apiClient.put<MemberResponse>(`/api/member/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/member/${id}`),
};

export default memberService;
