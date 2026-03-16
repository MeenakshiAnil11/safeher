import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaHeartbeat,
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaEdit,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../services/api";
import "./HealthData.css";

export default function HealthData() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [healthVitals, setHealthVitals] = useState([]);
  const [cycleLogs, setCycleLogs] = useState([]);
  const [symptomJournal, setSymptomJournal] = useState([]);
  const [consentToShare, setConsentToShare] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchUserData();
    fetchHealthData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      const userData = response.data.user;
      setUser(userData);
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchHealthData = async () => {
    try {
      // Fetch health vitals, cycle logs, symptom journal
      // These would come from existing health tracking APIs
      const [vitalsRes, cyclesRes, symptomsRes] = await Promise.all([
        api.get("/health/vitals").catch(() => ({ data: { vitals: [] } })),
        api.get("/periods").catch(() => ({ data: { periods: [] } })),
        api.get("/health/symptoms").catch(() => ({ data: { symptoms: [] } })),
      ]);
      setHealthVitals(vitalsRes.data.vitals || []);
      setCycleLogs(cyclesRes.data.periods || []);
      setSymptomJournal(symptomsRes.data.symptoms || []);
    } catch (error) {
      console.error("Error fetching health data:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.put("/auth/profile", {
        name: profileData.name,
        phone: profileData.phone,
      });
      setIsEditing(false);
      fetchUserData();
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleExportData = () => {
    // Export health data as PDF
    alert("Export functionality coming soon!");
  };

  return (
    <div className="health-data-page">
      <div className="page-header">
        <h2>Profile & Health Data</h2>
        <p>Manage your profile and health information</p>
      </div>

      {/* Tabs */}
      <div className="health-tabs">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <FaUser /> Profile
        </button>
        <button
          className={activeTab === "vitals" ? "active" : ""}
          onClick={() => setActiveTab("vitals")}
        >
          <FaHeartbeat /> Health Vitals
        </button>
        <button
          className={activeTab === "cycle" ? "active" : ""}
          onClick={() => setActiveTab("cycle")}
        >
          <FaCalendarAlt /> Cycle Logs
        </button>
        <button
          className={activeTab === "journal" ? "active" : ""}
          onClick={() => setActiveTab("journal")}
        >
          <FaFileAlt /> Symptom Journal
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="tab-content">
          <div className="profile-card">
            <div className="card-header">
              <h3>Profile Information</h3>
              {!isEditing ? (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit
                </button>
              ) : (
                <button
                  className="btn-save"
                  onClick={handleProfileUpdate}
                >
                  <FaCheckCircle /> Save
                </button>
              )}
            </div>
            <div className="profile-fields">
              <div className="field-group">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="field-input"
                  />
                ) : (
                  <p>{profileData.name}</p>
                )}
              </div>
              <div className="field-group">
                <label>Email</label>
                <p>{profileData.email}</p>
              </div>
              <div className="field-group">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="field-input"
                  />
                ) : (
                  <p>{profileData.phone || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="consent-card">
            <div className="consent-header">
              <h3>Data Sharing Consent</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={consentToShare}
                  onChange={(e) => setConsentToShare(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <p className="consent-text">
              Allow doctors to view your health data during consultations
            </p>
          </div>

          <button className="btn-export" onClick={handleExportData}>
            <FaDownload /> Export Health Data as PDF
          </button>
        </div>
      )}

      {/* Health Vitals Tab */}
      {activeTab === "vitals" && (
        <div className="tab-content">
          <div className="data-section">
            <h3>Health Vitals</h3>
            {healthVitals.length === 0 ? (
              <div className="empty-state">
                <p>No health vitals recorded yet</p>
                <button
                  className="btn-primary"
                  onClick={() => (window.location.href = "/health")}
                >
                  Add Vitals
                </button>
              </div>
            ) : (
              <div className="vitals-list">
                {healthVitals.map((vital, idx) => (
                  <div key={idx} className="vital-card">
                    <h4>{vital.type}</h4>
                    <p className="vital-value">{vital.value} {vital.unit}</p>
                    <span className="vital-date">
                      {new Date(vital.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cycle Logs Tab */}
      {activeTab === "cycle" && (
        <div className="tab-content">
          <div className="data-section">
            <h3>Menstrual Cycle Logs</h3>
            {cycleLogs.length === 0 ? (
              <div className="empty-state">
                <p>No cycle logs recorded yet</p>
                <button
                  className="btn-primary"
                  onClick={() => (window.location.href = "/period-tracking")}
                >
                  Track Period
                </button>
              </div>
            ) : (
              <div className="cycle-list">
                {cycleLogs.slice(0, 10).map((cycle, idx) => (
                  <div key={idx} className="cycle-card">
                    <div className="cycle-date">
                      {new Date(cycle.startDate).toLocaleDateString()}
                    </div>
                    <div className="cycle-details">
                      <span>Duration: {cycle.duration} days</span>
                      {cycle.symptoms && (
                        <span>Symptoms: {cycle.symptoms.join(", ")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptom Journal Tab */}
      {activeTab === "journal" && (
        <div className="tab-content">
          <div className="data-section">
            <h3>Symptom Journal</h3>
            {symptomJournal.length === 0 ? (
              <div className="empty-state">
                <p>No symptom entries yet</p>
                <button
                  className="btn-primary"
                  onClick={() => (window.location.href = "/health")}
                >
                  Add Entry
                </button>
              </div>
            ) : (
              <div className="journal-list">
                {symptomJournal.slice(0, 10).map((entry, idx) => (
                  <div key={idx} className="journal-card">
                    <div className="journal-date">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="journal-content">
                      {entry.mood && <span>Mood: {entry.mood}</span>}
                      {entry.pain && <span>Pain: {entry.pain}</span>}
                      {entry.sleep && <span>Sleep: {entry.sleep} hours</span>}
                      {entry.energy && <span>Energy: {entry.energy}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
