import React from "react";
import { useNavigate } from "react-router-dom";
import "./lockedFeature.css";

export default function LockedFeature({ title, description, children }) {
  const navigate = useNavigate();

  return (
    <div className="locked-feature-wrap">
      <div className="locked-feature-blur">{children}</div>
      <div className="locked-feature-overlay" onClick={() => navigate("/subscription#plans")}>
        <div className="locked-feature-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="14" width="20" height="14" rx="3" stroke="#c026d3" strokeWidth="2"/>
            <path d="M10 14v-4a6 6 0 1 1 12 0v4" stroke="#c026d3" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="21" r="2" fill="#c026d3"/>
          </svg>
        </div>
        <h3 className="locked-feature-title">{title || "Premium Feature"}</h3>
        <p className="locked-feature-desc">{description || "Unlock with Subscription"}</p>
        <button className="locked-feature-btn">View Subscription Plans</button>
      </div>
    </div>
  );
}
