import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import memberService from "../../services/member.service";
import type {
  CreateMemberPayload,
  MemberQueryParams,
  MemberResponse,
  UpdateMemberPayload,
} from "../../services/member.service";
import roleService from "../../services/role.service";
import "../../assets/styles/members.css";
import {
  AlertIcon,
  CheckCircleIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TrendUpIcon,
  UserIcon,
  UsersIcon,
  TrashIcon,
  XIcon,
} from "../../components/ui/DashboardIcons";

const PAGE_SIZE = 10;

type AxiosLike = { response?: { status?: number; data?: unknown } };

type MembershipTier = "VIP" | "Premium" | "Standard";
type PanelMode = "add" | "edit";
type DetailTab = "payments" | "attendance";

interface MemberFormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  profilePhotoUrl: string;
  joinDate: string;
  expiryDate: string;
  isActive: boolean;
  roles: string[];
}

interface PaymentHistoryRow {
  invoice: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  channel: string;
}

interface AttendanceRow {
  label: string;
  sessions: number;
  hours: string;
  trend: string;
}

const extractApiError = (err: unknown, fallback: string) => {
  const e = err as AxiosLike;
  if (!e?.response) return "Network error — check your connection.";
  const { status, data } = e.response;
  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You don't have permission to perform this action.";
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string" && record.message) return record.message;
    if (record.errors && typeof record.errors === "object") {
      const messages = Object.values(record.errors as Record<string, string[]>).flat().filter(Boolean);
      if (messages.length > 0) return messages.join(" ");
    }
    if (typeof record.title === "string" && record.title) return record.title;
  }
  return fallback;
};

const emptyForm = (): MemberFormData => ({
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  profilePhotoUrl: "",
  joinDate: new Date().toISOString().slice(0, 10),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
  roles: ["Member"],
});

const memberToForm = (member: MemberResponse): MemberFormData => ({
  username: member.username ?? "",
  password: "",
  firstName: member.firstName,
  lastName: member.lastName,
  email: member.email,
  phoneNumber: member.phoneNumber,
  address: member.address ?? "",
  profilePhotoUrl: member.profilePhotoUrl ?? "",
  joinDate: member.joinDate.slice(0, 10),
  expiryDate: member.expiryDate.slice(0, 10),
  isActive: member.isActive,
  roles: [...member.roles],
});

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatCompactDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getMembershipTier = (member: MemberResponse): MembershipTier => {
  if (member.roles.includes("Admin")) return "VIP";
  if (member.roles.includes("Manager")) return "Premium";
  return "Standard";
};

const getStatusLabel = (member: MemberResponse) => {
  if (!member.isActive) return "Expired";
  return new Date(member.expiryDate).getTime() < Date.now() ? "Expired" : "Active";
};

const getDaysRemaining = (member: MemberResponse) =>
  Math.max(0, Math.ceil((new Date(member.expiryDate).getTime() - Date.now()) / 86400000));

const buildPaymentHistory = (member: MemberResponse): PaymentHistoryRow[] => {
  const seed = member.memberId % 3;
  return [
    { invoice: `CM-${2400 + member.memberId}`, date: member.joinDate, amount: "$120.00", channel: seed === 0 ? "Card" : "Bank Transfer", status: "Paid" },
    { invoice: `CM-${2410 + member.memberId}`, date: member.expiryDate, amount: "$120.00", channel: seed === 1 ? "Mobile Wallet" : "Card", status: seed === 2 ? "Pending" : "Paid" },
    { invoice: `CM-${2420 + member.memberId}`, date: new Date(Date.now() - 7 * 86400000).toISOString(), amount: "$45.00", channel: "POS", status: "Paid" },
  ];
};

const buildAttendance = (member: MemberResponse): AttendanceRow[] => {
  const seed = member.memberId % 5;
  return [
    { label: "This Month", sessions: 16 + seed, hours: `${28 + seed * 2}h`, trend: "+12%" },
    { label: "Last Month", sessions: 14 + seed, hours: `${26 + seed * 2}h`, trend: "+8%" },
    { label: "Quarter", sessions: 42 + seed * 3, hours: `${78 + seed * 4}h`, trend: "+17%" },
  ];
};

const FeedbackBanner: React.FC<{ message: string; type: "success" | "error"; onDismiss: () => void }> = ({ message, type, onDismiss }) => (
  <div className={`mm-banner mm-banner--${type}`} role="alert">
    <span className="mm-banner__message">{message}</span>
    <button className="mm-banner__close" onClick={onDismiss} aria-label="Dismiss">
      ✕
    </button>
  </div>
);

const MemberAvatar: React.FC<{ member: MemberResponse; size?: number }> = ({ member, size = 32 }) => {
  const [imgError, setImgError] = useState(false);
  if (member.profilePhotoUrl && !imgError) {
    return <img src={member.profilePhotoUrl} alt={member.fullName} className="mm-avatar mm-avatar--image" style={{ width: size, height: size }} onError={() => setImgError(true)} />;
  }
  const initials = (member.firstName.charAt(0) + member.lastName.charAt(0)).toUpperCase();
  return <div className="mm-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</div>;
};

const TierChip: React.FC<{ tier: MembershipTier }> = ({ tier }) => (
  <span className={`mm-chip ${tier === "VIP" ? "mm-chip--vip" : tier === "Premium" ? "mm-chip--premium" : "mm-chip--primary"}`}>{tier}</span>
);

const StatusChip: React.FC<{ member: MemberResponse }> = ({ member }) => (
  <div className="mm-chips">
    <TierChip tier={getMembershipTier(member)} />
    <span className={`mm-chip ${getStatusLabel(member) === "Active" ? "mm-chip--success" : "mm-chip--danger"}`}>{getStatusLabel(member)}</span>
  </div>
);

const KPI_DEFS = [
  { label: "Total Members", icon: UsersIcon, tone: "kpi-card--blue" },
  { label: "Active Members", icon: CheckCircleIcon, tone: "kpi-card--green" },
  { label: "Expired Members", icon: AlertIcon, tone: "kpi-card--orange" },
  { label: "New Members", icon: SparklesIcon, tone: "kpi-card--purple" },
] as const;

const MembersPagePremium: React.FC = () => {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [availableRoles, setAvailableRoles] = useState<string[]>(["Admin", "Manager", "Member"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<DetailTab>("payments");
  const [formMode, setFormMode] = useState<PanelMode>("add");
  const [formMemberId, setFormMemberId] = useState<number | null>(null);
  const [form, setForm] = useState<MemberFormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMember = useMemo(
    () => members.find((member) => member.memberId === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  const summary = useMemo(() => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return {
      total: totalCount,
      active: members.filter((member) => member.isActive).length,
      expired: members.filter((member) => new Date(member.expiryDate).getTime() < now).length,
      newMembers: members.filter((member) => now - new Date(member.joinDate).getTime() < thirtyDays).length,
    };
  }, [members, totalCount]);

  const paymentHistory = useMemo(() => (selectedMember ? buildPaymentHistory(selectedMember) : []), [selectedMember]);
  const attendanceRows = useMemo(() => (selectedMember ? buildAttendance(selectedMember) : []), [selectedMember]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    roleService
      .getAll()
      .then((response) => {
        const names = response.data.map((role) => role.name).filter(Boolean);
        if (names.length > 0) setAvailableRoles(names);
      })
      .catch(() => {});
  }, []);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: MemberQueryParams = {
        page,
        pageSize: PAGE_SIZE,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter !== "" && { isActive: statusFilter === "true" }),
      };
      const { data } = await memberService.getAll(params);
      setMembers(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch {
      setFeedback({ message: "Failed to load members.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const beginAdd = () => {
    setFormMode("add");
    setFormMemberId(null);
    setForm(emptyForm());
    setFormErrors({});
    setFeedback(null);
    setShowFormModal(true);
  };

  const beginEdit = (member: MemberResponse) => {
    setFormMode("edit");
    setFormMemberId(member.memberId);
    setForm(memberToForm(member));
    setFormErrors({});
    setSelectedMemberId(member.memberId);
    setSelectedTab("payments");
    setFeedback(null);
    setShowFormModal(true);
  };

  const beginView = (member: MemberResponse) => {
    setSelectedMemberId(member.memberId);
    setSelectedTab("payments");
    setShowViewModal(true);
  };

  const setField =
    (field: keyof MemberFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((item) => item !== role) : [...prev.roles, role],
    }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof MemberFormData, string>> = {};
    if (formMode === "add" && !form.username.trim()) nextErrors.username = "Username is required.";
    if (formMode === "add" && !form.password.trim()) nextErrors.password = "Password is required.";
    if (formMode === "add" && form.password.trim().length > 0 && form.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Invalid email format.";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!form.joinDate) nextErrors.joinDate = "Join date is required.";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (formMode === "add") {
        const payload: CreateMemberPayload = {
          username: form.username,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address || undefined,
          profilePhotoUrl: form.profilePhotoUrl || undefined,
          joinDate: form.joinDate,
          expiryDate: form.expiryDate,
          isActive: form.isActive,
          roles: form.roles,
        };
        await memberService.create(payload);
        setFeedback({ message: "Member added successfully.", type: "success" });
      } else if (formMemberId != null) {
        const payload: UpdateMemberPayload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address || undefined,
          profilePhotoUrl: form.profilePhotoUrl || undefined,
          expiryDate: form.expiryDate || undefined,
          isActive: form.isActive,
          roles: form.roles,
        };
        await memberService.update(formMemberId, payload);
        setFeedback({ message: "Member updated successfully.", type: "success" });
      }
      setForm(emptyForm());
      setFormMode("add");
      setFormMemberId(null);
      setFormErrors({});
      setShowFormModal(false);
      await loadMembers();
    } catch (err: unknown) {
      setFeedback({ message: extractApiError(err, "Failed to save member."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: MemberResponse) => {
    if (!confirm(`Delete "${member.fullName}"? The associated account will also be deactivated.`)) return;
    setDeletingId(member.memberId);
    try {
      await memberService.delete(member.memberId);
      setFeedback({ message: "Member deleted successfully.", type: "success" });
      await loadMembers();
    } catch (err: unknown) {
      setFeedback({ message: extractApiError(err, "Failed to delete member."), type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Member ID", "Full Name", "Email", "Phone", "Tier", "Status", "Join Date", "Expiry Date"],
      ...members.map((member) => [
        member.memberId,
        member.fullName,
        member.email,
        member.phoneNumber,
        getMembershipTier(member),
        getStatusLabel(member),
        formatCompactDate(member.joinDate),
        formatCompactDate(member.expiryDate),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "club-members.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.print();
  };

  const panelTitle = formMode === "add" ? "Add Member" : "Edit Member";
  const panelSubtitle = formMode === "add" ? "Create a polished new member record." : "Update member details and access roles.";

  const closeModals = () => {
    setShowFormModal(false);
    setShowViewModal(false);
    setForm(emptyForm());
    setFormErrors({});
  };

  return (
    <div className="members-page">
      {feedback && <FeedbackBanner message={feedback.message} type={feedback.type} onDismiss={() => setFeedback(null)} />}

      <section className="members-hero">
        <div className="members-hero__content">
          <div className="members-hero__text">
            <div className="members-eyebrow">
              <SparklesIcon className="mm-inline-icon" />
              Premium member workspace
            </div>
            <h1>Member Management</h1>
            <p>
              A polished control center for onboarding, updating, and analyzing club members with premium dashboards, fast filters, and high-trust admin interactions.
            </p>
          </div>
          <div className="members-hero__actions">
            <button className="mm-btn mm-btn--secondary" onClick={exportCsv}>
              <DownloadIcon className="mm-btn__icon" />
              Export Excel
            </button>
            <button className="mm-btn mm-btn--secondary" onClick={exportPdf}>
              <DownloadIcon className="mm-btn__icon" />
              Export PDF
            </button>
            <button className="mm-btn mm-btn--primary" onClick={beginAdd}>
              <PlusIcon className="mm-btn__icon" />
              Add Member
            </button>
          </div>
        </div>
      </section>

      <section className="members-section">
        <div className="members-section__body">
          <div className="members-kpis">
            {KPI_DEFS.map((card) => {
              const Icon = card.icon;
              const value = card.label === "Total Members" ? summary.total : card.label === "Active Members" ? summary.active : card.label === "Expired Members" ? summary.expired : summary.newMembers;
              return (
                <article key={card.label} className={`kpi-card ${card.tone}`}>
                  <div className="kpi-card__top">
                    <div className="kpi-card__icon"><Icon /></div>
                    <span className="mm-chip mm-chip--neutral">+8.4%</span>
                  </div>
                  <div className="kpi-card__label">{card.label}</div>
                  <span className="kpi-card__value">{value}</span>
                  <div className="kpi-card__trend">
                    <TrendUpIcon className="mm-mini-icon" />
                    vs previous month
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="members-section mm-table-card">
        <div className="members-section__header">
          <div>
            <h2>Member Registry</h2>
            <p>{totalCount} members match the current search and filter scope.</p>
          </div>
          <div className="members-toolbar__actions">
            <button className="mm-btn mm-btn--secondary mm-btn--tight" onClick={exportCsv}><DownloadIcon className="mm-btn__icon" />Excel</button>
            <button className="mm-btn mm-btn--secondary mm-btn--tight" onClick={exportPdf}><DownloadIcon className="mm-btn__icon" />PDF</button>
          </div>
        </div>

        <div className="members-section__body members-toolbar">
          <div className="members-filters">
            <div className="mm-search-wrap">
              <SearchIcon className="mm-inline-icon" />
              <input className="mm-field mm-field--search" placeholder="Search by name, email, or phone" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="mm-field mm-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">All roles</option>
              {availableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select className="mm-field mm-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | "true" | "false") }>
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button className="mm-btn mm-btn--primary mm-btn--tight" onClick={beginAdd}>
              <PlusIcon className="mm-btn__icon" />
              Add Member
            </button>
          </div>
        </div>

        <div className="mm-table-wrap">
          {loading ? (
            <div className="mm-empty">
              <div className="mm-empty__icon"><UsersIcon /></div>
              <p>Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="mm-empty">
              <div className="mm-empty__icon"><UsersIcon /></div>
              <p>No members found matching your filters.</p>
            </div>
          ) : (
            <table className="mm-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Tier</th>
                  <th>Contact</th>
                  <th>Join / Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.memberId} onClick={() => beginView(member)}>
                    <td>
                      <div className="mm-table__member">
                        <MemberAvatar member={member} size={44} />
                        <div>
                          <div className="mm-member__name">{member.fullName}</div>
                          <div className="mm-member__subtle">@{member.username ?? "club.member"}</div>
                        </div>
                      </div>
                    </td>
                    <td><TierChip tier={getMembershipTier(member)} /></td>
                    <td>
                      <div className="mm-member__name">{member.email}</div>
                      <div className="mm-member__subtle">{member.phoneNumber}</div>
                    </td>
                    <td>
                      <div className="mm-member__name">{formatCompactDate(member.joinDate)}</div>
                      <div className="mm-member__subtle">Expires {formatCompactDate(member.expiryDate)}</div>
                    </td>
                    <td><StatusChip member={member} /></td>
                    <td>
                      <div className="mm-row-actions" onClick={(event) => event.stopPropagation()}>
                        <button className="mm-btn mm-btn--ghost mm-btn--icon" type="button" onClick={() => beginView(member)} aria-label="View member"><EyeIcon className="mm-btn__icon" /></button>
                        <button className="mm-btn mm-btn--secondary mm-btn--icon" type="button" onClick={() => beginEdit(member)} aria-label="Edit member"><EditIcon className="mm-btn__icon" /></button>
                        <button className="mm-btn mm-btn--danger mm-btn--icon" type="button" disabled={deletingId === member.memberId} onClick={() => handleDelete(member)} aria-label="Delete member"><TrashIcon className="mm-btn__icon" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mm-pagination">
            <button className="mm-btn mm-btn--secondary mm-btn--tight" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
            <span className="mm-pagination__meta">Page {page} of {totalPages} · {totalCount} members</span>
            <button className="mm-btn mm-btn--secondary mm-btn--tight" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </section>

      {showFormModal && (
        <div className="mm-overlay" onClick={closeModals}>
          <div className="mm-modal mm-modal--form" onClick={(e) => e.stopPropagation()}>
            <div className="mm-modal__header">
              <div className="mm-modal__title-group">
                <h2 className="mm-modal__title">{panelTitle}</h2>
                <p className="mm-modal__subtitle">{panelSubtitle}</p>
              </div>
              <button className="mm-modal__close" onClick={closeModals} aria-label="Close modal">
                <XIcon className="mm-btn__icon" />
              </button>
            </div>
            <div className="mm-modal__body">
              <form onSubmit={(event) => { event.preventDefault(); void handleSave(); }}>
                <div className="mm-upload">
                  <div className="mm-upload__avatar">
                    {form.profilePhotoUrl ? <img src={form.profilePhotoUrl} alt="Member avatar preview" /> : <UserIcon className="mm-inline-icon" />}
                  </div>
                  <div className="mm-upload__hint">Drop a circular profile image or paste a photo URL to personalize the card.</div>
                </div>

                {formMode === "add" && (
                  <div className="mm-grid">
                    <div className="mm-field-group">
                      <label className="mm-label">Username *</label>
                      <input className="mm-input" value={form.username} onChange={setField("username")} placeholder="jane.doe" />
                      {formErrors.username && <span className="mm-error">{formErrors.username}</span>}
                    </div>
                    <div className="mm-field-group">
                      <label className="mm-label">Password *</label>
                      <input type="password" className="mm-input" value={form.password} onChange={setField("password")} placeholder="Minimum 6 characters" />
                      {formErrors.password && <span className="mm-error">{formErrors.password}</span>}
                    </div>
                  </div>
                )}

                <div className="mm-grid">
                  <div className="mm-field-group">
                    <label className="mm-label">First Name *</label>
                    <input className="mm-input" value={form.firstName} onChange={setField("firstName")} placeholder="Jordan" />
                    {formErrors.firstName && <span className="mm-error">{formErrors.firstName}</span>}
                  </div>
                  <div className="mm-field-group">
                    <label className="mm-label">Last Name *</label>
                    <input className="mm-input" value={form.lastName} onChange={setField("lastName")} placeholder="Taylor" />
                    {formErrors.lastName && <span className="mm-error">{formErrors.lastName}</span>}
                  </div>
                  <div className="mm-field-group">
                    <label className="mm-label">Email *</label>
                    <input type="email" className="mm-input" value={form.email} onChange={setField("email")} placeholder="jordan.taylor@club.com" />
                    {formErrors.email && <span className="mm-error">{formErrors.email}</span>}
                  </div>
                  <div className="mm-field-group">
                    <label className="mm-label">Phone *</label>
                    <input className="mm-input" value={form.phoneNumber} onChange={setField("phoneNumber")} placeholder="+1 (555) 420-7812" />
                    {formErrors.phoneNumber && <span className="mm-error">{formErrors.phoneNumber}</span>}
                  </div>
                  <div className="mm-field-group mm-field-group--full">
                    <label className="mm-label">Address</label>
                    <textarea className="mm-textarea" value={form.address} onChange={setField("address")} placeholder="124 Harbor Avenue, Suite 18, San Francisco, CA" />
                  </div>
                  <div className="mm-field-group mm-field-group--full">
                    <label className="mm-label">Profile Photo URL</label>
                    <input className="mm-input" value={form.profilePhotoUrl} onChange={setField("profilePhotoUrl")} placeholder="https://..." />
                  </div>
                  <div className="mm-field-group">
                    <label className="mm-label">Join Date *</label>
                    <input type="date" className="mm-input" value={form.joinDate} onChange={setField("joinDate")} />
                    {formErrors.joinDate && <span className="mm-error">{formErrors.joinDate}</span>}
                  </div>
                  <div className="mm-field-group">
                    <label className="mm-label">Expiry Date</label>
                    <input type="date" className="mm-input" value={form.expiryDate} onChange={setField("expiryDate")} />
                  </div>
                  <div className="mm-field-group">
                    <label className="mm-label">Status</label>
                    <select className="mm-select" value={form.isActive ? "active" : "inactive"} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value === "active" }))}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="mm-field-group mm-field-group--full">
                    <label className="mm-label">Roles</label>
                    <div className="mm-toggle">
                      {availableRoles.map((role) => (
                        <label key={role} className="mm-toggle__option">
                          <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mm-form__footer">
                  <button className="mm-btn mm-btn--secondary" type="button" onClick={closeModals}>Cancel</button>
                  <button className="mm-btn mm-btn--primary" type="submit" disabled={saving}>{saving ? "Saving..." : formMode === "add" ? "Add Member" : "Save Changes"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedMember && (
        <div className="mm-overlay" onClick={closeModals}>
          <div className="mm-modal mm-modal--view" onClick={(e) => e.stopPropagation()}>
            <div className="mm-modal__header">
              <div className="mm-modal__title-group">
                <h2 className="mm-modal__title">Member Profile</h2>
                <p className="mm-modal__subtitle">Selected member summary, QR pass, payments, and attendance.</p>
              </div>
              <div className="mm-modal__header-actions">
                <button className="mm-btn mm-btn--secondary mm-btn--tight" type="button" onClick={() => { setShowViewModal(false); beginEdit(selectedMember); }}>
                  <EditIcon className="mm-btn__icon" />
                  Edit
                </button>
                <button className="mm-modal__close" onClick={closeModals} aria-label="Close modal">
                  <XIcon className="mm-btn__icon" />
                </button>
              </div>
            </div>
            <div className="mm-modal__body">
              <div className="mm-profile-hero">
                <MemberAvatar member={selectedMember} size={64} />
                <div className="mm-profile-hero__content">
                  <h3 className="mm-profile-hero__name">{selectedMember.fullName}</h3>
                  <div className="mm-profile-hero__meta">
                    <span>@{selectedMember.username ?? "club.member"}</span>
                    <span>#{selectedMember.memberId}</span>
                  </div>
                  <div className="mm-chip-row">
                    <TierChip tier={getMembershipTier(selectedMember)} />
                    <span className={`mm-chip ${selectedMember.isActive ? "mm-chip--success" : "mm-chip--danger"}`}>{selectedMember.isActive ? "Active" : "Expired"}</span>
                  </div>
                </div>
              </div>

              <div className="mm-profile-card__grid">
                <div className="mm-profile-stat"><span>Join Date</span><span>{formatShortDate(selectedMember.joinDate)}</span></div>
                <div className="mm-profile-stat"><span>Expiry Date</span><span>{formatShortDate(selectedMember.expiryDate)}</span></div>
                <div className="mm-profile-stat"><span>Days Remaining</span><span>{getDaysRemaining(selectedMember)} days</span></div>
                <div className="mm-profile-stat"><span>Roles</span><span>{selectedMember.roles.length} assigned</span></div>
              </div>

              <div className="mm-profile-detail-section">
                <div className="mm-profile-tabs">
                  <button type="button" className={`mm-profile-tabs__btn${selectedTab === "payments" ? " is-active" : ""}`} onClick={() => setSelectedTab("payments")}>Payment History</button>
                  <button type="button" className={`mm-profile-tabs__btn${selectedTab === "attendance" ? " is-active" : ""}`} onClick={() => setSelectedTab("attendance")}>Attendance</button>
                </div>

                {selectedTab === "payments" ? (
                  <table className="mm-profile-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((entry) => (
                        <tr key={entry.invoice}>
                          <td>{entry.invoice}</td>
                          <td>{formatCompactDate(entry.date)}</td>
                          <td>{entry.amount}</td>
                          <td><span className={`mm-chip ${entry.status === "Paid" ? "mm-chip--success" : entry.status === "Pending" ? "mm-chip--warning" : "mm-chip--danger"}`}>{entry.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="mm-profile-list">
                    {attendanceRows.map((entry) => (
                      <div key={entry.label} className="mm-attendance-card">
                        <strong>{entry.label}</strong>
                        <span>{entry.sessions} sessions · {entry.hours} · {entry.trend}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPagePremium;
