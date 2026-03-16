import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./EcommerceSidebar.css";

const LINKS = [
  { to: "/shop", label: "Shop Home", icon: "🛍" },
  { to: "/shop/cart", label: "Cart", icon: "🛒" },
  { to: "/shop/orders", label: "Orders", icon: "📦" },
  { to: "/wishlist", label: "Wishlist", icon: "♡" },
  { to: "/shop/offers", label: "Offers & Discounts", icon: "🏷" },
  { to: "/shop/best-sellers", label: "Best Sellers", icon: "↗" },
  { to: "/shop/new-arrivals", label: "New Arrivals", icon: "✦" },
  { to: "/shop/support", label: "Support & FAQs", icon: "❔" },
  { to: "/shop/dashboard", label: "My Dashboard", icon: "⌘" },
];

const EcommerceSidebar = () => {
  const location = useLocation();

  const isActive = (to) => {
    if (to === "/shop") return location.pathname === "/shop";
    if (to === "/wishlist") return location.pathname === "/wishlist";
    if (to === "/shop/orders") return location.pathname.startsWith("/shop/orders");
    if (to === "/shop/cart") return location.pathname.startsWith("/shop/cart") || location.pathname.startsWith("/shop/checkout");
    if (to === "/shop/offers") return location.pathname === "/shop/offers";
    if (to === "/shop/best-sellers") return location.pathname === "/shop/best-sellers";
    if (to === "/shop/new-arrivals") return location.pathname === "/shop/new-arrivals";
    if (to === "/shop/support") return location.pathname === "/shop/support";
    if (to === "/shop/dashboard") return location.pathname === "/shop/dashboard";
    return false;
  };

  return (
    <aside className="ecom-sidebar" aria-label="E-commerce navigation">
      <div className="ecom-sidebar-brand">WellnessHub</div>
      <nav className="ecom-sidebar-nav">
        {LINKS.map((item) => (
          <Link key={item.to} to={item.to} className={`ecom-sidebar-link ${isActive(item.to) ? "active" : ""}`}>
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default EcommerceSidebar;
