import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./EcommerceNavPages.css";

const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Standard delivery usually takes 3-7 business days depending on your location.",
  },
  {
    q: "What is your return and refund policy?",
    a: "You can request returns within 7 days for unopened products. Refunds are processed within 5-7 business days after verification.",
  },
  {
    q: "How can I track my order?",
    a: "Go to Orders in your account and select Track Order for live status updates.",
  },
  {
    q: "How can I contact support?",
    a: "Use email support@wellnesshub.com or call +91 98765 43210 for immediate assistance.",
  },
];

const EcommerceSupportPage = () => {
  return (
    <div className="cp2-page ecom-nav-page">
      <header className="cp2-topbar">
        <div className="cp2-topbar-left">
          <Link to="/shop" className="cp2-brand">
            <span className="cp2-brand-icon">🛍️</span>
            WellnessHub
          </Link>
        </div>
        <div className="cp2-topbar-center">
          <SearchBar placeholder="Search products..." />
        </div>
        <div className="cp2-topbar-right">
          <OrdersIcon />
          <WishlistIcon />
          <CartIcon />
          <Link to="/profile" className="cp2-profile-link" aria-label="Profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor" />
              <path d="M12 14C7.58172 14 4 15.7909 4 18V22H20V18C20 15.7909 16.4183 14 12 14Z" fill="currentColor" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="cp2-layout">
        <ShopModuleSidebar />

        <main className="cp2-main ecom-content-main">
          <section className="ecom-content-panel">
            <div className="ecom-page-head">
              <h1>Support & FAQs</h1>
              <p>Shipping, returns, refunds, and customer support.</p>
            </div>

            <div className="support-grid">
              <article className="support-card">
                <h3>Shipping Information</h3>
                <p>Free delivery on orders above Rs. 500. Standard shipping takes 3-7 business days.</p>
              </article>
              <article className="support-card">
                <h3>Return & Refund Policy</h3>
                <p>Eligible returns within 7 days. Refunds are processed securely to your original payment method.</p>
              </article>
              <article className="support-card">
                <h3>Customer Support Contact</h3>
                <p>Email: support@wellnesshub.com</p>
                <p>Phone: +91 98765 43210</p>
              </article>
            </div>

            <section className="faq-list" aria-label="Frequently asked questions">
              {FAQS.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EcommerceSupportPage;
