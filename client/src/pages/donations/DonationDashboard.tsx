import React, { useState, useMemo } from 'react';
import SummaryCards from '../../components/donations/SummaryCards.tsx';
import DonationAnalytics from '../../components/donations/DonationAnalytics.tsx';
import RecentDonationsFeed from '../../components/donations/RecentDonationsFeed.tsx';
import TopDonorsTable from '../../components/donations/TopDonorsTable.tsx';
import TopDonorLeaderboard from '../../components/donations/TopDonorLeaderboard.tsx';
import DonationFilters from '../../components/donations/DonationFilters.tsx';
import { type DonationData } from '../../types/donation.types.ts';
import { getDummyDonationData } from '../../services/donation.service.ts';
import '../../assets/styles/donations.css';

const DonationDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'custom'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'recent'>('recent');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');

  // Get dummy data
  const data: DonationData = getDummyDonationData();

  // Filter donations based on date range
  const filteredDonations = useMemo(() => {
    let filtered = data.recentDonations;
    const now = new Date();
    let startDate = new Date();

    if (dateRange === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (dateRange === 'custom') {
      if (customDateStart) {
        startDate = new Date(customDateStart);
      }
    }

    filtered = filtered.filter(
      (d) => new Date(d.date) >= startDate && (customDateEnd ? new Date(d.date) <= new Date(customDateEnd) : true)
    );

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((d) =>
        d.donorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  }, [dateRange, searchQuery, sortBy, customDateStart, customDateEnd, data.recentDonations]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

    const totalThisMonth = data.recentDonations
      .filter((d) => new Date(d.date) >= monthStart)
      .reduce((sum, d) => sum + d.amount, 0);

    const activeDonors = new Set(filteredDonations.map((d) => d.donorId)).size;

    return {
      totalDonations: data.totalDonations,
      totalMembers: data.totalMembers,
      activeDonors,
      donationsThisMonth: totalThisMonth,
      trends: data.trends,
    };
  }, [data, filteredDonations]);

  return (
    <div className="donation-dashboard">
      {/* Welcome Section */}
      <div className="page-welcome">
        <h2>💰 Donation Dashboard</h2>
        <p>Monitor donation activities, manage donors, and analyze trends</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={summaryStats} />

      {/* Filters Section */}
      <DonationFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        customDateStart={customDateStart}
        setCustomDateStart={setCustomDateStart}
        customDateEnd={customDateEnd}
        setCustomDateEnd={setCustomDateEnd}
      />

      {/* Analytics Section */}
      <DonationAnalytics data={data} filteredDonations={filteredDonations} dateRange={dateRange} />

      {/* Top Donors Leaderboard */}
      <TopDonorLeaderboard donors={data.topDonors} />

      {/* Recent Donors Table */}
      <TopDonorsTable donations={filteredDonations} />

      {/* Recent Feed */}
      <RecentDonationsFeed donations={filteredDonations.slice(0, 10)} />
    </div>
  );
};

export default DonationDashboard;
