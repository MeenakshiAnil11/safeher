import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import AdminHeader from "../../components/AdminHeader";
import "./AdminDashboard.css";
import "./AdminPeriodTracking.css";
import AdminExercises from "./AdminExercises";
import AdminEducationalContent from "./AdminEducationalContent";

export default function AdminPeriodTracking() {
  const [activeMainTab, setActiveMainTab] = useState("userManagement");
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState("");
  // Removed userLogs related state variables as user logs tab is removed
  // const [userLogs, setUserLogs] = useState([]);
  // const [userLogsQ, setUserLogsQ] = useState("");
  // const [fromDate, setFromDate] = useState("");
  // const [toDate, setToDate] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserHistory, setShowUserHistory] = useState(false);

  const load = async () => {
    const res = await api.get(`/admin/health?q=${encodeURIComponent(q)}&type=periods`);
    setRecords(res.data.records);
  };

  /*
  const loadUserLogs = async () => {
    const params = new URLSearchParams();
    if (userLogsQ) params.append('q', userLogsQ);
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    const res = await api.get(`/admin/user-logs?${params.toString()}`);
    setUserLogs(res.data.logs);
  };
  */

  useEffect(() => {
    load();
  }, []);

  /*
  useEffect(() => {
    if (activeMainTab === "userLogs") {
      loadUserLogs();
    }
  }, [activeMainTab]);
  */

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this period record?")) return;
    await api.delete(`/admin/health/${id}`);
    load();
  };

  /*
  const exportUserLogs = async () => {
    const params = new URLSearchParams();
    if (userLogsQ) params.append('q', userLogsQ);
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    const url = `/admin/user-logs/export?${params.toString()}`;
    window.open(url, '_blank');
  };
  */

  return (
    <AdminLayout pageTitle="Period Tracking">
      <div className="admin-dashboard">
        <div className="main-tabs" style={{ marginBottom: "15px" }}>
          <button
            className={activeMainTab === "userManagement" ? "active" : ""}
            onClick={() => setActiveMainTab("userManagement")}
          >
            User Management
          </button>
          {/* Removed User Logs tab button */}
          <button
            className={activeMainTab === "educationalContent" ? "active" : ""}
            onClick={() => setActiveMainTab("educationalContent")}
          >
            Educational Content
          </button>
          <button
            className={activeMainTab === "exercises" ? "active" : ""}
            onClick={() => setActiveMainTab("exercises")}
          >
            Exercises
          </button>
        </div>

        {activeMainTab === "userManagement" && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                placeholder="Search user name/email"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button onClick={load}>Search</button>
            </div>

            <table border="1" cellPadding="5" style={{ width: "100%", marginTop: 10 }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Flow Intensity</th>
                  <th>Symptoms</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.user?.name || r.user?.email}</td>
                    <td>{new Date(r.startDate).toLocaleDateString()}</td>
                    <td>{r.endDate ? new Date(r.endDate).toLocaleDateString() : "Ongoing"}</td>
                    <td>{r.intensity}</td>
                    <td>{r.symptoms?.join(", ")}</td>
                    <td>{r.notes}</td>
                    <td>
                      <button onClick={() => deleteRecord(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}



        {activeMainTab === "educationalContent" && <AdminEducationalContent />}

        {activeMainTab === "exercises" && <AdminExercises />}
      </div>
    </AdminLayout>
  );
}
