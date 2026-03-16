import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import UserTelehealthSidebar from "../components/UserTelehealthSidebar";
import { TelehealthProvider, useTelehealth } from "../context/TelehealthContext";
import "./Telehealth.css";

function TelehealthContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { unreadCount } = useTelehealth();
  
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path.includes("/doctors")) return "doctors";
    if (path.includes("/appointments")) return "appointments";
    if (path.includes("/consultations")) return "consultations";
    if (path.includes("/prescriptions")) return "prescriptions";
    if (path.includes("/records")) return "records";
    if (path.includes("/history")) return "history";
    if (path.includes("/payments")) return "payments";
    if (path.includes("/notifications")) return "notifications";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  });

  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/telehealth", icon: "🏠" },
    { id: "doctors", label: "Doctors", path: "/telehealth/doctors", icon: "👩‍⚕️" },
    { id: "appointments", label: "Appointments", path: "/telehealth/appointments", icon: "📅" },
    { id: "notifications", label: "Notifications", path: "/telehealth/notifications", icon: "🔔", badge: unreadCount },
    { id: "settings", label: "Settings", path: "/telehealth/settings", icon: "⚙️" },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="telehealth-full-page">
      <UserHeader />
      <div className="telehealth-page">
        <div className="telehealth-layout">
          {/* Desktop / tablet sidebar */}
          <UserTelehealthSidebar active={activeTab} user={user} />

          {/* Main telehealth content */}
          <div className="telehealth-container">
            <Outlet />
          </div>
        </div>

        {/* Bottom Tab Bar (Mobile) */}
        <div className="bottom-tab-bar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`tab-item ${isActive ? "active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                <span className="tab-icon">
                  {tab.icon}
                  {tab.badge > 0 && (
                    <span className="tab-badge">{tab.badge}</span>
                  )}
                </span>
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Telehealth() {
  return (
    <TelehealthProvider>
      <TelehealthContent />
    </TelehealthProvider>
  );
}
