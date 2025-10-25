// client/src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * AdminRoute: allows only users with role admin/superadmin.
 * Reads from localStorage 'user' (JSON) or falls back to 'role' string.
 */
export default function AdminRoute({ children }) {
  let role = null;

  // Try to read role from stored user object first
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      role = parsed?.role || null;
    }
  } catch (e) {
    // ignore JSON parse errors
  }

  // Fallback: explicit 'role' key
  if (!role) {
    role = localStorage.getItem("role");
  }

  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
