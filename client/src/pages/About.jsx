import React from 'react';
import { FaRocket, FaEye, FaCog, FaLaptop, FaLightbulb, FaUser, FaComment } from 'react-icons/fa';
import HeaderHome from '../components/HeaderHome';

const About = () => {
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
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#d63384',
          marginBottom: '40px',
          fontWeight: 'bold'
        }}>
          About Women’s Health & Safety Platform
        </h1>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaRocket /> Introduction / Mission
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            The Women’s Health & Safety Platform is a comprehensive web application designed to promote the health, wellness, and personal safety of women in all aspects of daily life.
          </p>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Our mission is to empower women through technology by providing them with accessible digital tools that help them track their physical and mental well-being, manage health cycles, access verified health resources, and stay safe with instant emergency response features.
          </p>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            In a world where women’s safety and health awareness are of utmost importance, this platform serves as a trusted digital companion for every woman.
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaEye /> Vision Statement
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            Our vision is to create an inclusive, intelligent, and secure ecosystem where every woman feels protected, informed, and in control of her own health and safety.
          </p>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            We aim to integrate innovation and compassion—using technology not only to prevent emergencies but also to promote long-term wellness and confidence.
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaCog /> Objectives
          </h2>
          <ul style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>To simplify health management through tools like period and health trackers.</li>
            <li>To ensure personal security with SOS alerts and live location sharing.</li>
            <li>To educate and guide women via a resource hub containing verified wellness and safety information.</li>
            <li>To foster digital independence and safety awareness among women of all ages.</li>
          </ul>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaLaptop /> Technologies Used
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            This project integrates modern full-stack web technologies to deliver a smooth, responsive, and real-time experience:
          </p>
          <ul style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>Frontend: React.js (component-based UI)</li>
            <li>Styling: Tailwind CSS (modern responsive design)</li>
            <li>Backend: Node.js with Express (API & data handling)</li>
            <li>Database: Firebase or MongoDB (for data storage)</li>
            <li>APIs: Geolocation API for location tracking, Chart.js / Recharts for health visualization</li>
          </ul>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaLightbulb /> Key Highlights
          </h2>
          <ul style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>Responsive design accessible on both mobile and desktop devices</li>
            <li>Real-time location tracking and emergency alerts</li>
            <li>Intuitive health monitoring tools for daily wellness</li>
            <li>Resource hub for verified women’s health and safety content</li>
            <li>Lightweight performance optimized for quick use in emergencies</li>
          </ul>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaUser /> Developer Credits
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '10px'
          }}>
            <strong>Developed by:</strong> Meenakshi Anil
          </p>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            <strong>Project Type:</strong> MCA Mini Project 2025
          </p>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginTop: '20px'
          }}>
            This project reflects the vision of using technology for social good — transforming a simple idea into a digital platform that empowers, educates, and protects women in their everyday lives.
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#d63384',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaComment /> Closing Note
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            The Women’s Health & Safety Platform is more than just a website — it’s a step towards a safer and healthier digital future for women. By combining care, technology, and awareness, this project aspires to make a real difference in society.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default About;
