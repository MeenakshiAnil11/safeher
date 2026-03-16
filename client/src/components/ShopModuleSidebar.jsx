import React from "react";
import { Link, useLocation } from "react-router-dom";

const DEFAULT_CATEGORIES = [
  { to: "/shop/category/menstrual-care", label: "Menstrual Care", icon: "◌" },
  { to: "/shop/category/pregnancy-care", label: "Pregnancy Care", icon: "◌" },
  { to: "/shop/category/wellness", label: "Wellness", icon: "◌" },
  { to: "/shop/category/personal-care", label: "Personal Care", icon: "◌" },
];

const QUICK_LINKS = [
  { to: "/shop/offers", label: "Offers & Discounts", icon: "🏷" },
  { to: "/shop/best-sellers", label: "Best Sellers", icon: "↗" },
  { to: "/shop/new-arrivals", label: "New Arrivals", icon: "✧" },
  { to: "/wishlist", label: "Wishlist", icon: "♡" },
  { to: "/shop/orders", label: "Orders", icon: "📦" },
  { to: "/shop/support", label: "Support & FAQs", icon: "❔" },
];

const ShopModuleSidebar = ({ categories = DEFAULT_CATEGORIES, showOffer = true }) => {
  const location = useLocation();

  const isActive = (to) => {
    if (to === "/shop/dashboard") return location.pathname === "/shop/dashboard";
    if (to === "/shop/orders") return location.pathname.startsWith("/shop/orders");
    if (to === "/wishlist") return location.pathname === "/wishlist";
    if (to.startsWith("/shop/category/")) return location.pathname === to;
    return location.pathname === to;
  };

  return (
    <aside className="cp2-sidebar" aria-label="E-commerce sidebar navigation">
      <div className="cp2-nav cp2-nav-top">
        <Link
          to="/shop/dashboard"
          className={`cp2-nav-item ${isActive("/shop/dashboard") ? "active" : ""}`}
          aria-label="Open e-commerce dashboard"
        >
          ⌘ Dashboard
        </Link>
      </div>

      <div className="cp2-sidebar-title quick">CATEGORIES</div>
      <div className="cp2-nav">
        {categories.map((c) => (
          <Link
            key={c.to || c.slug || c.label}
            to={c.to || `/shop/category/${c.slug}`}
            className={`cp2-nav-item ${isActive(c.to || `/shop/category/${c.slug}`) ? "active" : ""}`}
            aria-label={`Open ${c.label || c.name} category`}
          >
            {c.icon || "◌"} {c.label || c.name}
          </Link>
        ))}
      </div>

      <div className="cp2-sidebar-title quick">QUICK LINKS</div>
      <div className="cp2-nav">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`cp2-nav-item ${isActive(item.to) ? "active" : ""}`}
            aria-label={`Open ${item.label}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {showOffer && (
        <div className="cp2-offer-card">
          <h4>🏷 Special Offer!</h4>
          <p>Get 20% off on your first order</p>
          <Link to="/shop/offers" className="cp2-offer-btn">
            Shop Now
          </Link>
        </div>
      )}

      <div className="cp2-sidebar-bottom">
        <Link to="/dashboard" className="cp2-nav-item cp2-back-main-link" aria-label="Back to main dashboard">
          ⌂ Back to Main Dashboard
        </Link>
      </div>
    </aside>
  );
};

export default ShopModuleSidebar;
