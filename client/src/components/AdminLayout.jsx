import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children, pageTitle = "Admin Dashboard" }) {
  const navigate = useNavigate();

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message) => {
      const text = typeof message === "string" ? message : String(message ?? "");
      const isSuccess = /success|saved|updated|created|approved|activated|deleted|resolved/i.test(text);
      const isError = /failed|error/i.test(text);
      const isWarning = /required|please|enter|cannot|denied|not available|no data/i.test(text);

      const icon = isSuccess ? "success" : isError ? "error" : isWarning ? "warning" : "info";
      const title = isSuccess ? "Success" : isError ? "Error" : isWarning ? "Notice" : "Info";

      return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: "OK",
        confirmButtonColor: "#6a5af9",
        timer: isSuccess ? 2000 : undefined,
        showConfirmButton: true,
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

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
