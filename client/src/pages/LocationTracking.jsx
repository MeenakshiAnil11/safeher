import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/UserHeader';
import UserSidebar from '../components/UserSidebar';
import Footer from '../components/Footer';
import SOSButton from '../components/SOSButton';
import LocationMap from '../components/LocationMap';
import LeafletMapComponent from '../components/LeafletMapComponent';
import { reverseGeocode, formatAddress, formatShortAddress } from '../utils/geocoding';
import './LocationTracking.css';

export default function LocationTracking() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Get address details from coordinates
  const getAddressFromCoordinates = async (latitude, longitude) => {
    setIsGeocoding(true);
    try {
      const address = await reverseGeocode(latitude, longitude);
      setAddressDetails(address);
    } catch (error) {
      console.error('Geocoding failed:', error);
      setAddressDetails(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(location);
        setLocationError('');
        // Get address details
        getAddressFromCoordinates(location.latitude, location.longitude);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Start/stop location tracking
  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      setLocationError('');
    } else {
      getCurrentLocation();
      setIsTracking(true);
    }
  };

  // Handle SOS activation with location
  const handleSOSActivate = (locationData) => {
    setSosActive(true);
    console.log('SOS Activated!', locationData);

    // In a real app, you would send the location to emergency contacts
    if (locationData) {
      const addressText = addressDetails ? `\nAddress: ${formatShortAddress(addressDetails)}` : '';
      alert(`🚨 SOS ALERT SENT!\n\nYour location has been shared with emergency contacts:\nLatitude: ${locationData.latitude.toFixed(6)}\nLongitude: ${locationData.longitude.toFixed(6)}\nAccuracy: ±${Math.round(locationData.accuracy)}m${addressText}`);
    } else {
      alert('🚨 SOS ALERT SENT!\n\nNote: Location not available. Emergency contacts have been notified without location data.');
    }
  };

  // Handle location updates from SOSButton
  const handleLocationUpdate = (locationData) => {
    setCurrentLocation(locationData);
    console.log('Location updated:', locationData);
    // Get address details for SOS location
    if (locationData) {
      getAddressFromCoordinates(locationData.latitude, locationData.longitude);
    }
  };

  // Handle real-time tracking updates
  const handleTrackingUpdate = (locationData, updateCount) => {
    console.log(`🔄 Real-time tracking update #${updateCount}:`, locationData);
    // In a real app, you would send this to your backend/emergency contacts
    // For now, we'll just log it and update the UI
    setCurrentLocation(locationData);
    
    // Add to tracking history for map display
    setLocationHistory(prev => [...prev, locationData]);
  };

  // Handle SOS deactivation
  const handleSOSDeactivate = () => {
    setSosActive(false);
    console.log('SOS Deactivated');
  };

  // Format location for display
  const formatLocation = (location) => {
    if (!location) return 'Location not available';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  // Format accuracy
  const formatAccuracy = (accuracy) => {
    if (!accuracy) return '';
    return `±${Math.round(accuracy)}m`;
  };

  return (
    <div className="location-tracking-container">
      <UserHeader />
      <div className="location-tracking-body">
        <UserSidebar className="location-tracking-sidebar" />
        <main className="location-tracking-main">
          <div className="location-tracking-content">
            <div className="page-header">
              <h1>📍 Location Tracking</h1>
              <p>Track your location and access emergency SOS features</p>
            </div>

            <div className="location-section">
              <div className="location-card">
                <h2>Current Location</h2>
                <div className="location-info">
                  {currentLocation ? (
                    <div className="location-details">
                      <div className="location-coords">
                        <span className="label">Coordinates:</span>
                        <span className="value">{formatLocation(currentLocation)}</span>
                      </div>
                      <div className="location-accuracy">
                        <span className="label">Accuracy:</span>
                        <span className="value">{formatAccuracy(currentLocation.accuracy)}</span>
                      </div>
                      <div className="location-time">
                        <span className="label">Last Updated:</span>
                        <span className="value">
                          {new Date(currentLocation.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {addressDetails && (
                        <div className="location-address">
                          <span className="label">Address:</span>
                          <span className="value address-value">
                            {formatAddress(addressDetails)}
                          </span>
                        </div>
                      )}
                      {isGeocoding && (
                        <div className="location-geocoding">
                          <span className="geocoding-indicator">🔍 Getting address details...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-location">
                      <p>📍 Location not available</p>
                      <p className="location-hint">Click "Get Location" to enable location tracking</p>
                    </div>
                  )}
                </div>

                {locationError && (
                  <div className="location-error">
                    <p>⚠️ {locationError}</p>
                  </div>
                )}

                <div className="location-actions">
                  <button 
                    className={`btn ${isTracking ? 'btn-danger' : 'btn-primary'}`}
                    onClick={toggleTracking}
                  >
                    {isTracking ? '🛑 Stop Tracking' : '📍 Get Location'}
                  </button>
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={getCurrentLocation}
                    disabled={!navigator.geolocation}
                  >
                    🔄 Refresh Location
                  </button>
                </div>
              </div>
            </div>

            <div className="sos-section">
              <div className="sos-card">
                <h2>🚨 Emergency SOS</h2>
                <p className="sos-description">
                  Hold the button for 3 seconds to activate SOS alert. 
                  Your location will be shared with emergency contacts.
                </p>
                
                <SOSButton
                  onActivate={handleSOSActivate}
                  onDeactivate={handleSOSDeactivate}
                  holdToActivate={true}
                  holdDuration={3000}
                  requireLocation={true}
                  onLocationUpdate={handleLocationUpdate}
                  enableRealTimeTracking={true}
                  trackingInterval={5000}
                  onTrackingUpdate={handleTrackingUpdate}
                />

                {sosActive && (
                  <div className="sos-status">
                    <div className="sos-status-indicator">
                      <span className="sos-icon">🚨</span>
                      <span className="sos-text">SOS ALERT ACTIVE</span>
                    </div>
                    <p className="sos-note">
                      Emergency contacts have been notified of your location.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Location Map */}
            <div className="map-section">
              <div className="map-card">
                <h2>🗺️ Live Location Map</h2>
                <p className="map-description">
                  Real-time OpenStreetMap showing your current location and tracking history during SOS mode.
                </p>

                <LeafletMapComponent
                  location={currentLocation}
                  isActive={sosActive}
                  zoom={15}
                  height="400px"
                  showPopup={true}
                  trackingHistory={locationHistory}
                  addressDetails={addressDetails}
                  onMapClick={(coords) => {
                    console.log('Map clicked at:', coords);
                  }}
                />
              </div>
            </div>

            <div className="info-section">
              <div className="info-card">
                <h3>ℹ️ How it works</h3>
                <ul className="info-list">
                  <li>📍 <strong>Location Tracking:</strong> Get your current GPS coordinates</li>
                  <li>🚨 <strong>SOS Button:</strong> Hold for 3 seconds to send emergency alert</li>
                  <li>👥 <strong>Emergency Contacts:</strong> Your trusted contacts will be notified</li>
                  <li>🔒 <strong>Privacy:</strong> Location data is only shared during emergencies</li>
                </ul>
              </div>
            </div>

            <div className="quick-actions">
              <Link to="/my-contacts" className="action-link">
                <span className="action-icon">📇</span>
                <span className="action-text">Manage Emergency Contacts</span>
              </Link>
              
              <Link to="/settings" className="action-link">
                <span className="action-icon">⚙️</span>
                <span className="action-text">Location Settings</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
