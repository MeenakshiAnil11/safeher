import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaCreditCard,
  FaChartLine,
  FaFileAlt,
  FaShieldAlt,
  FaCogs,
  FaArrowLeft,
} from "react-icons/fa";
import "./AdminTelehealth.css";

export default function AdminTelehealth() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const telehealthSections = [
    {
      path: "dashboard",
      label: "Dashboard Overview",
      icon: FaTachometerAlt,
      description: "View key metrics, graphs, and notifications",
    },
    {
      path: "doctors",
      label: "Doctor Management",
      icon: FaUserMd,
      description: "Manage doctors, approvals, and profiles",
    },
    {
      path: "users",
      label: "User Management",
      icon: FaUsers,
      description: "Manage users, activity logs, and history",
    },
    {
      path: "appointments",
      label: "Appointment Management",
      icon: FaCalendarAlt,
      description: "Calendar view, reschedule, and disputes",
    },
    {
      path: "payments",
      label: "Payment & Refunds",
      icon: FaCreditCard,
      description: "Transactions, refunds, and revenue analytics",
    },
    {
      path: "reports",
      label: "Reports & Analytics",
      icon: FaChartLine,
      description: "Charts, exports, and performance metrics",
    },
    {
      path: "content",
      label: "Content & Resources",
      icon: FaFileAlt,
      description: "Manage educational resources and moderation",
    },
    {
      path: "security",
      label: "Security & Compliance",
      icon: FaShieldAlt,
      description: "Access control, logs, and compliance settings",
    },
    {
      path: "settings",
      label: "Settings",
      icon: FaCogs,
      description: "Configure fees, policies, and preferences",
    },
  ];

  return (
    <div className="admin-layout admin-telehealth">
      <aside className={`sidebar telehealth-sidebar ${sidebarOpen ? "open" : ""}`}>
        <nav className="telehealth-nav">
          {telehealthSections.map((section) => {
            const Icon = section.icon;
            const isActive = location.pathname.includes(`/admin/telehealth/${section.path}`);

            return (
              <NavLink
                key={section.path}
                to={`/admin/telehealth/${section.path}`}
                className={`sidebar-item telehealth-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                <div className="nav-content">
                  <span className="nav-label">{section.label}</span>
                  <span className="nav-description">{section.description}</span>
                </div>
              </NavLink>
            );
          })}
          <NavLink
            to="/admin/dashboard"
            className="sidebar-item telehealth-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <FaArrowLeft className="nav-icon" />
            <div className="nav-content">
              <span className="nav-label">Back to Dashboard</span>
              <span className="nav-description">Return to main admin dashboard</span>
            </div>
          </NavLink>
        </nav>
      </aside>

      <div className="main-section telehealth-main-section">
        <header className="header telehealth-header">
          <button
            type="button"
            className="telehealth-sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div>
            <h1 className="page-title">🩺 Telehealth Management</h1>
            <p className="page-subtitle">Manage doctors, appointments, payments, and analytics</p>
          </div>
        </header>

        <div className="content-area telehealth-content">
          <Outlet />
        </div>
      </div>

      {sidebarOpen ? <button className="telehealth-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" /> : null}
    </div>
  );
}
