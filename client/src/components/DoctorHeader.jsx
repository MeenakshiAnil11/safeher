import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import "./DoctorHeader.css";

export default function DoctorHeader() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setDoctor(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const initial = doctor?.name ? doctor.name.charAt(0).toUpperCase() : "D";

  return (
    <header className="doctor-header">
      <div className="doctor-header-content">
        {/* Left side - Logo/Title */}
        <div className="doctor-header-left">
          <h1 className="doctor-header-title">Doctor Portal</h1>
        </div>

        {/* Right side - Profile Menu */}
        <div className="doctor-header-right">
          <div className="doctor-user-menu" ref={userMenuRef}>
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {doctor?.photo ? (
                  <img src={doctor.photo} alt={doctor.name} />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <span className="user-name">{doctor?.name || "Doctor"}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    {doctor?.photo ? (
                      <img src={doctor.photo} alt={doctor.name} />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div className="user-details">
                    <p className="user-name-large">{doctor?.name || "Doctor"}</p>
                    <p className="user-email">{doctor?.email || ""}</p>
                  </div>
                </div>
                <div className="user-menu-items">
                  <button className="menu-item" onClick={() => {
                    navigate("/doctor/profile");
                    setShowUserMenu(false);
                  }}>
                    <FaUser className="menu-icon" />
                    Profile
                  </button>
                  <hr className="menu-divider" />
                  <button className="menu-item logout" onClick={handleLogout}>
                    <FaSignOutAlt className="menu-icon" />
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
