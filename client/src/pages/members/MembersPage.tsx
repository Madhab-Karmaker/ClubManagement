import React, { useEffect, useState, useCallback } from "react";
import userService from "../../services/user.service";
import type { UserResponse } from "../../services/user.service";

/* ─── Sub-components ─────────────────────────────────────── */

interface FeedbackBannerProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ message, type, onDismiss }) => (
  <div className={`feedback-banner feedback-banner--${type}`} role="alert">
    <span>{message}</span>
    <button className="feedback-banner__close" onClick={onDismiss} aria-label="Dismiss">
      ✕
    </button>
  </div>
);

/* ─── Main component ─────────────────────────────────────── */

const MembersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll(showDeleted);
      setUsers(data);
    } catch {
      setFeedback({ message: "Failed to load members.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (user: UserResponse) => {
    if (!confirm(`Remove member "${user.username}"? This action soft-deletes the account.`)) return;
    try {
      const { data } = await userService.remove(user.userId);
      setFeedback({ message: data.message, type: "success" });
      await loadUsers();
    } catch {
      setFeedback({ message: "Failed to remove member.", type: "error" });
    }
  };

  return (
    <div className="members-page">
      {feedback && (
        <FeedbackBanner
          message={feedback.message}
          type={feedback.type}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <div className="members-toolbar">
        <p className="members-count">
          {loading ? "Loading…" : `${users.length} member${users.length !== 1 ? "s" : ""}`}
        </p>
        <label className="members-toggle">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />
          Show deleted accounts
        </label>
      </div>

      {loading ? (
        <p className="roles-loading">Loading members…</p>
      ) : users.length === 0 ? (
        <p className="roles-empty">No members found.</p>
      ) : (
        <div className="members-table-wrapper">
          <table className="roles-table members-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>
                    <div className="member-name-cell">
                      <div className="member-avatar">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      {u.username}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <div className="member-roles">
                      {u.roles && u.roles.length > 0
                        ? u.roles.map((r) => (
                            <span key={r} className="role-badge">
                              {r}
                            </span>
                          ))
                        : <span className="roles-empty-cell">—</span>}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(u)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
