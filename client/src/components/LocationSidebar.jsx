import React, { useState, useEffect } from 'react';
import {
  FiAlertOctagon,
  FiCompass,
  FiCopy,
  FiFlag,
  FiMapPin,
  FiNavigation,
  FiShield,
  FiUserCheck,
  FiUsers
} from 'react-icons/fi';
import locationService from '../services/locationService';
import './LocationSidebar.css';

const LocationSidebar = ({ 
  currentLocation, 
  isTracking, 
  sosActive, 
  trackingCount,
  activeSection = 'overview',
  onNavigate,
  className = '' 
}) => {
  const [permissionState, setPermissionState] = useState('unknown');
  const [locationHistory, setLocationHistory] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [locationStats, setLocationStats] = useState({
    totalTrackingTime: 0,
    totalDistance: 0,
    averageAccuracy: 0,
    lastSOSDate: null
  });
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  useEffect(() => {
    const initializeSidebar = async () => {
      try {
        // Check permission status
        const permission = await locationService.checkPermissionStatus();
        setPermissionState(permission);

        // Load emergency contacts
        const contacts = await locationService.getEmergencyContacts();
        setEmergencyContacts(contacts);

        // Load location history
        const history = locationService.getLocationHistory();
        setLocationHistory(history);

        // Calculate stats
        calculateLocationStats(history);
      } catch (error) {
        console.error('Failed to initialize location sidebar:', error);
      } finally {
        setIsSidebarLoading(false);
      }
    };

    initializeSidebar();
  }, [currentLocation, trackingCount]);

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
      lastSOSDate: null // This would come from SOS logs
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

  const sidebarItems = [
    {
      key: 'dashboard',
      label: 'Dashboard Overview',
      icon: FiCompass,
      path: '/location-tracking',
      description: ''
    },
    {
      key: 'live-map',
      label: 'Live Map & Safe Routes',
      icon: FiMapPin,
      path: '/location-tracking/live',
      description: '',
      badge: isTracking ? 'ACTIVE' : null,
      badgeColor: 'success'
    },
    {
      key: 'location-history',
      label: 'Location History',
      icon: FiNavigation,
      path: '/location-tracking/history',
      description: '',
      badge: locationHistory.length > 0 ? `${locationHistory.length}` : null,
      badgeColor: 'info'
    },
    {
      key: 'safe-zones',
      label: 'Safe Zones',
      icon: FiShield,
      path: '/location-tracking/safe-zones',
      description: ''
    },
    {
      key: 'emergency-contacts',
      label: 'Emergency Contacts',
      icon: FiUsers,
      path: '/my-contacts',
      description: '',
      badge: emergencyContacts.length > 0 ? `${emergencyContacts.length}` : null,
      badgeColor: 'primary'
    },
    {
      key: 'sos-alerts',
      label: 'SOS Alerts',
      icon: FiAlertOctagon,
      path: '/location-tracking/sos',
      description: '',
      badge: sosActive ? 'ACTIVE' : null,
      badgeColor: 'danger'
    },
    {
      key: 'safety-audit',
      label: 'Safety Audit',
      icon: FiFlag,
      path: '/location-tracking/safety-audit',
      description: ''
    },
    {
      key: 'explore-nearby',
      label: 'Explore Nearby',
      icon: FiCompass,
      path: '/location-tracking/explore-nearby',
      description: ''
    },
    {
      key: 'find-support',
      label: 'Find Support',
      icon: FiUserCheck,
      path: '/location-tracking/find-support',
      description: ''
    },
    {
      key: 'follow-me-mode',
      label: 'Follow Me Mode',
      icon: FiCopy,
      path: '/location-tracking/follow-me-mode',
      description: ''
    }
  ];

  const isActive = (key) => {
    return activeSection === key || (activeSection === 'overview' && key === 'dashboard');
  };

  const groupedItems = [
    {
      title: 'Emergency Actions',
      keys: ['dashboard', 'sos-alerts', 'emergency-contacts']
    },
    {
      title: 'Tracking Tools',
      keys: ['live-map', 'safe-zones', 'explore-nearby', 'find-support', 'follow-me-mode', 'safety-audit']
    },
    {
      title: 'History',
      keys: ['location-history']
    }
  ];

  return (
    <div className={`location-sidebar ${className}`}>
      {/* Emergency Actions */}
      <div className="sidebar-emergency">
        <h3>🚨 Emergency Actions</h3>
        <div className="emergency-actions">
          <button 
            className={`emergency-btn ${sosActive ? 'active' : ''}`}
            onClick={() => onNavigate?.('emergency-sos')}
          >
            <span className="btn-icon"><FiAlertOctagon /></span>
            <span className="btn-text">
              {sosActive ? 'SOS Active' : 'Activate SOS'}
            </span>
          </button>
          
          <button 
            className="emergency-btn secondary"
            onClick={() => onNavigate?.('share-location')}
          >
            <span className="btn-icon"><FiNavigation /></span>
            <span className="btn-text">Share Location</span>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {isSidebarLoading ? (
          <div className="sidebar-nav-skeleton" aria-hidden="true">
            <div className="nav-skeleton-item" />
            <div className="nav-skeleton-item" />
            <div className="nav-skeleton-item" />
            <div className="nav-skeleton-item" />
            <div className="nav-skeleton-item" />
          </div>
        ) : (
          <div className="sidebar-groups">
            {groupedItems.map((group) => (
              <div className="sidebar-group" key={group.title}>
                <h4 className="sidebar-group-title">{group.title}</h4>
                <ul className="nav-list">
                  {sidebarItems
                    .filter((item) => group.keys.includes(item.key))
                    .map((item) => (
                      <li key={item.key} className="nav-item">
                        <button
                          className={`nav-link ${isActive(item.key) ? 'active' : ''}`}
                          onClick={() => onNavigate?.(item.key)}
                        >
                          <div className="nav-content">
                            <span className="nav-icon"><item.icon /></span>
                            <div className="nav-text">
                              <span className="nav-label">{item.label}</span>
                              {item.description && <span className="nav-description">{item.description}</span>}
                            </div>
                            {item.badge && (
                              <span className={`nav-badge nav-badge-${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-info">
          <p>🔒 Your location data is secure and only shared when you choose to share it.</p>
        </div>
      </div>
    </div>
  );
};

export default LocationSidebar;
