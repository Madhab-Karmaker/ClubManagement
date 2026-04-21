import React from 'react';

interface DonationFiltersProps {
  dateRange: '7d' | '30d' | 'custom';
  setDateRange: (range: '7d' | '30d' | 'custom') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'amount' | 'recent';
  setSortBy: (sort: 'amount' | 'recent') => void;
  customDateStart: string;
  setCustomDateStart: (date: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (date: string) => void;
}

const DonationFilters: React.FC<DonationFiltersProps> = ({
  dateRange,
  setDateRange,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  customDateStart,
  setCustomDateStart,
  customDateEnd,
  setCustomDateEnd,
}) => {
  return (
    <div className="donation-filters-section">
      <div className="donation-filters-header">
        <h3>Filters & Controls</h3>
      </div>

      <div className="donation-filters">
        {/* Search */}
        <div className="donation-filter-group">
          <label>Search by Donor Name</label>
          <div className="donation-search-wrapper">
            <input
              type="text"
              placeholder="Search donor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="donation-search-input"
            />
            <span className="donation-search-icon">🔍</span>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="donation-filter-group">
          <label>Date Range</label>
          <div className="donation-date-buttons">
            <button
              className={`donation-date-btn ${dateRange === '7d' ? 'active' : ''}`}
              onClick={() => setDateRange('7d')}
            >
              Last 7 Days
            </button>
            <button
              className={`donation-date-btn ${dateRange === '30d' ? 'active' : ''}`}
              onClick={() => setDateRange('30d')}
            >
              Last 30 Days
            </button>
            <button
              className={`donation-date-btn ${dateRange === 'custom' ? 'active' : ''}`}
              onClick={() => setDateRange('custom')}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="donation-filter-group donation-filter-group--custom-dates">
            <label>From</label>
            <input
              type="date"
              value={customDateStart}
              onChange={(e) => setCustomDateStart(e.target.value)}
              className="form-input"
            />
            <label>To</label>
            <input
              type="date"
              value={customDateEnd}
              onChange={(e) => setCustomDateEnd(e.target.value)}
              className="form-input"
            />
          </div>
        )}

        {/* Sort By */}
        <div className="donation-filter-group">
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'amount' | 'recent')}
            className="form-input donation-select"
          >
            <option value="recent">Most Recent</option>
            <option value="amount">Highest Amount</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DonationFilters;
