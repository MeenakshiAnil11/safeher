import React, { useState, useEffect } from "react";
import api from "../../../api";
import { FaFileAlt, FaComments, FaExclamationTriangle, FaChartLine, FaUsers } from "react-icons/fa";
import "./ForumDashboard.css";

const ForumDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/forum/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching forum stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="forum-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="forum-dashboard">
        <div className="error-state">
          <p>Failed to load statistics</p>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    "period-cycle-health": "Period & Cycle Health",
    "pregnancy-conception": "Pregnancy & Conception",
    "perimenopause-menopause": "Perimenopause & Menopause",
    "mental-health-wellness": "Mental Health & Wellness",
    "general-health-questions": "General Health Questions",
    "product-reviews-recommendations": "Product Reviews",
    "anonymous-support": "Anonymous Support"
  };

  return (
    <div className="forum-dashboard">
      <div className="dashboard-header">
        <h2>Forum Overview</h2>
        <p>Key metrics and statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon posts">
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPosts.toLocaleString()}</h3>
            <p>Total Posts</p>
            <span className="stat-change">+{stats.recentPosts} this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon comments">
            <FaComments />
          </div>
          <div className="stat-content">
            <h3>{stats.totalComments.toLocaleString()}</h3>
            <p>Total Comments</p>
            <span className="stat-change">+{stats.recentComments} this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon reports">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{stats.totalReports.toLocaleString()}</h3>
            <p>Total Reports</p>
            <span className="stat-change warning">{stats.pendingReports} pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activity">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{(stats.recentPosts + stats.recentComments).toLocaleString()}</h3>
            <p>Recent Activity</p>
            <span className="stat-change">Last 7 days</span>
          </div>
        </div>
      </div>

      {/* Posts by Category */}
      <div className="dashboard-section">
        <h3>Posts by Category</h3>
        <div className="category-stats">
          {stats.postsByCategory.map((cat) => (
            <div key={cat._id} className="category-item">
              <div className="category-info">
                <span className="category-name">
                  {categoryLabels[cat._id] || cat._id}
                </span>
                <span className="category-count">{cat.count} posts</span>
              </div>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{
                    width: `${(cat.count / stats.totalPosts) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Users */}
      <div className="dashboard-section">
        <h3>Top Contributors</h3>
        <div className="top-users">
          {stats.topUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Posts</th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsers.map((user, index) => (
                  <tr key={user.userId}>
                    <td>#{index + 1}</td>
                    <td>{user.name || "Unknown"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="post-badge">{user.postCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-message">No user data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumDashboard;
