import React, { useEffect, useState } from "react";
import membershipService, {
  type MembershipFeeDto,
  type CreateMembershipFeeDto,
  type ExpiringMemberDto,
  type MembershipRenewalDto,
} from "../../services/membership.service";
import memberService from "../../services/member.service";
import "./MembershipPage.css";

const emptyFee: CreateMembershipFeeDto = {
  memberId: 0,
  amount: 0,
  dueDate: "",
  note: "",
};

const MembershipPage: React.FC = () => {
  const [tab, setTab] = useState<"pending" | "expiring" | "renewals">("pending");

  return (
    <div className="mp-page">
      <div className="mp-header">
        <div>
          <h1>Membership Management</h1>
          <p>Manage fees, renewals, and expiring memberships</p>
        </div>
      </div>

      <div className="mp-tabs">
        <button className={`mp-tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>Pending Fees</button>
        <button className={`mp-tab ${tab === "expiring" ? "active" : ""}`} onClick={() => setTab("expiring")}>Expiring Members</button>
        <button className={`mp-tab ${tab === "renewals" ? "active" : ""}`} onClick={() => setTab("renewals")}>Renewals</button>
      </div>

      {tab === "pending" && <PendingFeesSection />}
      {tab === "expiring" && <ExpiringSection />}
      {tab === "renewals" && <RenewalsSection />}
    </div>
  );
};

/* ── Pending Fees ─────────────────────────────────── */
const PendingFeesSection: React.FC = () => {
  const [fees, setFees] = useState<MembershipFeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateMembershipFeeDto>(emptyFee);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<{ memberId: number; name: string }[]>([]);

  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await membershipService.getPendingFees();
      setFees(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  const loadMembers = async () => {
    try {
      const res = await memberService.getAll({ pageSize: 200 });
      const items = res.data.items || res.data;
      setMembers(items.map((m: any) => ({ memberId: m.memberId || m.id, name: `${m.firstName} ${m.lastName}` })));
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await membershipService.createFee(form);
      setForm(emptyFee);
      setShowForm(false);
      await fetchFees();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create fee");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (feeId: number) => {
    const donationId = prompt("Enter donation ID to link:");
    if (!donationId || isNaN(Number(donationId))) return;
    try {
      await membershipService.markAsPaid(feeId, Number(donationId));
      await fetchFees();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to mark as paid");
    }
  };

  const handleDelete = async (feeId: number) => {
    if (!window.confirm("Delete this fee?")) return;
    try {
      await membershipService.deleteFee(feeId);
      await fetchFees();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete fee");
    }
  };

  const openCreateForm = () => {
    setForm(emptyFee);
    loadMembers();
    setShowForm(true);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  if (loading) {
    return <div className="mp-loading"><div className="spinner" /><p>Loading fees...</p></div>;
  }

  return (
    <>
      <div className="mp-toolbar">
        <p className="mp-count">{fees.length} pending fee{fees.length !== 1 ? "s" : ""}</p>
        <button className="mp-btn mp-btn-primary" onClick={openCreateForm}>+ Add Fee</button>
      </div>

      {error && (
        <div className="mp-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {fees.length === 0 ? (
        <div className="mp-empty">
          <span className="mp-empty-icon">✅</span>
          <h3>No pending fees</h3>
          <p>All member fees are paid up to date.</p>
        </div>
      ) : (
        <div className="mp-table-wrapper">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.membershipFeeId}>
                  <td><span className="mp-member-name">{fee.memberName}</span></td>
                  <td className="mp-amount">{formatCurrency(fee.amount)}</td>
                  <td className="mp-date">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="mp-note">{fee.note || "—"}</td>
                  <td>
                    <div className="mp-table-actions">
                      <button className="mp-btn-sm mp-btn-sm-success" onClick={() => handleMarkPaid(fee.membershipFeeId)} title="Mark as paid">✓ Pay</button>
                      <button className="mp-btn-sm mp-btn-sm-danger" onClick={() => handleDelete(fee.membershipFeeId)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Fee Modal */}
      {showForm && (
        <div className="mp-overlay" onClick={() => { if (!saving) setShowForm(false); }}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2>Add Fee</h2>
              <button className="mp-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className="mp-form" onSubmit={handleCreate}>
              <div className="mp-form-grid">
                <div className="form-group mp-form-full">
                  <label>Member *</label>
                  <select className="form-input" required value={form.memberId} onChange={(e) => setForm({ ...form, memberId: Number(e.target.value) })}>
                    <option value={0}>Select a member...</option>
                    {members.map((m) => (
                      <option key={m.memberId} value={m.memberId}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount ($) *</label>
                  <input className="form-input" type="number" required min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Due Date *</label>
                  <input className="form-input" type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-group mp-form-full">
                  <label>Note</label>
                  <input className="form-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving..." : "Add Fee"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Expiring Members ─────────────────────────────── */
const ExpiringSection: React.FC = () => {
  const [members, setMembers] = useState<ExpiringMemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membershipService.getExpiringMembers(30)
      .then((res) => setMembers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mp-loading"><div className="spinner" /><p>Loading...</p></div>;

  if (members.length === 0) {
    return (
      <div className="mp-empty">
        <span className="mp-empty-icon">✅</span>
        <h3>No expiring members</h3>
        <p>No memberships expiring within the next 30 days.</p>
      </div>
    );
  }

  return (
    <div className="mp-table-wrapper">
      <table className="mp-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Email</th>
            <th>Expiry Date</th>
            <th>Days Left</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.memberId}>
              <td><span className="mp-member-name">{m.fullName}</span></td>
              <td>{m.email}</td>
              <td className="mp-date">{new Date(m.expiryDate).toLocaleDateString()}</td>
              <td>
                <span className={`mp-days-badge ${m.daysUntilExpiry <= 7 ? "critical" : m.daysUntilExpiry <= 14 ? "warning" : "ok"}`}>
                  {m.daysUntilExpiry} days
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Renewals ─────────────────────────────────────── */
const RenewalsSection: React.FC = () => {
  const [renewals, setRenewals] = useState<MembershipRenewalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!memberId || isNaN(Number(memberId))) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await membershipService.getRenewalHistory(Number(memberId));
      setRenewals(res.data);
    } catch {
      setRenewals([]);
    } finally {
      setLoading(false);
    }
  };

  if (!searched) {
    return (
      <div className="mp-card">
        <p className="mp-card-text">Enter a Member ID to view renewal history.</p>
        <div className="mp-search-row">
          <input className="form-input" type="number" placeholder="Member ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
          <button className="mp-btn mp-btn-primary" onClick={handleSearch}>Search</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="mp-loading"><div className="spinner" /><p>Loading renewals...</p></div>;

  return (
    <div>
      <div className="mp-search-row" style={{ marginBottom: "1rem" }}>
        <input className="form-input" type="number" placeholder="Member ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
        <button className="mp-btn mp-btn-primary" onClick={handleSearch}>Search</button>
      </div>

      {renewals.length === 0 ? (
        <div className="mp-empty">
          <span className="mp-empty-icon">🔄</span>
          <h3>No renewals found</h3>
          <p>No renewal history for this member.</p>
        </div>
      ) : (
        <div className="mp-table-wrapper">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Previous Expiry</th>
                <th>New Expiry</th>
                <th>Fee Paid</th>
                <th>Note</th>
                <th>Renewed At</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((r) => (
                <tr key={r.membershipRenewalId}>
                  <td><span className="mp-member-name">{r.memberName}</span></td>
                  <td className="mp-date">{new Date(r.previousExpiryDate).toLocaleDateString()}</td>
                  <td className="mp-date">{new Date(r.newExpiryDate).toLocaleDateString()}</td>
                  <td className="mp-amount">{r.feePaid != null ? `$${r.feePaid.toFixed(2)}` : "—"}</td>
                  <td className="mp-note">{r.note || "—"}</td>
                  <td className="mp-date">{new Date(r.renewedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
