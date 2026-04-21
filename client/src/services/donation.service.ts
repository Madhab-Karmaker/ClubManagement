import { type DonationData, type DonationRecord, type DonorProfile } from '../types/donation.types.ts';

/**
 * Generate dummy donation data for the dashboard
 * In production, this would call a real API endpoint
 */
export function getDummyDonationData(): DonationData {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Generate realistic donor data
  const donorNames = [
    'Ahsan Ahmed', 'Fatima Khan', 'Muhammad Hassan', 'Zara Malik', 'Omar Farooq',
    'Amina Begum', 'Hassan Ali', 'Noor Ahmed', 'Sarim Khan', 'Bushra Siddiqui',
    'Abdullah Karim', 'Hana Mirza', 'Karim Hussain', 'Laila Ahmed', 'Malik Rashid',
    'Nadia Khan', 'Raman Ali', 'Sara Fatima', 'Tariq Hassan', 'Umma Yousuf',
  ];

  // Generate recent donations
  const recentDonations: DonationRecord[] = [];
  const categoryTypes = ['general', 'event', 'cause', 'project'] as const;
  const paymentMethods = ['cash', 'online', 'cheque', 'bank_transfer'] as const;
  const statuses = ['completed', 'pending', 'cancelled'] as const;

  for (let i = 0; i < 50; i++) {
    const donorName = donorNames[Math.floor(Math.random() * donorNames.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    recentDonations.push({
      id: `DT-${String(i + 1).padStart(5, '0')}`,
      donorId: `DONOR-${String(i + 1).padStart(4, '0')}`,
      donorName,
      donorEmail: `${donorName.toLowerCase().replace(' ', '.')}@example.com`,
      donorPhone: `+880${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      amount: Math.floor(Math.random() * 50000) + 5000, // 5000-55000 BDT
      date: date.toISOString().split('T')[0],
      category: categoryTypes[Math.floor(Math.random() * categoryTypes.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: i % 5 === 0 ? 'Annual donation' : undefined,
    });
  }

  // Create top donors list
  const donorMap = new Map<string, { name: string; totalAmount: number; lastDate: string; count: number }>();
  recentDonations.forEach((d) => {
    const existing = donorMap.get(d.donorId) || { name: d.donorName, totalAmount: 0, lastDate: d.date, count: 0 };
    existing.totalAmount += d.amount;
    existing.lastDate = new Date(existing.lastDate) > new Date(d.date) ? existing.lastDate : d.date;
    existing.count += 1;
    donorMap.set(d.donorId, existing);
  });

  const topDonors: DonorProfile[] = Array.from(donorMap.entries())
    .map(([id, data], idx) => ({
      id,
      name: data.name,
      email: `${data.name.toLowerCase().replace(' ', '.')}@example.com`,
      phone: `+880${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      totalDonation: data.totalAmount,
      lastDonation: data.lastDate,
      status: Math.random() > 0.15 ? 'active' : 'inactive',
      donationCount: data.count,
      joinDate: new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }))
    .sort((a, b) => b.totalDonation - a.totalDonation)
    .slice(0, 10);

  // Calculate total donations
  const totalDonations = recentDonations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  // Generate daily donations for chart
  const dailyDonations = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayDonations = recentDonations.filter(
      (d) => d.status === 'completed' && new Date(d.date).toDateString() === date.toDateString()
    );
    const amount = dayDonations.reduce((sum, d) => sum + d.amount, 0);
    dailyDonations.push({
      date: date.toISOString().split('T')[0],
      amount,
    });
  }

  // Generate trends
  const trends = [
    { month: 'January', amount: 850000, percentage: 8 },
    { month: 'February', amount: 920000, percentage: 12 },
    { month: 'March', amount: 1050000, percentage: 15 },
    { month: 'April', amount: 980000, percentage: -7 },
    { month: 'May', amount: 1120000, percentage: 14 },
    { month: 'June', amount: 1350000, percentage: 25 },
  ];

  // Calculate categories
  const categoryMap = new Map<string, { amount: number; count: number }>();
  recentDonations.forEach((d) => {
    if (d.status === 'completed') {
      const existing = categoryMap.get(d.category) || { amount: 0, count: 0 };
      existing.amount += d.amount;
      existing.count += 1;
      categoryMap.set(d.category, existing);
    }
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: data.amount,
      percentage: 0, // Will be calculated below
    }))
    .sort((a, b) => b.amount - a.amount);

  const categoryTotal = categories.reduce((sum, c) => sum + c.amount, 0);
  categories.forEach((c) => {
    c.percentage = Math.round((c.amount / categoryTotal) * 100);
  });

  return {
    totalDonations,
    totalMembers: 250,
    activeDonors: topDonors.filter((d) => d.status === 'active').length,
    recentDonations: recentDonations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    topDonors,
    trends,
    categories,
    dailyDonations,
  };
}

/**
 * Format amount to BDT currency
 */
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Get days ago from a date
 */
export function getDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
