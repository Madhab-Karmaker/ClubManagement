import apiClient from '../api/apiClient';

export interface MembershipFeeDto {
  membershipFeeId: number;
  memberId: number;
  memberName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
  donationId?: number;
  note?: string;
}

export interface CreateMembershipFeeDto {
  memberId: number;
  amount: number;
  dueDate: string;
  note?: string;
}

export interface MembershipRenewalDto {
  membershipRenewalId: number;
  memberId: number;
  memberName: string;
  previousExpiryDate: string;
  newExpiryDate: string;
  feePaid?: number;
  note?: string;
  renewedAt: string;
}

export interface RenewMembershipDto {
  memberId: number;
  renewMonths: number;
  feePaid?: number;
  note?: string;
}

export interface ExpiringMemberDto {
  memberId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

const membershipService = {
  getFeesByMember: (memberId: number) =>
    apiClient.get<MembershipFeeDto[]>(`/api/membership/fees/${memberId}`),

  getPendingFees: () =>
    apiClient.get<MembershipFeeDto[]>('/api/membership/fees/pending'),

  createFee: (data: CreateMembershipFeeDto) =>
    apiClient.post<MembershipFeeDto>('/api/membership/fees', data),

  markAsPaid: (feeId: number, donationId: number) =>
    apiClient.put<{ message: string }>(`/api/membership/fees/${feeId}/pay`, null, {
      params: { donationId },
    }),

  deleteFee: (feeId: number) =>
    apiClient.delete<{ message: string }>(`/api/membership/fees/${feeId}`),

  renewMembership: (data: RenewMembershipDto) =>
    apiClient.post<MembershipRenewalDto>('/api/membership/renew', data),

  getRenewalHistory: (memberId: number) =>
    apiClient.get<MembershipRenewalDto[]>(`/api/membership/renewals/${memberId}`),

  getExpiringMembers: (withinDays = 30) =>
    apiClient.get<ExpiringMemberDto[]>('/api/membership/expiring', {
      params: { withinDays },
    }),
};

export default membershipService;
