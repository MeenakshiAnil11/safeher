import React from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children, pageTitle = "Admin Dashboard" }) {
  const navigate = useNavigate();

  // Mock admin data — replace with real auth data if needed
  const adminName = "Admin";

  const logout = () => {
    // Add your logout logic here (clear token, redirect, etc.)
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-page-wrapper">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="admin-main-content">
        <AdminHeader pageTitle={pageTitle} />

        {/* Page Content */}
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
