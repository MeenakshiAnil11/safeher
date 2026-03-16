import React, { useState, useEffect } from 'react';
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

      {/* Safe Zones List */}
      <section className="safe-zones-list">
        {safeZones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <p>No safe zones yet</p>
            <button className="btn-secondary" onClick={() => setShowModal(true)}>
              Create Your First Safe Zone
            </button>
          </div>
        ) : (
          <div className="zones-grid">
            {safeZones.map((zone) => (
              <div key={zone._id} className="zone-card">
                <div className="zone-header">
                  <div className="zone-icon">🏠</div>
                  <div className="zone-info">
                    <h3>{zone.name}</h3>
                    <p className="zone-coords">
                      {zone.latitude.toFixed(6)}, {zone.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="zone-details">
                  <div className="detail-item">
                    <span className="label">Radius:</span>
                    <span className="value">{zone.radius}m</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Visited:</span>
                    <span className="value">
                      {zone.lastVisited ? new Date(zone.lastVisited).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="zone-actions">
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
            ))}
          </div>
        )}
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
                  location={editingZone || mapCenter.lat ? {
                    latitude: mapCenter.lat,
                    longitude: mapCenter.lng,
                    timestamp: new Date()
                  } : null}
                  zoom={15}
                  height="300px"
                  onMapClick={handleMapClick}
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

