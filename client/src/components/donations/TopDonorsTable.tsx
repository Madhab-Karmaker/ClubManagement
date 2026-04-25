import React, { useState, useMemo } from 'react';
import { type DonationRecord } from '../../types/donation.types.ts';
import { formatBDT, getDaysAgo } from '../../services/donation.service';

interface TopDonorsTableProps {
  donations: DonationRecord[];
}

const TopDonorsTable: React.FC<TopDonorsTableProps> = ({ donations }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Aggregate donations by donor
  const aggregatedDonors = useMemo(() => {
    const donorMap = new Map<string, { record: DonationRecord; totalAmount: number; count: number }>();

    donations.forEach((d) => {
      const existing = donorMap.get(d.donorId);
      if (existing) {
        existing.totalAmount += d.amount;
        existing.count += 1;
      } else {
        donorMap.set(d.donorId, {
          record: d,
          totalAmount: d.amount,
          count: 1,
        });
      }
    });

    return Array.from(donorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [donations]);

  // Pagination
  const totalPages = Math.ceil(aggregatedDonors.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedDonors = aggregatedDonors.slice(startIdx, endIdx);

  const handleViewProfile = (donorId: string) => {
    // In a real app, this would open a modal or navigate to donor profile
    alert(`View profile for donor: ${donorId}`);
  };

  if (donations.length === 0) {
    return (
      <div className="donation-empty-state">
        <div className="donation-empty-icon">📭</div>
        <h3>No Donations Found</h3>
        <p>No donations match the current filters</p>
      </div>
    );
  }

  return (
    <div className="donation-table-section">
      <h2 className="donation-section-title">💎 Top Donors</h2>

      <div className="donation-table-wrapper">
        <table className="donation-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Email</th>
              <th>Total Donation</th>
              <th>Donations Count</th>
              <th>Last Donation</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDonors.map((donor, _idx) => (
              <tr key={donor.record.donorId} className="donation-table-row">
                <td>
                  <div className="donation-donor-cell">
                    <div className="donation-donor-avatar">
                      {donor.record.donorName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="donation-donor-info">
                      <p className="donation-donor-name">{donor.record.donorName}</p>
                      <p className="donation-donor-phone">{donor.record.donorPhone}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="donation-email">{donor.record.donorEmail}</span>
                </td>
                <td>
                  <span className="donation-amount">{formatBDT(donor.totalAmount)}</span>
                </td>
                <td>
                  <span className="donation-count">{donor.count} times</span>
                </td>
                <td>
                  <span className="donation-date">{getDaysAgo(donor.record.date)}</span>
                </td>
                <td>
                  <span className={`donation-status donation-status--${donor.record.status}`}>
                    {donor.record.status.charAt(0).toUpperCase() + donor.record.status.slice(1)}
                  </span>
                </td>
                <td>
                  <button
                    className="donation-action-btn"
                    onClick={() => handleViewProfile(donor.record.donorId)}
                    title="View Profile"
                  >
                    👁️ View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="donation-pagination">
          <button
            className="donation-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="donation-pagination-info">
            Page <span>{currentPage}</span> of <span>{totalPages}</span> ({aggregatedDonors.length} total)
          </div>

          <button
            className="donation-pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default TopDonorsTable;
