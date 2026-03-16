import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarAlt,
  FaComments,
  FaPrescriptionBottle,
  FaUsers,
  FaDollarSign,
  FaBell,
  FaCogs,
  FaHeartbeat,
} from "react-icons/fa";
import DoctorHeader from "../../components/DoctorHeader";
import api from "../../services/api";
import { connectSocket, disconnectSocket } from "../../services/socket";
import "./DoctorLayout.css";

export default function DoctorLayout() {
  const location = useLocation();
  const [doctor, setDoctor] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Connect socket when doctor layout mounts
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await api.get("/telehealth/doctors/profile");
        const profile = response?.data?.doctor || response?.data || {};
        setDoctor({
          name: profile.name || profile.user?.name || "",
          specialization: profile.specialization || "",
          photo: profile.photo || profile.user?.profilePicture || null,
        });
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        setDoctor(null);
      }
    };
    fetchDoctorProfile();
  }, []);

  // Auto-collapse sidebar on tablet/mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const doctorSections = [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: FaTachometerAlt,
      description: "Overview, stats, and notifications",
    },
    {
      path: "profile",
      label: "Profile",
      icon: FaUser,
      description: "Manage profile and availability",
    },
    {
      path: "appointments",
      label: "Appointments",
      icon: FaCalendarAlt,
      description: "Manage appointments and schedule",
    },
    {
      path: "consultations",
      label: "Consultations",
      icon: FaComments,
      description: "Active consultations and chat",
    },
    {
      path: "prescriptions",
      label: "Prescriptions",
      icon: FaPrescriptionBottle,
      description: "Issue and manage prescriptions",
    },
    {
      path: "patients",
      label: "Patient Records",
      icon: FaUsers,
      description: "View patient history and records",
    },
    {
      path: "earnings",
      label: "Earnings",
      icon: FaDollarSign,
      description: "Revenue and transactions",
    },
    {
      path: "notifications",
      label: "Notifications",
      icon: FaBell,
      description: "Alerts and reminders",
    },
    {
      path: "settings",
      label: "Settings",
      icon: FaCogs,
      description: "Preferences and account",
    },
  ];

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== "/doctor" && location.pathname !== "/doctor/";

  return (
    <div className="doctor-layout">
      {/* Header */}
      <DoctorHeader />

      <div className="doctor-layout-body">
        {/* Sidebar Navigation */}
        <aside className={`doctor-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          {/* Sidebar Logo/Title */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <FaHeartbeat />
            </div>
            {!isSidebarCollapsed && (
              <div className="sidebar-logo-text">
                <span className="logo-main">TeleHealth</span>
                <span className="logo-sub">Doctor Portal</span>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="doctor-nav">
            {doctorSections.map((section) => {
              const Icon = section.icon;
              const isActive = location.pathname.includes(`/doctor/${section.path}`);

              return (
                <NavLink
                  key={section.path}
                  to={`/doctor/${section.path}`}
                  className={`doctor-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="nav-icon" />
                  {!isSidebarCollapsed && (
                    <div className="nav-content">
                      <span className="nav-label">{section.label}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Doctor Profile at Bottom */}
          {!isSidebarCollapsed && (
            <div className="sidebar-profile">
              <div className="sidebar-profile-avatar">
                {doctor?.photo ? (
                  <img src={doctor.photo} alt={doctor.name} />
                ) : (
                  <span>{doctor?.name ? doctor.name.charAt(0).toUpperCase() : "D"}</span>
                )}
              </div>
              <div className="sidebar-profile-info">
                <p className="sidebar-profile-name">{doctor?.name || "Doctor profile not loaded."}</p>
                <p className="sidebar-profile-specialization">{doctor?.specialization || ""}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className={`doctor-content ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          {isSubRoute ? (
            <Outlet />
          ) : (
            <div className="doctor-overview">
              <div className="overview-header">
                <h1>Welcome to Doctor Portal</h1>
                <p>Select a section from the sidebar to get started</p>
              </div>
              <div className="overview-grid">
                {doctorSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <NavLink
                      key={section.path}
                      to={`/doctor/${section.path}`}
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
