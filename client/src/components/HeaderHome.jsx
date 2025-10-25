import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeaderHome.css';

const HeaderHome = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header-home ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          
          {/* Logo on the left */}
          <div className="header-logo">
            <Link to="/" className="logo-link">
              <span className="logo-icon">🛡️</span>
              Women's Health & Safety
            </Link>
          </div>

          {/* Navigation links centered */}
          <nav className="header-nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/features" className="nav-link">
              Features
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </nav>

          {/* Login/Register buttons on the right */}
          <div className="header-actions">
            <Link to="/login" className="btn-login">
              Login
            </Link>
            <Link to="/register" className="btn-register">
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderHome;
