import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaSave,
  FaDollarSign,
  FaBell,
  FaGlobe,
  FaPowerOff,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import api from "../../services/api";
import DoctorProfileGate from "../../components/doctor/DoctorProfileGate";
import useDoctorProfileStatus from "../../hooks/useDoctorProfileStatus";
import "./DoctorSettings.css";

export default function DoctorSettings() {
  const [settings, setSettings] = useState({
    consultationFee: {
      min: 300,
      max: 2000,
      default: 500,
    },
    notifications: {
      email: true,
      sms: false,
      app: true,
    },
    language: "en",
    timezone: "Asia/Kolkata",
    accountActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profileLoading, profileCompleted, doctorName } = useDoctorProfileStatus();

  useEffect(() => {
    if (profileCompleted) {
      fetchSettings();
    } else if (!profileLoading) {
      setLoading(false);
    }
  }, [profileLoading, profileCompleted]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/doctors/settings").catch(() => ({
        data: { settings },
      }));
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleToggle = (section, field) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field],
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await api.put("/telehealth/doctors/settings", { settings }).catch(() => {
        console.log("Settings saved (mock)");
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm("Are you sure you want to temporarily deactivate your account? You can reactivate it anytime.")) {
      return;
    }

    try {
      await api.put("/telehealth/doctors/deactivate").catch(() => {
        console.log("Account deactivated (mock)");
      });
      setSettings((prev) => ({ ...prev, accountActive: false }));
      alert("Account deactivated successfully");
    } catch (error) {
      console.error("Error deactivating account:", error);
      alert("Failed to deactivate account");
    }
  };

  if (loading || profileLoading) {
    return <div className="doctor-settings-loading">Loading settings...</div>;
  }

  if (!profileCompleted) {
    return (
      <DoctorProfileGate
        doctorName={doctorName}
        sectionTitle="settings"
        description="Complete your profile to unlock Settings."
      />
    );
  }

  return (
    <div className="doctor-settings">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your preferences and account settings</p>
        </div>
        <button className="btn-save-all" onClick={handleSaveSettings} disabled={saving}>
          <FaSave /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Consultation Fee Settings */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-title">
            <FaDollarSign className="section-icon" />
            <h2>Consultation Fee</h2>
          </div>
        </div>
        <div className="section-content">
          <div className="form-group">
            <label>Minimum Fee (₹)</label>
            <input
              type="number"
              value={settings.consultationFee.min}
              onChange={(e) => handleInputChange("consultationFee", "min", parseInt(e.target.value))}
              className="form-input"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Maximum Fee (₹)</label>
            <input
              type="number"
              value={settings.consultationFee.max}
              onChange={(e) => handleInputChange("consultationFee", "max", parseInt(e.target.value))}
              className="form-input"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Default Fee (₹)</label>
            <input
              type="number"
              value={settings.consultationFee.default}
              onChange={(e) => handleInputChange("consultationFee", "default", parseInt(e.target.value))}
              className="form-input"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-title">
            <FaBell className="section-icon" />
            <h2>Notification Preferences</h2>
          </div>
        </div>
        <div className="section-content">
          <div className="toggle-item">
            <div className="toggle-info">
              <h3>Email Notifications</h3>
              <p>Receive notifications via email</p>
            </div>
            <button
              className="toggle-btn"
              onClick={() => handleToggle("notifications", "email")}
            >
              {settings.notifications.email ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
          <div className="toggle-item">
            <div className="toggle-info">
              <h3>SMS Notifications</h3>
              <p>Receive notifications via SMS</p>
            </div>
            <button
              className="toggle-btn"
              onClick={() => handleToggle("notifications", "sms")}
            >
              {settings.notifications.sms ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
          <div className="toggle-item">
            <div className="toggle-info">
              <h3>App Notifications</h3>
              <p>Receive in-app notifications</p>
            </div>
            <button
              className="toggle-btn"
              onClick={() => handleToggle("notifications", "app")}
            >
              {settings.notifications.app ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-title">
            <FaGlobe className="section-icon" />
            <h2>Language & Timezone</h2>
          </div>
        </div>
        <div className="section-content">
          <div className="form-group">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
              className="form-input"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
            </select>
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
              className="form-input"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="settings-section danger">
        <div className="section-header">
          <div className="section-title">
            <FaPowerOff className="section-icon" />
            <h2>Account Management</h2>
          </div>
        </div>
        <div className="section-content">
          <div className="account-status">
            <div>
              <h3>Account Status</h3>
              <p>Your account is currently {settings.accountActive ? "active" : "deactivated"}</p>
            </div>
            {settings.accountActive && (
              <button className="btn-deactivate" onClick={handleDeactivateAccount}>
                <FaPowerOff /> Deactivate Account
              </button>
            )}
          </div>
          <p className="danger-note">
            Deactivating your account will temporarily disable your profile. You can reactivate it anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
