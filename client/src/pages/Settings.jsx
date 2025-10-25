import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBell, FaLock, FaGlobe, FaSave, FaToggleOn, FaToggleOff } from "react-icons/fa";
import UserHeader from "../components/UserHeader";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import { getUser } from "../services/auth";
import "./profile.css"; // Reuse profile styles for consistency

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      enablePeriodReminder: true,
      enableOvulationReminder: true,
      reminderDaysBeforePeriod: 2,
      reminderDaysBeforeOvulation: 1,
      email: "",
      phone: "",
    },
    privacy: {
      enablePinLock: false,
      pin: "",
    },
    locale: "en",
  });

  const [loading, setLoading] = useState(false);
  const [pinConfirm, setPinConfirm] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { default: api } = await import("../services/api");
      const response = await api.get("/settings");
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Fallback to localStorage
      const user = getUser();
      if (user && user.settings) {
        setSettings(user.settings);
      }
    }
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (settings.privacy.enablePinLock && settings.privacy.pin !== pinConfirm) {
      alert("PIN confirmation doesn't match!");
      return;
    }

    setLoading(true);
    try {
      const { default: api } = await import("../services/api");
      const response = await api.put('/settings', { settings });

      // Update localStorage with new settings
      const user = getUser();
      if (user) {
        localStorage.setItem("user", JSON.stringify({ ...user, settings: response.data.settings }));
      }

      alert("✅ Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("❌ Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const locales = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिंदी (Hindi)" },
    { value: "es", label: "Español (Spanish)" },
    { value: "fr", label: "Français (French)" },
  ];

  return (
    <div className="dashboard-container">
      <UserHeader />
      <div className="dashboard-body">
        <UserSidebar />

        <main className="dashboard-main">
          <motion.div
            className="profile-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Settings</h2>
            <p className="dashboard-subtitle">Customize your app experience and privacy preferences.</p>

            {/* Notifications Section */}
            <div className="settings-section">
              <h3 className="section-title">
                <FaBell className="section-icon" /> Notifications
              </h3>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Period Reminders</span>
                  <button
                    className="toggle-btn"
                    onClick={() => handleNotificationChange('enablePeriodReminder', !settings.notifications.enablePeriodReminder)}
                  >
                    {settings.notifications.enablePeriodReminder ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
                {settings.notifications.enablePeriodReminder && (
                  <div className="setting-subitem">
                    <label>Days before period:</label>
                    <select
                      value={settings.notifications.reminderDaysBeforePeriod}
                      onChange={(e) => handleNotificationChange('reminderDaysBeforePeriod', parseInt(e.target.value))}
                      className="form-input"
                    >
                      <option value={1}>1 day</option>
                      <option value={2}>2 days</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Ovulation Reminders</span>
                  <button
                    className="toggle-btn"
                    onClick={() => handleNotificationChange('enableOvulationReminder', !settings.notifications.enableOvulationReminder)}
                  >
                    {settings.notifications.enableOvulationReminder ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
                {settings.notifications.enableOvulationReminder && (
                  <div className="setting-subitem">
                    <label>Days before ovulation:</label>
                    <select
                      value={settings.notifications.reminderDaysBeforeOvulation}
                      onChange={(e) => handleNotificationChange('reminderDaysBeforeOvulation', parseInt(e.target.value))}
                      className="form-input"
                    >
                      <option value={1}>1 day</option>
                      <option value={2}>2 days</option>
                      <option value={3}>3 days</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="setting-item">
                <label>Email Notifications:</label>
                <input
                  type="email"
                  value={settings.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email for notifications"
                />
              </div>

              <div className="setting-item">
                <label>SMS Notifications:</label>
                <input
                  type="tel"
                  value={settings.notifications.phone}
                  onChange={(e) => handleNotificationChange('phone', e.target.value)}
                  className="form-input"
                  placeholder="Enter phone for SMS notifications"
                />
              </div>
            </div>

            {/* Privacy Section */}
            <div className="settings-section">
              <h3 className="section-title">
                <FaLock className="section-icon" /> Privacy & Security
              </h3>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Enable PIN Lock</span>
                  <button
                    className="toggle-btn"
                    onClick={() => handlePrivacyChange('enablePinLock', !settings.privacy.enablePinLock)}
                  >
                    {settings.privacy.enablePinLock ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
                {settings.privacy.enablePinLock && (
                  <div className="setting-subitem">
                    <div className="form-grid">
                      <input
                        type="password"
                        value={settings.privacy.pin}
                        onChange={(e) => handlePrivacyChange('pin', e.target.value)}
                        className="form-input"
                        placeholder="Enter 4-digit PIN"
                        maxLength="4"
                        pattern="[0-9]{4}"
                      />
                      <input
                        type="password"
                        value={pinConfirm}
                        onChange={(e) => setPinConfirm(e.target.value)}
                        className="form-input"
                        placeholder="Confirm PIN"
                        maxLength="4"
                        pattern="[0-9]{4}"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Language Section */}
            <div className="settings-section">
              <h3 className="section-title">
                <FaGlobe className="section-icon" /> Language & Region
              </h3>

              <div className="setting-item">
                <label>Language:</label>
                <select
                  value={settings.locale}
                  onChange={(e) => setSettings(prev => ({ ...prev, locale: e.target.value }))}
                  className="form-input"
                >
                  {locales.map(locale => (
                    <option key={locale.value} value={locale.value}>
                      {locale.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="btn-row">
              <button
                onClick={handleSave}
                disabled={loading}
                className="save-btn"
              >
                <FaSave className="mr-2" />
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}