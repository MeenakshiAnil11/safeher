import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../pages/resources.css";

export default function ResourceSidebar() {
  const location = useLocation();

  const getActiveSection = () => {
    const hash = location.hash.substring(1);
    return hash || "all";
  };

  const activeSection = getActiveSection();

  const topLink = { id: "all", label: "All Resources", icon: "🗂" };

  const categoryLinks = [
    { id: "health", label: "Health & Wellness", icon: "♡" },
    { id: "safety", label: "Safety", icon: "🛡" },
    { id: "career", label: "Career & Education", icon: "💼" },
    { id: "legal", label: "Legal Rights", icon: "⚖" },
    { id: "helplines", label: "Support Networks", icon: "👥" },
    { id: "lifestyle", label: "Lifestyle & Inspiration", icon: "✨" },
    { id: "finance", label: "Financial Literacy", icon: "$" },
  ];

  const quickLinks = [
    { id: "saved", label: "Saved Resources", icon: "◷" },
    { id: "recent", label: "Recently Viewed", icon: "◉" },
    { id: "quiz", label: "Quizzes & Assessments", icon: "◧" },
    { id: "events", label: "Webinars & Events", icon: "◌" },
    { id: "external", label: "External Resources", icon: "↗" },
  ];

  return (
    <aside className="resource-left-sidebar">
      <div className="resource-left-group resource-top-group">
        <Link
          to={`/resources#${topLink.id}`}
          className={`resource-left-link resource-top-link ${activeSection === topLink.id ? "active" : ""}`}
        >
          <span className="resource-left-icon">{topLink.icon}</span>
          <span>{topLink.label}</span>
        </Link>
      </div>

      <div className="resource-left-group">
        <div className="resource-left-title">CATEGORIES</div>
        <div className="resource-left-links">
          {categoryLinks.map((item) => (
            <Link
              key={item.id}
              to={`/resources#${item.id}`}
              className={`resource-left-link ${activeSection === item.id ? "active" : ""}`}
            >
              <span className="resource-left-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="resource-left-group">
        <div className="resource-left-title">QUICK LINKS</div>
        <div className="resource-left-links">
          {quickLinks.map((item) => (
            <Link
              key={item.id}
              to={`/resources#${item.id}`}
              className={`resource-left-link ${activeSection === item.id ? "active" : ""}`}
            >
              <span className="resource-left-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="resource-left-actions">
        <Link to="/resources#submit" className="resource-action-btn">
          + Add Resource
        </Link>
        <Link to="/dashboard" className="resource-back-btn">
          ⌫ Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}