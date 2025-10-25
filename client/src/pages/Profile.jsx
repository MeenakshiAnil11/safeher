// client/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaUpload,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUser,
  FaShieldAlt,
  FaChartBar,
  FaHistory,
  FaCog,
  FaTrashAlt,
  FaCheckCircle,
  FaCamera,
  FaBell,
  FaEnvelope,
  FaPalette,
  FaHeart,
  FaStar,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import api from "../services/api";
import "./profile.css";
import "./profile-tab-styles.css";

function CircularProgress({ size = 140, strokeWidth = 8, progress = 0 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="circular-progress">
      <circle
        stroke="rgba(255, 255, 255, 0.2)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="url(#gradient)"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <defs>
        <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FloatingLabelInput({ label, type = "text", value, onChange, name, disabled = false, icon: Icon, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value;

  return (
    <div className="floating-input-container">
      <div className="floating-input-wrapper">
        {Icon && <Icon className="input-icon" />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`floating-input ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
          {...props}
        />
        <label className={`floating-label ${isActive ? 'active' : ''}`}>
          {label}
        </label>
      </div>
    </div>
  );
}

function SoftCard({ children, className = "", ...props }) {
  return (
    <motion.div
      className={`soft-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");

  const [preferences, setPreferences] = useState({
    theme: "light",
    notifications: true,
    emailUpdates: false,
    privacy: "public",
    language: "en",
    timezone: "UTC",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setProfile({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      dob: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      github: user.github || "",
      linkedin: user.linkedin || "",
      twitter: user.twitter || "",
      instagram: user.instagram || "",
    });
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    setIsEditing(false);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...user,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      dateOfBirth: profile.dob,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      github: profile.github,
      linkedin: profile.linkedin,
      twitter: profile.twitter,
      instagram: profile.instagram,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("✅ Profile updated successfully!");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return false;
    }
    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return false;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess("✅ Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser, color: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" },
    { id: "security", label: "Security", icon: FaShieldAlt, color: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)" },
    { id: "statistics", label: "Statistics", icon: FaChartBar, color: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
    { id: "activity", label: "Activity", icon: FaHistory, color: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
    { id: "preferences", label: "Preferences", icon: FaCog, color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="tab-content">
            <div className="profile-header">
              <h2 className="section-title">Personal Information</h2>
              <p className="profile-subtitle">Manage your personal details and profile picture.</p>
            </div>

            <SoftCard className="profile-avatar-section">
              <div className="profile-avatar-container">
                <div className="profile-avatar" style={{ position: "relative", width: 160, height: 160 }}>
                  <CircularProgress progress={85} size={160} />
                  <div className="avatar-image-container">
                    {preview ? (
                      <img src={preview} alt="Profile" className="avatar-img" />
                    ) : (
                      <div className="default-avatar">
                        <FaUserCircle size={80} className="avatar-icon" />
                        <div className="avatar-placeholder">
                          <FaCamera size={20} />
                        </div>
                      </div>
                    )}
                    {isEditing && (
                      <div className="avatar-overlay">
                        <label htmlFor="fileInput" className="avatar-upload-btn">
                          <FaCamera />
                        </label>
                        <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-info">
                  <h3 className="profile-name">{profile.name || "Your Name"}</h3>
                  <p className="profile-email">{profile.email}</p>
                  <div className="profile-completion">
                    <span>Profile Completion: 85%</span>
                    <div className="completion-bar">
                      <div className="completion-fill" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="basic-info-section">
              <h3 className="section-subtitle">Basic Information</h3>
              <div className="form-grid">
                <FloatingLabelInput
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaUser}
                />
                <FloatingLabelInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaEnvelope}
                />
                <FloatingLabelInput
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaPhone}
                />
                <FloatingLabelInput
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={profile.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaCalendarAlt}
                />
              </div>
            </SoftCard>

            <SoftCard className="bio-section">
              <h3 className="section-subtitle">About Me</h3>
              <div className="bio-container">
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bio-textarea"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </SoftCard>

            <SoftCard className="location-section">
              <h3 className="section-subtitle">Location & Contact</h3>
              <div className="form-grid">
                <FloatingLabelInput
                  label="Location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaMapMarkerAlt}
                />
                <FloatingLabelInput
                  label="Website"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaGlobe}
                />
              </div>
            </SoftCard>

            <SoftCard className="social-section">
              <h3 className="section-subtitle">Social Links</h3>
              <div className="social-grid">
                <FloatingLabelInput
                  label="GitHub"
                  name="github"
                  value={profile.github}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaGithub}
                />
                <FloatingLabelInput
                  label="LinkedIn"
                  name="linkedin"
                  value={profile.linkedin}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaLinkedin}
                />
                <FloatingLabelInput
                  label="Twitter"
                  name="twitter"
                  value={profile.twitter}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaTwitter}
                />
                <FloatingLabelInput
                  label="Instagram"
                  name="instagram"
                  value={profile.instagram}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={FaInstagram}
                />
              </div>
            </SoftCard>

            <div className="action-buttons">
              {!isEditing ? (
                <button 
                  onClick={handleEdit} 
                  className="soft-btn primary"
                >
                  <FaEdit className="btn-icon" /> Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    onClick={handleSave} 
                    className="soft-btn success"
                  >
                    <FaSave className="btn-icon" /> Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="soft-btn secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "security":
        return (
          <div className="tab-content">
            <h2 className="section-title">Account Security</h2>
            <p className="profile-subtitle">Manage your password and account security settings.</p>

            <div className="profile-sections">
              <h3 className="section-title"><FaLock className="section-icon" /> Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="password-form">
                <div className="form-grid">
                  <div className="password-input-group">
                    <input type={showPassword.current ? "text" : "password"} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="form-input" placeholder="Current Password" required />
                    <button type="button" onClick={() => togglePasswordVisibility("current")} className="password-toggle">
                      {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="password-input-group">
                    <input type={showPassword.new ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="form-input" placeholder="New Password" required />
                    <button type="button" onClick={() => togglePasswordVisibility("new")} className="password-toggle">
                      {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="password-input-group">
                    <input type={showPassword.confirm ? "text" : "password"} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="form-input" placeholder="Confirm New Password" required />
                    <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="password-toggle">
                      {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {passwordError && <div className="password-message error">{passwordError}</div>}
                {passwordSuccess && <div className="password-message success">{passwordSuccess}</div>}

                <button type="submit" className="password-update-btn" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            <div className="profile-sections danger-zone">
              <h3 className="section-title danger"><FaTrashAlt className="section-icon" /> Danger Zone</h3>
              <p className="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="delete-btn">
                  <FaTrashAlt className="mr-2" /> Delete Account
                </button>
              ) : (
                <div className="delete-confirm">
                  <p>Type "DELETE" to confirm:</p>
                  <input type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} className="form-input" placeholder="DELETE" />
                  <div className="btn-row">
                    <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">Cancel</button>
                    <button onClick={() => { if (deleteConfirmation === "DELETE") alert("Account deletion not implemented yet"); }} className="confirm-delete-btn" disabled={deleteConfirmation !== "DELETE"}>
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // Statistics, Activity, Preferences tabs same structure, professional card style applied
      case "statistics":
        return (
          <div className="tab-content">
            <div className="profile-header">
              <h2 className="section-title">Account Statistics</h2>
              <p className="profile-subtitle">View your account activity and usage statistics.</p>
            </div>

            <div className="stats-overview">
              <SoftCard className="stat-card primary">
                <div className="stat-icon">
                  <FaUser />
                </div>
                <div className="stat-content">
                  <h4>Profile Completeness</h4>
                  <p className="stat-value">85%</p>
                  <div className="stat-progress">
                    <div className="stat-progress-bar" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </SoftCard>

              <SoftCard className="stat-card success">
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-content">
                  <h4>Member Since</h4>
                  <p className="stat-value">{new Date().toLocaleDateString()}</p>
                  <span className="stat-label">Account created</span>
                </div>
              </SoftCard>

              <SoftCard className="stat-card info">
                <div className="stat-icon">
                  <FaHistory />
                </div>
                <div className="stat-content">
                  <h4>Last Login</h4>
                  <p className="stat-value">{new Date().toLocaleDateString()}</p>
                  <span className="stat-label">Recently active</span>
                </div>
              </SoftCard>

              <SoftCard className="stat-card warning">
                <div className="stat-icon">
                  <FaShieldAlt />
                </div>
                <div className="stat-content">
                  <h4>Active Sessions</h4>
                  <p className="stat-value">1</p>
                  <span className="stat-label">Current device</span>
                </div>
              </SoftCard>
            </div>

            <div className="detailed-stats">
              <SoftCard className="activity-stats">
                <h3 className="section-subtitle">Activity Overview</h3>
                <div className="activity-metrics">
                  <div className="metric-item">
                    <div className="metric-icon">
                      <FaHeart />
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">Health Records</span>
                      <span className="metric-value">12</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <FaChartBar />
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">Reports Generated</span>
                      <span className="metric-value">8</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-icon">
                      <FaStar />
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">Achievements</span>
                      <span className="metric-value">5</span>
                    </div>
                  </div>
                </div>
              </SoftCard>

              <SoftCard className="progress-stats">
                <h3 className="section-subtitle">Progress Tracking</h3>
                <div className="progress-items">
                  <div className="progress-item">
                    <div className="progress-header">
                      <span>Health Goals</span>
                      <span>75%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-header">
                      <span>Profile Setup</span>
                      <span>85%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-header">
                      <span>Data Entry</span>
                      <span>60%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </SoftCard>
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="tab-content">
            <h2 className="section-title">Recent Activity</h2>
            <p className="profile-subtitle">View your recent account activities and actions.</p>
            <div className="activity-list">
              <div className="activity-item"><FaCheckCircle className="activity-icon success" /><div><p>Profile updated successfully</p><span>{new Date().toLocaleString()}</span></div></div>
              <div className="activity-item"><FaCheckCircle className="activity-icon success" /><div><p>Password changed successfully</p><span>{new Date().toLocaleString()}</span></div></div>
              <div className="activity-item"><FaCheckCircle className="activity-icon success" /><div><p>Email verified</p><span>{new Date().toLocaleString()}</span></div></div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="tab-content">
            <div className="profile-header">
              <h2 className="section-title">Preferences</h2>
              <p className="profile-subtitle">Manage your personal settings and preferences.</p>
            </div>

            <SoftCard className="notification-preferences">
              <h3 className="section-subtitle">
                <FaBell className="section-icon" />
                Notifications
              </h3>
              <div className="preference-items">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Push Notifications</h4>
                    <p>Receive notifications for important updates</p>
                  </div>
                  <label className="soft-toggle">
                    <input 
                      type="checkbox" 
                      checked={preferences.notifications} 
                      onChange={() => setPreferences({ ...preferences, notifications: !preferences.notifications })} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Email Updates</h4>
                    <p>Get weekly summaries and important announcements</p>
                  </div>
                  <label className="soft-toggle">
                    <input 
                      type="checkbox" 
                      checked={preferences.emailUpdates} 
                      onChange={() => setPreferences({ ...preferences, emailUpdates: !preferences.emailUpdates })} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="appearance-preferences">
              <h3 className="section-subtitle">
                <FaPalette className="section-icon" />
                Appearance
              </h3>
              <div className="preference-items">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Theme</h4>
                    <p>Choose your preferred color scheme</p>
                  </div>
                  <div className="theme-selector">
                    <button 
                      className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                    >
                      <div className="theme-preview light"></div>
                      <span>Light</span>
                    </button>
                    <button 
                      className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                    >
                      <div className="theme-preview dark"></div>
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="privacy-preferences">
              <h3 className="section-subtitle">
                <FaShieldAlt className="section-icon" />
                Privacy & Security
              </h3>
              <div className="preference-items">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Profile Visibility</h4>
                    <p>Control who can see your profile information</p>
                  </div>
                  <select 
                    value={preferences.privacy} 
                    onChange={(e) => setPreferences({ ...preferences, privacy: e.target.value })} 
                    className="soft-select"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </SoftCard>

            <SoftCard className="language-preferences">
              <h3 className="section-subtitle">
                <FaGlobe className="section-icon" />
                Language & Region
              </h3>
              <div className="preference-items">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Language</h4>
                    <p>Select your preferred language</p>
                  </div>
                  <select 
                    value={preferences.language} 
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })} 
                    className="soft-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Timezone</h4>
                    <p>Set your local timezone</p>
                  </div>
                  <select 
                    value={preferences.timezone} 
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })} 
                    className="soft-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">Greenwich Mean Time</option>
                  </select>
                </div>
              </div>
            </SoftCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-with-header">
      <UserHeader />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="sidebar-header">
              <h3>Profile Settings</h3>
              <p>Manage your account</p>
            </div>
            <div className="sidebar-tabs">
              {tabs.map((tab) => (
                <button 
                  key={tab.id} 
                  className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`} 
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? tab.color : 'transparent'
                  }}
                >
                  <tab.icon className="tab-icon" /> 
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="profile-main">
            {renderTabContent()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
