import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import "./AdminDashboard.css"; // keep your table & dashboard styles

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const res = await api.get(`/admin/users?q=${encodeURIComponent(q)}`);
    setUsers(res.data.users);
  };

  useEffect(() => {
    load();
  }, []);

  const deactivate = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    await api.patch(`/admin/users/${id}/deactivate`);
    load();
  };

  const activate = async (id) => {
    await api.patch(`/admin/users/${id}/activate`);
    load();
  };

  const resetPwd = async (id) => {
    if (!window.confirm("Generate a temporary password?")) return;
    const res = await api.post(`/admin/users/${id}/reset-password`);
    alert(`Temporary password: ${res.data.tempPassword}`);
  };

  const changeRole = async (id, role) => {
    await api.patch(`/admin/users/${id}/role`, { role });
    load();
  };

  return (
    <AdminLayout pageTitle="Users">
      <div className="admin-dashboard">
        <h2>Users</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <input
            placeholder="Search name/email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={load}>Search</button>
        </div>

        <table border="1" cellPadding="5" style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </td>
                <td>{u.isActive ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => resetPwd(u._id)}>Reset PW</button>{" "}
                  {u.isActive ? (
                    <button onClick={() => deactivate(u._id)}>Deactivate</button>
                  ) : (
                    <button onClick={() => activate(u._id)}>Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
