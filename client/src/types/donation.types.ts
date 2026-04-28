export interface DonationRecord {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  date: string;
  category: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
}

export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  totalDonation: number;
  lastDonation: string;
  status: 'active' | 'inactive';
  donationCount: number;
  joinDate: string;
}

export interface DonationTrend {
  month: string;
  amount: number;
  percentage: number;
}

export interface DonationCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface DonationData {
  totalDonations: number;
  totalMembers: number;
  activeDonors: number;
  recentDonations: DonationRecord[];
  topDonors: DonorProfile[];
  trends: DonationTrend[];
  categories: DonationCategory[];
  dailyDonations: Array<{ date: string; amount: number }>;
}
