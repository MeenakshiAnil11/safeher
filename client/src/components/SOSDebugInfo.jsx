import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getUser } from '../services/auth';

/**
 * SOS Debug Info Component
 * Shows debug information and helps add test contacts
 */
const SOSDebugInfo = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastSOSResult, setLastSOSResult] = useState(null);

  useEffect(() => {
    const u = getUser();
    setUser(u);

    // Fetch contacts
    const fetchContacts = async () => {
      try {
        const response = await api.get('/contacts');
        setContacts(response.data.contacts || []);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();

    // Listen for SOS results
    window.addEventListener('sos-result', handleSOSResult);

    return () => {
      window.removeEventListener('sos-result', handleSOSResult);
    };
  }, []);

  const handleSOSResult = (event) => {
    setLastSOSResult(event.detail);
  };

  const addTestContact = async () => {
    const testContact = {
      name: `Test Contact ${contacts.length + 1}`,
      number: `+123456789${contacts.length}`,
      email: `test${contacts.length + 1}@example.com`,
      relationship: "Test",
      notes: "Test emergency contact for SOS"
    };

    try {
      await api.post('/contacts', testContact);
      // Refresh contacts
      const response = await api.get('/contacts');
      setContacts(response.data.contacts || []);
      alert('✅ Test contact added successfully!');
    } catch (error) {
      console.error('Failed to add test contact:', error);
      alert('❌ Failed to add test contact: ' + error.message);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#ef4444', marginTop: 0 }}>🚨 SOS Debug Information</h2>

      {/* User Info */}
      {user && (
        <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0 }}>👤 Current User</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}

      {/* Emergency Contacts */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ marginTop: 0 }}>📋 Emergency Contacts ({contacts.length})</h3>
          <button
            onClick={addTestContact}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add Test Contact
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#856404' }}>
              ⚠️ No emergency contacts found! Add at least one contact to test SOS.
            </p>
          </div>
        ) : (
          <div>
            {contacts.map((contact, index) => (
              <div key={index} style={{
                padding: '10px',
                marginBottom: '10px',
                background: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{contact.name}</p>
                {contact.email && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>📧 {contact.email}</p>}
                {contact.number && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>📱 {contact.number}</p>}
                {contact.relationship && (
                  <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#666' }}>
                    {contact.relationship}
                  </p>
                )}
              </div>
            ))}

            {/* Contact Statistics */}
            <div style={{ marginTop: '15px', padding: '10px', background: '#e7f5ff', borderRadius: '4px' }}>
              <p style={{ margin: '5px 0' }}>
                📧 Contacts with email: {contacts.filter(c => c.email).length}
              </p>
              <p style={{ margin: '5px 0' }}>
                📱 Contacts with phone: {contacts.filter(c => c.number).length}
              </p>
            </div>

            {contacts.filter(c => c.email).length === 0 && contacts.filter(c => c.number).length === 0 && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: '#d32f2f' }}>
                  ⚠️ WARNING: None of your contacts have email or phone numbers!
                  Emails and SMS will NOT be sent when you click SOS.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Last SOS Result */}
      {lastSOSResult && (
        <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0, color: lastSOSResult.success ? '#28a745' : '#dc3545' }}>
            {lastSOSResult.success ? '✅' : '❌'} Last SOS Result
          </h3>
          {lastSOSResult.success ? (
            <div>
              <p><strong>Status:</strong> {lastSOSResult.message}</p>
              {lastSOSResult.data && (
                <div>
                  <p><strong>Contacts Notified:</strong> {lastSOSResult.data.contactsNotified?.total || 0}</p>
                  <p><strong>Emails Sent:</strong> {lastSOSResult.data.contactsNotified?.emails || 0}</p>
                  <p><strong>SMS Sent:</strong> {lastSOSResult.data.contactsNotified?.sms || 0}</p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#dc3545' }}>{lastSOSResult.message}</p>
          )}
        </div>
      )}

      {/* Troubleshooting Tips */}
      <div style={{ padding: '15px', background: 'white', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>💡 Troubleshooting</h3>
        <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
          <li>Make sure you have at least one emergency contact</li>
          <li>Contacts must have email and/or phone number</li>
          <li>Check backend console for detailed logs</li>
          <li>Check your email spam folder</li>
          <li>Verify EMAIL_* variables in backend/.env</li>
        </ul>
      </div>
    </div>
  );
};

export default SOSDebugInfo;

