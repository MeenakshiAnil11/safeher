import React from "react";
import { useNavigate } from "react-router-dom";

export default function PerimenopauseIntroSimple() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#333',
          marginBottom: '1rem'
        }}>
          Welcome to Perimenopause Mode
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#666',
          marginBottom: '2rem'
        }}>
          Track your symptoms and wellness during perimenopause
        </p>

        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>
            About This Mode
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Perimenopause Mode helps you monitor changes in your menstrual cycle, 
            hormone levels, and symptoms during perimenopause.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate("/period-tracking/perimenopause")}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            Continue to Dashboard
          </button>
          
          <button
            onClick={() => navigate("/period-tracking")}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            Exit Mode
          </button>
        </div>
      </div>
    </div>
  );
}
