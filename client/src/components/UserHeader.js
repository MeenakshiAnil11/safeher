import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function UserHeader({ onSidebarToggle }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const firstInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    if (query.includes('period') || query.includes('tracker')) {
      console.log('Navigating to period-tracking');
      navigate('/period-tracking');
    }
    else if (query.includes('health')) {
      console.log('Navigating to health');
      navigate('/health');
    }
    else if (query.includes('helpline')) {
      console.log('Navigating to helplines');
      navigate('/helplines');
    }
    else if (query.includes('resource')) {
      console.log('Navigating to resources');
      navigate('/resources');
    }
    else {
      console.log('Navigating to dashboard');
      navigate('/dashboard');
    }
    setSearchQuery("");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onSidebarToggle) onSidebarToggle();
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '0 1rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: 'white'
        }}>
          🛡️
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>SafeHer</div>
          <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Wellness Space</div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Home</Link>
        <Link to="/health" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Health Tracker</Link>
        <Link to="/period-tracking" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Period Tracker</Link>
        <Link to="/resources" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Resources</Link>
        <Link to="/helplines" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Helplines</Link>
      </nav>

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '24px', padding: '8px 12px' }}>
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              padding: '4px 8px',
              fontSize: '14px'
            }}
          />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>🔍</button>
        </form>
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '20px', color: '#6b7280' }}>🔔</button>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {firstInitial}
          </div>
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              padding: '8px 0',
              minWidth: '160px',
              zIndex: 1000
            }}>
              <div style={{ padding: '8px 16px', cursor: 'pointer', color: '#374151' }} onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>Profile</div>
              <div style={{ padding: '8px 16px', cursor: 'pointer', color: '#374151' }} onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>Settings</div>
              <div style={{ padding: '8px 16px', cursor: 'pointer', color: '#374151' }} onClick={handleLogoutClick}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
