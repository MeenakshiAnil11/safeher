import React, { useState, useEffect, useRef } from 'react';
import locationService from '../services/locationService';
import './SOSButton.css';

const SOSButton = ({ 
  onActivate, 
  onDeactivate, 
  holdToActivate = true, 
  holdDuration = 3000,
  className = '',
  requireLocation = true,
  onLocationUpdate = null,
  enableRealTimeTracking = true,
  trackingInterval = 5000, // 5 seconds default
  onTrackingUpdate = null
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [locationPermission, setLocationPermission] = useState('unknown');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingCount, setTrackingCount] = useState(0);
  const [lastTrackingTime, setLastTrackingTime] = useState(null);
  
  const holdTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const trackingTimerRef = useRef(null);

  // Check location permission on component mount
  useEffect(() => {
    const initializeLocationService = async () => {
      if (requireLocation) {
        try {
          const permission = await locationService.checkPermissionStatus();
          setLocationPermission(permission);
        } catch (error) {
          console.warn('Failed to check location permission:', error);
          setLocationPermission('unknown');
        }
      }
    };

    initializeLocationService();
  }, [requireLocation]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (trackingTimerRef.current) {
        trackingTimerRef.current(); // This is now an unsubscribe function
      }
      // Cleanup location service
      locationService.cleanup();
    };
  }, []);

  // Get current location with permission handling
  const getCurrentLocation = async () => {
    try {
      const location = await locationService.requestLocationPermission();
      setCurrentLocation(location);
      setLocationError('');
      setLocationPermission('granted');
      onLocationUpdate?.(location);
      return location;
    } catch (error) {
      setLocationError(error.message);
      setLocationPermission('denied');
      throw error;
    }
  };

  // Request location permission and get location
  const requestLocationPermission = async () => {
    try {
      const location = await getCurrentLocation();
      setLocationPermission('granted');
      return location;
    } catch (error) {
      setLocationPermission('denied');
      throw error;
    }
  };

  // Manual permission request button handler
  const handleRequestPermission = async () => {
    try {
      await requestLocationPermission();
    } catch (error) {
      // Error is already handled in requestLocationPermission
      console.log('Permission request failed:', error.message);
    }
  };

  // Start real-time location tracking
  const startTracking = () => {
    if (!enableRealTimeTracking || isTracking) return;
    
    console.log(`🚀 Starting real-time location tracking (interval: ${trackingInterval}ms)`);
    setIsTracking(true);
    setTrackingCount(0);
    setLastTrackingTime(new Date().toISOString());
    
    try {
      // Start tracking using location service
      locationService.startTracking({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });

      // Subscribe to tracking updates
      const unsubscribe = locationService.subscribeToTracking((location) => {
        const newCount = trackingCount + 1;
        setTrackingCount(newCount);
        setLastTrackingTime(new Date().toISOString());
        setCurrentLocation(location);
        
        console.log(`📍 Tracking update #${newCount}:`, {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp
        });
        
        onLocationUpdate?.(location);
        onTrackingUpdate?.(location, newCount);
      });

      // Store unsubscribe function
      trackingTimerRef.current = unsubscribe;
    } catch (error) {
      console.error('❌ Failed to start tracking:', error.message);
      setLocationError(error.message);
      setIsTracking(false);
    }
  };

  // Stop real-time location tracking
  const stopTracking = () => {
    if (!isTracking) return;
    
    console.log('🛑 Stopping real-time location tracking');
    setIsTracking(false);
    
    // Stop tracking using location service
    locationService.stopTracking();
    
    // Unsubscribe from tracking updates
    if (trackingTimerRef.current) {
      trackingTimerRef.current();
      trackingTimerRef.current = null;
    }
  };

  const handleMouseDown = () => {
    if (isActive) return;
    
    setIsHolding(true);
    setHoldProgress(0);
    
    // Start progress animation
    const progressInterval = 50; // Update every 50ms
    const progressStep = (progressInterval / holdDuration) * 100;
    
    progressTimerRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current);
          return 100;
        }
        return prev + progressStep;
      });
    }, progressInterval);

    // Start countdown
    setCountdown(Math.ceil(holdDuration / 1000));
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Activate after hold duration
    holdTimerRef.current = setTimeout(() => {
      activateSOS();
    }, holdDuration);
  };

  const handleMouseUp = () => {
    if (isActive) return;
    
    setIsHolding(false);
    setHoldProgress(0);
    setCountdown(0);
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const activateSOS = async () => {
    setIsActive(true);
    setIsHolding(false);
    setHoldProgress(0);
    setCountdown(0);
    
    // Clear all timers
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    // Handle location permission if required
    if (requireLocation) {
      // If permission is denied, show explanation and don't proceed
      if (locationPermission === 'denied') {
        const locationExplanation = 
          '📍 LOCATION PERMISSION DENIED\n\n' +
          'Your location is needed to:\n' +
          '• Send your exact coordinates to emergency contacts\n' +
          '• Help emergency services find you quickly\n' +
          '• Provide accurate location data for rescue operations\n\n' +
          'Please click "Request Location Access" button above to enable location permissions, or enable them manually in your browser settings.';
        
        alert(locationExplanation);
        setIsActive(false);
        return;
      }
      
      // If permission is unknown or not granted, try to request it
      if (locationPermission !== 'granted') {
        try {
          await requestLocationPermission();
        } catch (error) {
          // Show location permission explanation and error
          const locationExplanation = 
            '📍 LOCATION PERMISSION REQUIRED\n\n' +
            'Your location is needed to:\n' +
            '• Send your exact coordinates to emergency contacts\n' +
            '• Help emergency services find you quickly\n' +
            '• Provide accurate location data for rescue operations\n\n' +
            'Please click "Request Location Access" button above to enable location permissions, or enable them manually in your browser settings.';
          
          alert(locationExplanation + '\n\n' + error.message);
          setIsActive(false);
          return;
        }
      }
    }
    
    // Show confirmation with location info
    let confirmationMessage = '🚨 SOS ALERT ACTIVATED!\n\n' +
      'This will send an emergency alert to your trusted contacts.\n';
    
    if (currentLocation) {
      confirmationMessage += `\n📍 Your location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\n` +
        `Accuracy: ±${Math.round(currentLocation.accuracy)}m`;
    } else if (requireLocation) {
      confirmationMessage += '\n⚠️ Location not available - emergency contacts will be notified without location data.';
    }
    
    confirmationMessage += '\n\nAre you sure you want to proceed?';
    
    const confirmed = window.confirm(confirmationMessage);
    
    if (confirmed) {
      onActivate?.(currentLocation);
      // Start real-time tracking when SOS is activated
      if (enableRealTimeTracking) {
        startTracking();
      }
    } else {
      setIsActive(false);
    }
  };

  const deactivateSOS = () => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate the SOS alert?'
    );
    
    if (confirmed) {
      setIsActive(false);
      // Stop real-time tracking when SOS is deactivated
      if (enableRealTimeTracking) {
        stopTracking();
      }
      onDeactivate?.();
    }
  };

  const getButtonClass = () => {
    let baseClass = 'sos-button';
    if (isActive) baseClass += ' sos-button--active';
    if (isHolding) baseClass += ' sos-button--holding';
    if (className) baseClass += ` ${className}`;
    return baseClass;
  };

  const getButtonIcon = () => {
    if (isActive) return '🚨';
    if (isHolding) return '⚠️';
    return '🆘';
  };

  const getButtonText = () => {
    if (isActive) return 'SOS ACTIVE';
    if (isHolding) return `HOLD (${countdown}s)`;
    return 'HOLD FOR SOS';
  };

  return (
    <div className="sos-button-container">
      {/* Location Permission Status */}
      {requireLocation && (
        <div className="location-permission-status">
          <div className={`permission-indicator permission-indicator--${locationPermission}`}>
            <span className="permission-icon">
              {locationPermission === 'granted' ? '✅' : 
               locationPermission === 'denied' ? '❌' : '⚠️'}
            </span>
            <span className="permission-text">
              {locationPermission === 'granted' ? 'Location Access Granted' : 
               locationPermission === 'denied' ? 'Location Access Denied' : 'Location Permission Unknown'}
            </span>
          </div>
          
          {(locationPermission === 'denied' || locationPermission === 'unknown') && (
            <button 
              className="permission-request-btn"
              onClick={handleRequestPermission}
            >
              📍 Request Location Access
            </button>
          )}
          
          {locationError && (
            <div className="location-error-message">
              <p>{locationError}</p>
            </div>
          )}
          
          {/* Real-time Tracking Status */}
          {enableRealTimeTracking && isActive && (
            <div className="tracking-status">
              <div className={`tracking-indicator ${isTracking ? 'tracking-active' : 'tracking-inactive'}`}>
                <span className="tracking-icon">
                  {isTracking ? '🔄' : '⏸️'}
                </span>
                <span className="tracking-text">
                  {isTracking ? `Live Tracking (${trackingCount} updates)` : 'Tracking Paused'}
                </span>
              </div>
              {isTracking && lastTrackingTime && (
                <div className="tracking-details">
                  <small>Last update: {new Date(lastTrackingTime).toLocaleTimeString()}</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {holdToActivate ? (
        <button
          className={getButtonClass()}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          disabled={isActive}
        >
          <div className="sos-button__content">
            <span className="sos-button__icon">{getButtonIcon()}</span>
            <span className="sos-button__text">{getButtonText()}</span>
          </div>
          {isHolding && (
            <div className="sos-button__progress">
              <div 
                className="sos-button__progress-bar"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
          )}
        </button>
      ) : (
        <button
          className={getButtonClass()}
          onClick={isActive ? deactivateSOS : activateSOS}
        >
          <div className="sos-button__content">
            <span className="sos-button__icon">{getButtonIcon()}</span>
            <span className="sos-button__text">{getButtonText()}</span>
          </div>
        </button>
      )}
      
      {isActive && (
        <button
          className="sos-button sos-button--deactivate"
          onClick={deactivateSOS}
        >
          <span className="sos-button__icon">✅</span>
          <span className="sos-button__text">DEACTIVATE</span>
        </button>
      )}
    </div>
  );
};

export default SOSButton;
