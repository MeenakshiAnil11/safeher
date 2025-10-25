import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

export default function AdminHeader({ pageTitle = "Admin Dashboard" }) {
  const navigate = useNavigate();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    { id: 1, message: "New user registered", time: "2 min ago", unread: true },
    { id: 2, message: "SOS alert received", time: "15 min ago", unread: true },
    { id: 3, message: "Resource approved", time: "1 hour ago", unread: false },
  ];

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        {/* Logo and Page Title */}
        <div className="admin-header-left">
          <div className="admin-logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">SafeHer Admin</span>
          </div>
          <h1 className="admin-page-title">{pageTitle}</h1>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="admin-header-right">
          {/* Notifications */}
          <div className="admin-notifications" ref={notificationsRef}>
            <button
              className="notification-btn"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
            >
              <span className="notification-icon">🔔</span>
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all read</button>
                </div>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="admin-user-menu" ref={userMenuRef}>
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <span>A</span>
              </div>
              <span className="user-name">Admin</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <span>A</span>
                  </div>
                  <div className="user-details">
                    <p className="user-name-large">Admin User</p>
                    <p className="user-email">admin@safeher.com</p>
                  </div>
                </div>
                <div className="user-menu-items">
                  <button className="menu-item" onClick={() => navigate("/admin/profile")}>
                    <span className="menu-icon">👤</span>
                    Profile
                  </button>
                  <button className="menu-item" onClick={() => navigate("/admin/settings")}>
                    <span className="menu-icon">⚙️</span>
                    Settings
                  </button>
                  <hr className="menu-divider" />
                  <button className="menu-item logout" onClick={handleLogout}>
                    <span className="menu-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}













