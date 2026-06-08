import apiClient from "../api/apiClient";

export interface DonationReceiptDto {
  receiptId: number;
  receiptNumber: string;
  donationId: number;
  memberName: string;
  memberEmail: string;
  amount: number;
  category: string;
  paymentMethod: string;
  referenceNumber: string | null;
  donationDate: string;
  generatedAt: string;
  note: string | null;
}

const receiptService = {
  generate: (donationId: number) =>
    apiClient.post<DonationReceiptDto>(`/api/receipts/donations/${donationId}`),

  getByDonationId: (donationId: number) =>
    apiClient.get<DonationReceiptDto>(`/api/receipts/donations/${donationId}`),

  getByNumber: (receiptNumber: string) =>
    apiClient.get<DonationReceiptDto>(`/api/receipts/number/${receiptNumber}`),

  getByMemberId: (memberId: number) =>
    apiClient.get<DonationReceiptDto[]>(`/api/receipts/members/${memberId}`),
};

export default receiptService;
