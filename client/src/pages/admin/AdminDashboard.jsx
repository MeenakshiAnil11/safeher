import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    sosCount: 0,
    pendingResources: 0,
  });

  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/admin/reports/overview");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="admin-dashboard">
        <div className="dashboard-cards">
          <Link to="/admin/users" className="dashboard-card">
            <div className="card-content">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
          </Link>

          <Link to="/admin/users" className="dashboard-card">
            <div className="card-content">
              <h3>Active Users</h3>
              <p>{stats.activeUsers}</p>
            </div>
          </Link>

          <Link to="/admin/sos" className="dashboard-card">
            <div className="card-content">
              <h3>SOS Triggered</h3>
              <p>{stats.sosCount}</p>
            </div>
          </Link>

          <Link to="/admin/resources" className="dashboard-card">
            <div className="card-content">
              <h3>Pending Resources</h3>
              <p>{stats.pendingResources}</p>
            </div>
          </Link>

          <Link to="/admin/feedback" className="dashboard-card feedback-card">
            <div className="card-content">
              <h3>Feedback</h3>
              <p>Moderate user feedback and respond/escalate</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
