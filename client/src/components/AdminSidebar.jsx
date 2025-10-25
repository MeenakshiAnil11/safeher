import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBook,
  FaChartBar,
  FaBell,
  FaCogs,
  FaHeartbeat,
  FaCalendarAlt,
  FaPhone
} from "react-icons/fa";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <ul>
          {/* Main */}
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaTachometerAlt className="sidebar-icon" /> Dashboard
            </NavLink>
          </li>

          {/* User Management */}
          <li>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaUsers className="sidebar-icon" /> Users
            </NavLink>
          </li>

          {/* Resources */}
          <li>
            <NavLink to="/admin/resources" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaBook className="sidebar-icon" /> Resources
            </NavLink>
          </li>

          {/* Reports */}
          <li>
            <NavLink to="/admin/reports" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaChartBar className="sidebar-icon" /> Reports
            </NavLink>
          </li>

          {/* SOS Logs */}
          <li>
            <NavLink to="/admin/sos" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaBell className="sidebar-icon" /> SOS Logs
            </NavLink>
          </li>

          {/* Helplines */}
          <li>
            <NavLink to="/admin/helplines" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaPhone className="sidebar-icon" /> Helplines
            </NavLink>
          </li>

          {/* Feedback */}
          <li>
            <NavLink to="/admin/feedback" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaBell className="sidebar-icon" /> Feedback
            </NavLink>
          </li>

          {/* Settings */}
          <li>
            <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaCogs className="sidebar-icon" /> Settings
            </NavLink>
          </li>

          {/* Health Modules */}
          <li>
            <NavLink to="/admin/health" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaHeartbeat className="sidebar-icon" /> Health Tracking
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/period-tracking" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaCalendarAlt className="sidebar-icon" /> Period Tracking
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
