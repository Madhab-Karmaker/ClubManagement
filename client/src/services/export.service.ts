import apiClient from "../api/apiClient";

const exportService = {
  exportDonationsCsv: (params?: { fromDate?: string; toDate?: string; categoryId?: number }) =>
    apiClient.get<Blob>("/api/export/donations/csv", {
      params,
      responseType: "blob",
    }),

  exportDonationsExcel: (params?: { fromDate?: string; toDate?: string; categoryId?: number }) =>
    apiClient.get<Blob>("/api/export/donations/excel", {
      params,
      responseType: "blob",
    }),

  exportMembersCsv: (params?: { search?: string; isActive?: boolean }) =>
    apiClient.get<Blob>("/api/export/members/csv", {
      params,
      responseType: "blob",
    }),

  exportMembersExcel: (params?: { search?: string; isActive?: boolean }) =>
    apiClient.get<Blob>("/api/export/members/excel", {
      params,
      responseType: "blob",
    }),
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export default exportService;
