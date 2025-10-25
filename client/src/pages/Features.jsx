import React from 'react';
import { FaCalendarAlt, FaHeartbeat, FaExclamationTriangle, FaMapMarkerAlt, FaBook, FaUsers } from 'react-icons/fa';
import HeaderHome from '../components/HeaderHome';

const Features = () => {
  const features = [
    {
      icon: <FaCalendarAlt />,
      title: 'Period Tracker',
      description: 'Predict and track menstrual cycles with ease.'
    },
    {
      icon: <FaHeartbeat />,
      title: 'Health Tracker',
      description: 'Monitor sleep, water intake, and activity levels.'
    },
    {
      icon: <FaExclamationTriangle />,
      title: 'SOS & Safety Alert',
      description: 'Quick emergency alert system for instant help.'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Location Tracker',
      description: 'Share live location securely with trusted contacts.'
    },
    {
      icon: <FaBook />,
      title: 'Resource Hub',
      description: 'Access women’s health and safety guides.'
    },
    {
      icon: <FaUsers />,
      title: 'Emergency Contacts',
      description: 'Manage and contact trusted people instantly.'
    }
  ];

  return (
    <>
      <HeaderHome />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 50%, #e1bee7 100%)',
        padding: '100px 20px 40px 20px',
        fontFamily: 'Arial, sans-serif'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#d63384',
          marginBottom: '40px',
          fontWeight: 'bold'
        }}>
          Platform Features
        </h1>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 16px 64px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            }}
            >
              <div style={{
                fontSize: '3rem',
                color: '#6f42c1',
                marginBottom: '20px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                color: '#d63384',
                marginBottom: '15px',
                fontWeight: 'bold'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: '#6c757d',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Features;
