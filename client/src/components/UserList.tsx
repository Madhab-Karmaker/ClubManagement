/**
 * EXAMPLE: Using the auto-generated Swagger client
 *
 * This component is a reference showing the two ways to call the API:
 *   A) Via your hand-written service layer  (services/user.service.ts)
 *   B) Via the auto-generated Swagger client (api/generated/)         ← recommended after generation
 *
 * Run `npm run swagger:sync` once to populate src/api/generated/, then
 * swap the import below from approach A to approach B.
 */
import React, { useEffect, useState } from "react";

// ─── Approach A: hand-written service (works right now) ──────────────────────
import userService, { UserResponse } from "../services/user.service";

// ─── Approach B: generated client (uncomment after running swagger:sync) ──────
// import { UserService }    from "../api/generated";
// import type { UserResponseDto } from "../api/generated";   // type matches your C# DTO exactly

// ─────────────────────────────────────────────────────────────────────────────

const UserList: React.FC = () => {
  const [users, setUsers]     = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // ── Approach A ──────────────────────────────────────────────────────
        const { data } = await userService.getAll();
        setUsers(data);

        // ── Approach B (generated) ──────────────────────────────────────────
        // const { data } = await UserService.getAllUsers({ query: { includeDeleted: false } });
        // setUsers(data ?? []);
        // ────────────────────────────────────────────────────────────────────
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading users…</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h3>Users ({users.length})</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={th}>Username</th>
            <th style={th}>Email</th>
            <th style={th}>Roles</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td style={td}>{u.username}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.roles?.join(", ") ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const th: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontWeight: 600,
  borderBottom: "2px solid #e5e7eb", fontSize: 13
};
const td: React.CSSProperties = {
  padding: "9px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13
};

export default UserList;
