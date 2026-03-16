// client/src/components/DoctorRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * DoctorRoute: allows only users with role doctor.
 * Reads from localStorage 'user' (JSON) or falls back to 'role' string.
 * Redirects non-doctors to user dashboard and non-authenticated users to login.
 */
export default function DoctorRoute({ children }) {
  let role = null;
  let user = null;

  // Try to read role from stored user object first
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
      role = user?.role || null;
    }
  } catch (e) {
    // ignore JSON parse errors
  }

  // Fallback: explicit 'role' key
  if (!role) {
    role = localStorage.getItem("role");
  }

  // If not authenticated, redirect to login
  if (!user && !role) {
    return <Navigate to="/login" replace />;
  }

  // If user is not doctor, redirect to user dashboard
  if (role !== "doctor") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
