import apiClient from '../api/apiClient';

export interface DonationCategoryResponse {
  id: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateDonationCategoryPayload {
  categoryName: string;
  description?: string;
}

export interface UpdateDonationCategoryPayload {
  categoryName?: string;
  description?: string;
  isActive?: boolean;
}

const donationCategoryService = {
  getAll: () =>
    apiClient.get<DonationCategoryResponse[]>('/api/donation-categories'),

  getById: (id: number) =>
    apiClient.get<DonationCategoryResponse>(`/api/donation-categories/${id}`),

  create: (data: CreateDonationCategoryPayload) =>
    apiClient.post<DonationCategoryResponse>('/api/donation-categories', data),

  update: (id: number, data: UpdateDonationCategoryPayload) =>
    apiClient.put<DonationCategoryResponse>(`/api/donation-categories/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/donation-categories/${id}`),
};

export default donationCategoryService;
