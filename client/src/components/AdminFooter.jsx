import React from "react";
import "./AdminFooter.css";

export default function AdminFooter() {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-content">
        <div className="footer-brand">
          <div className="brand-info">
            <span className="logo">🛡️</span>
            <div className="brand-text">
              <h3>SafeHer Admin</h3>
              <p>Empowering women's safety and wellness</p>
            </div>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/admin/dashboard">Dashboard</a></li>
              <li><a href="/admin/users">Users</a></li>
              <li><a href="/admin/sos">SOS Logs</a></li>
              <li><a href="/admin/helplines">Helplines</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="/admin/resources">Manage Resources</a></li>
              <li><a href="/admin/feedback">Feedback</a></li>
              <li><a href="/resources">Public Resources</a></li>
              <li><a href="/helplines">Public Helplines</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>System</h4>
            <ul>
              <li><a href="#analytics">Analytics</a></li>
              <li><a href="#reports">Reports</a></li>
              <li><a href="#settings">Settings</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-number">1,234</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">89</span>
            <span className="stat-label">SOS Alerts</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">156</span>
            <span className="stat-label">Resources</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} SafeHer. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
          
          <div className="footer-social">
            <span>Follow us:</span>
            <div className="social-links">
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}













