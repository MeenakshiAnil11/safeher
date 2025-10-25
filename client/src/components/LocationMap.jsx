import React, { useRef, useEffect, useState } from 'react';
import { formatAddress, formatShortAddress } from '../utils/geocoding';
import './LocationMap.css';

// Simple fallback map component to avoid react-leaflet issues

const LocationMap = ({
  location = null,
  isActive = false,
  zoom = 15,
  center = null,
  className = '',
  height = '300px',
  showPopup = true,
  onMapClick = null,
  trackingHistory = [],
  addressDetails = null
}) => {
  const formatLocation = (loc) => {
    if (!loc) return 'Location not available';
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  };

  const formatAccuracy = (accuracy) => {
    if (!accuracy) return '';
    return `±${Math.round(accuracy)}m`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`location-map-container ${className}`}>
      <div className="map-header">
        <h3>📍 Live Location Map</h3>
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
      
      <div className="map-fallback" style={{ height }}>
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
      
      {/* Map controls */}
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
              <span className="legend-marker history-marker">1</span>
              <span>Tracking History</span>
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
        </div>
      </div>
    </div>
  );
};

export default LocationMap;

