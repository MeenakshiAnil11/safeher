import React, { useState, useEffect, useRef } from 'react';
import { formatAddress, formatShortAddress } from '../utils/geocoding';
import './LeafletMapComponent.css';



const LeafletMapComponent = ({
  location = null,
  isActive = false,
  zoom = 15,
  center = null,
  className = '',
  height = '400px',
  showPopup = true,
  onMapClick = null,
  trackingHistory = [],
  addressDetails = null,
  mapContainerStyle = null
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(true); // Set to true to show fallback

  // Default map container style
  const defaultMapContainerStyle = {
    width: '100%',
    height: height,
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const finalMapContainerStyle = mapContainerStyle || defaultMapContainerStyle;

  // Format location for display
  const formatLocation = (loc) => {
    if (!loc) return 'Location not available';
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  };

  // Format accuracy
  const formatAccuracy = (accuracy) => {
    if (!accuracy) return '';
    return `±${Math.round(accuracy)}m`;
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`leaflet-map-container ${className}`}>
      <div className="map-header">
        <h3>🗺️ Live Location Map</h3>
        {location && (
          <div className="location-info">
            <span className="coordinates">{formatLocation(location)}</span>
            {location.accuracy && (
              <span className="accuracy">{formatAccuracy(location.accuracy)}</span>
            )}
            {addressDetails && (
              <div className="address-info">
                <span className="address">{formatShortAddress(addressDetails)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={finalMapContainerStyle} className="map-wrapper">
        <div className="map-fallback">
          <div className="fallback-content">
            <div className="map-placeholder">
              <div className="map-icon">🗺️</div>
              <h4>Interactive Map</h4>
              <p>Map functionality temporarily disabled</p>
            </div>
            
            {location && (
              <div className="location-details">
                <h4>{isActive ? '🚨 SOS Active Location' : '📍 Current Location'}</h4>
                <div className="location-info-grid">
                  <div className="info-item">
                    <span className="info-label">Coordinates:</span>
                    <span className="info-value">{formatLocation(location)}</span>
                  </div>
                  {location.accuracy && (
                    <div className="info-item">
                      <span className="info-label">Accuracy:</span>
                      <span className="info-value">{formatAccuracy(location.accuracy)}</span>
                    </div>
                  )}
                  {location.timestamp && (
                    <div className="info-item">
                      <span className="info-label">Updated:</span>
                      <span className="info-value">{formatTime(location.timestamp)}</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="sos-status">
                      <span className="sos-badge">🚨 EMERGENCY ACTIVE</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {trackingHistory.length > 0 && (
              <div className="tracking-history">
                <h4>📍 Tracking History ({trackingHistory.length} points)</h4>
                <div className="history-list">
                  {trackingHistory.slice(-5).map((point, index) => (
                    <div key={index} className="history-item">
                      <span className="history-number">{index + 1}</span>
                      <span className="history-coords">{formatLocation(point)}</span>
                      <span className="history-time">{formatTime(point.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map controls and info */}
      <div className="map-controls">
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-marker sos-marker active">🚨</span>
            <span>SOS Active Location</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker sos-marker">📍</span>
            <span>Current Location</span>
          </div>
          {trackingHistory.length > 0 && (
            <div className="legend-item">
              <span className="legend-marker history-marker">●</span>
              <span>Tracking History ({trackingHistory.length})</span>
            </div>
          )}
          {selectedLocation && (
            <div className="legend-item">
              <span className="legend-marker selected-marker">?</span>
              <span>Selected Location</span>
            </div>
          )}
        </div>

        <div className="map-stats">
          {location && (
            <div className="stat-item">
              <span className="stat-label">Last Update:</span>
              <span className="stat-value">{formatTime(location.timestamp)}</span>
            </div>
          )}
          {trackingHistory.length > 0 && (
            <div className="stat-item">
              <span className="stat-label">Tracking Points:</span>
              <span className="stat-value">{trackingHistory.length}</span>
            </div>
          )}
          {selectedLocation && (
            <div className="stat-item">
              <span className="stat-label">Selected:</span>
              <span className="stat-value">{formatLocation(selectedLocation)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeafletMapComponent;
