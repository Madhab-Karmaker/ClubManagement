import apiClient from "../api/apiClient";

export interface PaymentMethodResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreatePaymentMethodPayload {
  name: string;
  description: string;
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

const paymentMethodService = {
  getAll: () =>
    apiClient.get<PaymentMethodResponse[]>("/api/paymentmethod"),

  getById: (id: number) =>
    apiClient.get<PaymentMethodResponse>(`/api/paymentmethod/${id}`),

  create: (data: CreatePaymentMethodPayload) =>
    apiClient.post<PaymentMethodResponse>("/api/paymentmethod", data),

  update: (id: number, data: UpdatePaymentMethodPayload) =>
    apiClient.put<PaymentMethodResponse>(`/api/paymentmethod/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/paymentmethod/${id}`),
};

export default paymentMethodService;
