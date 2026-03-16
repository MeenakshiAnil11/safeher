// client/src/services/locationService.js
import api from './api';

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.trackingCallbacks = new Set();
    this.permissionState = 'unknown';
    this.currentLocation = null;
    this.locationHistory = [];
    this.maxHistorySize = 50; // Keep last 50 location updates
  }

  /**
   * Check if geolocation is supported by the browser
   */
  isGeolocationSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Check current location permission status
   */
  async checkPermissionStatus() {
    if (!navigator.permissions) {
      this.permissionState = 'unknown';
      return this.permissionState;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      this.permissionState = result.state;
      
      // Listen for permission changes
      result.onchange = () => {
        this.permissionState = result.state;
        this.notifyPermissionChange(result.state);
      };
      
      return this.permissionState;
    } catch (error) {
      console.warn('Permission API not supported:', error);
      this.permissionState = 'unknown';
      return this.permissionState;
    }
  }

  /**
   * Request location permission and get current location
   */
  async requestLocationPermission(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased to 30 seconds
      maximumAge: 0, // Don't use cached locations - always get fresh location for accuracy
    };

    const finalOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      if (!this.isGeolocationSupported()) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      console.log('📍 Requesting location with options:', finalOptions);
      
      // Try multiple times with high accuracy for better results
      let attempts = 0;
      const maxAttempts = 2;
      
      const tryGetLocation = (attemptNumber) => {
        const startTime = Date.now();
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const elapsed = Date.now() - startTime;
            const accuracy = position.coords.accuracy;
            console.log(`✅ Location obtained in ${elapsed}ms with accuracy: ${accuracy}m`);
            
            const location = this.formatLocationData(position);
            this.currentLocation = location;
            this.addToHistory(location);
            this.permissionState = 'granted';
            
            // If accuracy is poor (> 100m) and we haven't tried enough times, retry
            if (accuracy > 100 && attemptNumber < maxAttempts) {
              console.log(`⚠️ Accuracy is ${accuracy}m, retrying for better accuracy...`);
              setTimeout(() => tryGetLocation(attemptNumber + 1), 2000);
            } else {
              resolve(location);
            }
          },
          (error) => {
            const elapsed = Date.now() - startTime;
            console.warn(`⚠️ Attempt ${attemptNumber + 1} failed after ${elapsed}ms:`, error.message);
            
            // If this was the last attempt, try fallback
            if (attemptNumber >= maxAttempts) {
              console.log('🔄 Trying fallback with lower accuracy...');
              
              const fallbackOptions = {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 60000
              };

              const fallbackStartTime = Date.now();
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const elapsed = Date.now() - fallbackStartTime;
                  console.log(`✅ Successfully got location with fallback accuracy in ${elapsed}ms`);
                  const location = this.formatLocationData(position);
                  this.currentLocation = location;
                  this.addToHistory(location);
                  this.permissionState = 'granted';
                  resolve(location);
                },
                (fallbackError) => {
                  const elapsed = Date.now() - fallbackStartTime;
                  console.error(`❌ Fallback also failed after ${elapsed}ms:`, fallbackError.message);
                  const errorMessage = this.getLocationErrorMessage(fallbackError);
                  this.permissionState = 'denied';
                  
                  // Provide helpful message
                  reject(new Error(`Unable to get accurate location: ${errorMessage}. You can use the search feature to manually set your location.`));
                },
                fallbackOptions
              );
            } else {
              // Retry with a delay
              setTimeout(() => tryGetLocation(attemptNumber + 1), 2000);
            }
          },
          finalOptions
        );
      };
      
      tryGetLocation(0);
    });
  }

  /**
   * Start continuous location tracking
   */
  startTracking(options = {}) {
    if (this.isTracking) {
      console.warn('Location tracking is already active');
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased to 30 seconds
      maximumAge: 5000, // Accept cached location up to 5 seconds old for tracking
    };

    const finalOptions = { ...defaultOptions, ...options };

    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    this.isTracking = true;
    console.log('🚀 Starting location tracking');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = this.formatLocationData(position);
        this.currentLocation = location;
        this.addToHistory(location);
        this.notifyTrackingCallbacks(location);
      },
      (error) => {
        console.error('Location tracking error:', error);
        
        // If error is timeout, retry with lower accuracy
        if (error.code === error.TIMEOUT) {
          console.warn('Retrying with lower accuracy due to timeout');
          this.watchId = navigator.geolocation.watchPosition(
            (position) => {
              const location = this.formatLocationData(position);
              this.currentLocation = location;
              this.addToHistory(location);
              this.notifyTrackingCallbacks(location);
            },
            (retryError) => {
              console.error('Location tracking error after retry:', retryError);
              this.notifyTrackingError(retryError);
            },
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 30000
            }
          );
        } else {
          this.notifyTrackingError(error);
        }
      },
      finalOptions
    );

    return this.watchId;
  }

  /**
   * Stop continuous location tracking
   */
  stopTracking() {
    if (!this.isTracking) {
      console.warn('Location tracking is not active');
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    console.log('🛑 Stopped location tracking');
  }

  /**
   * Get current cached location
   */
  getCurrentLocation() {
    return this.currentLocation;
  }

  /**
   * Get location history
   */
  getLocationHistory() {
    return [...this.locationHistory];
  }

  /**
   * Clear location history
   */
  clearHistory() {
    this.locationHistory = [];
  }

  /**
   * Subscribe to location tracking updates
   */
  subscribeToTracking(callback) {
    this.trackingCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.trackingCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to permission changes
   */
  subscribeToPermissionChanges(callback) {
    this.permissionChangeCallbacks = this.permissionChangeCallbacks || new Set();
    this.permissionChangeCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.permissionChangeCallbacks.delete(callback);
    };
  }

  /**
   * Send SOS alert with location to backend
   */
  async sendSOSAlert(locationData, message = 'SOS triggered') {
    try {
      const payload = {
        lat: locationData?.latitude,
        lng: locationData?.longitude,
        message: message,
        timestamp: locationData?.timestamp || new Date().toISOString(),
        accuracy: locationData?.accuracy
      };

      const response = await api.post('/sos', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to send SOS alert:', error);
      throw error;
    }
  }

  /**
   * Share location with specific contacts
   */
  async shareLocationWithContacts(contacts, locationData, message = 'Location shared') {
    try {
      const payload = {
        contacts: contacts,
        location: locationData,
        message: message,
        timestamp: new Date().toISOString()
      };

      const response = await api.post('/sos/share-location', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to share location:', error);
      throw error;
    }
  }

  /**
   * Get emergency contacts
   */
  async getEmergencyContacts() {
    try {
      const response = await api.get('/contacts');
      return response.data?.contacts || [];
    } catch (error) {
      console.error('Failed to get emergency contacts:', error);
      throw error;
    }
  }

  /**
   * Persist live user coordinates to backend.
   */
  async saveLiveLocation(locationData, source = 'tracking') {
    if (!locationData) return null;
    try {
      const payload = {
        lat: locationData.latitude,
        lng: locationData.longitude,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        heading: locationData.heading,
        source,
      };
      const response = await api.post('/location/live', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to save live location:', error);
      return null;
    }
  }

  /**
   * Get active danger zones to overlay on map.
   */
  async getDangerZones() {
    const response = await api.get('/location/danger-zones');
    return response.data?.zones || [];
  }

  /**
   * Evaluate current point against safe/danger zones.
   */
  async checkGeoFenceStatus(locationData, sosModeActive = false) {
    const response = await api.post('/location/geofence/check', {
      lat: locationData?.latitude,
      lng: locationData?.longitude,
      sosModeActive,
    });
    return response.data;
  }

  /**
   * Get fastest and safe route options.
   */
  async getSafeRouteOptions(start, end) {
    const response = await api.post('/location/routes/safe-options', {
      start: { lat: start.latitude, lng: start.longitude },
      end: { lat: end.latitude, lng: end.longitude },
    });
    return response.data;
  }

  /**
   * Admin APIs for danger zones and analytics.
   */
  async getAdminDangerZones() {
    const response = await api.get('/location/admin/danger-zones');
    return response.data?.zones || [];
  }

  async createAdminDangerZone(payload) {
    const response = await api.post('/location/admin/danger-zones', payload);
    return response.data?.zone;
  }

  async deleteAdminDangerZone(zoneId) {
    const response = await api.delete(`/location/admin/danger-zones/${zoneId}`);
    return response.data;
  }

  async getUnsafeZoneAnalytics() {
    const response = await api.get('/location/admin/unsafe-zones/analytics');
    return response.data;
  }

  /**
   * Format location data from GeolocationPosition
   */
  formatLocationData(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user-friendly error message for location errors
   */
  getLocationErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions in your browser settings.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable. Please check your GPS/network connection.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return 'An unknown error occurred while retrieving location.';
    }
  }

  /**
   * Add location to history with size limit
   */
  addToHistory(location) {
    this.locationHistory.push(location);
    
    // Keep only the last maxHistorySize entries
    if (this.locationHistory.length > this.maxHistorySize) {
      this.locationHistory = this.locationHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Notify all tracking callbacks
   */
  notifyTrackingCallbacks(location) {
    this.trackingCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in tracking callback:', error);
      }
    });
  }

  /**
   * Notify tracking error to callbacks
   */
  notifyTrackingError(error) {
    this.trackingCallbacks.forEach(callback => {
      try {
        if (callback.onError) {
          callback.onError(error);
        }
      } catch (err) {
        console.error('Error in tracking error callback:', err);
      }
    });
  }

  /**
   * Notify permission change to callbacks
   */
  notifyPermissionChange(newState) {
    if (this.permissionChangeCallbacks) {
      this.permissionChangeCallbacks.forEach(callback => {
        try {
          callback(newState);
        } catch (error) {
          console.error('Error in permission change callback:', error);
        }
      });
    }
  }

  /**
   * Generate Google Maps link for location
   */
  generateMapsLink(latitude, longitude) {
    if (!latitude || !longitude) return null;
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  /**
   * Generate Apple Maps link for location
   */
  generateAppleMapsLink(latitude, longitude) {
    if (!latitude || !longitude) return null;
    return `https://maps.apple.com/?q=${latitude},${longitude}`;
  }

  /**
   * Generate OpenStreetMap link for location
   */
  generateOSMLink(latitude, longitude) {
    if (!latitude || !longitude) return null;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopTracking();
    this.trackingCallbacks.clear();
    if (this.permissionChangeCallbacks) {
      this.permissionChangeCallbacks.clear();
    }
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService;
