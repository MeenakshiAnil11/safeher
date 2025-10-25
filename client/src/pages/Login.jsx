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

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      persistAuth(res.data);
      const role = res.data?.user?.role || res.data?.role;

      setSuccess("✅ Login successful! Redirecting...");
      const target = role === "admin" || role === "superadmin" ? "/admin/dashboard" : "/dashboard";
      setTimeout(() => navigate(target), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
      const target = role === "admin" || role === "superadmin" ? "/admin/dashboard" : "/dashboard";
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

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={onSubmit} className="auth-form">
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
