import apiClient from "../api/apiClient";

export interface AuditLogEntry {
  auditId: number;
  donationId: number;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  changedAt: string;
}

const auditService = {
  getAll: (page = 1, pageSize = 50) =>
    apiClient.get<AuditLogEntry[]>("/api/audit-logs", { params: { page, pageSize } }),

  getByDonationId: (donationId: number) =>
    apiClient.get<AuditLogEntry[]>(`/api/audit-logs/donations/${donationId}`),
};

export default auditService;
