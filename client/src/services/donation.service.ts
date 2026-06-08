import apiClient from '../api/apiClient';

export interface CreateDonationDto {
  memberId: number;
  amount: number;
  categoryId: number;
  paymentMethodId: number;
  referenceNumber?: string;
  donationDate: string;
  note?: string;
}

export interface UpdateDonationDto {
  amount?: number;
  categoryId?: number;
  paymentMethodId?: number;
  referenceNumber?: string;
  donationDate?: string;
  note?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DonationResponseDto {
  id: number;
  memberId: number;
  memberFullName: string;
  amount: number;
  categoryName: string;
  paymentMethod: string;
  statusName: string | null;
  statusId: number;
  receiptNumber: string | null;
  referenceNumber?: string;
  donationDate: string;
  note?: string;
  createdAt: string;
}

export interface DonationQueryParams {
  memberId?: number;
  categoryId?: number;
  paymentMethodId?: number;
  statusId?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}

// ── Utility functions used by existing donation components ──────────
export const formatBDT = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 2 }).format(value);

export const getDaysAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const donationService = {
  create: (data: CreateDonationDto) =>
    apiClient.post<DonationResponseDto>('/api/donations', data),

  getAll: (params?: DonationQueryParams) =>
    apiClient.get<PagedResult<DonationResponseDto>>('/api/donations', { params }),

  getById: (id: number) =>
    apiClient.get<DonationResponseDto>(`/api/donations/${id}`),

  update: (id: number, data: UpdateDonationDto) =>
    apiClient.put<DonationResponseDto>(`/api/donations/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/donations/${id}`),

  updateStatus: (id: number, statusId: number) =>
    apiClient.patch<DonationResponseDto>(`/api/donations/${id}/status?statusId=${statusId}`),

  getByMemberId: (memberId: number, page = 1, pageSize = 10) =>
    apiClient.get<PagedResult<DonationResponseDto>>(`/api/members/${memberId}/donations`, {
      params: { page, pageSize },
    }),
};

export default donationService;
