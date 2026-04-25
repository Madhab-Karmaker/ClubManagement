import React, { useEffect, useState, useCallback, useRef } from "react";
import paymentMethodService from "../../services/paymentmethod.service";
import type {
  PaymentMethodResponse,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
} from "../../services/paymentmethod.service";

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
    return "You don't have permission to perform this action. Admin role required.";
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.message === "string" && d.message) return d.message;
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
interface PaymentMethodFormData {
  name: string;
  description: string;
  isActive: boolean;
}

const emptyForm = (): PaymentMethodFormData => ({
  name: "",
  description: "",
  isActive: true,
});

const methodToForm = (m: PaymentMethodResponse): PaymentMethodFormData => ({
  name: m.name,
  description: m.description,
  isActive: m.isActive,
});

/* ─── Payment Method Modal (Add / Edit / View) ───────────────── */
interface ModalProps {
  mode: "add" | "edit" | "view";
  method?: PaymentMethodResponse;
  onClose: () => void;
  onSave: (data: PaymentMethodFormData) => Promise<void>;
  saving: boolean;
}

const PaymentMethodModal: React.FC<ModalProps> = ({
  mode,
  method,
  onClose,
  onSave,
  saving,
}) => {
  const [form, setForm] = useState<PaymentMethodFormData>(
    mode === "add" ? emptyForm() : methodToForm(method!)
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentMethodFormData, string>>
  >({});

  const set =
    (field: keyof PaymentMethodFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof PaymentMethodFormData, string>> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  const isView = mode === "view";
  const title =
    mode === "add"
      ? "Add New Payment Method"
      : mode === "edit"
      ? "Edit Payment Method"
      : "Payment Method Details";

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
          /* ── View Details ─────────────────────────────────────── */
          <div className="mm-profile">
            <dl className="mm-profile__info">
              <div>
                <dt>Payment Method ID</dt>
                <dd>#{method!.id}</dd>
              </div>
              <div>
                <dt>Name</dt>
                <dd>{method!.name}</dd>
              </div>
              <div className="mm-profile__info-full">
                <dt>Description</dt>
                <dd>{method!.description}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge isActive={method!.isActive} />
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          /* ── Add / Edit Form ──────────────────────────────────── */
          <form className="mm-form" onSubmit={handleSubmit} noValidate>
            <div className="mm-form__grid">
              <div className="form-group form-group--full">
                <label>Name *</label>
                <input
                  className={`form-input${
                    errors.name ? " form-input--error" : ""
                  }`}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g., Cash, Bank Transfer, Credit Card"
                />
                {errors.name && (
                  <span className="form-error">{errors.name}</span>
                )}
              </div>

              <div className="form-group form-group--full">
                <label>Description *</label>
                <textarea
                  className={`form-input${
                    errors.description ? " form-input--error" : ""
                  }`}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Brief description of this payment method"
                  rows={3}
                />
                {errors.description && (
                  <span className="form-error">{errors.description}</span>
                )}
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
                  ? "Add Payment Method"
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
const PaymentMethodsPage: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  type ModalState =
    | { mode: "add" }
    | { mode: "edit" | "view"; method: PaymentMethodResponse }
    | null;
  const [modal, setModal] = useState<ModalState>(null);

  /* Load payment methods */
  const loadMethods = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paymentMethodService.getAll();
      setMethods(data);
    } catch {
      setFeedback({
        message: "Failed to load payment methods.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  /* Save (add or edit) */
  const handleSave = async (formData: PaymentMethodFormData) => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        const payload: CreatePaymentMethodPayload = {
          name: formData.name,
          description: formData.description,
        };
        await paymentMethodService.create(payload);
        setFeedback({
          message: "Payment method added successfully.",
          type: "success",
        });
      } else if (modal?.mode === "edit") {
        const payload: UpdatePaymentMethodPayload = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        };
        await paymentMethodService.update(modal.method.id, payload);
        setFeedback({
          message: "Payment method updated successfully.",
          type: "success",
        });
      }
      setModal(null);
      await loadMethods();
    } catch (err: unknown) {
      setFeedback({
        message: extractApiError(err, "Failed to save payment method."),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* Delete */
  const handleDelete = async (method: PaymentMethodResponse) => {
    if (!confirm(`Delete "${method.name}" payment method?`)) return;
    setDeletingId(method.id);
    try {
      await paymentMethodService.delete(method.id);
      setFeedback({
        message: "Payment method deleted successfully.",
        type: "success",
      });
      await loadMethods();
    } catch (err: unknown) {
      setFeedback({
        message: extractApiError(err, "Failed to delete payment method."),
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = methods.filter((m) => m.isActive).length;
  const inactiveCount = methods.filter((m) => !m.isActive).length;

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
          <h1>Payment Methods</h1>
          <p>Manage available payment methods for donations.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => setModal({ mode: "add" })}
        >
          + Add Payment Method
        </button>
      </div>

      {/* Stats */}
      <div className="mm-stats">
        <div className="mm-stat-card">
          <span className="mm-stat-card__value">{methods.length}</span>
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

      {/* Table */}
      {loading ? (
        <p className="roles-loading">Loading payment methods…</p>
      ) : methods.length === 0 ? (
        <div className="mm-empty">
          <div className="mm-empty__icon">💳</div>
          <p>No payment methods found. Create one to get started.</p>
        </div>
      ) : (
        <div className="members-table-wrapper">
          <table className="roles-table members-table mm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id}>
                  <td className="roles-table__id">{m.id}</td>
                  <td className="mm-method-name">{m.name}</td>
                  <td className="mm-method-desc">{m.description}</td>
                  <td>
                    <StatusBadge isActive={m.isActive} />
                  </td>
                  <td>
                    <div className="mm-actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        title="View details"
                        onClick={() => setModal({ mode: "view", method: m })}
                      >
                        👁
                      </button>
                      <button
                        className="btn btn--secondary btn--sm"
                        title="Edit method"
                        onClick={() => setModal({ mode: "edit", method: m })}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        title="Delete method"
                        disabled={deletingId === m.id}
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

      {/* Modal */}
      {modal && (
        <PaymentMethodModal
          mode={modal.mode}
          method={modal.mode !== "add" ? modal.method : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
};

export default PaymentMethodsPage;
