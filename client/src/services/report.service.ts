import apiClient from '../api/apiClient';

export interface ReportDto {
  savedReportId: number;
  reportName: string;
  reportType: string;
  createdAt: string;
}

export interface GenerateReportDto {
  reportName?: string;
  fromDate?: string;
  toDate?: string;
  memberId?: number;
  categoryId?: number;
}

const reportService = {
  generateDonationReport: async (params?: GenerateReportDto) => {
    const body: any = { reportName: params?.reportName || 'Donation Report', reportType: 'Donation' };
    if (params?.fromDate) body.fromDate = params.fromDate;
    if (params?.toDate) body.toDate = params.toDate;
    if (params?.memberId) body.memberId = params.memberId;
    if (params?.categoryId) body.categoryId = params.categoryId;
    const res = await apiClient.post('/api/reports/donations', body, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `donation_report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    return res;
  },

  generateMemberReport: async (params?: GenerateReportDto) => {
    const body: any = { reportName: params?.reportName || 'Member Report', reportType: 'Member' };
    if (params?.memberId) body.memberId = params.memberId;
    const res = await apiClient.post('/api/reports/members', body, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `member_report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    return res;
  },

  getSavedReports: () =>
    apiClient.get<ReportDto[]>('/api/reports/saved'),

  deleteSavedReport: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/reports/saved/${id}`),
};

export default reportService;
