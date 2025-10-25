import React, { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./AdminSettings.css";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    theme: "light",
    language: "en",
    sessionTimeout: 30,
    notifications: {
      sosAlerts: true,
      newUsers: true,
      feedback: false,
    },
  });

  const [loginHistory, setLoginHistory] = useState([]);
  const [passwords, setPasswords] = useState({ current: "", new: "" });

  useEffect(() => {
    loadSettings();
    loadLoginHistory();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings");
    }
  };

  const loadLoginHistory = async () => {
    try {
      const res = await api.get("/admin/login-history");
      setLoginHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to load login history");
    }
  };

  const saveSettings = async () => {
    try {
      await api.patch("/admin/settings", settings);
      alert("Settings saved");
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.new) return alert("Fill both fields");
    try {
      await api.post("/admin/change-password", passwords);
      alert("Password updated");
      setPasswords({ current: "", new: "" });
    } catch (err) {
      alert("Failed to change password");
    }
  };

  return (
    <AdminLayout pageTitle="Admin Settings">
      <div className="admin-settings">
        <h2>Account Settings</h2>
        <div className="settings-section">
          <input
            type="password"
            placeholder="Current Password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
          <button onClick={changePassword}>Change Password</button>
        </div>

        <h2>Personalization</h2>
        <div className="settings-section">
          <label>Theme:</label>
          <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <label>Language:</label>
          <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ml">Malayalam</option>
          </select>
        </div>

        <h2>Notifications</h2>
        <div className="settings-section">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.sosAlerts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sosAlerts: e.target.checked },
                })
              }
            />
            SOS Alerts
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.newUsers}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, newUsers: e.target.checked },
                })
              }
            />
            New User Alerts
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.feedback}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, feedback: e.target.checked },
                })
              }
            />
            Feedback Alerts
          </label>
        </div>

        <h2>Security</h2>
        <div className="settings-section">
          <label>Session Timeout (minutes):</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
          />
        </div>

        <h2>Login History</h2>
        <table className="login-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>IP</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {loginHistory.map((entry, idx) => (
              <tr key={idx}>
                <td>{new Date(entry.date).toLocaleString()}</td>
                <td>{entry.ip}</td>
                <td>{entry.device}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="settings-actions">
          <button onClick={saveSettings}>Save All Settings</button>
        </div>
      </div>
    </AdminLayout>
  );
}
