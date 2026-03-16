import React, { useState } from 'react';
import SOSButtonNew from '../components/SOSButtonNew';
import { SAMPLE_EMERGENCY_CONTACTS, testLocationPermission, formatPhoneNumber } from '../components/SOSTestUtils';
import api from '../services/api';

/**
 * SOS Test Page
 * 
 * This page demonstrates the SOS functionality with:
 * - Location permission testing
 * - Emergency contacts display
 * - SOS button with callbacks
 * - Test utilities
 */
const SOSTest = () => {
  const [locationStatus, setLocationStatus] = useState(null);
  const [lastSOS, setLastSOS] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Test location permission on mount
  React.useEffect(() => {
    testLocationPermission().then(setLocationStatus);
  }, []);

  // Fetch emergency contacts
  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/contacts');
        setContacts(response.data.contacts || []);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  // Handle SOS success
  const handleSOSSuccess = ({ location, result }) => {
    console.log('SOS sent successfully:', { location, result });
    setLastSOS({
      timestamp: new Date(),
      location: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      contactsNotified: result.data.contactsNotified
    });
  };

  // Handle SOS error
  const handleSOSError = (error) => {
    console.error('SOS failed:', error);
    alert(`❌ SOS Error: ${error.message}`);
  };

  // Handle location permission retest
  const handleRetestLocation = async () => {
    setLoading(true);
    const status = await testLocationPermission();
    setLocationStatus(status);
    setLoading(false);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#ef4444',
        fontSize: '2rem',
        marginBottom: '10px'
      }}>
        🚨 SOS Test Page
      </h1>
      
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Test the SOS functionality with location tracking and emergency contact notifications.
      </p>

      {/* Location Status */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginTop: 0 }}>📍 Location Permission</h2>
        
        {locationStatus && (
          <div style={{ marginTop: '10px' }}>
            <p><strong>Supported:</strong> {locationStatus.supported ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Permission:</strong> {locationStatus.permission === 'granted' ? '✅ Granted' : '⚠️ Denied'}</p>
            
            {locationStatus.location && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#e7f5ff', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0' }}><strong>Latitude:</strong> {locationStatus.location.latitude.toFixed(6)}</p>
                <p style={{ margin: '5px 0' }}><strong>Longitude:</strong> {locationStatus.location.longitude.toFixed(6)}</p>
                <p style={{ margin: '5px 0' }}><strong>Accuracy:</strong> ±{Math.round(locationStatus.location.accuracy)}m</p>
              </div>
            )}
            
            {locationStatus.error && (
              <p style={{ color: '#ef4444', marginTop: '10px' }}>
                ⚠️ {locationStatus.error}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleRetestLocation}
          disabled={loading}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Retest Location'}
        </button>
      </div>

      {/* Emergency Contacts */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginTop: 0 }}>👥 Emergency Contacts</h2>
        
        {contacts.length === 0 ? (
          <p style={{ color: '#666' }}>
            ⚠️ No emergency contacts found. Please add at least one contact to test SOS.
          </p>
        ) : (
          <div style={{ marginTop: '15px' }}>
            {contacts.map((contact, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  background: 'white',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  border: '1px solid #ddd'
                }}
              >
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{contact.name}</p>
                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                  📞 {contact.number}
                  {contact.email && ` | 📧 ${contact.email}`}
                </p>
                {contact.relationship && (
                  <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#666' }}>
                    {contact.relationship}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sample Contacts Info */}
        <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
          <p style={{ margin: '5px 0', fontSize: '0.85rem' }}>
            💡 <strong>Tip:</strong> Use the sample contacts data in <code>SOSTestUtils.js</code> to populate test contacts.
          </p>
        </div>
      </div>

      {/* SOS Button */}
      <div style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>🚨 Send SOS Alert</h2>
        
        <SOSButtonNew 
          onSuccess={handleSOSSuccess}
          onError={handleSOSError}
        />
      </div>

      {/* Last SOS Result */}
      {lastSOS && (
        <div style={{
          background: '#d4edda',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ marginTop: 0, color: '#155724' }}>✅ Last SOS Sent</h3>
          <p><strong>Time:</strong> {lastSOS.timestamp.toLocaleString()}</p>
          <p><strong>Location:</strong> {lastSOS.location}</p>
          <p><strong>Contacts Notified:</strong> {lastSOS.contactsNotified.total} (Emails: {lastSOS.contactsNotified.emails}, SMS: {lastSOS.contactsNotified.sms})</p>
        </div>
      )}

      {/* Backend Configuration Info */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#e7f5ff',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h3 style={{ marginTop: 0 }}>⚙️ Configuration Required</h3>
        <p style={{ margin: '10px 0' }}>
          To receive actual emails and SMS, configure the following in <code>backend/.env</code>:
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Email: <code>EMAIL_HOST</code>, <code>EMAIL_USER</code>, <code>EMAIL_PASS</code></li>
          <li>SMS: <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, <code>TWILIO_FROM</code></li>
        </ul>
        <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>
          See <code>SOS_IMPLEMENTATION_GUIDE.md</code> for detailed setup instructions.
        </p>
      </div>
    </div>
  );
};

export default SOSTest;

