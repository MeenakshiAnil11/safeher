import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./userSidebar.css"; // Reuse userSidebar styles

export default function ResourceSidebar() {
  const location = useLocation();

  // Extract the active section from URL hash or default to 'all'
  const getActiveSection = () => {
    const hash = location.hash.substring(1); // Remove the '#'
    return hash || 'all';
  };

  const activeSection = getActiveSection();

  const resourceSections = [
    { id: 'search', icon: '🔍', description: 'Find resources' },
    { id: 'all', label: 'All Resources', icon: '📚' },
    {
      id: 'categories',
      label: 'Categories',
      icon: '🗂️',
      subItems: [
        { id: 'safety', label: 'Safety', icon: '🛡️' },
        { id: 'legal', label: 'Legal', icon: '⚖️' },
        { id: 'health', label: 'Health', icon: '🏥' },
        { id: 'helplines', label: 'Helplines', icon: '📞' },
      ]
    },
    { id: 'saved', label: 'Saved', icon: '⭐' },
    { id: 'recent', label: 'Recently Viewed', icon: '⏱️' },
    { id: 'quiz', label: 'Quiz and Assessment', icon: '🧠' },
    { id: 'submit', label: 'Add Resources', icon: '➕' },
    { id: 'events', label: 'Webinars & Events', icon: '🗓️' },
    { id: 'external', label: 'External Resources', icon: '🌐'},
  ];

  return (
    <aside className="user-sidebar resource-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>Resource Hub</h2>
          <p>Find help and support</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {resourceSections.map(section => (
          <div key={section.id}>
            <Link
              to={`/resources#${section.id}`}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{section.icon}</span>
              <div className="nav-content">
                <span className="nav-text">{section.label}</span>
                <span className="nav-description">{section.description}</span>
              </div>
            </Link>

            {/* Render sub-items if they exist */}
            {section.subItems && activeSection.startsWith(section.id) && (
              <div className="sidebar-submenu">
                {section.subItems.map(subItem => (
                  <Link
                    key={subItem.id}
                    to={`/resources#${subItem.id}`}
                    className={`nav-item submenu-item ${activeSection === subItem.id ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{subItem.icon}</span>
                    <div className="nav-content">
                      <span className="nav-text">{subItem.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
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