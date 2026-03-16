import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./userSidebar.css";

export default function UserSidebar({ className }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Added Feedback link here in navItems array
  const navItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/health-tracker", icon: "💗", label: "Health Vitals" },
    {
      path: "/selfcare",
      icon: "🧘",
      label: "Self Care",
      children: [
        { path: "/selfcare#breast-cancer", label: "Breast Cancer Detection" },
        { path: "/selfcare#pcod-risk", label: "PCOD Risk Prediction" },
        { path: "/selfcare#pregnancy-monitor", label: "Pregnancy Health Monitor" },
        { path: "/selfcare#breast-exam-guide", label: "Self Breast Exam Guide" },
      ],
    },
    { path: "/period-tracking", icon: "📅", label: "Period Tracker" },
    { path: "/telehealth", icon: "🩺", label: "Telehealth" },
    { path: "/location-tracking", icon: "📍", label: "Location Tracking" },
    { path: "/helplines", icon: "📞", label: "Helplines" },
    { path: "/resources", icon: "📚", label: "Resources" },
    { path: "/forum", icon: "💬", label: "Community Forum" },
    { path: "/shop/dashboard", icon: "🛍️", label: "E-commerce" },
    { path: "/wishlist", icon: "❤️", label: "My Wishlist" },
    { path: "/shop/orders", icon: "📦", label: "My Orders" },
    { path: "/my-contacts", icon: "📇", label: "My Emergency Contacts" },
    { path: "/subscription", icon: "💎", label: "Subscription" },
    { path: "/feedback", icon: "💬", label: "Feedback" },
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
        {navItems.map((item) => {
          // Check if current path matches or is a sub-route (for e-commerce)
          const isActive =
            location.pathname === item.path ||
            (item.path === "/shop/dashboard" &&
              location.pathname.startsWith("/shop") &&
              !location.pathname.startsWith("/shop/orders")) ||
            (item.path === "/shop/orders" && location.pathname.startsWith("/shop/orders")) ||
            (item.path === "/forum" && location.pathname.startsWith("/forum")) ||
            (item.path === "/telehealth" && location.pathname.startsWith("/telehealth")) ||
            (item.path === "/subscription" && location.pathname.startsWith("/subscription")) ||
            (item.path === "/selfcare" && location.pathname.startsWith("/selfcare"));
          
          return (
            <div key={item.path}>
              <Link to={item.path} className={`nav-item ${isActive ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
                {item.children ? <span className="submenu-caret">⌃</span> : null}
              </Link>
              {item.children && isActive ? (
                <div className="sidebar-submenu">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`submenu-item ${location.hash === `#${child.path.split("#")[1]}` ? "active" : ""}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>


    </aside>
  );
}


