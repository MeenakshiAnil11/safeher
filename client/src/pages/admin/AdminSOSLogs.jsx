import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import "./admin.css"; // optional: keep your table and form styles

export default function AdminSOSLogs() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dangerZones, setDangerZones] = useState([]);
  const [topUnsafeZones, setTopUnsafeZones] = useState([]);
  const [heatmapPointsCount, setHeatmapPointsCount] = useState(0);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneLat, setNewZoneLat] = useState("");
  const [newZoneLng, setNewZoneLng] = useState("");
  const [newZoneRadius, setNewZoneRadius] = useState("500");

  const load = async () => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await api.get(`/admin/sos?${params.toString()}`);
    setLogs(res.data.logs);
  };

  const loadGeoData = async () => {
    const [zonesRes, analyticsRes] = await Promise.all([
      api.get("/location/admin/danger-zones"),
      api.get("/location/admin/unsafe-zones/analytics"),
    ]);
    setDangerZones(zonesRes.data?.zones || []);
    setTopUnsafeZones(analyticsRes.data?.topUnsafeZones || []);
    setHeatmapPointsCount((analyticsRes.data?.heatmapPoints || []).length);
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
    loadGeoData();
  }, []);

  const createDangerZone = async () => {
    if (!newZoneName || !newZoneLat || !newZoneLng) {
      alert("Please enter name and coordinates.");
      return;
    }
    try {
      await api.post("/location/admin/danger-zones", {
        name: newZoneName,
        zoneType: "circle",
        center: { lat: Number(newZoneLat), lng: Number(newZoneLng) },
        radius: Number(newZoneRadius || 500),
        severity: "high",
      });
      setNewZoneName("");
      setNewZoneLat("");
      setNewZoneLng("");
      setNewZoneRadius("500");
      loadGeoData();
    } catch (error) {
      alert("Failed to create danger zone");
    }
  };

  const removeDangerZone = async (id) => {
    if (!window.confirm("Remove this danger zone?")) return;
    await api.delete(`/location/admin/danger-zones/${id}`);
    loadGeoData();
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    window.open(`/api/admin/sos/export?${params.toString()}`, "_blank");
  };

  return (
    <AdminLayout pageTitle="SOS Logs">
      <div className="admin-page">
        <div className="admin-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Unsafe Zone Management</h3>
          <div className="admin-controls" style={{ marginBottom: 10 }}>
            <input className="admin-input" placeholder="Zone name" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} />
            <input className="admin-input" placeholder="Latitude" value={newZoneLat} onChange={(e) => setNewZoneLat(e.target.value)} />
            <input className="admin-input" placeholder="Longitude" value={newZoneLng} onChange={(e) => setNewZoneLng(e.target.value)} />
            <input className="admin-input" placeholder="Radius (m)" value={newZoneRadius} onChange={(e) => setNewZoneRadius(e.target.value)} />
            <button className="admin-btn primary" onClick={createDangerZone}>Add Zone</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {dangerZones.map((zone) => (
              <div key={zone._id} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "8px 10px", borderRadius: 8 }}>
                <div>
                  <strong>{zone.name}</strong>{" "}
                  <span style={{ color: "#64748b" }}>
                    ({zone.center?.lat?.toFixed?.(4)}, {zone.center?.lng?.toFixed?.(4)}) • {zone.radius}m
                  </span>
                </div>
                <button className="admin-btn small" onClick={() => removeDangerZone(zone._id)}>Remove</button>
              </div>
            ))}
            {dangerZones.length === 0 && <p style={{ color: "#64748b", margin: 0 }}>No danger zones yet.</p>}
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Top 5 Unsafe Zones This Week</h3>
          <div style={{ display: "grid", gap: 6 }}>
            {topUnsafeZones.map((row, index) => (
              <div key={row._id || index} style={{ display: "flex", justifyContent: "space-between", background: "#fff7ed", padding: "8px 10px", borderRadius: 8 }}>
                <span>{index + 1}. {row.name || "Unknown Zone"}</span>
                <strong>{row.incidents} incidents</strong>
              </div>
            ))}
            {topUnsafeZones.length === 0 && <p style={{ color: "#64748b", margin: 0 }}>No incidents in the last 7 days.</p>}
            <p style={{ color: "#64748b", margin: 0 }}>Heatmap data points (last 7 days): {heatmapPointsCount}</p>
          </div>
        </div>

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
