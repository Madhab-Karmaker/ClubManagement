import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dashboardService, { type DashboardSummary, type MonthlyTrend, type TopDonor, type CategoryBreakdown } from "../../services/dashboard.service";
import "./DashboardPage.css";

const DashboardPage: React.FC = () => {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardService.getSummary(),
      dashboardService.getTopDonors(5),
    ])
      .then(([summaryRes, donorsRes]) => {
        setSummary(summaryRes.data);
        setTopDonors(donorsRes.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <span className="error-icon">⚠️</span>
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("en-US").format(val);

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-greeting">Welcome back, {username} 👋</h1>
          <p className="dash-subtitle">Here&apos;s what&apos;s happening with your club today.</p>
        </div>
        <div className="dash-header-right">
          <button className="dash-btn dash-btn-primary" onClick={() => navigate("/donations")}>
            + New Donation
          </button>
          <button className="dash-btn dash-btn-secondary" onClick={() => navigate("/members")}>
            + Add Member
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-revenue" onClick={() => navigate("/donations")}>
          <div className="kpi-top">
            <span className="kpi-label">Total Donations</span>
            <span className="kpi-icon">💰</span>
          </div>
          <span className="kpi-value">{formatCurrency(summary?.totalDonations ?? 0)}</span>
          <span className="kpi-footer">
            {formatCurrency(summary?.donationsThisMonth ?? 0)} this month
          </span>
        </div>
        <div className="kpi-card kpi-members" onClick={() => navigate("/members")}>
          <div className="kpi-top">
            <span className="kpi-label">Total Members</span>
            <span className="kpi-icon">👥</span>
          </div>
          <span className="kpi-value">{formatNumber(summary?.totalMembers ?? 0)}</span>
          <span className="kpi-footer">{summary?.activeMembers ?? 0} active · {summary?.expiringMembers ?? 0} expiring</span>
        </div>
        <div className="kpi-card kpi-donors" onClick={() => navigate("/donations")}>
          <div className="kpi-top">
            <span className="kpi-label">Active Donors</span>
            <span className="kpi-icon">🎯</span>
          </div>
          <span className="kpi-value">{formatNumber(summary?.activeDonors ?? 0)}</span>
          <span className="kpi-footer">{summary?.donationsThisMonthCount ?? 0} donations this month</span>
        </div>
        <div className="kpi-card kpi-events" onClick={() => navigate("/events")}>
          <div className="kpi-top">
            <span className="kpi-label">Pending / Events</span>
            <span className="kpi-icon">📅</span>
          </div>
          <span className="kpi-value">{summary?.pendingDonationsCount ?? 0} / {summary?.upcomingEventsCount ?? 0}</span>
          <span className="kpi-footer">Pending donations / Upcoming events</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <h3>Monthly Trends</h3>
            <span className="chart-badge">Last 6 months</span>
          </div>
          <div className="chart-body">
            <TrendChart trends={summary?.monthlyTrends ?? []} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Top Donors</h3>
            <span className="chart-badge">Top 5</span>
          </div>
          <div className="chart-body">
            <TopDonorsList donors={topDonors} />
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="section-card">
        <div className="section-card-header">
          <h3>Recent Donations</h3>
          <button className="dash-btn dash-btn-ghost" onClick={() => navigate("/donations")}>
            View All →
          </button>
        </div>
        <div className="table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentDonations?.slice(0, 8).map((d) => (
                <tr key={d.donationId}>
                  <td>
                    <div className="td-donor">
                      <span className="td-avatar">{d.memberName.charAt(0)}</span>
                      <span>{d.memberName}</span>
                    </div>
                  </td>
                  <td className="td-amount">{formatCurrency(d.amount)}</td>
                  <td><span className="badge badge-cat">{d.category}</span></td>
                  <td>{d.paymentMethod}</td>
                  <td><span className={`badge badge-status badge-${d.status.toLowerCase()}`}>{d.status}</span></td>
                  <td className="td-date">{new Date(d.donationDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!summary?.recentDonations || summary.recentDonations.length === 0) && (
                <tr><td colSpan={6} className="td-empty">No donations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TrendChart: React.FC<{ trends: MonthlyTrend[] }> = ({ trends }) => {
  if (!trends.length) return <div className="chart-empty">No trend data available</div>;
  const max = Math.max(...trends.map(t => t.amount));
  return (
    <div className="bar-chart">
      {trends.map((t, i) => (
        <div key={i} className="bar-item">
          <span className="bar-value">${(t.amount / 1000).toFixed(0)}k</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(t.amount / max) * 100}%` }}
            />
          </div>
          <span className="bar-label">
            {t.month.split("-")[1] || t.month.slice(0, 3)}
          </span>
          <span className={`bar-change ${t.percentageChange >= 0 ? "up" : "down"}`}>
            {t.percentageChange >= 0 ? "▲" : "▼"} {Math.abs(t.percentageChange)}%
          </span>
        </div>
      ))}
    </div>
  );
};

const TopDonorsList: React.FC<{ donors: TopDonor[] }> = ({ donors }) => {
  const max = donors.length > 0 ? Math.max(...donors.map(d => d.totalDonation)) : 0;
  return (
    <div className="top-donor-list">
      {donors.map((d, i) => (
        <div key={d.memberId} className="top-donor-item">
          <span className="top-donor-rank">#{i + 1}</span>
          <div className="top-donor-info">
            <span className="top-donor-name">{d.name}</span>
            <span className="top-donor-count">{d.donationCount} donations</span>
          </div>
          <div className="top-donor-bar-track">
            <div className="top-donor-bar-fill" style={{ width: `${(d.totalDonation / max) * 100}%` }} />
          </div>
          <span className="top-donor-amount">${d.totalDonation.toLocaleString()}</span>
        </div>
      ))}
      {donors.length === 0 && <div className="chart-empty">No donor data</div>}
    </div>
  );
};

export default DashboardPage;
