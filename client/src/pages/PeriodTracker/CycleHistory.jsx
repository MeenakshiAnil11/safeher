import React, { useEffect, useState } from "react";
import "./periodTracker.css";

export default function CycleHistory() {
  const [cycles, setCycles] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/periods/history", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCycles(data.cycles || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this cycle?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/periods/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete");
      }
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/periods/export.csv", { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cycles.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button className="btn-primary" onClick={handleExport}>Export CSV</button>
      </div>
      <div className="pt-table-wrap">
        <table className="pt-table">
          <thead>
            <tr><th>#</th><th>Start</th><th>End</th><th>Duration (days)</th><th></th></tr>
          </thead>
          <tbody>
            {cycles.length === 0 && <tr><td colSpan="5">No cycles logged yet.</td></tr>}
            {cycles.map((c, idx) => (
              <tr key={c._id}>
                <td>{idx + 1}</td>
                <td>{new Date(c.startDate).toLocaleDateString()}</td>
                <td>{new Date(c.endDate).toLocaleDateString()}</td>
                <td>{c.duration}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn-danger" disabled={deletingId===c._id} onClick={() => handleDelete(c._id)}>
                    {deletingId===c._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
