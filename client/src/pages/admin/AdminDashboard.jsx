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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/admin/reports/overview");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard stats. Showing latest available data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  const engagementRate = stats.totalUsers
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;
  const systemStatus =
    stats.sosCount > 20 ? "High alert load" : stats.sosCount > 10 ? "Moderate alert load" : "System stable";
  const priorityLabel =
    stats.pendingResources > 15
      ? "High"
      : stats.pendingResources > 5
      ? "Medium"
      : "Low";

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="admin-dashboard">
        <div className="dashboard-hero">
          <div className="dashboard-hero-content">
            <h2>Operations Control Center</h2>
            <p>Monitor platform health, respond to priority tasks, and access module workflows quickly.</p>
            <div className="dashboard-hero-chips">
              <span className="hero-chip">Users: {stats.totalUsers.toLocaleString()}</span>
              <span className="hero-chip">Active: {stats.activeUsers.toLocaleString()}</span>
              <span className="hero-chip">SOS: {stats.sosCount.toLocaleString()}</span>
            </div>
          </div>
          <button type="button" className="dashboard-refresh-btn" onClick={load}>
            <span className="refresh-icon" aria-hidden="true">↻</span>
            Refresh Data
          </button>
        </div>

        {error ? <div className="dashboard-alert">{error}</div> : null}

        <div className="dashboard-cards">
          <Link to="/admin/users" className="dashboard-card">
            <div className="card-content">
              <h3>Total Users</h3>
              <p>{stats.totalUsers.toLocaleString()}</p>
              <span className="card-meta">Registered platform users</span>
            </div>
          </Link>

          <Link to="/admin/users" className="dashboard-card">
            <div className="card-content">
              <h3>Active Users</h3>
              <p>{stats.activeUsers.toLocaleString()}</p>
              <span className="card-meta">{engagementRate}% engagement rate</span>
            </div>
          </Link>

          <Link to="/admin/sos" className="dashboard-card">
            <div className="card-content">
              <h3>SOS Triggered</h3>
              <p>{stats.sosCount.toLocaleString()}</p>
              <span className="card-meta">{systemStatus}</span>
            </div>
          </Link>

          <Link to="/admin/resources" className="dashboard-card">
            <div className="card-content">
              <h3>Pending Resources</h3>
              <p>{stats.pendingResources.toLocaleString()}</p>
              <span className="card-meta">Review priority: {priorityLabel}</span>
            </div>
          </Link>
        </div>

        <div className="dashboard-sections">
          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>Quick Actions</h3>
              <span>Most used admin flows</span>
            </div>
            <div className="quick-actions-grid">
              <Link to="/admin/users" className="quick-action-card">
                <h4>Manage Users</h4>
                <p>Verify profiles, access controls, and activity.</p>
              </Link>
              <Link to="/admin/ecommerce/dashboard" className="quick-action-card">
                <h4>E-commerce Overview</h4>
                <p>Track orders, products, payments, and growth.</p>
              </Link>
              <Link to="/admin/telehealth/dashboard" className="quick-action-card">
                <h4>Telehealth Control</h4>
                <p>Monitor doctors, appointments, and consultation health.</p>
              </Link>
              <Link to="/admin/feedback" className="quick-action-card">
                <h4>Feedback Queue</h4>
                <p>Moderate reports, escalations, and user issues.</p>
              </Link>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>Operations Snapshot</h3>
              <span>Live overview for decision support</span>
            </div>
            <ul className="ops-list">
              <li>
                <strong>User Base:</strong> {stats.totalUsers.toLocaleString()} total,{" "}
                {stats.activeUsers.toLocaleString()} active.
              </li>
              <li>
                <strong>Safety Alerts:</strong> {stats.sosCount.toLocaleString()} SOS cases need monitoring.
              </li>
              <li>
                <strong>Content Queue:</strong> {stats.pendingResources.toLocaleString()} resources pending review.
              </li>
              <li>
                <strong>Recommended Focus:</strong> Prioritize{" "}
                {stats.pendingResources > 0 ? "resource approvals and SOS response checks." : "module health checks."}
              </li>
            </ul>
          </section>

          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>Recent Activity</h3>
              <span>Operational feed</span>
            </div>
            <div className="activity-timeline">
              <div className="activity-item">
                <span className="activity-dot success" />
                <div>
                  <h4>System sync completed</h4>
                  <p>Dashboard metrics refreshed and modules are reachable.</p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot warning" />
                <div>
                  <h4>Resource moderation pending</h4>
                  <p>{stats.pendingResources.toLocaleString()} items are waiting for review action.</p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot info" />
                <div>
                  <h4>User engagement tracking active</h4>
                  <p>Current engagement is {engagementRate}% based on active users.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-header">
              <h3>Module Shortcuts</h3>
              <span>Jump into admin areas</span>
            </div>
            <div className="shortcut-list">
              <Link to="/admin/sos" className="shortcut-link">SOS Logs</Link>
              <Link to="/admin/resources" className="shortcut-link">Resources Moderation</Link>
              <Link to="/admin/reports" className="shortcut-link">Reports & Analytics</Link>
              <Link to="/admin/settings" className="shortcut-link">System Settings</Link>
              <Link to="/admin/forum" className="shortcut-link">Forum Moderation</Link>
              <Link to="/admin/helplines" className="shortcut-link">Helplines</Link>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
