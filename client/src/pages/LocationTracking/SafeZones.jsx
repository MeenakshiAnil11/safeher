import React, { useMemo, useState, useEffect } from 'react';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import api from '../../services/api';
import { forwardGeocode } from '../../utils/geocoding';
import './SafeZones.css';

export default function SafeZones() {
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [radius, setRadius] = useState(100);
  const [zoneName, setZoneName] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [isFindingAddress, setIsFindingAddress] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  useEffect(() => {
    fetchSafeZones();
  }, []);

  const fetchSafeZones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/location/safe-zones');
      setSafeZones(response.data || []);
    } catch (error) {
      console.error('Error fetching safe zones:', error);
      setSafeZones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    try {
      const zoneData = {
        name: zoneName,
        description: zoneDescription,
        latitude: mapCenter.lat,
        longitude: mapCenter.lng,
        radius: radius
      };

      await api.post('/location/safe-zones', zoneData);
      setShowModal(false);
      resetForm();
      fetchSafeZones();
    } catch (error) {
      console.error('Error creating safe zone:', error);
      alert('Failed to create safe zone');
    }
  };

  const handleUpdateZone = async () => {
    try {
      const zoneData = {
        name: zoneName,
        description: zoneDescription,
        latitude: mapCenter.lat,
        longitude: mapCenter.lng,
        radius: radius
      };

      await api.put(`/location/safe-zones/${editingZone._id}`, zoneData);
      setShowModal(false);
      setEditingZone(null);
      resetForm();
      fetchSafeZones();
    } catch (error) {
      console.error('Error updating safe zone:', error);
      alert('Failed to update safe zone');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this safe zone?')) return;
    
    try {
      await api.delete(`/location/safe-zones/${zoneId}`);
      fetchSafeZones();
    } catch (error) {
      console.error('Error deleting safe zone:', error);
      alert('Failed to delete safe zone');
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneDescription(zone.description || '');
    setMapCenter({ lat: zone.latitude, lng: zone.longitude });
    setRadius(zone.radius);
    setShowModal(true);
  };

  const resetForm = () => {
    setZoneName('');
    setZoneDescription('');
    setMapCenter({ lat: 12.9716, lng: 77.5946 });
    setRadius(100);
    setEditingZone(null);
    setAddressInput('');
  };

  const handleFindAddress = async () => {
    if (!addressInput.trim()) return;
    setIsFindingAddress(true);
    try {
      const results = await forwardGeocode(addressInput.trim());
      if (results.length > 0) {
        setMapCenter({ lat: results[0].latitude, lng: results[0].longitude });
      } else {
        alert('Address not found. Try a more specific location.');
      }
    } catch (error) {
      console.error('Address lookup failed:', error);
      alert('Failed to resolve address.');
    } finally {
      setIsFindingAddress(false);
    }
  };

  const handleMapClick = (location) => {
    if (editingZone || showModal) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
    }
  };

  const formatTimestamp = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString();
  };

  const getZoneStatus = (zone = {}) => {
    const rawStatus = String(zone.status || zone.zoneStatus || '').toLowerCase();
    if (rawStatus.includes('danger') || zone.isDanger === true) {
      return { label: 'Danger', tone: 'danger' };
    }
    if (
      zone.isInside === true ||
      zone.currentlyInside === true ||
      zone.isActive === true ||
      rawStatus.includes('active') ||
      rawStatus.includes('inside')
    ) {
      return { label: 'Active', tone: 'active' };
    }
    return { label: 'Outside', tone: 'outside' };
  };

  const resolvedSelectedZone = useMemo(() => {
    if (!safeZones.length) return null;
    return (
      safeZones.find((zone) => String(zone._id) === String(selectedZoneId)) ||
      safeZones.find((zone) => getZoneStatus(zone).tone === 'active') ||
      safeZones[0]
    );
  }, [safeZones, selectedZoneId]);

  const stats = useMemo(() => {
    const total = safeZones.length;
    const activeZone = safeZones.find((zone) => getZoneStatus(zone).tone === 'active') || null;
    const lastEnteredZone =
      [...safeZones]
        .filter((zone) => zone.lastEntered || zone.lastEnteredAt)
        .sort((a, b) => {
          const at = new Date(a.lastEntered || a.lastEnteredAt).getTime();
          const bt = new Date(b.lastEntered || b.lastEnteredAt).getTime();
          return bt - at;
        })[0] || null;

    return {
      totalZones: total,
      activeZoneName: activeZone?.name || 'None',
      lastEnteredZoneName: lastEnteredZone?.name || 'None',
    };
  }, [safeZones]);

  const previewLocation = useMemo(() => {
    if (resolvedSelectedZone) {
      return {
        latitude: Number(resolvedSelectedZone.latitude),
        longitude: Number(resolvedSelectedZone.longitude),
        accuracy: 24,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      latitude: mapCenter.lat,
      longitude: mapCenter.lng,
      accuracy: 24,
      timestamp: new Date().toISOString(),
    };
  }, [resolvedSelectedZone, mapCenter]);

  const previewCircles = useMemo(
    () =>
      safeZones.map((zone) => {
        const status = getZoneStatus(zone);
        const strokeColor =
          status.tone === 'active' ? '#22C55E' : status.tone === 'danger' ? '#EF4444' : '#6b7280';
        const fillColor =
          status.tone === 'active' ? '#22C55E' : status.tone === 'danger' ? '#EF4444' : '#94a3b8';

        return {
          lat: Number(zone.latitude),
          lng: Number(zone.longitude),
          radius: Number(zone.radius) || 100,
          strokeColor,
          fillColor,
          fillOpacity: 0.13,
          strokeOpacity: 0.75,
          strokeWeight: 2,
        };
      }),
    [safeZones]
  );

  if (loading) {
    return (
      <div className="safe-zones-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading safe zones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-zones-container">
      <section className="safe-zones-header">
        <div>
          <h2>🏠 Safe Zones</h2>
          <p>Define areas where you feel safe. We'll notify you when you enter or leave these zones.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Safe Zone
        </button>
      </section>

      <section className="safe-zones-stats">
        <article className="stat-tile">
          <span>Total Safe Zones</span>
          <strong>{stats.totalZones}</strong>
        </article>
        <article className="stat-tile">
          <span>Currently Active Zone</span>
          <strong>{stats.activeZoneName}</strong>
        </article>
        <article className="stat-tile">
          <span>Last Entered Zone</span>
          <strong>{stats.lastEnteredZoneName}</strong>
        </article>
      </section>

      <section className="safezones-layout">
        <section className="safe-zones-list">
          {safeZones.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <h3>No safe zones yet</h3>
              <p>Create your first safe zone to enable smart safety tracking.</p>
              <button className="btn-secondary" onClick={() => setShowModal(true)}>
                Create Your First Safe Zone
              </button>
            </div>
          ) : (
            <div className="zones-grid">
              {safeZones.map((zone) => {
                const status = getZoneStatus(zone);
                const lastEntered = zone.lastEntered || zone.lastEnteredAt;
                const lastExited = zone.lastExited || zone.lastExitedAt;
                const visits = zone.visitCount ?? zone.visits ?? 0;
                return (
                  <div key={zone._id} className="zone-card card">
                    <div className="zone-header">
                      <div className="zone-icon">🛡️</div>
                      <div className="zone-info">
                        <h3>{zone.name}</h3>
                        <p className="zone-coords">
                          {Number(zone.latitude).toFixed(6)}, {Number(zone.longitude).toFixed(6)}
                        </p>
                      </div>
                      <span className={`status ${status.tone}`}>{status.label}</span>
                    </div>

                    <div className="zone-details">
                      <div className="detail-item">
                        <span className="label">Radius</span>
                        <span className="value">{zone.radius}m</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Last Visited</span>
                        <span className="value">{formatTimestamp(zone.lastVisited)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Last Entered</span>
                        <span className="value">{formatTimestamp(lastEntered)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Last Exited</span>
                        <span className="value">{formatTimestamp(lastExited)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Visits</span>
                        <span className="value">{visits}</span>
                      </div>
                    </div>

                    <div className="zone-actions">
                      <button
                        className="btn-map"
                        onClick={() => setSelectedZoneId(zone._id)}
                      >
                        📍 View on Map
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditZone(zone)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteZone(zone._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="safe-zones-map-panel card">
          <div className="safe-zones-map-head">
            <h3>Map Preview</h3>
            <p>{resolvedSelectedZone ? resolvedSelectedZone.name : 'Safe Zones Overview'}</p>
          </div>
          <div className="map-preview">
            <GoogleMapComponent
              location={previewLocation}
              zoom={14}
              height="400px"
              showPopup={false}
              circles={previewCircles}
            />
          </div>
          <div className="map-preview-note">
            <span>Green: Active</span>
            <span>Gray: Outside</span>
            <span>Red: Danger</span>
          </div>
        </aside>
      </section>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingZone ? 'Edit Safe Zone' : 'Create Safe Zone'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Zone Name *</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g., Home, Office, School"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={zoneDescription}
                  onChange={(e) => setZoneDescription(e.target.value)}
                  placeholder="Optional description"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Enter Address</label>
                <div className="address-input-row">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Search by address and set safe zone pin"
                  />
                  <button
                    type="button"
                    className="btn-find-address"
                    onClick={handleFindAddress}
                    disabled={isFindingAddress || !addressInput.trim()}
                  >
                    {isFindingAddress ? 'Locating...' : 'Find'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Coordinates</label>
                <div className="coords-display">
                  {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
                </div>
                <small>Click on the map to set location</small>
              </div>

              <div className="form-group">
                <label>Radius: {radius}m</label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                />
                <div className="range-labels">
                  <span>50m</span>
                  <span>1000m</span>
                </div>
              </div>

              <div className="map-preview">
                <GoogleMapComponent
                  location={mapCenter.lat ? {
                    latitude: mapCenter.lat,
                    longitude: mapCenter.lng,
                    timestamp: new Date()
                  } : null}
                  zoom={15}
                  height="300px"
                  onMapClick={handleMapClick}
                  circles={[
                    {
                      lat: mapCenter.lat,
                      lng: mapCenter.lng,
                      radius,
                      strokeColor: '#6C63FF',
                      fillColor: '#6C63FF',
                      fillOpacity: 0.12,
                      strokeOpacity: 0.85,
                      strokeWeight: 2
                    }
                  ]}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={editingZone ? handleUpdateZone : handleCreateZone}
                disabled={!zoneName}
              >
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

