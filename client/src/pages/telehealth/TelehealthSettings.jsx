import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaEnvelope,
  FaSms,
  FaGlobe,
  FaSave,
  FaUserSlash,
} from "react-icons/fa";
import api from "../../services/api";
import "./TelehealthSettings.css";

export default function TelehealthSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      appointmentReminders: true,
      prescriptionReady: true,
      followUpReminders: true,
      doctorMessages: true,
    },
    channels: {
      email: true,
      sms: false,
      push: true,
    },
    language: "English",
    timezone: "Asia/Kolkata",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save settings to backend
      await api.put("/telehealth/user/settings", settings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = () => {
    if (!window.confirm("Are you sure you want to temporarily deactivate your account?")) return;
    alert("Account deactivation functionality coming soon!");
  };

  return (
    <div className="telehealth-settings-user">
      <div className="page-header">
        <h2>Telehealth Settings</h2>
        <p>Manage your preferences and account settings</p>
      </div>

      {/* Notification Preferences */}
      <div className="settings-section">
        <div className="section-header">
          <FaBell className="section-icon" />
          <h3>Notification Preferences</h3>
        </div>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Appointment Reminders</h4>
              <p>Get notified before your appointments</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.appointmentReminders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      appointmentReminders: e.target.checked,
                    },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Prescription Ready</h4>
              <p>Notify when your prescription is ready</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.prescriptionReady}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      prescriptionReady: e.target.checked,
                    },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Follow-up Reminders</h4>
              <p>Reminders for follow-up consultations</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.followUpReminders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      followUpReminders: e.target.checked,
                    },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Doctor Messages</h4>
              <p>Receive messages from your doctors</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications.doctorMessages}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      doctorMessages: e.target.checked,
                    },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="settings-section">
        <div className="section-header">
          <FaBell className="section-icon" />
          <h3>Notification Channels</h3>
        </div>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <FaEnvelope className="channel-icon" />
              <div>
                <h4>Email</h4>
                <p>Receive notifications via email</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.channels.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    channels: { ...settings.channels, email: e.target.checked },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <FaSms className="channel-icon" />
              <div>
                <h4>SMS</h4>
                <p>Receive notifications via SMS</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.channels.sms}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    channels: { ...settings.channels, sms: e.target.checked },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <FaBell className="channel-icon" />
              <div>
                <h4>Push Notifications</h4>
                <p>Receive push notifications in app</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.channels.push}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    channels: { ...settings.channels, push: e.target.checked },
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="settings-section">
        <div className="section-header">
          <FaGlobe className="section-icon" />
          <h3>Language & Region</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-field">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              className="setting-input"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
          <div className="setting-field">
            <label>Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="setting-input"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Account</h3>
        </div>
        <button className="btn-deactivate" onClick={handleDeactivate}>
          <FaUserSlash /> Temporarily Deactivate Account
        </button>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
