import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./userSidebar.css";

export default function UserSidebar({ className }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Added Feedback link here in navItems array
  const navItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/health", icon: "💗", label: "Health Vitals" },
    { path: "/period-tracking", icon: "📅", label: "Period Tracker" },
    { path: "/location-tracking", icon: "📍", label: "Location Tracking" },
    { path: "/helplines", icon: "📞", label: "Helplines" },
    { path: "/resources", icon: "📚", label: "Resources" },
    { path: "/my-contacts", icon: "📇", label: "My Emergency Contacts" },
    { path: "/feedback", icon: "💬", label: "Feedback" }, // ✅ NEW
    { path: "/settings", icon: "⚙️", label: "Settings" },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <aside className={`user-sidebar ${className || ""}`}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
          </div>
          <div className="user-details">
            <h3>{user.name || "User"}</h3>
            <p>{user.email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </Link>
        ))}
      </nav>


    </aside>
  );
}


