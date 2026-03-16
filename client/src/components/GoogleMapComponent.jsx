import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, Circle } from '@react-google-maps/api';
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
  mapContainerStyle = null,
  showAccuracyCircle = true,
  showTrackingPath = true,
  circles = [],
  polylines = [],
  markers = []
}) => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mapRef = useRef(null);

  // Timeout effect for loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Google Maps loading timeout");
        setLoadError(true);
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Pan map to location when it changes
  useEffect(() => {
    if (map && location) {
      const newCenter = {
        lat: location.latitude,
        lng: location.longitude
      };
      
      // Pan to the new location smoothly
      map.panTo(newCenter);
      
      // Calculate appropriate zoom based on accuracy
      // Higher accuracy (lower meters) = higher zoom
      // Lower accuracy (higher meters) = lower zoom
      if (location.accuracy) {
        let calculatedZoom = zoom;
        if (location.accuracy < 10) {
          calculatedZoom = 18; // Very accurate (GPS)
        } else if (location.accuracy < 50) {
          calculatedZoom = 16; // Accurate (GPS/WiFi)
        } else if (location.accuracy < 200) {
          calculatedZoom = 15; // Moderate (WiFi/Cell)
        } else if (location.accuracy < 1000) {
          calculatedZoom = 13; // Low accuracy (Cell tower)
        } else {
          calculatedZoom = 12; // Very low accuracy
        }
        
        // Only change zoom if it's significantly different
        const currentZoom = map.getZoom();
        if (Math.abs(currentZoom - calculatedZoom) > 1) {
          map.setZoom(calculatedZoom);
        }
      }
      
      console.log('📍 Map panned to location:', {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        zoom: map.getZoom()
      });
    }
  }, [map, location, zoom]);

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


  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // Handle map click
  const handleMapClick = useCallback((event) => {
    if (onMapClick && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const clickedLocation = {
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString()
      };
      setSelectedLocation(clickedLocation);
      onMapClick(clickedLocation);
    }
  }, [onMapClick]);

  // Helper function to safely create Google Maps Size objects
  const createGoogleMapsSize = (width, height) => {
    if (window.google && window.google.maps && window.google.maps.Size) {
      return new window.google.maps.Size(width, height);
    }
    return { width, height };
  };

  // Helper function to safely create Google Maps Point objects
  const createGoogleMapsPoint = (x, y) => {
    if (window.google && window.google.maps && window.google.maps.Point) {
      return new window.google.maps.Point(x, y);
    }
    return { x, y };
  };

  // Current location marker icon with 📍 pin
  const currentLocationIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin shadow -->
        <ellipse cx="25" cy="55" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
        <!-- Pin body -->
        <path d="M 25 0 L 45 15 L 45 25 C 45 30 43 32 40 35 L 25 55 L 10 35 C 7 32 5 30 5 25 L 5 15 Z" 
              fill="${isActive ? '#ff4444' : '#007bff'}" 
              stroke="white" 
              stroke-width="2"/>
        <!-- Pin point marker -->
        <circle cx="25" cy="20" r="10" fill="white"/>
        <text x="25" y="28" text-anchor="middle" fill="${isActive ? '#ff4444' : '#007bff'}" font-size="18" font-weight="bold">📍</text>
      </svg>
    `),
    scaledSize: createGoogleMapsSize(50, 60),
    anchor: createGoogleMapsPoint(25, 60)
  };

  // Tracking history marker icon
  const trackingMarkerIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#28a745" stroke="white" stroke-width="2"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>
    `),
    scaledSize: createGoogleMapsSize(20, 20),
    anchor: createGoogleMapsPoint(10, 20)
  };

  // Prepare tracking path coordinates
  const trackingPath = trackingHistory.map(point => ({
    lat: point.latitude,
    lng: point.longitude
  }));

  // If we have current location, add it to the path
  if (location && trackingPath.length === 0) {
    trackingPath.push({
      lat: location.latitude,
      lng: location.longitude
    });
  }

  // Retry loading the map
  const retryMapLoad = () => {
    if (retryCount < 3) {
      console.log(`🔄 Retrying map load (attempt ${retryCount + 1}/3)`);
      setRetryCount(prev => prev + 1);
      setLoadError(false);
      setIsLoading(true);
      // Force re-render by updating a dummy state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      console.error("❌ Max retry attempts reached");
    }
  };

  if (loadError) {
    return (
      <div className={`google-map-error ${className}`} style={finalMapContainerStyle}>
        <div className="map-error-content">
          <div className="error-icon">🗺️</div>
          <h3>Map Loading Failed</h3>
          <p>Unable to load Google Maps. Please check your internet connection and try again.</p>
          <div className="retry-section">
            <button 
              className="retry-button"
              onClick={retryMapLoad}
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? '❌ Max Retries Reached' : `🔄 Retry (${retryCount}/3)`}
            </button>
            <p className="retry-info">
              {retryCount >= 3 
                ? 'Please refresh the page or check your internet connection.'
                : 'Click retry to attempt loading the map again.'
              }
            </p>
          </div>
          <div className="error-details">
            {location && (
              <div className="location-fallback">
                <h4>📍 Current Location</h4>
                <p><strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                <p><strong>Accuracy:</strong> ±{Math.round(location.accuracy || 0)}m</p>
                {addressDetails && (
                  <p><strong>Address:</strong> {formatShortAddress(addressDetails)}</p>
                )}
                <div className="map-links">
                  <a 
                    href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    🗺️ Open in Google Maps
                  </a>
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    🌍 Open in OpenStreetMap
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check if Google Maps API is loaded
  const isGoogleMapsLoaded = () => {
    return window.google && window.google.maps && window.google.maps.Map;
  };

  // Check if API key is valid
  const isApiKeyValid = () => {
    const isValid = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
    console.log('Google Maps API Key Status:', {
      hasKey: !!GOOGLE_MAPS_API_KEY,
      isValid: isValid,
      keyPreview: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'No key'
    });
    return isValid;
  };

  // Render fallback if API key is missing
  if (!isApiKeyValid()) {
    console.warn('Google Maps API key not configured. Showing fallback with Leaflet.');
    return (
      <div className={`google-map-container ${className}`}>
        <div className="map-fallback" style={finalMapContainerStyle}>
          <div className="fallback-content">
            {/* Leaflet map as fallback */}
            {location ? (
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: finalMapContainerStyle.height || '400px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                overflow: 'visible'
              }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.005},${location.latitude - 0.005},${location.longitude + 0.005},${location.latitude + 0.005}&layer=mapnik&marker=${location.latitude},${location.longitude}&lat=${location.latitude}&lon=${location.longitude}&zoom=17`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  title="OpenStreetMap"
                  loading="lazy"
                  style={{ border: 'none', borderRadius: '8px' }}
                />
                
                {/* Marker Container - positioned absolutely over iframe */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {/* Large pulse ring */}
                  <div style={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: `4px solid ${isActive ? '#ff4444' : '#007bff'}`,
                    opacity: 0.3,
                    animation: 'ripple 2s infinite',
                    transform: 'translate(-50%, -50%)'
                  }} />
                  
                  {/* Large marker circle */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isActive ? '#ff4444' : '#007bff',
                    border: '5px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    animation: 'pulse 2s infinite',
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)'
                  }}>
                    {isActive ? '🚨' : '📍'}
                  </div>
                  
                  {/* Small center dot */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isActive ? '#ff4444' : '#007bff',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    position: 'absolute',
                    top: 'calc(50% + 30px)',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 1.5s infinite'
                  }} />
                </div>
              </div>
            ) : (
              <div className="map-placeholder" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: finalMapContainerStyle.height || '400px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>Location Map</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>Waiting for location data...</p>
              </div>
            )}
            
            {/* Location details below map */}
            {location && (
              <div className="location-fallback" style={{
                marginTop: '1rem',
                padding: '1.5rem',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ 
                  margin: '0 0 1rem', 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  color: isActive ? '#ef4444' : '#3b82f6'
                }}>
                  {isActive ? '🚨 SOS Active Location' : '📍 Current Location'}
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem'
                }}>
                  <div>
                    <strong>Coordinates:</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontFamily: 'monospace' }}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <strong>Accuracy:</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                      ±{Math.round(location.accuracy || 0)}m
                    </p>
                  </div>
                  <div>
                    <strong>Updated:</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                      {new Date(location.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {addressDetails && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Address:</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                      {formatAddress(addressDetails)}
                    </p>
                  </div>
                )}
                <div style={{ 
                  marginTop: '1rem', 
                  display: 'flex', 
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <a 
                    href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    🗺️ Open in Google Maps
                  </a>
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#059669',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    🌍 Open in OpenStreetMap
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#6b7280',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    📱 Open in Maps App
                  </a>
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
      {isLoading && (
        <div className="map-loading-overlay" style={finalMapContainerStyle}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}
      
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => {
          console.log("✅ Google Maps API loaded successfully");
          console.log("Google Maps version:", window.google?.maps?.version);
          setIsLoading(false);
          setLoadError(false);
        }}
        onError={(error) => {
          console.error("❌ Google Maps Load Error:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            apiKey: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'No key'
          });
          setLoadError(true);
          setIsLoading(false);
        }}
        preventGoogleFontsLoading={true}
        libraries={['places']}
        loadingElement={
          <div className="map-loading-overlay" style={finalMapContainerStyle}>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading Google Maps...</p>
            </div>
          </div>
        }
      >
        <div
          className="map-wrapper"
          style={{
            ...finalMapContainerStyle,
            display: isLoading ? 'none' : 'block'
          }}
        >
          <GoogleMap
            mapContainerStyle={finalMapContainerStyle}
            center={(() => {
              const centerValue = getCenter();
              console.log('Map center:', centerValue, 'from location:', location);
              return centerValue;
            })()}
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
              <>
                <Marker
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={currentLocationIcon}
                  title={isActive ? '🚨 SOS Active Location' : '📍 Current Location'}
                />
                {console.log('📍 Rendering marker at:', { 
                  lat: location.latitude, 
                  lng: location.longitude,
                  icon: currentLocationIcon,
                  isActive: isActive
                })}
              </>
            )}

            {/* Accuracy circle around current location */}
            {location && showAccuracyCircle && location.accuracy && (
              <Circle
                center={{ lat: location.latitude, lng: location.longitude }}
                radius={location.accuracy}
                options={{
                  fillColor: isActive ? '#ff4444' : '#007bff',
                  fillOpacity: 0.1,
                  strokeColor: isActive ? '#ff4444' : '#007bff',
                  strokeOpacity: 0.3,
                  strokeWeight: 2
                }}
              />
            )}

            {/* Additional circles (safe/danger zones overlays) */}
            {circles.map((circle, index) => (
              <Circle
                key={`custom-circle-${index}`}
                center={{ lat: circle.lat, lng: circle.lng }}
                radius={circle.radius}
                options={{
                  fillColor: circle.fillColor || "#ef4444",
                  fillOpacity: circle.fillOpacity ?? 0.18,
                  strokeColor: circle.strokeColor || "#dc2626",
                  strokeOpacity: circle.strokeOpacity ?? 0.7,
                  strokeWeight: circle.strokeWeight ?? 2,
                }}
              />
            ))}

            {/* Tracking path */}
            {showTrackingPath && trackingPath.length > 1 && (
              <Polyline
                path={trackingPath}
                options={{
                  strokeColor: isActive ? '#ff4444' : '#28a745',
                  strokeOpacity: 0.8,
                  strokeWeight: 3
                }}
              />
            )}

            {/* Additional route/path overlays */}
            {polylines.map((line, index) => (
              <Polyline
                key={`custom-line-${index}`}
                path={line.path}
                options={{
                  strokeColor: line.strokeColor || "#2563eb",
                  strokeOpacity: line.strokeOpacity ?? 0.9,
                  strokeWeight: line.strokeWeight ?? 4,
                }}
              />
            ))}

            {/* Tracking history markers */}
            {trackingHistory.map((point, index) => (
              <Marker
                key={`tracking-${index}`}
                position={{ lat: point.latitude, lng: point.longitude }}
                icon={trackingMarkerIcon}
                title={`Tracking Point ${index + 1} - ${new Date(point.timestamp).toLocaleTimeString()}`}
              />
            ))}

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
                  scaledSize: createGoogleMapsSize(30, 30),
                  anchor: createGoogleMapsPoint(15, 30)
                }}
                title="Selected Location"
              />
            )}

            {/* Additional markers */}
            {markers.map((marker, index) => (
              <Marker
                key={`custom-marker-${index}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.title || "Marker"}
              />
            ))}
          </GoogleMap>
        </div>
      </LoadScript>

      {/* Location info popup */}
      {showPopup && location && (
        <div className="location-info-popup">
          <div className="popup-header">
            <span className="popup-icon">{isActive ? '🚨' : '📍'}</span>
            <span className="popup-title">{isActive ? 'SOS Active Location' : 'Current Location'}</span>
          </div>
          <div className="popup-content">
            <div className="location-coords">
              <strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
            <div className="location-accuracy">
              <strong>Accuracy:</strong> ±{Math.round(location.accuracy || 0)}m
            </div>
            <div className="location-time">
              <strong>Time:</strong> {new Date(location.timestamp).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </div>
            {addressDetails && (
              <div className="location-address">
                <strong>Address:</strong> {formatShortAddress(addressDetails)}
              </div>
            )}
            {trackingHistory.length > 0 && (
              <div className="tracking-info">
                <strong>Tracking Points:</strong> {trackingHistory.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;