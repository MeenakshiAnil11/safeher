import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/UserHeader';
import LocationSidebar from '../components/LocationSidebar';
import Footer from '../components/Footer';
import SOSButton from '../components/SOSButton';
import GoogleMapComponent from '../components/GoogleMapComponent';
import locationService from '../services/locationService';
import { reverseGeocode, formatAddress, formatShortAddress } from '../utils/geocoding';
import DashboardOverview from './LocationTracking/DashboardOverview';
import LiveMap from './LocationTracking/LiveMap';
import LocationHistory from './LocationTracking/LocationHistory';
import SafeZones from './LocationTracking/SafeZones';
import SOSAlerts from './LocationTracking/SOSAlerts';
import SafetyAudit from './LocationTracking/SafetyAudit';
import ExploreNearby from './LocationTracking/ExploreNearby';
import FindSupport from './LocationTracking/FindSupport';
import FollowMeMode from './LocationTracking/FollowMeMode';
import MyContacts from './MyContacts';
import './LocationTracking.css';

export default function LocationTracking() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [permissionState, setPermissionState] = useState('unknown');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [trackingCount, setTrackingCount] = useState(0);
  const [lastTrackingTime, setLastTrackingTime] = useState(null);
  const [locationStats, setLocationStats] = useState({
    totalTrackingTime: 0,
    totalDistance: 0,
    averageAccuracy: 0,
    lastSOSDate: null,
    totalUpdates: 0
  });
  const [activeSection, setActiveSection] = useState('overview');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', type: 'info' });
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const trackingUnsubscribeRef = useRef(null);
  const permissionUnsubscribeRef = useRef(null);

  // Initialize location service and load emergency contacts
  useEffect(() => {
    const initializeLocationService = async () => {
      try {
        // Check permission status
        const permission = await locationService.checkPermissionStatus();
        setPermissionState(permission);

        // Subscribe to permission changes
        permissionUnsubscribeRef.current = locationService.subscribeToPermissionChanges((newState) => {
          setPermissionState(newState);
        });

        // Load emergency contacts
        const contacts = await locationService.getEmergencyContacts();
        setEmergencyContacts(contacts);

        // Don't automatically get location - wait for user to click "Get Location"
        // Only set up the service without requesting location
      } catch (error) {
        console.error('Failed to initialize location service:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeLocationService();

    // Cleanup on unmount
    return () => {
      if (trackingUnsubscribeRef.current) {
        trackingUnsubscribeRef.current();
      }
      if (permissionUnsubscribeRef.current) {
        permissionUnsubscribeRef.current();
      }
      locationService.cleanup();
    };
  }, []);

  // Calculate location statistics
  const calculateLocationStats = (history) => {
    if (history.length === 0) return;

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      const distance = calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
      totalDistance += distance;
    }

    // Calculate average accuracy
    const avgAccuracy = history.reduce((sum, point) => sum + (point.accuracy || 0), 0) / history.length;

    // Calculate total tracking time
    const firstPoint = history[0];
    const lastPoint = history[history.length - 1];
    const totalTime = new Date(lastPoint.timestamp) - new Date(firstPoint.timestamp);

    setLocationStats({
      totalTrackingTime: totalTime,
      totalDistance: totalDistance,
      averageAccuracy: avgAccuracy,
      lastSOSDate: null,
      totalUpdates: history.length
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (km) => {
    if (km < 1) return `${(km * 1000).toFixed(0)}m`;
    return `${km.toFixed(2)}km`;
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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

  // Get current location using location service
  const getCurrentLocation = async () => {
    try {
      setLocationError('');
      const location = await locationService.requestLocationPermission();
      setCurrentLocation(location);
      setPermissionState('granted');
      await getAddressFromCoordinates(location.latitude, location.longitude);
      calculateLocationStats([location]);
    } catch (error) {
      setLocationError(error.message);
      setPermissionState('denied');
    }
  };

  // Toggle location access (for manual permission management)
  const toggleLocationAccess = async () => {
    if (permissionState === 'granted') {
      // If already granted, we can't revoke it programmatically
      // User would need to do this in browser settings
      alert('To revoke location access, please go to your browser settings and disable location permissions for this site.');
    } else {
      // Try to request permission
      try {
        await getCurrentLocation();
      } catch (error) {
        console.error('Failed to request location permission:', error);
      }
    }
  };

  // Start/stop location tracking
  const toggleTracking = async () => {
    if (isTracking) {
      locationService.stopTracking();
      setIsTracking(false);
      setLocationError('');
      await locationService.logActivityEvent(
        'TRACKING_PAUSED',
        'Tracking paused',
        currentLocation
      );
      if (trackingUnsubscribeRef.current) {
        trackingUnsubscribeRef.current();
        trackingUnsubscribeRef.current = null;
      }
    } else {
      try {
        // Subscribe to tracking updates
        trackingUnsubscribeRef.current = locationService.subscribeToTracking((location) => {
          setCurrentLocation(location);
          setTrackingCount(prev => prev + 1);
          setLastTrackingTime(new Date().toISOString());
          setLocationHistory(prev => {
            const newHistory = [...prev, location];
            calculateLocationStats(newHistory);
            return newHistory;
          });
          getAddressFromCoordinates(location.latitude, location.longitude);
        });

        // Start tracking
        locationService.startTracking();
        setIsTracking(true);
        await locationService.logActivityEvent(
          'TRACKING_STARTED',
          'Tracking started',
          currentLocation
        );
      } catch (error) {
        setLocationError(error.message);
      }
    }
  };

  // Handle SOS activation with location
  const handleSOSActivate = async (locationData) => {
    setSosActive(true);
    console.log('SOS Activated!', locationData);

    try {
      // Send SOS alert to backend with location data
      const result = await locationService.sendSOSAlert(locationData, 'Emergency SOS triggered');
      console.log('SOS alert sent:', result);

      const addressText = addressDetails ? `\nAddress: ${formatShortAddress(addressDetails)}` : '';
      alert(`🚨 SOS ALERT SENT!\n\nYour location has been shared with emergency contacts:\nLatitude: ${locationData.latitude.toFixed(6)}\nLongitude: ${locationData.longitude.toFixed(6)}\nAccuracy: ±${Math.round(locationData.accuracy)}m${addressText}\n\nContacts notified: ${result.contactsNotified.total}`);
    } catch (error) {
      console.error('Failed to send SOS alert:', error);
      alert(`🚨 SOS ALERT SENT!\n\nNote: ${error.message}`);
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
    setCurrentLocation(locationData);
    setTrackingCount(updateCount);
    setLastTrackingTime(new Date().toISOString());
    
    // Add to tracking history for map display
    setLocationHistory(prev => {
      const newHistory = [...prev, locationData];
      calculateLocationStats(newHistory);
      return newHistory;
    });
  };

  // Handle SOS deactivation
  const handleSOSDeactivate = () => {
    setSosActive(false);
    console.log('SOS Deactivated');
  };

  // Share location with selected contacts
  const shareLocationWithContacts = async () => {
    if (!currentLocation) {
      alert('No location available to share. Please get your current location first.');
      return;
    }

    if (selectedContacts.length === 0) {
      alert('Please select at least one contact to share your location with.');
      return;
    }

    setIsSharingLocation(true);
    try {
      const result = await locationService.shareLocationWithContacts(
        selectedContacts,
        currentLocation,
        shareMessage || 'Location shared via SafeHer'
      );

      console.log('Location shared:', result);
      alert(`📍 Location shared successfully!\n\nShared with ${result.results.totalContacts} contacts.\nEmail notifications: ${result.results.email.filter(r => r.success).length}\nSMS notifications: ${result.results.sms.filter(r => r.success).length}`);
      
      // Reset form
      setShareMessage('');
      setSelectedContacts([]);
    } catch (error) {
      console.error('Failed to share location:', error);
      alert(`Failed to share location: ${error.message}`);
    } finally {
      setIsSharingLocation(false);
    }
  };

  // Toggle contact selection
  const toggleContactSelection = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c._id === contact._id);
      if (isSelected) {
        return prev.filter(c => c._id !== contact._id);
      } else {
        return [...prev, contact];
      }
    });
  };

  // Handle sidebar navigation
  const handleSidebarNavigation = (section) => {
    if (section === 'emergency-sos') {
      // Trigger SOS alert
      handleSendSOS();
    } else if (section === 'share-location') {
      // Handle share location
      handleShareLocation();
    } else {
      setActiveSection(section);
    }
  };

  // Handle sending SOS alert
  const handleSendSOS = async () => {
    try {
      // Get current location with high accuracy
      console.log("📍 Getting current location for SOS...");
      const location = await locationService.requestLocationPermission();
      
      if (!location) {
        alert("❌ Unable to get current location. Please enable location permissions.");
        return;
      }

      console.log("📍 Location obtained:", location);

      // Get address details for better context
      let addressDetails = null;
      try {
        addressDetails = await reverseGeocode(location.latitude, location.longitude);
        console.log("📍 Address resolved:", addressDetails);
      } catch (error) {
        console.warn("Failed to get address details:", error);
      }

      // Prepare SOS data with enhanced information
      const sosData = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        message: "Emergency SOS triggered from location tracking",
        address: addressDetails ? formatAddress(addressDetails) : null,
        source: "location-tracking"
      };

      console.log("🚨 Sending SOS with data:", sosData);

      // Import api here to use it
      const { default: api } = await import('../api');
      
      // Send SOS alert to backend using the new /send endpoint
      const response = await api.post("/sos/send", sosData);
      
      console.log("✅ SOS sent successfully:", response.data);

      // Update SOS state
      setSosActive(true);

      // Show success message in dialog
      setDialogContent({
        title: '🚨 SOS Alert Sent Successfully!',
        message: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n\nYour emergency contacts have been notified.`,
        type: 'success'
      });
      setShowDialog(true);

    } catch (error) {
      console.error("❌ SOS Error:", error);
      setDialogContent({
        title: '❌ SOS Alert Failed',
        message: `${error.message}\n\nPlease try again or call emergency services directly.`,
        type: 'error'
      });
      setShowDialog(true);
    }
  };

  // Handle sharing location
  const handleShareLocation = async () => {
    // First, try to get current location if not available
    if (!currentLocation) {
      try {
        console.log("📍 Getting current location for sharing...");
        const location = await locationService.requestLocationPermission();
        
        if (location) {
          console.log("✅ Location obtained:", location);
          setCurrentLocation(location);
          setShowShareDialog(true);
        } else {
          setDialogContent({
            title: '📍 No Location Available',
            message: 'Unable to get your current location. Please enable location permissions in your browser settings.',
            type: 'error'
          });
          setShowDialog(true);
        }
      } catch (error) {
        console.error("❌ Error getting location:", error);
        setDialogContent({
          title: '📍 Location Error',
          message: `Unable to get your location: ${error.message}\n\nPlease enable location permissions and try again.`,
          type: 'error'
        });
        setShowDialog(true);
      }
      return;
    }
    
    // Show share dialog if location is available
    setShowShareDialog(true);
  };

  // Share location via WhatsApp
  const shareViaWhatsApp = () => {
    if (!currentLocation) return;
    
    const message = encodeURIComponent(
      `📍 I'm sharing my current location with you:\n\n` +
      `Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\n` +
      `Accuracy: ±${Math.round(currentLocation.accuracy || 0)}m\n` +
      `Time: ${new Date(currentLocation.timestamp).toLocaleString()}\n\n` +
      `View on map: https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}&zoom=18`
    );
    
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    setShowShareDialog(false);
  };

  // Share location via SMS
  const shareViaSMS = () => {
    if (!currentLocation) return;
    
    const message = `📍 My location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}. View: https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}&zoom=18`;
    
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
    
    setShowShareDialog(false);
  };

  // Share location via Email
  const shareViaEmail = () => {
    if (!currentLocation) return;
    
    const subject = encodeURIComponent('My Current Location');
    const body = encodeURIComponent(
      `Hi,\n\nI'm sharing my current location with you:\n\n` +
      `Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\n` +
      `Accuracy: ±${Math.round(currentLocation.accuracy || 0)}m\n` +
      `Time: ${new Date(currentLocation.timestamp).toLocaleString()}\n\n` +
      `View on Google Maps: https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}&zoom=18\n\n` +
      `Best regards`
    );
    
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl, '_blank');
    
    setShowShareDialog(false);
  };

  // Copy location link to clipboard
  const copyLocationLink = async () => {
    if (!currentLocation) return;
    
    const locationUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}&zoom=18`;
    
    try {
      await navigator.clipboard.writeText(locationUrl);
      setShowShareDialog(false);
      setDialogContent({
        title: '✅ Link Copied!',
        message: 'Location link has been copied to your clipboard.',
        type: 'success'
      });
      setShowDialog(true);
    } catch (error) {
      console.error('Failed to copy:', error);
      setShowShareDialog(false);
      setDialogContent({
        title: '❌ Copy Failed',
        message: 'Failed to copy location link. Please try again.',
        type: 'error'
      });
      setShowDialog(true);
    }
  };

  // Close share dialog
  const closeShareDialog = () => {
    setShowShareDialog(false);
  };

  // Close dialog
  const closeDialog = () => {
    setShowDialog(false);
  };

  // Format location for display
  const formatLocation = (location) => {
    if (
      !location ||
      !Number.isFinite(Number(location.latitude)) ||
      !Number.isFinite(Number(location.longitude))
    ) {
      return 'Location unavailable';
    }
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
      
      {/* Dialog Modal */}
      {showDialog && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`dialog-header ${dialogContent.type}`}>
              <h3>{dialogContent.title}</h3>
              <button className="dialog-close" onClick={closeDialog}>×</button>
            </div>
            <div className="dialog-body">
              <p style={{ whiteSpace: 'pre-line' }}>{dialogContent.message}</p>
            </div>
            <div className="dialog-footer">
              <button className="dialog-button" onClick={closeDialog}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Location Dialog */}
      {showShareDialog && (
        <div className="dialog-overlay" onClick={closeShareDialog}>
          <div className="dialog-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="dialog-header info">
              <h3>📤 Share Your Location</h3>
              <button className="dialog-close" onClick={closeShareDialog}>×</button>
            </div>
            <div className="dialog-body">
              {currentLocation && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#1f2937' }}>📍 Current Location</p>
                  <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                    Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m
                  </p>
                </div>
              )}
              <p style={{ margin: '0 0 1rem', color: '#6b7280' }}>Choose how you want to share your location:</p>
              
              <div className="share-options">
                <button className="share-option-btn" onClick={shareViaWhatsApp}>
                  <span className="share-icon">💬</span>
                  <span className="share-label">WhatsApp</span>
                </button>
                <button className="share-option-btn" onClick={shareViaSMS}>
                  <span className="share-icon">📱</span>
                  <span className="share-label">SMS</span>
                </button>
                <button className="share-option-btn" onClick={shareViaEmail}>
                  <span className="share-icon">📧</span>
                  <span className="share-label">Email</span>
                </button>
                <button className="share-option-btn" onClick={copyLocationLink}>
                  <span className="share-icon">🔗</span>
                  <span className="share-label">Copy Link</span>
                </button>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="dialog-button" onClick={closeShareDialog}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="location-tracking-body">
        <LocationSidebar
          currentLocation={currentLocation}
          isTracking={isTracking}
          sosActive={sosActive}
          trackingCount={trackingCount}
          activeSection={activeSection}
          onNavigate={handleSidebarNavigation}
          className="location-tracking-sidebar"
        />
        <main className="location-tracking-main">
          <div className={activeSection === 'dashboard' || activeSection === 'overview' || activeSection === 'live-map' || activeSection === 'location-history' || activeSection === 'emergency-contacts' || activeSection === 'safe-zones' || activeSection === 'sos-alerts' || activeSection === 'safety-audit' || activeSection === 'explore-nearby' || activeSection === 'find-support' || activeSection === 'follow-me-mode' ? 'location-tracking-full-width' : 'location-tracking-content'}>
            {/* Current Location Info Box */}
            {currentLocation && activeSection !== 'follow-me-mode' && (
              <div className={`location-status-box ${isTracking ? 'tracking-active' : 'tracking-paused'}`}>
                <div className="location-status-header">
                  <h3>📍 Current Location</h3>
                  <span className={`status-badge tracking-state-badge ${isTracking ? 'active' : 'paused'}`}>
                    {isTracking ? 'Tracking Active' : 'Tracking Paused'}
                  </span>
                </div>
                <div className="location-status-grid">
                  <div className="location-status-item">
                    <span className="status-label">Coordinates:</span>
                    <span className="status-value font-mono">
                      {formatLocation(currentLocation)}
                    </span>
                  </div>
                  <div className="location-status-item">
                    <span className="status-label">Accuracy:</span>
                    <span className="status-value">±{Math.round(currentLocation.accuracy || 0)}m</span>
                  </div>
                  <div className="location-status-item">
                    <span className="status-label">Updated:</span>
                    <span className="status-value">
                      {new Date(currentLocation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* Conditional rendering based on activeSection */}
            {activeSection === 'dashboard' || activeSection === 'overview' ? (
              <DashboardOverview 
                currentLocation={currentLocation}
                isTracking={isTracking}
                sosActive={sosActive}
                onToggleTracking={toggleTracking}
                onOpenFullMap={() => setActiveSection('live-map')}
              />
            ) : activeSection === 'live-map' ? (
              <LiveMap 
                currentLocation={currentLocation}
                isTracking={isTracking}
                sosActive={sosActive}
                onToggleTracking={toggleTracking}
                onLocationUpdate={(newLocation) => {
                  setCurrentLocation(newLocation);
                  getAddressFromCoordinates(newLocation.latitude, newLocation.longitude);
                }}
              />
            ) : activeSection === 'location-history' ? (
              <LocationHistory />
            ) : activeSection === 'emergency-contacts' ? (
              <MyContacts embedded />
            ) : activeSection === 'safe-zones' ? (
              <SafeZones />
            ) : activeSection === 'sos-alerts' ? (
              <SOSAlerts />
            ) : activeSection === 'safety-audit' ? (
              <SafetyAudit addressDetails={addressDetails} />
            ) : activeSection === 'explore-nearby' ? (
              <ExploreNearby />
            ) : activeSection === 'find-support' ? (
              <FindSupport />
            ) : activeSection === 'follow-me-mode' ? (
              <FollowMeMode />
            ) : (
              <>
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">
                    📍 Location Tracking & Emergency Safety
                  </h1>
                  <p className="hero-subtitle">
                    Stay safe with real-time location tracking, emergency SOS alerts, and instant location sharing with your trusted contacts.
                  </p>
                  <div className="hero-features">
                    <div className="feature-item">
                      <span className="feature-icon">🔄</span>
                      <span className="feature-text">Real-time Tracking</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🚨</span>
                      <span className="feature-text">Emergency SOS</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">📤</span>
                      <span className="feature-text">Location Sharing</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🔒</span>
                      <span className="feature-text">Privacy Protected</span>
                    </div>
                  </div>
                </div>
                <div className="hero-stats">
                  <div className="stat-card">
                    <div className="stat-icon">📍</div>
                    <div className="stat-content">
                      <div className="stat-value">{locationStats.totalUpdates}</div>
                      <div className="stat-label">Location Updates</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📏</div>
                    <div className="stat-content">
                      <div className="stat-value">{formatDistance(locationStats.totalDistance)}</div>
                      <div className="stat-label">Distance Tracked</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🕐</div>
                    <div className="stat-content">
                      <div className="stat-value">{formatDuration(locationStats.totalTrackingTime)}</div>
                      <div className="stat-label">Tracking Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Current Location Status */}
            <section className="location-status-section">
              <div className="section-header">
                <h2>📍 Current Location Status</h2>
                <div className={`status-indicator ${permissionState}`}>
                  <span className="status-icon">
                    {permissionState === 'granted' ? '✅' : 
                     permissionState === 'denied' ? '❌' : '⚠️'}
                  </span>
                  <span className="status-text">
                    {permissionState === 'granted' ? 'Location Access Granted' : 
                     permissionState === 'denied' ? 'Location Access Denied' : 'Permission Unknown'}
                  </span>
                </div>
                <div className="permission-actions">
                  <button 
                    className={`btn ${permissionState === 'granted' ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={toggleLocationAccess}
                  >
                    {permissionState === 'granted' ? '🔒 Manage Access' : '🔓 Enable Location Access'}
                  </button>
                </div>
              </div>

              <div className="location-card">
                <div className="location-info">
                  {isInitializing ? (
                    <div className="location-skeleton-grid" aria-hidden="true">
                      <div className="skeleton-item" />
                      <div className="skeleton-item" />
                      <div className="skeleton-item" />
                      <div className="skeleton-item skeleton-item-wide" />
                    </div>
                  ) : currentLocation ? (
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
                      {isTracking && (
                        <div className="tracking-status">
                          <span className="label">Tracking Status:</span>
                          <span className="value tracking-active">
                            🔄 Live Tracking ({trackingCount} updates)
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-location friendly-empty-state">
                      <div className="no-location-icon">📍</div>
                      <h3>Ready when you are</h3>
                      <p className="location-hint">
                        {permissionState === 'denied' 
                          ? 'Location permission is turned off. Enable it from your browser settings to activate safety tracking.'
                          : 'Tap "Get Location" to start your live safety dashboard.'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {locationError && (
                  <div className="location-error">
                    <div className="error-icon">⚠️</div>
                    <div className="error-content">
                      <h4>Location Error</h4>
                      <p>{locationError}</p>
                    </div>
                  </div>
                )}

                <div className="location-actions">
                  <button 
                    className={`btn ${isTracking ? 'btn-danger' : 'btn-primary'}`}
                    onClick={isTracking ? toggleTracking : getCurrentLocation}
                    disabled={permissionState === 'denied'}
                  >
                    {isTracking ? '🛑 Stop Tracking' : '📍 Get Location'}
                  </button>
                  
                  {currentLocation && (
                    <button 
                      className="btn btn-secondary"
                      onClick={getCurrentLocation}
                      disabled={!locationService.isGeolocationSupported() || permissionState === 'denied'}
                    >
                      🔄 Refresh Location
                    </button>
                  )}
                  
                  {currentLocation && !isTracking && (
                    <button 
                      className="btn btn-secondary"
                      onClick={toggleTracking}
                      disabled={permissionState === 'denied'}
                    >
                      🔄 Start Live Tracking
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Emergency SOS Section */}
            <section className="sos-section">
              <div className="section-header">
                <h2>🚨 Emergency SOS</h2>
                <p className="section-description">
                  Hold the button for 3 seconds to activate SOS alert. Your location will be automatically shared with emergency contacts via email and SMS.
                </p>
              </div>
              
              <div className="sos-card">
                <div className="sos-content">
                  <div className="sos-info">
                    <h3>Emergency Alert System</h3>
                    <p>In case of emergency, activate SOS to instantly notify your trusted contacts with your exact location.</p>
                    <ul className="sos-features">
                      <li>📍 Automatic location sharing</li>
                      <li>📧 Email notifications to contacts</li>
                      <li>📱 SMS alerts to emergency contacts</li>
                      <li>🗺️ Multiple map service links</li>
                      <li>🔄 Real-time location updates</li>
                    </ul>
                  </div>
                  
                  <div className="sos-button-container">
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
                  </div>
                </div>

                {sosActive && (
                  <div className="sos-status">
                    <div className="sos-status-indicator">
                      <span className="sos-icon">🚨</span>
                      <span className="sos-text">SOS ALERT ACTIVE</span>
                    </div>
                    <p className="sos-note">
                      Emergency contacts have been notified of your location via email and SMS.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Location Sharing Section */}
            <section className="sharing-section">
              <div className="section-header">
                <h2>📤 Share Location</h2>
                <p className="section-description">
                  Share your current location with specific emergency contacts for non-emergency situations.
                </p>
              </div>

              <div className="sharing-card">
                {isInitializing ? (
                  <div className="contacts-skeleton-grid" aria-hidden="true">
                    <div className="contact-skeleton-card" />
                    <div className="contact-skeleton-card" />
                    <div className="contact-skeleton-card" />
                    <div className="contact-skeleton-card" />
                  </div>
                ) : emergencyContacts.length > 0 ? (
                  <div className="sharing-form">
                    <div className="contacts-selection">
                      <h3>Select Contacts:</h3>
                      <div className="contacts-list">
                        {emergencyContacts.map((contact) => (
                          <label key={contact._id} className="contact-item">
                            <input
                              type="checkbox"
                              checked={selectedContacts.some(c => c._id === contact._id)}
                              onChange={() => toggleContactSelection(contact)}
                            />
                            <span className="contact-info">
                              <strong>{contact.name}</strong>
                              {contact.email && <span className="contact-email">📧 {contact.email}</span>}
                              {contact.phone && <span className="contact-phone">📱 {contact.phone}</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="message-input">
                      <label htmlFor="share-message">Message (optional):</label>
                      <textarea
                        id="share-message"
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        placeholder="Add a message to include with your location..."
                        rows="3"
                      />
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={shareLocationWithContacts}
                      disabled={!currentLocation || selectedContacts.length === 0 || isSharingLocation}
                    >
                      {isSharingLocation ? '📤 Sharing...' : '📤 Share Location'}
                    </button>
                  </div>
                ) : (
                  <div className="no-contacts friendly-empty-state">
                    <div className="no-contacts-icon">📇</div>
                    <h3>No emergency contacts yet</h3>
                    <p>Add your trusted circle to unlock one-tap sharing and faster emergency response.</p>
                    <Link to="/my-contacts" className="btn btn-secondary">
                      Manage Emergency Contacts
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Interactive Map Section */}
            <section className="map-section">
              <div className="section-header">
                <h2>🗺️ Interactive Location Map</h2>
                <p className="section-description">
                  Real-time map showing your current location, accuracy circle, and tracking history.
                </p>
              </div>

              <div className="map-card">
                <GoogleMapComponent
                  location={currentLocation}
                  isActive={sosActive}
                  zoom={15}
                  height="500px"
                  showPopup={true}
                  trackingHistory={locationHistory}
                  addressDetails={addressDetails}
                  showAccuracyCircle={true}
                  showTrackingPath={true}
                  onMapClick={(coords) => {
                    console.log('Map clicked at:', coords);
                  }}
                />
              </div>
            </section>

            {/* Features & Benefits Section */}
            <section className="features-section">
              <div className="section-header">
                <h2>🛡️ Safety Features & Benefits</h2>
                <p className="section-description">
                  Comprehensive safety features designed to keep you protected and connected.
                </p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">📍</div>
                  <h3>Precise Location Tracking</h3>
                  <p>High-accuracy GPS tracking with real-time updates and location history.</p>
                  <ul>
                    <li>GPS accuracy up to ±3 meters</li>
                    <li>Real-time location updates</li>
                    <li>Location history tracking</li>
                    <li>Address resolution</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🚨</div>
                  <h3>Emergency SOS System</h3>
                  <p>Instant emergency alerts with automatic location sharing to trusted contacts.</p>
                  <ul>
                    <li>3-second hold-to-activate</li>
                    <li>Automatic contact notification</li>
                    <li>Email and SMS alerts</li>
                    <li>Multiple map service links</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">📤</div>
                  <h3>Smart Location Sharing</h3>
                  <p>Share your location with specific contacts for non-emergency situations.</p>
                  <ul>
                    <li>Selective contact sharing</li>
                    <li>Custom messages</li>
                    <li>Multiple notification channels</li>
                    <li>Privacy controls</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Privacy & Security</h3>
                  <p>Your location data is protected and only shared when you choose to share it.</p>
                  <ul>
                    <li>Permission-based access</li>
                    <li>Secure data transmission</li>
                    <li>User-controlled sharing</li>
                    <li>Data minimization</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">🗺️</div>
                  <h3>Multiple Map Services</h3>
                  <p>Compatible with all major map services for maximum accessibility.</p>
                  <ul>
                    <li>Google Maps integration</li>
                    <li>Apple Maps support</li>
                    <li>OpenStreetMap fallback</li>
                    <li>Cross-platform compatibility</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h3>Location Analytics</h3>
                  <p>Track your movement patterns and location statistics for safety insights.</p>
                  <ul>
                    <li>Distance tracking</li>
                    <li>Time analysis</li>
                    <li>Accuracy metrics</li>
                    <li>Usage statistics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
              <div className="section-header">
                <h2>ℹ️ How Location Tracking Works</h2>
                <p className="section-description">
                  Simple steps to stay safe and connected with location tracking.
                </p>
              </div>

              <div className="steps-container">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Grant Permission</h3>
                    <p>Allow location access when prompted to enable GPS tracking and emergency features.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Get Your Location</h3>
                    <p>Click "Get Location" to retrieve your current GPS coordinates with accuracy information.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Emergency SOS</h3>
                    <p>Hold the SOS button for 3 seconds to send emergency alert with your location to contacts.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Share Location</h3>
                    <p>Select specific contacts and share your location with custom messages anytime.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h3>Stay Protected</h3>
                    <p>Your trusted contacts receive notifications with your exact location and map links.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
              <div className="section-header">
                <h2>🚀 Quick Actions</h2>
                <p className="section-description">
                  Access important features and settings quickly.
                </p>
              </div>

              <div className="quick-actions-grid">
                <Link to="/my-contacts" className="action-card">
                  <div className="action-icon">📇</div>
                  <div className="action-content">
                    <h3>Manage Emergency Contacts</h3>
                    <p>Add, edit, or remove your trusted emergency contacts.</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
                
                <Link to="/settings" className="action-card">
                  <div className="action-icon">⚙️</div>
                  <div className="action-content">
                    <h3>Location Settings</h3>
                    <p>Configure location preferences and privacy settings.</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>

                <Link to="/dashboard" className="action-card">
                  <div className="action-icon">🏠</div>
                  <div className="action-content">
                    <h3>Dashboard</h3>
                    <p>Return to the main dashboard for other features.</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>

                <Link to="/help" className="action-card">
                  <div className="action-icon">❓</div>
                  <div className="action-content">
                    <h3>Help & Support</h3>
                    <p>Get help with location tracking and emergency features.</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
              </div>
            </section>
            </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}