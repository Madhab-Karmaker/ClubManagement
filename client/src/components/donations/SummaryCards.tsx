import React from 'react';
import { formatBDT } from '../../services/donation.service.ts';

interface SummaryCardProps {
  icon: string;
  label: string;
  value: number | string;
  trend?: number; // percentage trend
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, trend, color }) => {
  return (
    <div className={`donation-summary-card donation-summary-card--${color}`}>
      <div className="donation-summary-card__header">
        <div className="donation-summary-card__icon">{icon}</div>
        <div className="donation-summary-card__trend">
          {trend && (
            <>
              <span className={`trend-badge ${trend > 0 ? 'trend-positive' : 'trend-negative'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            </>
          )}
        </div>
      </div>
      <div className="donation-summary-card__content">
        <h3 className="donation-summary-card__value">{value}</h3>
        <p className="donation-summary-card__label">{label}</p>
      </div>
    </div>
  );
};

interface SummaryCardsProps {
  stats: {
    totalDonations: number;
    totalMembers: number;
    activeDonors: number;
    donationsThisMonth: number;
    trends: { month: string; percentage: number }[];
  };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const getTrendValue = (monthIndex: number) => {
    if (stats.trends[monthIndex]) {
      return stats.trends[monthIndex].percentage;
    }
    return 0;
  };

  return (
    <div className="donation-summary-cards">
      <SummaryCard
        icon="💰"
        label="Total Donations"
        value={formatBDT(stats.totalDonations)}
        trend={getTrendValue(stats.trends.length - 1)}
        color="green"
      />
      <SummaryCard
        icon="👥"
        label="Total Members"
        value={stats.totalMembers}
        trend={5}
        color="blue"
      />
      <SummaryCard
        icon="⭐"
        label="Active Donors"
        value={stats.activeDonors}
        trend={8}
        color="purple"
      />
      <SummaryCard
        icon="📅"
        label="This Month"
        value={formatBDT(stats.donationsThisMonth)}
        trend={getTrendValue(stats.trends.length - 1)}
        color="orange"
      />
    </div>
  );
};

export default SummaryCards;
