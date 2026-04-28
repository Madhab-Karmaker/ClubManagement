import React from 'react';
import { type DonationRecord } from '../../types/donation.types.ts';
import { formatBDT, getDaysAgo } from '../../services/donation.service.ts';

interface RecentDonationsFeedProps {
  donations: DonationRecord[];
}

const RecentDonationsFeed: React.FC<RecentDonationsFeedProps> = ({ donations }) => {
  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[\s_-]+/g, '');

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      general: '🎁',
      event: '🎉',
      cause: '❤️',
      project: '🏗️',
    };
    return icons[normalizeKey(category)] || '💰';
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      cash: '💵',
      online: '💳',
      cheque: '📄',
      banktransfer: '🏦',
    };
    return icons[normalizeKey(method)] || '💰';
  };

  if (donations.length === 0) {
    return (
      <div className="donation-feed-section">
        <h2 className="donation-section-title">📢 Recent Donations Feed</h2>
        <div className="donation-empty-state donation-empty-state--compact">
          <div className="donation-empty-icon">📭</div>
          <p>No recent donations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-feed-section">
      <h2 className="donation-section-title">📢 Recent Donations Feed</h2>

      <div className="donation-feed">
        {donations.map((donation, idx) => (
          <div key={donation.id} className={`donation-feed-item ${donation.status === 'completed' ? 'completed' : 'pending'}`}>
            {/* Timeline dot */}
            <div className="donation-feed-timeline">
              <div className="donation-feed-dot" />
              {idx !== donations.length - 1 && <div className="donation-feed-line" />}
            </div>

            {/* Feed content */}
            <div className="donation-feed-content">
              <div className="donation-feed-header">
                <div className="donation-feed-donor">
                  <div className="donation-feed-avatar">
                    {donation.donorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="donation-feed-details">
                    <h4 className="donation-feed-donor-name">{donation.donorName}</h4>
                    <p className="donation-feed-timestamp">{getDaysAgo(donation.date)}</p>
                  </div>
                </div>
                <div className="donation-feed-amount">{formatBDT(donation.amount)}</div>
              </div>

              <div className="donation-feed-meta">
                <span className="donation-feed-badge donation-feed-category">
                  {getCategoryIcon(donation.category)} {donation.category}
                </span>
                <span className="donation-feed-badge donation-feed-method">
                  {getPaymentMethodIcon(donation.paymentMethod)} {donation.paymentMethod}
                </span>
                <span className={`donation-feed-badge donation-feed-status donation-feed-status--${donation.status}`}>
                  {donation.status === 'completed' ? '✓' : '⏳'} {donation.status}
                </span>
              </div>

              {donation.notes && (
                <p className="donation-feed-notes">💬 {donation.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {donations.length > 0 && (
        <div className="donation-feed-footer">
          <button className="donation-view-all-btn">View All Donations →</button>
        </div>
      )}
    </div>
  );
};

export default RecentDonationsFeed;
