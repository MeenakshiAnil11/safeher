import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaComments,
  FaExclamationTriangle,
  FaUsers,
  FaChartBar
} from "react-icons/fa";
import "./AdminForum.css";

export default function AdminForum() {
  const location = useLocation();

  const forumSections = [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: FaTachometerAlt,
      description: "Forum statistics and overview"
    },
    {
      path: "posts",
      label: "Posts Management",
      icon: FaFileAlt,
      description: "Manage all forum posts"
    },
    {
      path: "comments",
      label: "Comments Management",
      icon: FaComments,
      description: "Manage all comments"
    },
    {
      path: "reports",
      label: "Reports & Moderation",
      icon: FaExclamationTriangle,
      description: "Review and resolve reports"
    },
    {
      path: "users",
      label: "User Activity",
      icon: FaUsers,
      description: "View user forum activity"
    }
  ];

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== "/admin/forum";

  return (
    <div className="admin-forum">
      <div className="forum-header">
        <h1>Forum Management</h1>
        <p>Manage community forum, moderate content, and track activity</p>
      </div>

      <div className="forum-layout">
        {/* Sidebar Navigation */}
        <aside className="forum-sidebar">
          <nav className="forum-nav">
            {forumSections.map((section) => {
              const Icon = section.icon;
              const isActive = location.pathname.includes(`/admin/forum/${section.path}`);
              
              return (
                <NavLink
                  key={section.path}
                  to={`/admin/forum/${section.path}`}
                  className={`forum-nav-item ${isActive ? "active" : ""}`}
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
        <main className="forum-content">
          {isSubRoute ? (
            <Outlet />
          ) : (
            <div className="forum-overview">
              <div className="overview-grid">
                {forumSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <NavLink
                      key={section.path}
                      to={`/admin/forum/${section.path}`}
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
