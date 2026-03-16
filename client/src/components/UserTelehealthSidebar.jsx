import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTelehealth } from "../context/TelehealthContext";
import "./UserTelehealthSidebar.css";

/**
 * UserTelehealthSidebar
 * Vertical sidebar for patient telehealth pages.
 * - Desktop / tablet: shows profile card + full nav.
 * - Mobile: hidden (existing bottom tab bar in Telehealth.jsx is used).
 */
export default function UserTelehealthSidebar({ active = "dashboard", user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useTelehealth();

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "🏠", path: "/telehealth" },
    { key: "doctors", label: "Doctor Directory", icon: "👩‍⚕️", path: "/telehealth/doctors" },
    { key: "appointments", label: "Appointments", icon: "📅", path: "/telehealth/appointments" },
    { key: "consultations", label: "Consultations", icon: "💬", path: "/telehealth/consultations" },
    { key: "prescriptions", label: "Prescriptions", icon: "💊", path: "/telehealth/prescriptions" },
    { key: "records", label: "Health Records", icon: "📂", path: "/telehealth/records" },
    { key: "history", label: "Consultation History", icon: "📜", path: "/telehealth/history" },
    { key: "payments", label: "Payments & Invoices", icon: "💳", path: "/telehealth/payments" },
    { key: "notifications", label: "Notifications", icon: "🔔", path: "/telehealth/notifications", badge: unreadCount },
    { key: "settings", label: "Settings", icon: "⚙️", path: "/telehealth/settings" },
  ];

  const initial =
    (user?.name || "P").trim().charAt(0).toUpperCase() || "P";

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  // Determine active item based on current path
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === "/telehealth" || path === "/telehealth/dashboard") return "dashboard";
    if (path.includes("/doctors")) return "doctors";
    if (path.includes("/appointments")) return "appointments";
    if (path.includes("/consultations")) return "consultations";
    if (path.includes("/prescriptions")) return "prescriptions";
    if (path.includes("/records")) return "records";
    if (path.includes("/history")) return "history";
    if (path.includes("/payments")) return "payments";
    if (path.includes("/notifications")) return "notifications";
    if (path.includes("/settings")) return "settings";
    return active;
  };

  const currentActive = getActiveKey();

  return (
    <aside className="th-sidebar">
      {/* Profile card */}
      <div className="th-profile-card">
        <div className="th-avatar">
          <span>{initial}</span>
        </div>
        <div className="th-profile-info">
          <div className="th-profile-name">{user?.name || "Patient User"}</div>
          <div className="th-profile-role">Patient</div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="th-nav">
        {navItems.map((item) => {
          const isActive = currentActive === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavClick(item)}
              className={
                "th-nav-item" +
                (isActive ? " th-nav-item--active" : "")
              }
            >
              <span className="th-nav-icon">
                {item.icon}
                {item.badge > 0 && (
                  <span className="th-nav-badge">{item.badge}</span>
                )}
              </span>
              <span className="th-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

