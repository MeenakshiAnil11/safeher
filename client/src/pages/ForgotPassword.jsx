// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError("Please enter a valid email address");
    }

    try {
      // This endpoint should exist in your backend
      await api.post("/auth/forgot-password", { email });
      setSuccess("✅ If an account exists, a reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process request right now");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Panel */}
        <div className="auth-hero">
          <div className="auth-badge">
            <span className="shield">🔒</span>
            SafeHer
          </div>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">We'll email you a secure link to reset it.</p>
          <div className="auth-ring" />
        </div>

        {/* Right Panel */}
        <div className="auth-body">
          <h2 className="auth-form-title">Reset password</h2>
          <p className="auth-tip">Enter the email you used to create your account.</p>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={onSubmit} className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />

            <div className="actions">
              <button type="submit" className="button primary">Send reset link</button>
            </div>

            <div className="form-links" style={{ marginTop: 12 }}>
              <Link to="/login" className="link small">Back to login</Link>
              <Link to="/register" className="link small">Create account</Link>
            </div>

            <div className="note">🔐 We never share your data. Security-first by design.</div>
          </form>
        </div>
      </div>
    </div>
  );
}