import React, { useEffect, useState, useCallback, useRef } from "react";
import memberService from "../../services/member.service";
import type {
  MemberResponse,
  MemberQueryParams,
  CreateMemberPayload,
  UpdateMemberPayload,
} from "../../services/member.service";
import roleService from "../../services/role.service";

const PAGE_SIZE = 10;

/* ─── API error extractor ────────────────────────────────────── */
type AxiosLike = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

function extractApiError(err: unknown, fallback: string): string {
  const e = err as AxiosLike;
  if (!e?.response) return "Network error — check your connection.";
  const { status, data } = e.response;
  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403)
    return "You don't have permission to perform this action. Admin or Manager role required.";
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.message === "string" && d.message) return d.message;
    // ASP.NET ValidationProblemDetails
    if (d.errors && typeof d.errors === "object") {
      const msgs = Object.values(d.errors as Record<string, string[]>)
        .flat()
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join(" ");
    }
    if (typeof d.title === "string" && d.title) return d.title;
  }
  return fallback;
}

/* ─── Feedback Banner ────────────────────────────────────────── */
const FeedbackBanner: React.FC<{
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}> = ({ message, type, onDismiss }) => (
  <div className={`feedback-banner feedback-banner--${type}`} role="alert">
    <span>{message}</span>
    <button className="feedback-banner__close" onClick={onDismiss} aria-label="Dismiss">✕</button>
  </div>
);

/* ─── Member Avatar ──────────────────────────────────────────── */
const MemberAvatar: React.FC<{ member: MemberResponse; size?: number }> = ({
  member,
  size = 32,
}) => {
  const [imgError, setImgError] = useState(false);
  if (member.profilePhotoUrl && !imgError) {
    return (
      <img
        src={member.profilePhotoUrl}
        alt={member.fullName}
        className="member-avatar member-avatar--photo"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  const initials =
    (member.firstName.charAt(0) + member.lastName.charAt(0)).toUpperCase();
  return (
    <div
      className="member-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
};

/* ─── Status Badge ───────────────────────────────────────────── */
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span
    className={`member-status-badge member-status-badge--${
      isActive ? "active" : "inactive"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

/* ─── Form types ─────────────────────────────────────────────── */
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
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  isActive: true,
  roles: ["Member"],
});

const memberToForm = (m: MemberResponse): MemberFormData => ({
  username: m.username ?? "",
  password: "",
  firstName: m.firstName,
  lastName: m.lastName,
  email: m.email,
  phoneNumber: m.phoneNumber,
  address: m.address ?? "",
  profilePhotoUrl: m.profilePhotoUrl ?? "",
  joinDate: m.joinDate.slice(0, 10),
  expiryDate: m.expiryDate.slice(0, 10),
  isActive: m.isActive,
  roles: [...m.roles],
});

/* ─── Member Modal (Add / Edit / View) ───────────────────────── */
interface ModalProps {
  mode: "add" | "edit" | "view";
  member?: MemberResponse;
  onClose: () => void;
  onSave: (data: MemberFormData) => Promise<void>;
  saving: boolean;
  availableRoles: string[];
}

const MemberModal: React.FC<ModalProps> = ({
  mode,
  member,
  onClose,
  onSave,
  saving,
  availableRoles,
}) => {
  const [form, setForm] = useState<MemberFormData>(
    mode === "add" ? emptyForm() : memberToForm(member!)
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof MemberFormData, string>>
  >({});

  const set =
    (field: keyof MemberFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const toggleRole = (role: string) =>
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof MemberFormData, string>> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email format.";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required.";
    if (mode === "add") {
      if (!form.username.trim()) e.username = "Username is required.";
      if (!form.password.trim()) e.password = "Password is required.";
      else if (form.password.length < 6)
        e.password = "Password must be at least 6 characters.";
    }
    if (!form.joinDate) e.joinDate = "Join date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  const isView = mode === "view";
  const title =
    mode === "add"
      ? "Add New Member"
      : mode === "edit"
      ? "Edit Member"
      : "Member Profile";

  return (
    <div
      className="mm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mm-modal">
        <div className="mm-modal__header">
          <h2 className="mm-modal__title">{title}</h2>
          <button
            className="mm-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {isView ? (
          /* ── View Profile ─────────────────────────────────────── */
          <div className="mm-profile">
            <div className="mm-profile__header">
              <MemberAvatar member={member!} size={72} />
              <div>
                <h3 className="mm-profile__name">{member!.fullName}</h3>
                <p className="mm-profile__username">
                  @{member!.username ?? "—"}
                </p>
                <StatusBadge isActive={member!.isActive} />
              </div>
            </div>
            <dl className="mm-profile__info">
              <div>
                <dt>Member ID</dt>
                <dd>#{member!.memberId}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{member!.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{member!.phoneNumber}</dd>
              </div>
              <div>
                <dt>Join Date</dt>
                <dd>{new Date(member!.joinDate).toLocaleDateString()}</dd>
              </div>
              {member!.address && (
                <div className="mm-profile__info-full">
                  <dt>Address</dt>
                  <dd>{member!.address}</dd>
                </div>
              )}
              <div>
                <dt>Expiry Date</dt>
                <dd>{new Date(member!.expiryDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>
                  <div className="member-roles">
                    {member!.roles.length > 0 ? (
                      member!.roles.map((r) => (
                        <span key={r} className="role-badge">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="roles-empty-cell">—</span>
                    )}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          /* ── Add / Edit Form ──────────────────────────────────── */
          <form className="mm-form" onSubmit={handleSubmit} noValidate>
            <div className="mm-form__grid">
              {mode === "add" && (
                <>
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      className={`form-input${
                        errors.username ? " form-input--error" : ""
                      }`}
                      value={form.username}
                      onChange={set("username")}
                      placeholder="johndoe"
                    />
                    {errors.username && (
                      <span className="form-error">{errors.username}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      className={`form-input${
                        errors.password ? " form-input--error" : ""
                      }`}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="Min. 6 characters"
                    />
                    {errors.password && (
                      <span className="form-error">{errors.password}</span>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label>First Name *</label>
                <input
                  className={`form-input${
                    errors.firstName ? " form-input--error" : ""
                  }`}
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="John"
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  className={`form-input${
                    errors.lastName ? " form-input--error" : ""
                  }`}
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className={`form-input${
                    errors.email ? " form-input--error" : ""
                  }`}
                  value={form.email}
                  onChange={set("email")}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <span className="form-error">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  className={`form-input${
                    errors.phoneNumber ? " form-input--error" : ""
                  }`}
                  value={form.phoneNumber}
                  onChange={set("phoneNumber")}
                  placeholder="+1 555 000 0000"
                />
                {errors.phoneNumber && (
                  <span className="form-error">{errors.phoneNumber}</span>
                )}
              </div>

              <div className="form-group form-group--full">
                <label>Address</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div className="form-group form-group--full">
                <label>Profile Photo URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={form.profilePhotoUrl}
                  onChange={set("profilePhotoUrl")}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="form-group">
                <label>Join Date *</label>
                <input
                  type="date"
                  className={`form-input${
                    errors.joinDate ? " form-input--error" : ""
                  }`}
                  value={form.joinDate}
                  onChange={set("joinDate")}
                />
                {errors.joinDate && (
                  <span className="form-error">{errors.joinDate}</span>
                )}
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.expiryDate}
                  onChange={set("expiryDate")}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-input"
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: e.target.value === "active",
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group form-group--full">
                <label>Roles</label>
                <div className="mm-roles-checkboxes">
                  {availableRoles.map((role) => (
                    <label key={role} className="mm-role-checkbox">
                      <input
                        type="checkbox"
                        checked={form.roles.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mm-form__footer">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : mode === "add"
                  ? "Add Member"
                  : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "Admin",
    "Manager",
    "Member",
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  type ModalState =
    | { mode: "add" }
    | { mode: "edit" | "view"; member: MemberResponse }
    | null;
  const [modal, setModal] = useState<ModalState>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Debounce search */
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  /* Reset to page 1 when filters change */
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  /* Fetch roles for checkboxes/dropdowns */
  useEffect(() => {
    roleService
      .getAll()
      .then((res) => {
        const names = res.data.map((r) => r.name).filter(Boolean);
        if (names.length > 0) setAvailableRoles(names);
      })
      .catch(() => {});
  }, []);

  /* Load members */
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

  /* Save (add or edit) */
  const handleSave = async (formData: MemberFormData) => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        const payload: CreateMemberPayload = {
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address || undefined,
          profilePhotoUrl: formData.profilePhotoUrl || undefined,
          joinDate: formData.joinDate,
          expiryDate: formData.expiryDate,
          isActive: formData.isActive,
          roles: formData.roles,
        };
        await memberService.create(payload);
        setFeedback({ message: "Member added successfully.", type: "success" });
      } else if (modal?.mode === "edit") {
        const payload: UpdateMemberPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address || undefined,
          profilePhotoUrl: formData.profilePhotoUrl || undefined,
          expiryDate: formData.expiryDate || undefined,
          isActive: formData.isActive,
          roles: formData.roles,
        };
        await memberService.update(modal.member.memberId, payload);
        setFeedback({
          message: "Member updated successfully.",
          type: "success",
        });
      }
      setModal(null);
      await loadMembers();
    } catch (err: unknown) {
      setFeedback({ message: extractApiError(err, "Failed to save member."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  /* Delete */
  const handleDelete = async (member: MemberResponse) => {
    if (
      !confirm(
        `Delete "${member.fullName}"? The associated account will also be deactivated.`
      )
    )
      return;
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

  const activeCount = members.filter((m) => m.isActive).length;
  const inactiveCount = members.filter((m) => !m.isActive).length;

  return (
    <div className="members-page">
      {feedback && (
        <FeedbackBanner
          message={feedback.message}
          type={feedback.type}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Header */}
      <div className="mm-header">
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Member Management</h1>
          <p>Add, edit, manage roles, and track member status.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setModal({ mode: "add" })}
        >
          + Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="mm-stats">
        <div className="mm-stat-card">
          <span className="mm-stat-card__value">{totalCount}</span>
          <span className="mm-stat-card__label">Total</span>
        </div>
        <div className="mm-stat-card mm-stat-card--active">
          <span className="mm-stat-card__value">{activeCount}</span>
          <span className="mm-stat-card__label">Active</span>
        </div>
        <div className="mm-stat-card mm-stat-card--inactive">
          <span className="mm-stat-card__value">{inactiveCount}</span>
          <span className="mm-stat-card__label">Inactive</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mm-filters">
        <input
          className="form-input mm-search"
          placeholder="🔍  Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input mm-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="form-input mm-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "" | "true" | "false")
          }
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="roles-loading">Loading members…</p>
      ) : members.length === 0 ? (
        <div className="mm-empty">
          <div className="mm-empty__icon">👥</div>
          <p>No members found matching your filters.</p>
        </div>
      ) : (
        <div className="members-table-wrapper">
          <table className="roles-table members-table mm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Contact</th>
                <th className="mm-col-address">Address</th>
                <th>Join Date</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.memberId}>
                  <td className="roles-table__id">{m.memberId}</td>
                  <td>
                    <div className="member-name-cell">
                      <MemberAvatar member={m} />
                      <div>
                        <div className="mm-member-name">{m.fullName}</div>
                        <div className="mm-member-username">
                          @{m.username ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="mm-contact">
                      <span>{m.email}</span>
                      <span className="mm-phone">{m.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="mm-col-address">
                    <span className="mm-address">{m.address || "—"}</span>
                  </td>
                  <td>{new Date(m.joinDate).toLocaleDateString()}</td>
                  <td>
                    <div className="member-roles">
                      {m.roles.length > 0 ? (
                        m.roles.map((r) => (
                          <span key={r} className="role-badge">
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="roles-empty-cell">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge isActive={m.isActive} />
                  </td>
                  <td>
                    <div className="mm-actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        title="View profile"
                        onClick={() => setModal({ mode: "view", member: m })}
                      >
                        👁
                      </button>
                      <button
                        className="btn btn--secondary btn--sm"
                        title="Edit member"
                        onClick={() => setModal({ mode: "edit", member: m })}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        title="Delete member"
                        disabled={deletingId === m.memberId}
                        onClick={() => handleDelete(m)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mm-pagination">
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="mm-pagination__info">
            Page {page} of {totalPages} &nbsp;·&nbsp; {totalCount} members
          </span>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <MemberModal
          mode={modal.mode}
          member={modal.mode !== "add" ? modal.member : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
          availableRoles={availableRoles}
        />
      )}
    </div>
  );
};

export default MembersPage;
