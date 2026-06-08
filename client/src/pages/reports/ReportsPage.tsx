import React, { useState } from "react";
import reportService, { type ReportDto } from "../../services/report.service";
import "./ReportsPage.css";

const ReportsPage: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<"donations" | "members">("donations");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      if (reportType === "donations") {
        await reportService.generateDonationReport({
          fromDate: dateFrom || undefined,
          toDate: dateTo || undefined,
        });
      } else {
        await reportService.generateMemberReport();
      }
      setMessage({ type: "success", text: `${reportType} report downloaded` });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Report generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rpt-page">
      <div className="rpt-header">
        <h1>Reports &amp; Exports</h1>
        <p>Generate reports and export data</p>
      </div>

      {message && (
        <div className={`rpt-message rpt-message--${message.type}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      <div className="rpt-card">
        <h2>Report Options</h2>

        <div className="rpt-type-group">
          <label>Report Type</label>
          <div className="rpt-type-btns">
            <button className={`rpt-type-btn ${reportType === "donations" ? "active" : ""}`} onClick={() => setReportType("donations")}>
              Donation Report
            </button>
            <button className={`rpt-type-btn ${reportType === "members" ? "active" : ""}`} onClick={() => setReportType("members")}>
              Member Report
            </button>
          </div>
        </div>

        {reportType === "donations" && (
          <div className="rpt-date-range">
            <div className="form-group">
              <label>From Date</label>
              <input className="form-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input className="form-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        )}

        <div className="rpt-actions">
          <button className="rpt-btn rpt-btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate & Download"}
          </button>
        </div>
      </div>

      <div className="rpt-card">
        <h2>Saved Reports</h2>
        <SavedReportsList />
      </div>
    </div>
  );
};

const SavedReportsList: React.FC = () => {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    reportService
      .getSavedReports()
      .then((res) => setReports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="rpt-loading-text">Loading saved reports...</p>;

  if (reports.length === 0) {
    return <p className="rpt-empty-text">No saved reports yet.</p>;
  }

  return (
    <div className="rpt-saved-list">
      {reports.map((r) => (
        <div key={r.savedReportId} className="rpt-saved-item">
          <div className="rpt-saved-info">
            <span className="rpt-saved-title">{r.reportName}</span>
            <span className="rpt-saved-date">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          <span className={`rpt-saved-type ${r.reportType.toLowerCase()}`}>
            {r.reportType}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ReportsPage;
