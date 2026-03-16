import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./subscriptionSidebar.css";

const sections = [
  { id: "plans", icon: "💳", label: "Plans" },
  { id: "billing", icon: "📜", label: "Billing History" },
  { id: "renewal", icon: "↕️", label: "My Subscription" },
  { id: "upgrade", icon: "⏳", label: "Renewal & Expiry" },
  { id: "offers", icon: "🎁", label: "Offers & Discounts" },
  { id: "support", icon: "❓", label: "Support & FAQs" }
];

export default function SubscriptionSidebar() {
  const location = useLocation();
  const hash = location.hash.substring(1) || "plans";

  return (
    <aside className="sub-sidebar">
      <div className="sub-sidebar-label">SUBSCRIPTION MENU</div>
      <nav className="sub-sidebar-nav">
        {sections.map(s => (
          <Link key={s.id} to={`/subscription#${s.id}`} className={`sub-sidebar-item ${hash === s.id ? "active" : ""}`}>
            <span className="sub-sidebar-icon">{s.icon}</span>
            {s.label}
          </Link>
        ))}
      </nav>
      <Link to="/dashboard" className="sub-sidebar-item back-link">
        <span className="sub-sidebar-icon">🏠</span>
        Back to Dashboard
      </Link>
    </aside>
  );
}
