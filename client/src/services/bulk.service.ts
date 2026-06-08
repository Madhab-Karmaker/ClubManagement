import apiClient from "../api/apiClient";

export interface BulkOperationRequest {
  ids: number[];
  action: string;
  parameters?: Record<string, unknown>;
}

export interface BulkOperationResult {
  totalRequested: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

const bulkService = {
  deleteMembers: (ids: number[]) =>
    apiClient.post<BulkOperationResult>("/api/bulk/members/delete", { ids, action: "delete" }),

  deleteDonations: (ids: number[]) =>
    apiClient.post<BulkOperationResult>("/api/bulk/donations/delete", { ids, action: "delete" }),

  updateMemberStatus: (ids: number[], isActive: boolean) =>
    apiClient.put<BulkOperationResult>("/api/bulk/members/status", {
      ids,
      action: "updateStatus",
      parameters: { isActive },
    }),

  updateDonationStatus: (ids: number[], statusId: number) =>
    apiClient.put<BulkOperationResult>("/api/bulk/donations/status", {
      ids,
      action: "updateStatus",
      parameters: { statusId },
    }),
};

export default bulkService;
