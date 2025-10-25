import React from "react";
import { Link } from "react-router-dom";

export default function HomepageHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <span className="logo">🛡️</span>
          <span className="brand-name">SafeHer</span>
        </div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/services">Services</Link>
        </nav>
        <div className="nav-cta">
          <Link to="/login" className="btn btn-secondary btn-small">Login</Link>
          <Link to="/register" className="btn btn-primary btn-small">Get Started</Link>
        </div>
      </div>
    </header>
  );
}
