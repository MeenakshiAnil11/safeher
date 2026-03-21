// client/src/pages/Login.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../auth.css";

// 🔹 Firebase auth + Google provider
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const persistAuth = (resData) => {
    if (resData?.token) localStorage.setItem("token", resData.token);

    // Persist full user object for route guards
    if (resData?.user) {
      localStorage.setItem("user", JSON.stringify(resData.user));
      if (resData.user.role) localStorage.setItem("role", resData.user.role);
    } else if (resData?.role) {
      localStorage.setItem("role", resData.role);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 🔹 Email/password login
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form before sending
    if (!form.email || !form.password) {
      setError("Please enter both email and password");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      console.log("🔐 Attempting login with email:", form.email);
      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      console.log("✅ Login successful:", res.data);
      persistAuth(res.data);
      const role = res.data?.user?.role || res.data?.role;

      setSuccess("✅ Login successful! Redirecting...");
      let target = "/dashboard";
      if (role === "admin" || role === "superadmin") {
        target = "/admin/dashboard";
      } else if (role === "doctor") {
        target = "/doctor/dashboard";
      }
      setTimeout(() => navigate(target), 500);
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Full error object:", err);
      
      // Extract error message - show the actual backend message
      let errorMessage = "Login failed";
      
      if (err.response?.data) {
        // Priority 1: Check for validation errors array
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(e => e.msg || e.message || "Validation error").join(", ");
        }
        // Priority 2: Check for message field
        else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        // Priority 3: Check if data is a string
        else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
        // Priority 4: Check for hint field (from our improved error messages)
        else if (err.response.data.hint) {
          errorMessage = `${err.response.data.message || "Login failed"}. ${err.response.data.hint}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Check for specific error types
      if (err.response?.status === 503) {
        errorMessage = "Database connection error. Please check if the backend server is running and MongoDB is connected.";
      } else if (err.response?.status === 400) {
        // Keep the actual backend message, but add context if it's generic
        if (errorMessage === "Invalid credentials" || errorMessage === "Invalid email or password") {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        }
      }
      
      // Log the final error message for debugging
      console.error("📋 Final error message shown to user:", errorMessage);
      
      setError(errorMessage);
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔹 Get Firebase ID token
      const idToken = await user.getIdToken();

      // 🔹 Send token to backend for verification/login
      const res = await api.post("/auth/google", { idToken });

      persistAuth(res.data);
      const role = res.data?.user?.role || res.data?.role;

      setSuccess("✅ Google login successful! Redirecting...");
      let target = "/dashboard";
      if (role === "admin" || role === "superadmin") {
        target = "/admin/dashboard";
      } else if (role === "doctor") {
        target = "/doctor/dashboard";
      }
      setTimeout(() => navigate(target), 500);
    } catch (err) {
      console.error("Google sign-in error:", err);

      // 🔹 Handle popup-specific errors
      if (err.code === "auth/popup-closed-by-user") {
        setError("Login canceled. You closed the popup before completing login.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Another login popup is already open. Please try again.");
      } else if (err.response?.status === 503) {
        setError(err.response?.data?.message || "Google login not configured on server.");
      } else {
        setError("Google sign-in failed. Check console for details.");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Panel */}
        <div className="auth-hero">
          <div className="auth-badge">
            <span className="shield">🛡️</span> SafeHer
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Your safety, wellness, and community in one place.
          </p>
          <div className="auth-ring" />
        </div>

        {/* Right Panel */}
        <div className="auth-body">
          <h2 className="auth-form-title">Login</h2>
          <p className="auth-tip">
            Access SOS, health, and trusted contacts instantly.
          </p>

          {error && (
            <div className="error-alert">
              Invalid email or password. Please check your credentials and try again.
            </div>
          )}
          {success && <div className="success">{success}</div>}

          <form onSubmit={onSubmit} className="auth-form form-container">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              className="input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              className="input"
              required
            />

            {/* Login Button */}
            <div className="actions single">
              <button type="submit" className="button primary">
                Login
              </button>
            </div>

            {/* Separator */}
            <div className="separator">
              <span>OR</span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
              Login with Google
            </button>

            {/* Links */}
            <div className="form-links">
              <Link to="/forgot-password" className="link small">
                Forgot password?
              </Link>
              <Link to="/register" className="link small">
                Create an account
              </Link>
            </div>

            <div className="note">
              🔐 We never share your data. Security-first by design.
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="back-to-home">
            <Link to="/" className="link small">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
