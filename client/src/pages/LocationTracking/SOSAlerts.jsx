import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SOSAlerts.css';

export default function SOSAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, open, handled, closed
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');

  useEffect(() => {
    fetchSOSAlerts();
  }, [filterStatus, dateRange]);

  const fetchSOSAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (dateRange !== 'all') params.dateRange = dateRange;
      
      const response = await api.get('/location/sos-alerts', { params });
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.post(`/location/sos-alerts/${alertId}/acknowledge`);
      fetchSOSAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      alert('Failed to acknowledge alert');
    }
  };

  const handleEscalate = async (alertId) => {
    try {
      await api.post(`/location/sos-alerts/${alertId}/escalate`, {
        message: escalationMessage
      });
      setShowEscalateModal(false);
      setEscalationMessage('');
      fetchSOSAlerts();
      alert('Alert escalated to police');
    } catch (error) {
      console.error('Error escalating alert:', error);
      alert('Failed to escalate alert');
    }
  };

  const handleResolve = async (alertId) => {
    if (!window.confirm('Are you sure you want to resolve this alert?')) return;
    
    try {
      await api.post(`/location/sos-alerts/${alertId}/resolve`);
      fetchSOSAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'badge-open', text: 'Open', icon: '🚨' },
      acknowledged: { class: 'badge-acknowledged', text: 'Acknowledged', icon: '✅' },
      escalated: { class: 'badge-escalated', text: 'Escalated', icon: '📢' },
      closed: { class: 'badge-closed', text: 'Closed', icon: '🛡️' }
    };
    return badges[status] || badges.open;
  };

  if (loading) {
    return (
      <div className="sos-alerts-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading SOS alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sos-alerts-container">
      {/* Header */}
      <section className="sos-alerts-header">
        <div>
          <h2>🚨 SOS Alerts</h2>
          <p>View and manage emergency alerts and responses</p>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="filter-results">
          Showing {alerts.length} alerts
        </div>
      </section>

      {/* Alerts List */}
      <section className="alerts-list-section">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚨</div>
            <p>No SOS alerts found</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => {
              const badge = getStatusBadge(alert.status);
              return (
                <div key={alert._id} className="alert-card">
                  <div className="alert-header">
                    <div className="alert-title">
                      <h3>{badge.icon} {alert.message || 'Emergency SOS'}</h3>
                      <span className={`status-badge ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="alert-details">
                    <div className="detail-row">
                      <span className="label">⏰ Time:</span>
                      <span className="value">{new Date(alert.timestamp || alert.createdAt).toLocaleString()}</span>
                    </div>
                    {alert.latitude && alert.longitude && (
                      <div className="detail-row">
                        <span className="label">📍 Location:</span>
                        <span className="value">
                          {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                    {alert.address && (
                      <div className="detail-row">
                        <span className="label">🏠 Address:</span>
                        <span className="value">{alert.address}</span>
                      </div>
                    )}
                    {alert.notificationsCount && (
                      <div className="detail-row">
                        <span className="label">📬 Notifications:</span>
                        <span className="value">{alert.notificationsCount} sent</span>
                      </div>
                    )}
                    {alert.responsesCount && (
                      <div className="detail-row">
                        <span className="label">💬 Responses:</span>
                        <span className="value">{alert.responsesCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="alert-actions">
                    {alert.status === 'open' && (
                      <>
                        <button
                          className="btn-acknowledge"
                          onClick={() => handleAcknowledge(alert._id)}
                        >
                          ✅ Acknowledge
                        </button>
                        <button
                          className="btn-escalate"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowEscalateModal(true);
                          }}
                        >
                          📢 Escalate to Police
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        className="btn-resolve"
                        onClick={() => handleResolve(alert._id)}
                      >
                        🛡️ Resolve
                      </button>
                    )}
                    <button
                      className="btn-view-details"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      📋 View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="modal-overlay" onClick={() => setShowEscalateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📢 Escalate to Police</h3>
              <button className="modal-close" onClick={() => setShowEscalateModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Emergency Alert Details</label>
                <div className="alert-info-box">
                  <p><strong>Location:</strong> {selectedAlert?.latitude}, {selectedAlert?.longitude}</p>
                  <p><strong>Time:</strong> {selectedAlert && new Date(selectedAlert.timestamp).toLocaleString()}</p>
                  {selectedAlert?.address && <p><strong>Address:</strong> {selectedAlert.address}</p>}
                </div>
              </div>

              <div className="form-group">
                <label>Additional Message (Optional)</label>
                <textarea
                  value={escalationMessage}
                  onChange={(e) => setEscalationMessage(e.target.value)}
                  placeholder="Add any additional information for police..."
                  rows="4"
                />
              </div>

              <div className="warning-box">
                ⚠️ This will send the alert details to local police authorities. Use only in genuine emergencies.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEscalateModal(false)}>
                Cancel
              </button>
              <button
                className="btn-escalate-modal"
                onClick={() => handleEscalate(selectedAlert?._id)}
              >
                📢 Escalate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAlert && !showEscalateModal && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Alert Details</h3>
              <button className="modal-close" onClick={() => setSelectedAlert(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="timeline-section">
                <h4>Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-icon">🚨</div>
                    <div className="timeline-content">
                      <h5>Alert Triggered</h5>
                      <p>{new Date(selectedAlert.timestamp || selectedAlert.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedAlert.notifiedContacts && selectedAlert.notifiedContacts > 0 && (
                    <div className="timeline-item">
                      <div className="timeline-icon">📬</div>
                      <div className="timeline-content">
                        <h5>Notifications Sent</h5>
                        <p>{selectedAlert.notifiedContacts} contacts notified</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedAlert.status === 'acknowledged' && (
                    <div className="timeline-item">
                      <div className="timeline-icon">✅</div>
                      <div className="timeline-content">
                        <h5>Acknowledged</h5>
                        <p>{selectedAlert.acknowledgedAt && new Date(selectedAlert.acknowledgedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

