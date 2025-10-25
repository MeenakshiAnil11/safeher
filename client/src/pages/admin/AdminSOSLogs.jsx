import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import "./admin.css"; // optional: keep your table and form styles

export default function AdminSOSLogs() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await api.get(`/admin/sos?${params.toString()}`);
    setLogs(res.data.logs);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/sos/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      alert("Error updating status");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    window.open(`/api/admin/sos/export?${params.toString()}`, "_blank");
  };

  return (
    <AdminLayout pageTitle="SOS Logs">
      <div className="admin-page">
        <div className="admin-page-header">
          <div className="admin-controls">
            <select
              className="admin-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="handled">Handled</option>
              <option value="closed">Closed</option>
            </select>
            <input
              className="admin-input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              className="admin-input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <button className="admin-btn primary" onClick={load}>
              Filter
            </button>
            <button className="admin-btn ghost" onClick={exportCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className={l.status !== "closed" ? "unresolved" : ""}>
                  <td>{l._id}</td>
                  <td>{l.user?.name}</td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>
                    {l.address ||
                      (l.coords ? `${l.coords.lat}, ${l.coords.lng}` : "N/A")}
                  </td>
                  <td>{l.status}</td>
                  <td>
                    {l.status === "open" && (
                      <button
                        className="admin-btn small"
                        onClick={() => updateStatus(l._id, "handled")}
                      >
                        Handle
                      </button>
                    )}
                    {l.status === "handled" && (
                      <button
                        className="admin-btn small"
                        onClick={() => updateStatus(l._id, "closed")}
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
