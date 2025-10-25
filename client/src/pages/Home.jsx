import React from "react";
import { Link } from "react-router-dom";
import HeaderHome from "../components/HeaderHome";
import "./home.css";

export default function Home() {
  return (
    <>
      <HeaderHome />
      <main className="home hero-page">

      {/* Hero section */}
      <section className="hero-visual">
        <div className="hero-overlay">
          <div className="hero-copy">
            <h1 className="hero-title">
              Empowering Women's Safety and Wellness
            </h1>

            <p className="hero-subtitle">
              SafeHer combines instant SOS alerts, live location sharing, trusted
              contacts, and a comprehensive health hub — all designed to help you
              feel safer and stronger every day.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn-pill primary large">
                Create your free account
              </Link>
              <Link to="/login" className="btn-pill outline large">
                Login
              </Link>
            </div>

            <p className="privacy-note">Private by default. You control your data.</p>
          </div>
        </div>
      </section>

      {/* BELOW-HERO CONTENT */}
      <div className="home-content">
        <section className="section narrow">
          <div className="container">
            <h2 className="section-title">
              Comprehensive Features for Your Safety and Wellness
            </h2>
            <p className="section-sub">
              Clear, easy-to-use features with strong privacy and a caring community.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <div
            className="container"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}
          >
            <div className="qa-card sos">
              <div className="icon">🚨</div>
              <h3>Instant SOS</h3>
              <p>
                Send emergency alerts with your live location to trusted contacts
                instantly.
              </p>
            </div>
            <div className="qa-card walk">
              <div className="icon">👣</div>
              <h3>Safe Walk</h3>
              <p>
                Share your route in real-time with friends for a safer journey home.
              </p>
            </div>
            <div className="qa-card health">
              <div className="icon">💗</div>
              <h3>Health Hub</h3>
              <p>
                Track your cycle, set reminders, and access curated wellness
                guidance.
              </p>
            </div>
            <div className="qa-card community">
              <div className="icon">🤝</div>
              <h3>Trusted Network</h3>
              <p>
                Build your circle of support and get help when you need it most.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="feature-grid section">
          <div className="container grid">
            <div className="feature">
              <div className="feature-icon">📅</div>
              <h3>Smart Period Tracking</h3>
              <p>
                Predict cycles and fertile windows with adaptive insights. Log
                symptoms, moods, and flow with a tap.
              </p>
              <Link to="/period-tracker" className="link">
                Open Tracker →
              </Link>
            </div>
            <div className="feature">
              <div className="feature-icon">🔔</div>
              <h3>Personalized Reminders</h3>
              <p>
                Gentle reminders for cycle phases, hydration, medications, and
                self-care—right when you need them.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>Privacy-First by Design</h3>
              <p>
                Your data stays yours. We use secure storage, optional account
                controls, and transparent settings.
              </p>
            </div>
          </div>
        </section>

        {/* NEW CARD SECTION */}
        <section className="section">
          <div className="container card-container">
            <div className="card">
              <h3>Card Title 1</h3>
              <p>Some description for this card.</p>
            </div>
            <div className="card">
              <h3>Card Title 2</h3>
              <p>Some description for this card.</p>
            </div>
            <div className="card">
              <h3>Card Title 3</h3>
              <p>Some description for this card.</p>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="trust section">
          <div className="container trust-inner">
            <div className="trust-badges">
              <div className="badge-card">⭐ GDPR-aligned practices</div>
              <div className="badge-card">🧩 Modular privacy controls</div>
              <div className="badge-card">🔐 Encrypted at rest & in transit</div>
            </div>
            <blockquote className="quote">
              "I finally have one place for safety and health that feels made for
              me."
              <span className="cite">— Aishwarya, community member</span>
            </blockquote>
          </div>
        </section>

        {/* News */}
        <section className="news section">
          <div className="container">
            <h2 className="section-title">Latest from SafeHer</h2>
            <div className="news-grid">
              <article className="news-item">
                <h3>New Feature: Safe Walk</h3>
                <p>
                  Introducing real-time route sharing to keep you safe on your way
                  home.
                </p>
                <Link to="/blog/safe-walk" className="link">
                  Read more →
                </Link>
              </article>
              <article className="news-item">
                <h3>How to Use SafeHer's Health Hub</h3>
                <p>Tips and tricks to get the most out of your wellness tracking.</p>
                <Link to="/blog/health-hub" className="link">
                  Read more →
                </Link>
              </article>
              <article className="news-item">
                <h3>Privacy and You</h3>
                <p>Our commitment to keeping your data safe and private.</p>
                <Link to="/blog/privacy" className="link">
                  Read more →
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="video-section section">
          <div className="container">
            <h2 className="section-title">See SafeHer in Action</h2>
            <div className="video-wrapper">
              <iframe
                title="SafeHer Demo Video"
                width="100%"
                height="400"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner section">
          <div className="container banner-inner">
            <div>
              <h2>Ready to feel safer and more in control?</h2>
              <p>Join thousands building healthier, safer routines with SafeHer.</p>
            </div>
            <div className="banner-actions">
              <Link to="/register" className="btn-pill primary large">
                Get Started Free
              </Link>
              <Link to="/resources" className="btn-pill outline large">
                Explore Resources
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-brand">
              <div className="brand-left">
                <span className="logo">🛡️</span>
                <span className="brand-name">SafeHer</span>
              </div>
              <p className="footer-text">
                A thoughtfully designed safety and wellness companion.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/period-tracker">Period Tracker</Link>
              <Link to="/health">Health</Link>
              <Link to="/resources">Resources</Link>
            </div>
            <div className="footer-col">
              <h4>Safety</h4>
              <Link to="/helplines">Helplines</Link>
              <Link to="/dashboard">Trusted Contacts</Link>
              <Link to="/profile">Privacy Controls</Link>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/forgot-password">Reset Password</Link>
            </div>
            <div className="footer-col social">
              <h4>Follow Us</h4>
              <a
                href="https://twitter.com/safeher"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
              <a
                href="https://facebook.com/safeher"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com/safeher"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>© {new Date().getFullYear()} SafeHer. All rights reserved.</span>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
    </>
  );
}
