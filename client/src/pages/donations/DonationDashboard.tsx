import React, { useMemo, useState, useEffect } from 'react';
import SummaryCards from '../../components/donations/SummaryCards.tsx';
import TopDonorsTable from '../../components/donations/TopDonorsTable.tsx';
import TopDonorLeaderboard from '../../components/donations/TopDonorLeaderboard.tsx';
import DonationFilters from '../../components/donations/DonationFilters.tsx';
import AddDonationModal from '../../components/donations/AddDonationModal.tsx';
import { type DonationData, type DonationRecord, type DonorProfile } from '../../types/donation.types.ts';
import donationService, { type DonationResponseDto } from '../../services/donation.service.ts';
import donationCategoryService, { type DonationCategoryResponse } from '../../services/donationcategory.service.ts';
import paymentMethodService, { type PaymentMethodResponse } from '../../services/paymentmethod.service.ts';
import '../../assets/styles/donations.css';
import memberService from '../../services/member.service.ts';


const DonationDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'custom'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'recent'>('recent');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | ''>('');
  const [categoryOptions, setCategoryOptions] = useState<DonationCategoryResponse[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<PaymentMethodResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberOptions, setMemberOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [realDonations, setRealDonations] = useState<DonationResponseDto[]>([]);

  const loadDonations = () => {
    donationService
      .getAll({ pageSize: 1000 })
      .then(({ data }) => setRealDonations(data.items || []))
      .catch(() => setRealDonations([]))
  };

  // Dynamically compute dashboard aggregates from live database donations
  const data = useMemo<DonationData>(() => {
    // 1. Map DTOs to DonationRecord format used by UI components
    const recentDonations: DonationRecord[] = realDonations.map((dto) => ({
      id: `DT-${String(dto.id).padStart(5, '0')}`,
      donorId: `DONOR-${String(dto.memberId).padStart(4, '0')}`,
      donorName: dto.memberFullName,
      donorEmail: `${dto.memberFullName.toLowerCase().replace(' ', '.')}@example.com`,
      donorPhone: `+8801700000000`, // fallback phone
      amount: dto.amount,
      date: dto.donationDate.split('T')[0],
      category: dto.categoryName,
      paymentMethod: dto.paymentMethod,
      status: 'completed',
      notes: dto.note || dto.referenceNumber || undefined,
    }));

    // 2. Calculate top donors list
    const donorMap = new Map<number, { name: string; totalAmount: number; lastDate: string; count: number }>();
    realDonations.forEach((d) => {
      const existing = donorMap.get(d.memberId) || { name: d.memberFullName, totalAmount: 0, lastDate: d.donationDate, count: 0 };
      existing.totalAmount += d.amount;
      existing.lastDate = new Date(existing.lastDate) > new Date(d.donationDate) ? existing.lastDate : d.donationDate;
      existing.count += 1;
      donorMap.set(d.memberId, existing);
    });

    const topDonors: DonorProfile[] = Array.from(donorMap.entries())
      .map(([id, dData]) => ({
        id: `DONOR-${String(id).padStart(4, '0')}`,
        name: dData.name,
        email: `${dData.name.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `+8801700000000`,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dData.name}`,
        totalDonation: dData.totalAmount,
        lastDonation: dData.lastDate.split('T')[0],
        status: 'active' as const,
        donationCount: dData.count,
        joinDate: dData.lastDate.split('T')[0],
      }))
      .sort((a, b) => b.totalDonation - a.totalDonation)
      .slice(0, 10);

    // 3. Calculate total donations
    const totalDonations = realDonations.reduce((sum, d) => sum + d.amount, 0);

    // 4. Calculate monthly trends
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyMap = new Map<string, number>();
    realDonations.forEach((d) => {
      const date = new Date(d.donationDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + d.amount);
    });

    const trends = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, amount], index, arr) => {
        const [year, monthIndex] = key.split('-');
        let percentage = 0;
        if (index > 0) {
          const prevAmount = arr[index - 1][1];
          percentage = prevAmount > 0 ? Math.round(((amount - prevAmount) / prevAmount) * 100) : 0;
        }
        return {
          month: `${monthNames[parseInt(monthIndex, 10) - 1]} ${year}`,
          amount,
          percentage,
        };
      });

    // 5. Calculate category breakdowns
    const categoryMap = new Map<string, number>();
    realDonations.forEach((d) => {
      categoryMap.set(d.categoryName, (categoryMap.get(d.categoryName) || 0) + d.amount);
    });

    const categories = Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: 0,
    }));
    const catTotal = categories.reduce((sum, c) => sum + c.amount, 0);
    categories.forEach((c) => {
      c.percentage = catTotal > 0 ? Math.round((c.amount / catTotal) * 100) : 0;
    });

    // 6. Calculate daily chart data
    const dailyMap = new Map<string, number>();
    realDonations.forEach((d) => {
      const dateStr = d.donationDate.split('T')[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + d.amount);
    });
    const dailyDonations = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));

    return {
      totalDonations,
      totalMembers: memberOptions.length || new Set(realDonations.map(d => d.memberId)).size,
      activeDonors: donorMap.size,
      recentDonations,
      topDonors,
      trends,
      categories,
      dailyDonations,
    };
  }, [realDonations, memberOptions]);

  useEffect(() => {
    donationCategoryService
      .getAll()
      .then(({ data }) => setCategoryOptions(data.filter((x) => x.isActive)))
      .catch(() => setCategoryOptions([]));

    paymentMethodService
      .getAll()
      .then(({ data }) => setPaymentMethodOptions(data.filter((x) => x.isActive)))
      .catch(() => setPaymentMethodOptions([]));

    memberService
      .getAll({ pageSize: 1000 })
      .then(({ data }) => setMemberOptions(data.items.map((m) => ({ id: m.memberId, name: m.fullName }))))
      .catch(() => setMemberOptions([]));

    loadDonations();
  }, []);

  const handleAddDonation = async (formData: {
    memberId: number;
    amount: number;
    categoryId: number;
    paymentMethodId: number;
    date: string;
    note?: string;
    referenceNumber?: string;
  }) => {
    try {
      await donationService.create({
        memberId: formData.memberId,
        amount: formData.amount,
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        donationDate: formData.date,
        note: formData.note,
        referenceNumber: formData.referenceNumber,
      });
      setIsModalOpen(false);
      loadDonations();
    } catch (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  };

  const normalizeLookupName = (value: string) =>
    value.toLowerCase().replace(/[\s_-]+/g, '');

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

    if (selectedCategoryId !== '') {
      const selectedCategory = categoryOptions.find((x) => x.id === selectedCategoryId);
      if (selectedCategory) {
        const selectedName = normalizeLookupName(selectedCategory.categoryName);
        filtered = filtered.filter((d) => normalizeLookupName(d.category) === selectedName);
      }
    }

    if (selectedPaymentMethodId !== '') {
      const selectedMethod = paymentMethodOptions.find((x) => x.id === selectedPaymentMethodId);
      if (selectedMethod) {
        const selectedName = normalizeLookupName(selectedMethod.name);
        filtered = filtered.filter((d) => normalizeLookupName(d.paymentMethod) === selectedName);
      }
    }

    // Sort
    if (sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  }, [
    dateRange,
    searchQuery,
    sortBy,
    customDateStart,
    customDateEnd,
    data.recentDonations,
    selectedCategoryId,
    selectedPaymentMethodId,
    categoryOptions,
    paymentMethodOptions,
  ]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>💰 Donation Dashboard</h2>
            <p>Monitor donation activities, manage donors, and analyze trends</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            + Add Donation
          </button>
        </div>
      </div>

      {/* Add Donation Modal */}
      <AddDonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDonation}
        memberOptions={memberOptions} // <-- Pass the loaded members list here
        categoryOptions={categoryOptions.map((x) => ({ id: x.id, name: x.categoryName }))}
        paymentMethodOptions={paymentMethodOptions.map((x) => ({ id: x.id, name: x.name }))}
      />

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
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedPaymentMethodId={selectedPaymentMethodId}
        setSelectedPaymentMethodId={setSelectedPaymentMethodId}
        categoryOptions={categoryOptions.map((x) => ({ id: x.id, name: x.categoryName }))}
        paymentMethodOptions={paymentMethodOptions.map((x) => ({ id: x.id, name: x.name }))}
      />

      {/* Top Donors Leaderboard */}
      <TopDonorLeaderboard donors={data.topDonors} />

      {/* Recent Donors Table */}
      <TopDonorsTable donations={filteredDonations} />
    </div>
  );
};

export default DonationDashboard;
