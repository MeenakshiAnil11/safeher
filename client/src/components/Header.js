import React from "react";
import { Link } from "react-router-dom";
import "./layout.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <span className="logo">🛡️</span>
          <span className="brand-name">SafeHer</span>
        </div>
        <nav className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/period-tracker">Tracker</Link>
          <Link to="/health">Health</Link>
          <Link to="/helplines">Helplines</Link>
          <Link to="/resources">Resources</Link>
        </nav>
        <div className="nav-cta">
          <Link to="/profile" className="btn ghost small">Profile</Link>
          <Link to="/login" className="btn primary small">Logout</Link>
        </div>
      </div>
    </header>
  );
}