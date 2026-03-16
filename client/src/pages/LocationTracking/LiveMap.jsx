import React, { useState, useEffect, useMemo } from 'react';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import locationService from '../../services/locationService';
import { reverseGeocode, formatAddress, forwardGeocode } from '../../utils/geocoding';
import './LiveMap.css';

export default function LiveMap({ currentLocation, isTracking, sosActive = false, onToggleTracking, onLocationUpdate }) {
  const [location, setLocation] = useState(currentLocation);
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [safeZones, setSafeZones] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [geofenceStatus, setGeofenceStatus] = useState(null);
  const [dangerBanner, setDangerBanner] = useState('');
  const [routeDestination, setRouteDestination] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteType, setSelectedRouteType] = useState('fastest');
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [quickZoneName, setQuickZoneName] = useState('');
  const [quickZoneRadius, setQuickZoneRadius] = useState(500);

  const apiGetSafeZones = async () => {
    const api = (await import('../../services/api')).default;
    const response = await api.get('/location/safe-zones');
    return response.data || [];
  };

  const createQuickSafeZone = async () => {
    if (!location) return;
    const name = quickZoneName.trim() || 'Pinned Safe Zone';
    try {
      const api = (await import('../../services/api')).default;
      await api.post('/location/safe-zones', {
        name,
        description: address || 'Created from live map',
        latitude: location.latitude,
        longitude: location.longitude,
        radius: quickZoneRadius,
      });
      setQuickZoneName('');
      const zones = await apiGetSafeZones();
      setSafeZones(zones);
      alert('Safe zone saved successfully.');
    } catch (error) {
      console.error('Failed to create safe zone:', error);
      alert('Failed to create safe zone.');
    }
  };

  const resolveDestinationAndBuildRoutes = async () => {
    if (!location || !routeDestination.trim()) return;
    setIsRouteLoading(true);
    setLocationError('');
    try {
      const results = await forwardGeocode(routeDestination);
      if (!results.length) {
        setLocationError('Destination not found. Please try another address.');
        setRouteOptions([]);
        setSelectedDestination(null);
        return;
      }
      const destination = results[0];
      setSelectedDestination(destination);

      const routeData = await locationService.getSafeRouteOptions(
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
        }
      );

      setRouteOptions(routeData?.routes || []);
      setSelectedRouteType('fastest');
    } catch (error) {
      console.error('Failed to fetch route options:', error);
      setLocationError('Unable to get route options right now.');
      setRouteOptions([]);
      setSelectedDestination(null);
    } finally {
      setIsRouteLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      console.log('📍 Current location received in LiveMap:', {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        timestamp: currentLocation.timestamp
      });
      setLocation(currentLocation);
      // Get address for the current location
      getAddressFromCoordinates(currentLocation.latitude, currentLocation.longitude);
    } else {
      console.warn('⚠️ No current location in LiveMap component');
    }
  }, [currentLocation]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const [safeZonesRes, dangerZonesRes] = await Promise.all([
          apiGetSafeZones(),
          locationService.getDangerZones(),
        ]);
        setSafeZones(safeZonesRes);
        setDangerZones(dangerZonesRes);
      } catch (error) {
        console.error('Failed loading geo zones:', error);
      }
    };
    loadZones();
  }, []);

  useEffect(() => {
    if (!location) return;
    const evaluateGeoFence = async () => {
      try {
        await locationService.saveLiveLocation(location, isTracking ? 'tracking' : 'manual');
        const status = await locationService.checkGeoFenceStatus(location, sosActive);
        setGeofenceStatus(status);
        setDangerBanner(status?.insideDangerZones?.length ? (status.alert || '⚠️ You’ve entered a flagged area') : '');
      } catch (error) {
        console.error('Geofence check failed:', error);
      }
    };
    evaluateGeoFence();
  }, [location, isTracking, sosActive]);

  const zoneOverlays = useMemo(() => {
    const safe = safeZones.map((zone) => ({
      lat: zone.latitude,
      lng: zone.longitude,
      radius: zone.radius,
      fillColor: '#10b981',
      strokeColor: '#059669',
      fillOpacity: 0.12,
    }));
    const danger = dangerZones
      .filter((zone) => zone.zoneType === 'circle' && zone.center)
      .map((zone) => ({
        lat: zone.center.lat,
        lng: zone.center.lng,
        radius: zone.radius || 500,
        fillColor: '#ef4444',
        strokeColor: '#dc2626',
        fillOpacity: 0.18,
      }));
    return [...safe, ...danger];
  }, [safeZones, dangerZones]);

  const selectedRoute = routeOptions.find((r) => r.type === selectedRouteType) || null;
  const routePolylines = selectedRoute
    ? [
        {
          path: selectedRoute.path.map((p) => ({ lat: p.lat, lng: p.lng })),
          strokeColor: selectedRouteType === 'safe' ? '#0f766e' : '#2563eb',
          strokeWeight: 5,
        },
      ]
    : [];

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      setIsLoading(true);
      const addrDetails = await reverseGeocode(latitude, longitude);
      setAddressDetails(addrDetails);
      if (addrDetails) {
        const formattedAddr = formatAddress(addrDetails.address);
        setAddress(formattedAddr);
      } else {
        setAddress('Address not available');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Address not available');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLocationError('');
      setIsLoading(true);
      // Force fresh location with high accuracy
      const loc = await locationService.requestLocationPermission({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0 // Always get fresh location
      });
      setLocation(loc);
      await getAddressFromCoordinates(loc.latitude, loc.longitude);
    } catch (error) {
      setLocationError(error.message);
      console.error('Error getting location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setLocationError('');
    
    try {
      const results = await forwardGeocode(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        setLocationError('No locations found. Try a different search term.');
      }
    } catch (error) {
      setLocationError('Search failed. Please try again.');
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    const newLocation = {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 10, // Set high accuracy for manually selected locations
      timestamp: new Date().toISOString()
    };
    
    setLocation(newLocation);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    
    // Get address details for the selected location
    await getAddressFromCoordinates(result.latitude, result.longitude);
    
    // Update location service
    locationService.currentLocation = newLocation;
    locationService.addToHistory(newLocation);
    
    // Notify parent component if callback provided
    if (onLocationUpdate) {
      onLocationUpdate(newLocation);
    }
  };

  const handleDisableLocation = () => {
    setLocation(null);
    setAddress('');
    setAddressDetails(null);
    setLocationError('');
    if (onToggleTracking) {
      onToggleTracking(); // Stop tracking if it's active
    }
  };

  const formatLocation = () => {
    if (!location) return 'Not available';
    console.log('Formatting location:', location);
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <div className="live-map-container">
      {/* Current Location Status */}
      <section className="current-location-status">
        <div className="section-header">
          <h2>📍 Current Location Status</h2>
          <div className={`status-indicator ${location ? 'active' : 'inactive'}`}>
            <span className="status-icon">
              {location ? '✅' : '❌'}
            </span>
            <span className="status-text">
              {location ? 'Location Active' : 'No Location'}
            </span>
          </div>
        </div>

        {location ? (
          <div className="location-info-card">
            <div className="info-grid">
              <div className="info-item">
                <label>Coordinates:</label>
                <span className="mono-text">{formatLocation()}</span>
              </div>
              {address && (
                <div className="info-item">
                  <label>Address:</label>
                  <span>{address}</span>
                </div>
              )}
              {location.accuracy && (
                <div className="info-item">
                  <label>Accuracy:</label>
                  <span className="accuracy-display">
                    ±{Math.round(location.accuracy)}m
                    {location.accuracy < 10 && <span className="accuracy-badge excellent">Excellent</span>}
                    {location.accuracy >= 10 && location.accuracy < 50 && <span className="accuracy-badge good">Good</span>}
                    {location.accuracy >= 50 && location.accuracy < 200 && <span className="accuracy-badge moderate">Moderate</span>}
                    {location.accuracy >= 200 && <span className="accuracy-badge poor">Low</span>}
                  </span>
                </div>
              )}
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(location.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div className="location-actions">
              <button 
                onClick={handleGetCurrentLocation}
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : '📍 Get GPS Location'}
              </button>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                🔍 Search Location
              </button>
              <button 
                onClick={handleDisableLocation}
                className="btn-secondary-small"
              >
                🔒
              </button>
            </div>
            
            {/* Location Search */}
            {showSearch && (
              <div className="location-search-container" style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                    placeholder="Search for location (e.g., Amlajyothi College of Engineering Kanjirappaly)"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button
                    onClick={handleSearchLocation}
                    disabled={isSearching || !searchQuery.trim()}
                    className="btn-primary"
                    style={{ minWidth: '100px' }}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="search-results" style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '0.5rem'
                  }}>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSearchResult(result)}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#1f2937' }}>
                          {result.displayName}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="location-error-card">
            <p>No location data available</p>
            <button onClick={handleGetCurrentLocation} className="btn-primary">
              Enable Location Services
            </button>
          </div>
        )}

        {locationError && (
          <div className="error-message">
            ⚠️ {locationError}
          </div>
        )}
      </section>

      {dangerBanner ? (
        <section className="geo-alert-banner" role="alert" aria-live="assertive">
          <strong>{dangerBanner}</strong>
          <span>
            Stay alert and switch to <b>Safe Route</b>. If SOS is active, trusted contacts can be auto-notified.
          </span>
        </section>
      ) : null}

      <section className="geo-tools-grid">
        <article className="geo-tool-card">
          <h3>🏠 Quick Safe Zone</h3>
          <p>Save your current pin as a safe zone with custom radius.</p>
          <div className="geo-form-row">
            <input
              type="text"
              value={quickZoneName}
              onChange={(e) => setQuickZoneName(e.target.value)}
              placeholder="Zone name (Home, Office)"
              aria-label="Safe zone name"
            />
          </div>
          <div className="geo-form-row">
            <label htmlFor="quick-zone-radius">Radius: {quickZoneRadius}m</label>
            <input
              id="quick-zone-radius"
              type="range"
              min="100"
              max="1500"
              step="50"
              value={quickZoneRadius}
              onChange={(e) => setQuickZoneRadius(Number(e.target.value))}
            />
          </div>
          <button className="btn-primary" onClick={createQuickSafeZone} disabled={!location}>
            Save Current Location as Safe Zone
          </button>
          {geofenceStatus ? (
            <p className="geo-status-inline">
              Safe zones nearby: {geofenceStatus.insideSafeZones?.length || 0} | Danger zones nearby: {geofenceStatus.insideDangerZones?.length || 0}
            </p>
          ) : null}
        </article>

        <article className="geo-tool-card">
          <h3>🛣️ Safe Route Navigation</h3>
          <p>Get fastest and safer route options with flagged zones considered.</p>
          <div className="geo-form-row">
            <input
              type="text"
              value={routeDestination}
              onChange={(e) => setRouteDestination(e.target.value)}
              placeholder="Enter destination address"
              aria-label="Destination address"
            />
            <button className="btn-primary" onClick={resolveDestinationAndBuildRoutes} disabled={isRouteLoading || !location}>
              {isRouteLoading ? 'Calculating...' : 'Get Routes'}
            </button>
          </div>

          {routeOptions.length > 0 ? (
            <div className="route-options">
              {routeOptions.map((route) => (
                <button
                  key={route.type}
                  className={`route-option ${selectedRouteType === route.type ? 'active' : ''}`}
                  onClick={() => setSelectedRouteType(route.type)}
                >
                  <span>{route.title}</span>
                  <small>
                    {(route.distanceMeters / 1000).toFixed(2)} km • {route.etaMinutes} min
                  </small>
                </button>
              ))}
            </div>
          ) : null}

          {selectedRoute ? (
            <p className="route-summary">
              Selected: <strong>{selectedRoute.title}</strong> with <strong>{selectedRoute.riskLevel}</strong> risk.
            </p>
          ) : null}
        </article>
      </section>

      {/* Interactive Map */}
      <section className="interactive-map-section">
        <h2 className="section-title">🗺️ Interactive Location Map</h2>
        <div className="map-container">
          {location ? (
            <GoogleMapComponent
              location={location}
              isActive={isTracking}
              zoom={location.accuracy ? (location.accuracy < 10 ? 18 : location.accuracy < 50 ? 16 : 15) : 15}
              height="500px"
              showAccuracyCircle={true}
              circles={zoneOverlays}
              polylines={routePolylines}
              markers={
                selectedDestination
                  ? [
                      {
                        lat: selectedDestination.latitude,
                        lng: selectedDestination.longitude,
                        title: 'Destination',
                      },
                    ]
                  : []
              }
            />
          ) : (
            <div className="map-placeholder">
              <div className="placeholder-content">
                <span className="placeholder-icon">🗺️</span>
                <p>Location services are not enabled</p>
                <button onClick={handleGetCurrentLocation} className="btn-primary">
                  Enable Location
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Safety Features and Benefits */}
      <section className="safety-features">
        <h2 className="section-title">🛡️ Safety Features & Benefits</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Emergency SOS</h3>
            <p>Instant alert to your emergency contacts with your exact location</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Real-time Tracking</h3>
            <p>Continuous location monitoring for your safety and peace of mind</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Contact Sharing</h3>
            <p>Share your location with trusted contacts in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Privacy Protected</h3>
            <p>Your location data is encrypted and secure</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">💡 How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Enable Location Services</h3>
              <p>Allow the app to access your location for real-time tracking</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Add Emergency Contacts</h3>
              <p>Add trusted contacts who will receive your location in emergencies</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Start Tracking</h3>
              <p>Begin location tracking to keep yourself safe</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Emergency SOS</h3>
              <p>Press the SOS button in emergencies to alert your contacts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

