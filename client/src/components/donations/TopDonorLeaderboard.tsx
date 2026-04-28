import React from 'react';
import { type DonorProfile } from '../../types/donation.types.ts';
import { formatBDT, formatDate } from '../../services/donation.service.ts';

interface TopDonorLeaderboardProps {
  donors: DonorProfile[];
}

const TopDonorLeaderboard: React.FC<TopDonorLeaderboardProps> = ({ donors }) => {
  const getLeaderboardBadge = (rank: number) => {
    const badges = ['🥇', '🥈', '🥉'];
    return badges[rank - 1] || '⭐';
  };

  const getRankColor = (rank: number): 'gold' | 'silver' | 'bronze' | 'default' => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'default';
  };

  return (
    <div className="donation-leaderboard-section">
      <h2 className="donation-section-title">🏆 Top Donor Leaderboard</h2>

      <div className="donation-leaderboard">
        {donors.slice(0, 10).map((donor, idx) => (
          <div
            key={donor.id}
            className={`donation-leaderboard-item donation-leaderboard-rank-${getRankColor(idx + 1)}`}
          >
            {/* Rank Badge */}
            <div className="donation-leaderboard-rank">
              <span className="donation-leaderboard-badge">{getLeaderboardBadge(idx + 1)}</span>
              <span className="donation-leaderboard-rank-num">#{idx + 1}</span>
            </div>

            {/* Donor Info */}
            <div className="donation-leaderboard-info">
              <div className="donation-leaderboard-header">
                <div className="donation-leaderboard-donor">
                  <img
                    src={donor.profileImage}
                    alt={donor.name}
                    className="donation-leaderboard-avatar"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="donation-leaderboard-donor-fallback">
                    {donor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="donation-leaderboard-text">
                    <h4 className="donation-leaderboard-name">{donor.name}</h4>
                    <p className="donation-leaderboard-email">{donor.email}</p>
                  </div>
                </div>
                <span className={`donation-leaderboard-status donation-leaderboard-status--${donor.status}`}>
                  {donor.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                </span>
              </div>

              <div className="donation-leaderboard-stats">
                <div className="donation-leaderboard-stat">
                  <span className="donation-leaderboard-stat-label">Total Donations</span>
                  <span className="donation-leaderboard-stat-value">{formatBDT(donor.totalDonation)}</span>
                </div>
                <div className="donation-leaderboard-stat">
                  <span className="donation-leaderboard-stat-label">Count</span>
                  <span className="donation-leaderboard-stat-value">{donor.donationCount}</span>
                </div>
                <div className="donation-leaderboard-stat">
                  <span className="donation-leaderboard-stat-label">Last Donation</span>
                  <span className="donation-leaderboard-stat-value">{formatDate(donor.lastDonation)}</span>
                </div>
                <div className="donation-leaderboard-stat">
                  <span className="donation-leaderboard-stat-label">Member Since</span>
                  <span className="donation-leaderboard-stat-value">{formatDate(donor.joinDate)}</span>
                </div>
              </div>

              {/* Progress bar for top 3 */}
              {idx < 3 && (
                <div className="donation-leaderboard-progress">
                  <div className="donation-leaderboard-progress-bar">
                    <div
                      className="donation-leaderboard-progress-fill"
                      style={{
                        width: `${(donor.totalDonation / (donors[0]?.totalDonation || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="donation-leaderboard-action">
              <button className="donation-leaderboard-btn" title="View Profile">
                👁️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDonorLeaderboard;
