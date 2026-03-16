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
  FaPhone,
  FaShoppingCart,
  FaComments,
  FaStethoscope,
  FaTasks
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

          {/* Forum */}
          <li>
            <NavLink to="/admin/forum" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaComments className="sidebar-icon" /> Forum Moderation
            </NavLink>
          </li>

          {/* E-commerce */}
          <li>
            <NavLink to="/admin/ecommerce" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaShoppingCart className="sidebar-icon" /> E-commerce
            </NavLink>
          </li>

          {/* Telehealth */}
          <li>
            <NavLink to="/admin/telehealth" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaStethoscope className="sidebar-icon" /> Telehealth
            </NavLink>
          </li>

          {/* Tracker Management */}
          <li>
            <NavLink to="/admin/tracker" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaTasks className="sidebar-icon" /> Tracker
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
