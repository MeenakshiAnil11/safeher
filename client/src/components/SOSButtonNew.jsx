import React, { useState } from 'react';
import api from '../services/api';
import './SOSButton.css';

/**
 * SOS Button Component
 * 
 * Features:
 * - Requests browser location permission
 * - Gets current GPS coordinates
 * - Sends SOS alert with location to emergency contacts
 * - Shows confirmation before sending
 * - Handles errors gracefully
 */
const SOSButtonNew = ({ onSuccess = null, onError = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [status, setStatus] = useState(''); // idle, getting-location, sending, success, error
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', type: 'success' });

  /**
   * Request browser location permission and get coordinates
   */
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      // Request high accuracy location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            latitude,
            longitude,
            accuracy
          });
        },
        (error) => {
          let message = 'Location access denied or unavailable';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable location access in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  /**
   * Show confirmation dialog before sending SOS
   */
  const showConfirmation = () => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        '🚨 EMERGENCY SOS ALERT\n\n' +
        'This will send your current location to all your emergency contacts via email and SMS.\n\n' +
        'Are you sure you want to send this SOS alert?'
      );
      resolve(confirmed);
    });
  };

  /**
   * Send SOS alert to backend
   */
  const sendSOS = async (location, message = '') => {
    try {
      const response = await api.post('/sos/send', {
        latitude: location.latitude,
        longitude: location.longitude,
        message: message
      });

      return response.data;
    } catch (error) {
      console.error('SOS send error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send SOS alert');
    }
  };

  /**
   * Handle SOS button click
   */
  const handleSOSClick = async () => {
    // Step 1: Show confirmation
    const confirmed = await showConfirmation();
    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setLocationError('');
    setStatus('getting-location');

    try {
      // Step 2: Get current location
      console.log('📍 Requesting location permission...');
      const location = await getCurrentLocation();
      console.log('✅ Location obtained:', location);

      // Step 3: Send SOS to backend
      setStatus('sending');
      const result = await sendSOS(location);
      console.log('✅ SOS sent successfully:', result);

      // Step 4: Show success message
      setStatus('success');
      
      // Show success dialog
      const totalContacts = result?.data?.contactsNotified?.total ?? result?.contactsNotified?.total ?? 'Multiple';
      const emails = result?.data?.contactsNotified?.emails ?? result?.contactsNotified?.emails ?? '-';
      const sms = result?.data?.contactsNotified?.sms ?? result?.contactsNotified?.sms ?? '-';
      setDialogContent({
        title: '✅ SOS Alert Sent Successfully!',
        message:
          `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n` +
          `Accuracy: ±${Math.round(location.accuracy)} meters\n\n` +
          `Contacts Notified:\n` +
          `- Total: ${totalContacts}\n` +
          `- Emails: ${emails}\n` +
          `- SMS: ${sms}`,
        type: 'success'
      });
      setShowDialog(true);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess({ location, result });
      }

    } catch (error) {
      console.error('❌ SOS Error:', error);
      setStatus('error');
      setLocationError(error.message);
      
      // Show error message
      setDialogContent({
        title: '❌ SOS Alert Failed',
        message: `${error.message}\n\nPlease try again or call emergency services directly.`,
        type: 'error'
      });
      setShowDialog(true);

      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sos-button-container">
      <button
        className={`sos-button ${isLoading ? 'sos-button--loading' : ''} ${status === 'success' ? 'sos-button--success' : ''}`}
        onClick={handleSOSClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            {status === 'getting-location' && '📍 Getting Location...'}
            {status === 'sending' && '🚨 Sending SOS...'}
          </>
        ) : (
          <>
            <span className="sos-icon">🚨</span>
            <span className="sos-text">SEND SOS</span>
          </>
        )}
      </button>

      {locationError && (
        <div className="sos-error-message">
          ⚠️ {locationError}
        </div>
      )}

      <div className="sos-info">
        <p>📍 Uses GPS to get your exact location</p>
        <p>📧 Sends email alerts to emergency contacts</p>
        <p>📱 Sends SMS alerts to emergency contacts</p>
      </div>

      {showDialog && (
        <div
          className="dialog-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => setShowDialog(false)}
        >
          <div
            className="dialog-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 16,
              width: '90%',
              maxWidth: 480,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            <div
              className={`dialog-header ${dialogContent.type}`}
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: dialogContent.type === 'success' ? '#059669' : '#ef4444' }}>
                {dialogContent.title}
              </h3>
              <button
                className="dialog-close"
                onClick={() => setShowDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <div className="dialog-body" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ whiteSpace: 'pre-line', margin: 0, color: '#4b5563' }}>{dialogContent.message}</p>
            </div>
            <div className="dialog-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="dialog-button"
                onClick={() => setShowDialog(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  background: dialogContent.type === 'success' ? '#10b981' : '#ef4444',
                  color: 'white'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSButtonNew;

