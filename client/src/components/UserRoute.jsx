// client/src/components/UserRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getUser, getRole } from "../services/auth";

/**
 * UserRoute: allows only regular users (not admins).
 * Redirects admins to admin dashboard and non-authenticated users to login.
 */
export default function UserRoute({ children }) {
  const user = getUser();
  const role = getRole() || user?.role;

  // If not authenticated, redirect to login
  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  // If admin, redirect to admin dashboard
  if (role === "admin" || role === "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Regular user - allow access
  return children;
}
