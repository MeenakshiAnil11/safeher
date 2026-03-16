import React from "react";
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
} from "react-icons/fa";
import "./AdminTelehealth.css";

export default function AdminTelehealth() {
  const location = useLocation();

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

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== "/admin/telehealth";

  return (
    <div className="admin-telehealth">
      <div className="telehealth-header">
        <h1>Telehealth Management</h1>
        <p>Manage doctors, appointments, payments, and analytics</p>
      </div>

      <div className="telehealth-layout">
        {/* Sidebar Navigation */}
        <aside className="telehealth-sidebar">
          <nav className="telehealth-nav">
            {telehealthSections.map((section) => {
              const Icon = section.icon;
              const isActive = location.pathname.includes(`/admin/telehealth/${section.path}`);

              return (
                <NavLink
                  key={section.path}
                  to={`/admin/telehealth/${section.path}`}
                  className={`telehealth-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="nav-icon" />
                  <div className="nav-content">
                    <span className="nav-label">{section.label}</span>
                    <span className="nav-description">{section.description}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="telehealth-content">
          {isSubRoute ? (
            <Outlet />
          ) : (
            <div className="telehealth-overview">
              <div className="overview-grid">
                {telehealthSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <NavLink
                      key={section.path}
                      to={`/admin/telehealth/${section.path}`}
                      className="overview-card"
                    >
                      <div className="card-icon">
                        <Icon />
                      </div>
                      <h3>{section.label}</h3>
                      <p>{section.description}</p>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
