import React, { useState, useEffect } from "react";
import {
  FaShieldAlt,
  FaUserShield,
  FaFileAlt,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../../services/api";
import "./SecurityCompliance.css";

export default function SecurityCompliance() {
  const [adminLogs, setAdminLogs] = useState([]);
  const [complianceSettings, setComplianceSettings] = useState({
    gdprEnabled: false,
    hipaaEnabled: false,
    dataRetentionDays: 365,
    requireConsent: true,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("logs");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "logs") {
        // Fetch admin action logs
        const response = await api.get("/admin/logs").catch(() => ({ data: { logs: [] } }));
        setAdminLogs(response.data.logs || []);
      } else if (activeTab === "compliance") {
        // Fetch compliance settings
        const response = await api.get("/admin/compliance-settings").catch(() => ({ data: complianceSettings }));
        setComplianceSettings(response.data || complianceSettings);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplianceUpdate = async () => {
    try {
      await api.put("/admin/compliance-settings", complianceSettings);
      alert("Compliance settings updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update settings");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US");
  };

  return (
    <div className="security-compliance">
      <div className="page-header">
        <h2>Security & Compliance</h2>
        <p>Manage access control, logs, and compliance settings</p>
      </div>

      {/* Tabs */}
      <div className="security-tabs">
        <button
          className={activeTab === "logs" ? "active" : ""}
          onClick={() => setActiveTab("logs")}
        >
          <FaFileAlt /> Admin Logs
        </button>
        <button
          className={activeTab === "compliance" ? "active" : ""}
          onClick={() => setActiveTab("compliance")}
        >
          <FaShieldAlt /> Compliance Settings
        </button>
        <button
          className={activeTab === "access" ? "active" : ""}
          onClick={() => setActiveTab("access")}
        >
          <FaUserShield /> Access Control
        </button>
      </div>

      {/* Admin Logs Tab */}
      {activeTab === "logs" && (
        <div className="security-section">
          <div className="section-header">
            <h3>Admin Action Logs</h3>
            <p>Track all administrative actions for audit purposes</p>
          </div>
          {loading ? (
            <div className="loading-state">Loading logs...</div>
          ) : adminLogs.length === 0 ? (
            <div className="empty-state">No logs available</div>
          ) : (
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {adminLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>{log.adminName || "System"}</td>
                      <td>
                        <span className="action-badge">{log.action}</span>
                      </td>
                      <td>{log.resource || "N/A"}</td>
                      <td>{log.details || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Compliance Settings Tab */}
      {activeTab === "compliance" && (
        <div className="security-section">
          <div className="section-header">
            <h3>Compliance Settings</h3>
            <p>Configure GDPR, HIPAA, and data protection settings</p>
          </div>
          <div className="compliance-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h4>
                  <FaShieldAlt /> GDPR Compliance
                </h4>
                <p>Enable GDPR-compliant data handling and user rights</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={complianceSettings.gdprEnabled}
                  onChange={(e) =>
                    setComplianceSettings({
                      ...complianceSettings,
                      gdprEnabled: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>
                  <FaShieldAlt /> HIPAA Compliance
                </h4>
                <p>Enable HIPAA-compliant healthcare data protection</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={complianceSettings.hipaaEnabled}
                  onChange={(e) =>
                    setComplianceSettings({
                      ...complianceSettings,
                      hipaaEnabled: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>
                  <FaLock /> Require Consent
                </h4>
                <p>Require explicit user consent for data sharing</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={complianceSettings.requireConsent}
                  onChange={(e) =>
                    setComplianceSettings({
                      ...complianceSettings,
                      requireConsent: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Data Retention Period</h4>
                <p>Number of days to retain user data (default: 365 days)</p>
              </div>
              <input
                type="number"
                value={complianceSettings.dataRetentionDays}
                onChange={(e) =>
                  setComplianceSettings({
                    ...complianceSettings,
                    dataRetentionDays: parseInt(e.target.value) || 365,
                  })
                }
                className="setting-input"
                min="30"
                max="3650"
              />
            </div>

            <button className="btn-save" onClick={handleComplianceUpdate}>
              <FaCheckCircle /> Save Compliance Settings
            </button>
          </div>
        </div>
      )}

      {/* Access Control Tab */}
      {activeTab === "access" && (
        <div className="security-section">
          <div className="section-header">
            <h3>Role-Based Access Control</h3>
            <p>Manage admin roles and permissions</p>
          </div>
          <div className="access-control-info">
            <div className="info-card">
              <FaUserShield className="info-icon" />
              <h4>Admin Role</h4>
              <p>Full access to all telehealth management features</p>
            </div>
            <div className="info-card">
              <FaShieldAlt className="info-icon" />
              <h4>Sub-Admin Role</h4>
              <p>Limited access to specific modules (coming soon)</p>
            </div>
            <div className="info-card">
              <FaExclamationTriangle className="info-icon" />
              <h4>Note</h4>
              <p>Role management is currently handled through user management. Advanced RBAC features coming soon.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
