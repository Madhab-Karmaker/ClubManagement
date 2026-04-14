import React, { useEffect, useState, useCallback } from "react";
import roleService from "../../services/role.service";
import type { RoleResponse } from "../../services/role.service";

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

/* ─── Create Role Modal ─────────────────────────────────────── */

interface CreateRoleModalProps {
  onClose: () => void;
  onSave: (roleName: string) => Promise<void>;
  saving: boolean;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, onSave, saving }) => {
  const [roleName, setRoleName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = roleName.trim();
    if (!trimmed) return;
    await onSave(trimmed);
  };

  return (
    <div
      className="mm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mm-modal" style={{ maxWidth: "400px" }}>
        <div className="mm-modal__header">
          <h2 className="mm-modal__title">Create New Role</h2>
          <button
            className="mm-modal__close"
            onClick={onClose}
            aria-label="Close"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div className="form-group">
            <label htmlFor="roleName">Role Name</label>
            <input
              id="roleName"
              type="text"
              className="form-input"
              placeholder="e.g. Admin, Manager, Member"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              autoFocus
              disabled={saving}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create Role"}
            </button>
            <button
              className="btn btn--secondary"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Create role
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit role
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [updating, setUpdating] = useState(false);

  // Assign / Remove role from user
  const [assignUsername, setAssignUsername] = useState("");
  const [assignRoleName, setAssignRoleName] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [removeUsername, setRemoveUsername] = useState("");
  const [removeRoleName, setRemoveRoleName] = useState("");
  const [removing, setRemoving] = useState(false);

  /* ── Data loading ─────────────────────────────────────── */

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await roleService.getAll();
      setRoles(data);
    } catch {
      setFeedback({ message: "Failed to load roles.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type });
  };

  /* ── Handlers ─────────────────────────────────────────── */

  const handleCreateRole = async (roleName: string) => {
    setCreating(true);
    try {
      const { data } = await roleService.create({ roleName });
      showFeedback(data.message, "success");
      setShowCreateModal(false);
      await loadRoles();
    } catch (err: any) {
      const msg = err?.response?.data?.[0]?.description ?? "Failed to create role.";
      showFeedback(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (roleName: string) => {
    if (!confirm(`Delete role "${roleName}"? This cannot be undone.`)) return;
    try {
      const { data } = await roleService.delete(roleName);
      showFeedback(data.message, "success");
      await loadRoles();
    } catch (err: any) {
      const msg = err?.response?.data?.[0]?.description ?? "Failed to delete role.";
      showFeedback(msg, "error");
    }
  };

  const handleEditClick = (role: RoleResponse) => {
    setEditingRole(role);
    setEditRoleName(role.name);
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setEditRoleName("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    const trimmed = editRoleName.trim();
    if (!trimmed) return;
    setUpdating(true);
    try {
      const { data } = await roleService.update({
        roleId: editingRole.id,
        newRoleName: trimmed,
      });
      showFeedback(data.message, "success");
      setEditingRole(null);
      setEditRoleName("");
      await loadRoles();
    } catch (err: any) {
      const msg = err?.response?.data?.[0]?.description ?? "Failed to update role.";
      showFeedback(msg, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUsername.trim() || !assignRoleName.trim()) return;
    setAssigning(true);
    try {
      const { data } = await roleService.assign({
        username: assignUsername.trim(),
        roleName: assignRoleName.trim(),
      });
      showFeedback(data.message, "success");
      setAssignUsername("");
      setAssignRoleName("");
    } catch (err: any) {
      const msg = err?.response?.data?.[0]?.description ?? "Failed to assign role.";
      showFeedback(msg, "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveFromUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeUsername.trim() || !removeRoleName.trim()) return;
    setRemoving(true);
    try {
      const { data } = await roleService.removeFromUser({
        username: removeUsername.trim(),
        roleName: removeRoleName.trim(),
      });
      showFeedback(data.message, "success");
      setRemoveUsername("");
      setRemoveRoleName("");
    } catch (err: any) {
      const msg = err?.response?.data?.[0]?.description ?? "Failed to remove role.";
      showFeedback(msg, "error");
    } finally {
      setRemoving(false);
    }
  };

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div className="roles-page">
      {feedback && (
        <FeedbackBanner
          message={feedback.message}
          type={feedback.type}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* ── Roles list ───────────────────────────────────── */}
      <section className="roles-section">
        <div className="roles-section__header">
          <h2 className="roles-section__title">All Roles</h2>
          <button 
            className="btn btn--primary" 
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Add Role
          </button>
        </div>

        {loading ? (
          <p className="roles-loading">Loading roles…</p>
        ) : roles.length === 0 ? (
          <p className="roles-empty">No roles found. Create one below.</p>
        ) : (
          <table className="roles-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td className="roles-table__id">{role.id}</td>
                  <td>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => handleEditClick(role)}
                      style={{ marginRight: "8px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(role.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="roles-forms">
        {/* ── Edit role (shown when editing) ───────────────── */}
        {editingRole && (
          <section className="roles-section roles-section--card roles-section--highlight">
            <h2 className="roles-section__title">Edit Role</h2>
            <form className="roles-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="editRoleName">Role Name</label>
                <input
                  id="editRoleName"
                  type="text"
                  className="form-input"
                  placeholder="Enter new role name"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn--primary" type="submit" disabled={updating}>
                  {updating ? "Updating…" : "Update Role"}
                </button>
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── Assign role to user ─────────────────────────── */}
        <section className="roles-section roles-section--card">
          <h2 className="roles-section__title">Assign Role to User</h2>
          <form className="roles-form" onSubmit={handleAssign}>
            <div className="form-group">
              <label htmlFor="assignUsername">Username</label>
              <input
                id="assignUsername"
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={assignUsername}
                onChange={(e) => setAssignUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="assignRoleName">Role</label>
              <select
                id="assignRoleName"
                className="form-input"
                value={assignRoleName}
                onChange={(e) => setAssignRoleName(e.target.value)}
                required
              >
                <option value="">Select a role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn--primary" type="submit" disabled={assigning}>
              {assigning ? "Assigning…" : "Assign Role"}
            </button>
          </form>
        </section>

        {/* ── Remove role from user ───────────────────────── */}
        <section className="roles-section roles-section--card">
          <h2 className="roles-section__title">Remove Role from User</h2>
          <form className="roles-form" onSubmit={handleRemoveFromUser}>
            <div className="form-group">
              <label htmlFor="removeUsername">Username</label>
              <input
                id="removeUsername"
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={removeUsername}
                onChange={(e) => setRemoveUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="removeRoleName">Role</label>
              <select
                id="removeRoleName"
                className="form-input"
                value={removeRoleName}
                onChange={(e) => setRemoveRoleName(e.target.value)}
                required
              >
                <option value="">Select a role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn--danger" type="submit" disabled={removing}>
              {removing ? "Removing…" : "Remove Role"}
            </button>
          </form>
        </section>
      </div>

      {/* ── Create Role Modal ───────────────────────────────── */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateRole}
          saving={creating}
        />
      )}
    </div>
  );
};

export default RolesPage;
