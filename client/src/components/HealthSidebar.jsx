import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./userSidebar.css"; // Reuse userSidebar styles

export default function HealthSidebar() {
  const location = useLocation();

  // Extract the active section from URL hash or default to 'vitals'
  const getActiveSection = () => {
    const hash = location.hash.substring(1); // Remove the '#'
    return hash || 'vitals';
  };

  const activeSection = getActiveSection();

  const healthSections = [
    { id: 'vitals', label: 'Vitals', icon: '❤️' },
    { id: 'symptoms', label: 'Symptoms', icon: '🤒' },
    { id: 'vaccinations', label: 'Vaccinations', icon: '💉' },
    { id: 'records', label: 'Medical Records', icon: '📄' },
    { id: 'moodlogs', label: 'Mood & Symptoms', icon: '😊' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🏃‍♀️' },
    { id: 'analytics', label: 'Analytics & Insights', icon: '📊' },
  ];

  return (
    <aside className="user-sidebar health-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          {/* Removed Health Tracker title and description as requested */}
          {/* <h2>Health Tracker</h2> */}
          {/* <p>Monitor your health data</p> */}
        </div>
      </div>

      <nav className="sidebar-nav">
        {healthSections.map(section => (
          <Link
            key={section.id}
            to={`/health#${section.id}`}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{section.icon}</span>
            <div className="nav-content">
              <span className="nav-text">{section.label}</span>
              <span className="nav-description">{section.description}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/dashboard" className="back-to-dashboard">
          <span className="nav-icon">⬅️</span>
          <span className="nav-text">Back to Dashboard</span>
        </Link>
      </div>
    </aside>
  );
}