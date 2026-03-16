import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./healthSidebar.css";

export default function HealthSidebar() {
  const location = useLocation();

  const getActiveSection = () => {
    const hash = location.hash.substring(1);
    return hash || 'dashboard';
  };

  const activeSection = getActiveSection();

  const healthSections = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'vitals', label: 'Vitals' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'vaccinations', label: 'Vaccinations' },
    { id: 'records', label: 'Medical Records' },
    { id: 'moodlogs', label: 'Mood & Symptoms' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'goals', label: 'Goals & Risk' },
    { id: 'ml', label: 'AI Health Assistant' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <aside className="ht-sidebar">
      <Link to="/dashboard" className="ht-sidebar-back">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Main
      </Link>

      <div className="ht-sidebar-label">HEALTH TRACKER</div>

      <nav className="ht-sidebar-nav">
        {healthSections.map(section => (
          <Link
            key={section.id}
            to={`/health-tracker#${section.id}`}
            className={`ht-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
          >
            <span className="ht-sidebar-dot" />
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="ht-sidebar-help">
        <div className="ht-help-title">Need help?</div>
        <p className="ht-help-text">Our AI assistant can answer your health questions</p>
        <Link to="/health-tracker#ml" className="ht-help-btn">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zm0 11a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 01-2 0V5a1 1 0 012 0z" fill="currentColor"/></svg>
          Ask AI
        </Link>
      </div>
    </aside>
  );
}
