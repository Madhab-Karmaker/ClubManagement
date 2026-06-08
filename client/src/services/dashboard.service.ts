import apiClient from "../api/apiClient";

export interface DashboardSummary {
  totalDonations: number;
  totalMembers: number;
  activeMembers: number;
  expiringMembers: number;
  activeDonors: number;
  donationsThisMonth: number;
  donationsThisMonthCount: number;
  averageDonation: number;
  pendingDonationsCount: number;
  upcomingEventsCount: number;
  unreadNotificationsCount: number;
  recentDonations: RecentDonation[];
  monthlyTrends: MonthlyTrend[];
}

export interface RecentDonation {
  donationId: number;
  memberId: number;
  memberName: string;
  memberEmail: string | null;
  amount: number;
  donationDate: string;
  category: string;
  paymentMethod: string;
  status: string;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
  percentageChange: number;
}

export interface DonationAnalytics {
  totalDonations: number;
  totalDonors: number;
  totalDonationsCount: number;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  topDonors: TopDonor[];
  dailyDonations: DailyDonation[];
}

export interface CategoryBreakdown {
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface TopDonor {
  memberId: number;
  name: string;
  email: string;
  phone: string | null;
  profilePhotoUrl: string | null;
  totalDonation: number;
  lastDonation: string;
  donationCount: number;
  largestCategory: string | null;
}

export interface DailyDonation {
  date: string;
  amount: number;
  count: number;
}

const dashboardService = {
  getSummary: () =>
    apiClient.get<DashboardSummary>("/api/dashboard/summary"),

  getAnalytics: (params?: { fromDate?: string; toDate?: string }) =>
    apiClient.get<DonationAnalytics>("/api/dashboard/analytics", { params }),

  getTopDonors: (count = 10) =>
    apiClient.get<TopDonor[]>("/api/dashboard/top-donors", { params: { count } }),

  getMonthlyTrends: (months = 12) =>
    apiClient.get<MonthlyTrend[]>("/api/dashboard/monthly-trends", { params: { months } }),
};

export default dashboardService;
