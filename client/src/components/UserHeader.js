import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import NotificationCenter from "./NotificationCenter";

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
      <div style={{ 
        flex: 1, 
        maxWidth: '650px', 
        margin: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <form 
          onSubmit={handleSearch} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'transparent',
            border: 'none',
            padding: 0,
            width: '100%',
            maxWidth: '100%',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Search for"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              borderRadius: '28px',
              outline: 'none',
              padding: '10px 16px',
              fontSize: '15px',
              color: '#1f2937',
              fontFamily: 'inherit',
              minWidth: 0,
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button 
            type="submit" 
            style={{ 
              background: '#3b82f6',
              border: 'none',
              borderRadius: '22px',
              cursor: 'pointer',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              minWidth: '44px',
              height: '40px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: 'white' }}
            >
              <path
                d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 19L14.65 14.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <NotificationCenter />
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
