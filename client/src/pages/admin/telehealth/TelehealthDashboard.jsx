import React, { useState, useEffect } from "react";
import {
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaCheckCircle,
  FaRupeeSign,
  FaBell,
  FaExclamationTriangle,
  FaHeartbeat,
  FaUserClock,
} from "react-icons/fa";
import api from "../../../services/api";
import "./TelehealthDashboard.css";

export default function TelehealthDashboard() {
  const [stats, setStats] = useState(null);
  const [liveData, setLiveData] = useState({ metrics: { activeCount: 0, waitingCount: 0, bothJoinedCount: 0 }, active: [], queue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchLiveConsultations();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [dashboardRes, liveRes] = await Promise.all([
        api.get("/telehealth/admin/dashboard"),
        api.get("/telehealth/admin/consultations/live").catch(() => ({ data: liveData })),
      ]);
      setStats(dashboardRes.data);
      setLiveData(liveRes.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveConsultations = async () => {
    try {
      const response = await api.get("/telehealth/admin/consultations/live");
      setLiveData(response.data);
    } catch (error) {
      console.error("Error fetching live consultations:", error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="dashboard-error">Failed to load dashboard data</div>;
  }

  const { metrics, trends, notifications } = stats;

  return (
    <div className="telehealth-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>Monitor system health and key metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon doctor">
            <FaUserMd />
          </div>
          <div className="metric-content">
            <h3>Total Doctors</h3>
            <p className="metric-value">{metrics.totalDoctors}</p>
            <span className="metric-subtitle">
              {metrics.activeDoctors} Active • {metrics.pendingDoctors} Pending
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon user">
            <FaUsers />
          </div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <p className="metric-value">{metrics.totalUsers}</p>
            <span className="metric-subtitle">{metrics.activeUsers} Active Users</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon appointment">
            <FaCalendarCheck />
          </div>
          <div className="metric-content">
            <h3>Upcoming Appointments</h3>
            <p className="metric-value">{metrics.upcomingAppointments}</p>
            <span className="metric-subtitle">{metrics.pendingAppointments} Pending</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon completed">
            <FaCheckCircle />
          </div>
          <div className="metric-content">
            <h3>Completed Consultations</h3>
            <p className="metric-value">{metrics.completedConsultations}</p>
            <span className="metric-subtitle">Total consultations</span>
          </div>
        </div>

        <div className="metric-card revenue">
          <div className="metric-icon revenue">
            <FaRupeeSign />
          </div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">₹{metrics.totalRevenue.toLocaleString()}</p>
            <span className="metric-subtitle">
              Daily: ₹{metrics.dailyRevenue.toLocaleString()} • Weekly: ₹
              {metrics.weeklyRevenue.toLocaleString()} • Monthly: ₹
              {metrics.monthlyRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Consultation Trends (Last 30 Days)</h3>
          <div className="chart-container">
            <ConsultationChart data={trends.consultations} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Revenue Trends (Last 30 Days)</h3>
          <div className="chart-container">
            <RevenueChart data={trends.revenue} />
          </div>
        </div>
      </div>

      <div className="live-monitoring-section">
        <div className="panel-header">
          <FaHeartbeat className="panel-icon" />
          <h3>Live Consultation Monitoring</h3>
        </div>
        <div className="live-metrics-grid">
          <div className="live-metric-card">
            <h4>Active Sessions</h4>
            <p>{liveData?.metrics?.activeCount || 0}</p>
          </div>
          <div className="live-metric-card">
            <h4>Waiting Queue</h4>
            <p>{liveData?.metrics?.waitingCount || 0}</p>
          </div>
          <div className="live-metric-card">
            <h4>Both Parties Connected</h4>
            <p>{liveData?.metrics?.bothJoinedCount || 0}</p>
          </div>
        </div>

        <div className="live-cards-grid">
          {(liveData?.active || []).slice(0, 6).map((session) => (
            <div key={session._id} className="live-session-card">
              <div className="live-session-header">
                <strong>#{session.appointment?.appointmentNumber || "N/A"}</strong>
                <span className={`live-health-badge ${session.sessionHealth}`}>
                  {formatHealth(session.sessionHealth)}
                </span>
              </div>
              <p>
                <b>Doctor:</b> {session.doctor?.name || "N/A"}
              </p>
              <p>
                <b>Patient:</b> {session.patient?.name || "N/A"}
              </p>
              <p>
                <b>Type:</b> {session.consultationType || "N/A"}
              </p>
              <p>
                <b>Elapsed:</b> {formatElapsed(session.elapsedSeconds || 0)}
              </p>
            </div>
          ))}
          {(liveData?.active || []).length === 0 && (
            <div className="live-session-empty">
              <FaUserClock />
              <p>No active consultations right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="notifications-panel">
        <div className="panel-header">
          <FaBell className="panel-icon" />
          <h3>Notifications & Alerts</h3>
        </div>
        <div className="notifications-list">
          {notifications.pendingApprovals > 0 && (
            <div className="notification-item warning">
              <FaExclamationTriangle />
              <div className="notification-content">
                <h4>Pending Doctor Approvals</h4>
                <p>{notifications.pendingApprovals} doctors waiting for approval</p>
              </div>
              <span className="notification-badge">{notifications.pendingApprovals}</span>
            </div>
          )}
          {notifications.disputes > 0 && (
            <div className="notification-item danger">
              <FaExclamationTriangle />
              <div className="notification-content">
                <h4>Pending Disputes</h4>
                <p>{notifications.disputes} appointment disputes need resolution</p>
              </div>
              <span className="notification-badge">{notifications.disputes}</span>
            </div>
          )}
          {notifications.pendingApprovals === 0 && notifications.disputes === 0 && (
            <div className="notification-item success">
              <FaCheckCircle />
              <div className="notification-content">
                <h4>All Clear</h4>
                <p>No pending approvals or disputes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatElapsed(seconds) {
  const hh = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const ss = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatHealth(health) {
  if (health === "connected") return "Connected";
  if (health === "waiting_for_patient") return "Waiting Patient";
  if (health === "waiting_for_doctor") return "Waiting Doctor";
  return "Not Joined";
}

// Simple Bar Chart Component for Consultations
function ConsultationChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.count));

  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar-wrapper">
            <div
              className="bar"
              style={{ height: `${(item.count / maxValue) * 100}%` }}
            ></div>
          </div>
          <span className="bar-label">{item.count}</span>
          <span className="bar-date">{formatDate(item._id)}</span>
        </div>
      ))}
    </div>
  );
}

// Simple Bar Chart Component for Revenue
function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar-wrapper">
            <div
              className="bar revenue-bar"
              style={{ height: `${(item.revenue / maxValue) * 100}%` }}
            ></div>
          </div>
          <span className="bar-label">₹{item.revenue.toLocaleString()}</span>
          <span className="bar-date">{formatDate(item._id)}</span>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
