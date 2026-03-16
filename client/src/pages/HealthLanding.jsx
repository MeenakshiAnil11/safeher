import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/health-landing.css";

export default function HealthLanding() {
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Animate health icons cycling through
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const healthIcons = ["❤️", "🧘", "🏃‍♀️", "💤"];

  return (
    <div className="health-landing-container">
      {/* Background gradient */}
      <div className="health-landing-bg-gradient"></div>

      {/* Floating icons animation */}
      <div className="floating-icons">
        {healthIcons.map((icon, i) => (
          <div 
            key={i} 
            className={`floating-icon ${animationPhase === i ? 'active' : ''}`}
            style={{
              animationDelay: `${i * 0.5}s`,
              top: `${20 + i * 20}%`,
              left: `${10 + i * 15}%`
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="health-landing-content">
        <div className="health-landing-card">
          {/* Logo/Icon */}
          <div className="health-landing-icon-large">
            🌸
          </div>

          {/* Title */}
          <h1 className="health-landing-title">
            Welcome to Health Tracker
          </h1>

          {/* Subtitle */}
          <p className="health-landing-subtitle">
            Monitor your wellness journey with ease
          </p>

          {/* Stats */}
          <div className="health-landing-stats">
            <div className="health-stat-item">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-number">Track Vitals</span>
                <span className="stat-label">BP, Weight, Heart Rate</span>
              </div>
            </div>
            <div className="health-stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <span className="stat-number">Set Goals</span>
                <span className="stat-label">Achieve health targets</span>
              </div>
            </div>
            <div className="health-stat-item">
              <div className="stat-icon">🤖</div>
              <div className="stat-content">
                <span className="stat-number">AI Insights</span>
                <span className="stat-label">Smart recommendations</span>
              </div>
            </div>
          </div>

          {/* Main message */}
          <div className="health-landing-message">
            <p className="message-text">
              📅 <strong>Track your health vitals once in a month</strong> to maintain a comprehensive health profile and stay on top of your wellness.
            </p>
          </div>

          {/* Features */}
          <div className="health-landing-features">
            <div className="feature-card">
              <span className="feature-icon">❤️</span>
              <span className="feature-text">Vital Signs</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Health Goals</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚠️</span>
              <span className="feature-text">Risk Assessment</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Analytics</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="health-landing-actions">
            <button 
              className="btn-continue"
              onClick={() => navigate('/health-tracker#vitals')}
            >
              Continue to Health Tracker 🚀
            </button>
            <button 
              className="btn-exit"
              onClick={() => navigate('/dashboard')}
            >
              Exit
            </button>
          </div>

          {/* Benefits */}
          <div className="health-landing-benefits">
            <p className="benefits-title">Benefits of Regular Tracking:</p>
            <ul className="benefits-list">
              <li>✓ Early detection of health issues</li>
              <li>✓ Better understanding of your body</li>
              <li>✓ Personalized health insights</li>
              <li>✓ Progress tracking toward goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

