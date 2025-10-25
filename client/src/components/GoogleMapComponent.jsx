import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { formatAddress, formatShortAddress } from '../utils/geocoding';
import './GoogleMapComponent.css';

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

const GoogleMapComponent = ({
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
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const mapRef = useRef(null);

  // Default map container style
  const defaultMapContainerStyle = {
    width: '100%',
    height: height,
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const finalMapContainerStyle = mapContainerStyle || defaultMapContainerStyle;

  // Calculate center based on location or provided center
  const getCenter = () => {
    if (center) {
      return { lat: center.lat, lng: center.lng };
    }
    if (location) {
      return { lat: location.latitude, lng: location.longitude };
    }
    // Default center (somewhere in the world)
    return { lat: 20.5937, lng: 78.9629 }; // Center of India
  };

  // Handle map load
  const onLoad = useCallback((map) => {
    setMap(map);
    mapRef.current = map;
    setIsLoading(false);
    setLoadError(false);
  }, []);

  // Timeout effect for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // Handle map click
  const handleMapClick = useCallback((event) => {
    if (onMapClick) {
      const clickedLocation = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
        timestamp: new Date().toISOString()
      };
      setSelectedLocation(clickedLocation);
      onMapClick(clickedLocation);
    }
  }, [onMapClick]);

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

  // Prepare tracking path for polyline
  const trackingPath = trackingHistory.map(point => ({
    lat: point.latitude,
    lng: point.longitude
  }));

  // Custom marker icons
  const currentLocationIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${isActive ? '#ff4444' : '#4285f4'}" stroke="white" stroke-width="3"/>
        <circle cx="20" cy="20" r="8" fill="white"/>
        ${isActive ? '<text x="20" y="25" text-anchor="middle" fill="#ff4444" font-size="16" font-weight="bold">!</text>' : ''}
      </svg>
    `),
    scaledSize: window.google?.maps ? new window.google.maps.Size(40, 40) : { width: 40, height: 40 },
    anchor: window.google?.maps ? new window.google.maps.Point(20, 40) : { x: 20, y: 40 }
  };

  const historyIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#34a853" stroke="white" stroke-width="2"/>
      </svg>
    `),
    scaledSize: window.google?.maps ? new window.google.maps.Size(20, 20) : { width: 20, height: 20 },
    anchor: window.google?.maps ? new window.google.maps.Point(10, 10) : { x: 10, y: 10 }
  };

  // Check if Google Maps API key is configured
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className={`google-map-container ${className}`}>
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
      </div>
    );
  }

  return (
    <div className={`google-map-container ${className}`}>
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

      <LoadScript 
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onError={(error) => {
          console.error('Google Maps failed to load:', error);
          setLoadError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          console.log('Google Maps loaded successfully');
          setIsLoading(false);
          setLoadError(false);
        }}
        loadingElement={
          <div className="map-fallback" style={{ height }}>
            <div className="fallback-content">
              <div className="map-placeholder">
                <div className="map-icon">🗺️</div>
                <h4>Loading Google Maps...</h4>
                <p>Please wait while the map initializes.</p>
              </div>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={finalMapContainerStyle}
          center={getCenter()}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            gestureHandling: 'greedy',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          {/* Current location marker */}
          {location && (
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={currentLocationIcon}
              title={isActive ? '🚨 SOS Active Location' : '📍 Current Location'}
            />
          )}

          {/* Selected location marker (when clicking on map) */}
          {selectedLocation && (
            <Marker
              position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="13" fill="#ff9800" stroke="white" stroke-width="2"/>
                    <text x="15" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">?</text>
                  </svg>
                `),
                scaledSize: window.google?.maps ? new window.google.maps.Size(30, 30) : { width: 30, height: 30 },
                anchor: window.google?.maps ? new window.google.maps.Point(15, 30) : { x: 15, y: 30 }
              }}
              title="Selected Location"
            />
          )}

          {/* Tracking history markers */}
          {trackingHistory.map((point, index) => (
            <Marker
              key={`history-${index}`}
              position={{ lat: point.latitude, lng: point.longitude }}
              icon={historyIcon}
              title={`Tracking Point ${index + 1} - ${formatTime(point.timestamp)}`}
            />
          ))}

          {/* Tracking path polyline */}
          {trackingPath.length > 1 && (
            <Polyline
              path={trackingPath}
              options={{
                strokeColor: isActive ? '#ff4444' : '#4285f4',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                geodesic: true
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Show fallback if there's a load error */}
      {loadError && (
        <div className="map-fallback" style={{ height, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <div className="fallback-content">
            <div className="map-placeholder">
              <div className="map-icon">🗺️</div>
              <h4>Map Unavailable</h4>
              <p>Unable to load Google Maps. Showing location details instead.</p>
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
          </div>
        </div>
      )}

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

      {/* API Key warning */}
      {(!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') && (
        <div className="api-key-warning">
          <p>⚠️ Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your environment variables.</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
