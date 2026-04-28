import React, { useMemo } from 'react';
import { type DonationRecord, type DonationData } from '../../types/donation.types.ts';
import { formatBDT } from '../../services/donation.service.ts';

interface DonationAnalyticsProps {
  data: DonationData;
  filteredDonations: DonationRecord[];
  dateRange: '7d' | '30d' | 'custom';
}

/**
 * Simple Line Chart Component
 * Shows donation trends over time
 */
const LineChart: React.FC<{ data: Array<{ date: string; amount: number }> }> = ({ data }) => {
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const minAmount = 0;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((d.amount - minAmount) / (maxAmount - minAmount)) * chartHeight;
    return { x, y, amount: d.amount };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Y-axis labels
  const yLabels = [0, Math.floor(maxAmount / 3), Math.floor((maxAmount * 2) / 3), maxAmount];

  return (
    <div className="donation-chart-wrapper">
      <svg width={width} height={height} className="donation-chart-svg">
        {/* Grid lines */}
        {yLabels.map((label, i) => {
          const y = padding + chartHeight - (i / (yLabels.length - 1)) * chartHeight;
          return (
            <g key={`gridline-${i}`}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text
                x={padding - 10}
                y={y + 4}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                {formatBDT(label)}
              </text>
            </g>
          );
        })}

        {/* Gradient area under line */}
        <defs>
          <linearGradient id="lineChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight}`}
          fill="url(#lineChartGradient)"
        />

        {/* Line */}
        <path d={pathD} stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={p.y} r="4" fill="#059669" opacity="0.8" />
        ))}

        {/* X-axis */}
        <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#9ca3af" strokeWidth="1" />
      </svg>
    </div>
  );
};

/**
 * Bar Chart Component
 * Shows donation amounts by category or top donors
 */
const BarChart: React.FC<{ data: Array<{ label: string; value: number }> }> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="donation-bar-chart">
      <div className="donation-bar-chart-bars">
        {data.map((item, i) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={`bar-${i}`} className="donation-bar-item">
              <div className="donation-bar-container">
                <div
                  className="donation-bar"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: [
                      '#10b981',
                      '#3b82f6',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                      '#ec4899',
                    ][i % 6],
                  }}
                >
                  <span className="donation-bar-value">{formatBDT(item.value)}</span>
                </div>
              </div>
              <p className="donation-bar-label">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Pie Chart Component
 * Shows category distribution
 */
const PieChart: React.FC<{ data: Array<{ name: string; percentage: number; amount: number }> }> = ({ data }) => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const size = 200;
  const radius = size / 2 - 20;

  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, i) => {
    const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = size / 2 + radius * Math.cos(startAngle);
    const y1 = size / 2 + radius * Math.sin(startAngle);
    const x2 = size / 2 + radius * Math.cos(endAngle);
    const y2 = size / 2 + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${size / 2} ${size / 2}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return { pathData, color: colors[i % colors.length], item };
  });

  return (
    <div className="donation-pie-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, i) => (
          <path key={`slice-${i}`} d={slice.pathData} fill={slice.color} opacity="0.8" />
        ))}
      </svg>
      <div className="donation-pie-legend">
        {data.map((item, i) => (
          <div key={`legend-${i}`} className="donation-pie-legend-item">
            <span
              className="donation-pie-legend-color"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <div className="donation-pie-legend-text">
              <p className="donation-pie-legend-name">{item.name}</p>
              <p className="donation-pie-legend-value">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DonationAnalytics: React.FC<DonationAnalyticsProps> = ({ data, filteredDonations }) => {
  // Get last 10 days of data for line chart
  const last10Days = useMemo(() => {
    return data.dailyDonations.slice(-10);
  }, [data.dailyDonations]);

  // Get top 5 categories for bar chart
  const topCategories = useMemo(() => {
    return data.categories.slice(0, 5).map((c) => ({
      label: c.name,
      value: c.amount,
    }));
  }, [data.categories]);

  // Get top 5 donors for bar chart
  const topDonorsBar = useMemo(() => {
    return filteredDonations
      .reduce(
        (acc, d) => {
          const existing = acc.find((a) => a.donorId === d.donorId);
          if (existing) {
            existing.amount += d.amount;
          } else {
            acc.push({
              donorId: d.donorId,
              donorName: d.donorName,
              amount: d.amount,
            });
          }
          return acc;
        },
        [] as Array<{ donorId: string; donorName: string; amount: number }>
      )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((d) => ({
        label: d.donorName.split(' ')[0], // First name only for space
        value: d.amount,
      }));
  }, [filteredDonations]);

  return (
    <div className="donation-analytics-section">
      <h2 className="donation-section-title">📊 Donation Analytics</h2>

      <div className="donation-analytics-grid">
        {/* Line Chart - Donations Over Time */}
        <div className="donation-chart-card">
          <h3 className="donation-chart-title">Donations Over Time (Last 10 Days)</h3>
          <LineChart data={last10Days} />
        </div>

        {/* Bar Chart - Top Donors */}
        <div className="donation-chart-card">
          <h3 className="donation-chart-title">Top 5 Donors (Current Period)</h3>
          {topDonorsBar.length > 0 ? (
            <BarChart data={topDonorsBar} />
          ) : (
            <p className="donation-chart-empty">No donation data available</p>
          )}
        </div>

        {/* Pie Chart - Categories */}
        <div className="donation-chart-card donation-chart-card--pie">
          <h3 className="donation-chart-title">Donation Categories Distribution</h3>
          <PieChart data={data.categories} />
        </div>

        {/* Bar Chart - Categories */}
        <div className="donation-chart-card">
          <h3 className="donation-chart-title">Donations by Category</h3>
          <BarChart data={topCategories} />
        </div>
      </div>
    </div>
  );
};

export default DonationAnalytics;
