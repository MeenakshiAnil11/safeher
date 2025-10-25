// client/src/pages/Register.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Validation helpers
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|`~]).{8,}$/.test(
      password
    );
  const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (!validateEmail(form.email)) {
      return setError("Please enter a valid email address");
    }
    if (!validatePhone(form.phone)) {
      return setError("Please enter a valid 10-digit phone number");
    }
    if (!validatePassword(form.password)) {
      return setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      // Send data to backend
      await api.post("/auth/register", form);

      setSuccess("🎉 Registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const onReset = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Panel */}
        <div className="auth-hero">
          <div className="auth-badge">
            <span className="shield">🌸</span>
            SafeHer
          </div>
          <h1 className="auth-title">Create your SafeHer account</h1>
          <p className="auth-subtitle">
            Join a community built for women’s safety and wellbeing.
          </p>
          <div className="auth-ring" />
        </div>

        {/* Right Panel */}
        <div className="auth-body">
          <h2 className="auth-form-title">Sign up</h2>
          <p className="auth-tip">
            Unlock SOS, trusted contacts, health tips, and more.
          </p>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={onSubmit} className="form-group">
            <input
              className="input"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="phone"
              type="text"
              placeholder="Phone number"
              value={form.phone}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />
            <input
              className="input"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={onChange}
              required
            />

            <div className="actions dual">
              <button type="submit" className="button primary">
                Create account
              </button>
              <button type="button" className="button reset" onClick={onReset}>
                Reset
              </button>
            </div>

            <Link to="/login" className="link">
              I already have an account
            </Link>

            <div className="note">
              💗 Our pledge: privacy, safety, and support—always.
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
