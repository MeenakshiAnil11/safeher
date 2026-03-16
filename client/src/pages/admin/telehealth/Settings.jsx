import React, { useState, useEffect } from "react";
import {
  FaCogs,
  FaRupeeSign,
  FaFileAlt,
  FaBell,
  FaGlobe,
  FaPhone,
  FaSave,
} from "react-icons/fa";
import api from "../../../services/api";
import "./Settings.css";

export default function TelehealthSettings() {
  const [settings, setSettings] = useState({
    consultationFeeMin: 100,
    consultationFeeMax: 5000,
    refundPolicy: "Full refund within 24 hours of cancellation",
    notificationTemplates: {
      appointmentConfirmed: "Your appointment has been confirmed for {date} at {time}",
      appointmentReminder: "Reminder: Your appointment is scheduled for {date} at {time}",
      prescriptionReady: "Your prescription is ready. Please check your account.",
    },
    languageSupport: ["English", "Hindi"],
    timezone: "Asia/Kolkata",
    emergencyHelpline: {
      enabled: true,
      number: "+91-1800-XXX-XXXX",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/admin/settings").catch(() => ({ data: settings }));
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/telehealth/admin/settings", settings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="telehealth-settings">
      <div className="page-header">
        <h2>Telehealth Settings</h2>
        <p>Configure consultation fees, policies, and system preferences</p>
      </div>

      {/* Consultation Fees */}
      <div className="settings-section">
        <div className="section-header">
          <FaRupeeSign className="section-icon" />
          <h3>Consultation Fee Range</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-field">
            <label>Minimum Fee (₹)</label>
            <input
              type="number"
              value={settings.consultationFeeMin}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  consultationFeeMin: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              className="setting-input"
            />
          </div>
          <div className="setting-field">
            <label>Maximum Fee (₹)</label>
            <input
              type="number"
              value={settings.consultationFeeMax}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  consultationFeeMax: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              className="setting-input"
            />
          </div>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="settings-section">
        <div className="section-header">
          <FaFileAlt className="section-icon" />
          <h3>Refund Policy</h3>
        </div>
        <textarea
          value={settings.refundPolicy}
          onChange={(e) =>
            setSettings({ ...settings, refundPolicy: e.target.value })
          }
          className="setting-textarea"
          rows="4"
          placeholder="Enter refund policy details..."
        />
      </div>

      {/* Notification Templates */}
      <div className="settings-section">
        <div className="section-header">
          <FaBell className="section-icon" />
          <h3>Notification Templates</h3>
        </div>
        <div className="notification-templates">
          <div className="template-field">
            <label>Appointment Confirmed</label>
            <input
              type="text"
              value={settings.notificationTemplates.appointmentConfirmed}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notificationTemplates: {
                    ...settings.notificationTemplates,
                    appointmentConfirmed: e.target.value,
                  },
                })
              }
              className="setting-input"
            />
          </div>
          <div className="template-field">
            <label>Appointment Reminder</label>
            <input
              type="text"
              value={settings.notificationTemplates.appointmentReminder}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notificationTemplates: {
                    ...settings.notificationTemplates,
                    appointmentReminder: e.target.value,
                  },
                })
              }
              className="setting-input"
            />
          </div>
          <div className="template-field">
            <label>Prescription Ready</label>
            <input
              type="text"
              value={settings.notificationTemplates.prescriptionReady}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notificationTemplates: {
                    ...settings.notificationTemplates,
                    prescriptionReady: e.target.value,
                  },
                })
              }
              className="setting-input"
            />
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="settings-section">
        <div className="section-header">
          <FaGlobe className="section-icon" />
          <h3>Language & Region</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-field">
            <label>Supported Languages</label>
            <input
              type="text"
              value={settings.languageSupport.join(", ")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  languageSupport: e.target.value.split(",").map((l) => l.trim()),
                })
              }
              className="setting-input"
              placeholder="English, Hindi, Tamil"
            />
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
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Helpline */}
      <div className="settings-section">
        <div className="section-header">
          <FaPhone className="section-icon" />
          <h3>Emergency Helpline Integration</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-field">
            <label>
              <input
                type="checkbox"
                checked={settings.emergencyHelpline.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergencyHelpline: {
                      ...settings.emergencyHelpline,
                      enabled: e.target.checked,
                    },
                  })
                }
              />
              Enable Emergency Helpline
            </label>
          </div>
          {settings.emergencyHelpline.enabled && (
            <div className="setting-field">
              <label>Helpline Number</label>
              <input
                type="text"
                value={settings.emergencyHelpline.number}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergencyHelpline: {
                      ...settings.emergencyHelpline,
                      number: e.target.value,
                    },
                  })
                }
                className="setting-input"
                placeholder="+91-1800-XXX-XXXX"
              />
            </div>
          )}
        </div>
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
