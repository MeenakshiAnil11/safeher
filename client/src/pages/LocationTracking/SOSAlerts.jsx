import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import './SOSAlerts.css';

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_META = {
  open: { class: 'badge-open', text: 'Open', icon: '🚨', cardClass: 'card-open' },
  acknowledged: { class: 'badge-acknowledged', text: 'Acknowledged', icon: '✅', cardClass: 'card-acknowledged' },
  escalated: { class: 'badge-escalated', text: 'Escalated', icon: '📢', cardClass: 'card-escalated' },
  resolved: { class: 'badge-resolved', text: 'Resolved', icon: '🛡️', cardClass: 'card-resolved' }
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString();
};

const normalizeAlertStatus = (status) => {
  if (!status) return 'open';
  if (status === 'closed') return 'resolved';
  return status;
};

const hasValidCoordinates = (alert) =>
  Number.isFinite(Number(alert?.latitude)) && Number.isFinite(Number(alert?.longitude));

const getDateBounds = (dateRange, customRange) => {
  const now = new Date();
  if (dateRange === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: start, to: now };
  }
  if (dateRange === 'last7') {
    return { from: new Date(now.getTime() - 7 * DAY_MS), to: now };
  }
  if (dateRange === 'custom') {
    return {
      from: customRange.start ? new Date(customRange.start) : new Date(0),
      to: customRange.end ? new Date(`${customRange.end}T23:59:59`) : now
    };
  }
  return { from: new Date(0), to: now };
};

const buildAlertTimeline = (alert) => {
  const timeline = [
    {
      id: 'triggered',
      icon: '🚨',
      title: 'SOS Triggered',
      at: alert.timestamp || alert.createdAt,
      description: 'Emergency alert was initiated by the user.'
    }
  ];

  if (alert.notifiedAt || alert.notificationsCount || alert.notifiedContacts) {
    timeline.push({
      id: 'contacts_notified',
      icon: '📬',
      title: 'Contacts Notified',
      at: alert.notifiedAt || alert.timestamp || alert.createdAt,
      description: `${alert.notificationsCount || alert.notifiedContacts || 0} notification(s) sent`
    });
  }

  if (alert.status === 'escalated' || alert.policeNotifiedAt || alert.escalatedAt) {
    timeline.push({
      id: 'police_notified',
      icon: '👮',
      title: 'Police Notified',
      at: alert.policeNotifiedAt || alert.escalatedAt || alert.updatedAt || alert.createdAt,
      description: 'Escalation sent to law enforcement.'
    });
  }

  if (alert.status === 'acknowledged' || alert.acknowledgedAt) {
    timeline.push({
      id: 'acknowledged',
      icon: '✅',
      title: 'Alert Acknowledged',
      at: alert.acknowledgedAt || alert.updatedAt,
      description: 'Emergency workflow acknowledged.'
    });
  }

  if (alert.status === 'resolved' || alert.resolvedAt) {
    timeline.push({
      id: 'resolved',
      icon: '🛡️',
      title: 'Alert Resolved',
      at: alert.resolvedAt || alert.updatedAt,
      description: 'Alert closed after resolution.'
    });
  }

  return timeline.filter((event) => event.at).sort((a, b) => new Date(a.at) - new Date(b.at));
};

export default function SOSAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('last7');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');

  useEffect(() => {
    fetchSOSAlerts();
  }, []);

  const fetchSOSAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/location/sos-alerts');
      const normalized = (response.data || []).map((alert) => ({
        ...alert,
        status: normalizeAlertStatus(alert.status)
      }));
      setAlerts(normalized);
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

  const filteredAlerts = useMemo(() => {
    const { from, to } = getDateBounds(dateRange, customRange);
    return alerts.filter((alert) => {
      const ts = new Date(alert.timestamp || alert.createdAt);
      if (Number.isNaN(ts.getTime())) return false;
      const statusOk = filterStatus === 'all' || alert.status === filterStatus;
      const dateOk = ts >= from && ts <= to;
      return statusOk && dateOk;
    });
  }, [alerts, customRange, dateRange, filterStatus]);

  const alertSummary = useMemo(
    () =>
      filteredAlerts.reduce(
        (acc, alert) => {
          const key = normalizeAlertStatus(alert.status);
          if (acc[key] !== undefined) acc[key] += 1;
          return acc;
        },
        { open: 0, acknowledged: 0, escalated: 0, resolved: 0 }
      ),
    [filteredAlerts]
  );

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
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <div className="custom-date-range">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
            />
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
            />
          </div>
        )}

        <div className="filter-results">
          Showing {filteredAlerts.length} alerts
        </div>
      </section>

      <section className="summary-cards-section">
        <button
          type="button"
          className={`summary-card open ${filterStatus === 'open' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'open' ? 'all' : 'open')}
        >
          <span className="summary-title">Open</span>
          <strong>{alertSummary.open}</strong>
        </button>
        <button
          type="button"
          className={`summary-card acknowledged ${filterStatus === 'acknowledged' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'acknowledged' ? 'all' : 'acknowledged')}
        >
          <span className="summary-title">Acknowledged</span>
          <strong>{alertSummary.acknowledged}</strong>
        </button>
        <button
          type="button"
          className={`summary-card escalated ${filterStatus === 'escalated' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'escalated' ? 'all' : 'escalated')}
        >
          <span className="summary-title">Escalated</span>
          <strong>{alertSummary.escalated}</strong>
        </button>
        <button
          type="button"
          className={`summary-card resolved ${filterStatus === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved')}
        >
          <span className="summary-title">Resolved</span>
          <strong>{alertSummary.resolved}</strong>
        </button>
      </section>

      {/* Alerts List */}
      <section className="alerts-list-section">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚨</div>
            <p>No SOS alerts found</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {filteredAlerts.map((alert) => {
              const badge = STATUS_META[alert.status] || STATUS_META.open;
              const timeline = buildAlertTimeline(alert);
              return (
                <div key={alert._id} className={`alert-card ${badge.cardClass}`}>
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
                      <span className="value">{formatDate(alert.timestamp || alert.createdAt)}</span>
                    </div>
                    {alert.latitude && alert.longitude && (
                      <div className="detail-row">
                        <span className="label">📍 Exact Location:</span>
                        <span className="value">
                          {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">🔔 Notification Status:</span>
                      <span className="value">{alert.notificationsCount || alert.notifiedContacts || 0} sent</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">💬 Contact Responses:</span>
                      <span className="value">{alert.responsesCount || 0} response(s)</span>
                    </div>
                    {alert.address && (
                      <div className="detail-row">
                        <span className="label">🏠 Address:</span>
                        <span className="value">{alert.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="alert-map-preview">
                    {hasValidCoordinates(alert) ? (
                      <iframe
                        title={`Alert map ${alert._id}`}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${alert.longitude - 0.003},${alert.latitude - 0.003},${alert.longitude + 0.003},${alert.latitude + 0.003}&layer=mapnik&marker=${alert.latitude},${alert.longitude}`}
                      />
                    ) : (
                      <div className="map-fallback">Location unavailable</div>
                    )}
                  </div>

                  <div className="card-timeline">
                    <h4>Event Timeline</h4>
                    <div className="card-timeline-list">
                      {timeline.map((event) => (
                        <div className="card-timeline-item" key={`${alert._id}-${event.id}`}>
                          <span>{event.icon}</span>
                          <div>
                            <strong>{event.title}</strong>
                            <p>{formatDate(event.at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <>
                        <button
                          className="btn-escalate"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowEscalateModal(true);
                          }}
                        >
                          📢 Escalate to Police
                        </button>
                        <button
                          className="btn-resolve"
                          onClick={() => handleResolve(alert._id)}
                        >
                          🛡️ Resolve
                        </button>
                      </>
                    )}
                    {alert.status === 'escalated' && (
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
                  <p><strong>Time:</strong> {selectedAlert && formatDate(selectedAlert.timestamp)}</p>
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
                  {buildAlertTimeline(selectedAlert).map((event) => (
                    <div className="timeline-item" key={`detail-${event.id}`}>
                      <div className="timeline-icon">{event.icon}</div>
                      <div className="timeline-content">
                        <h5>{event.title}</h5>
                        <p>{formatDate(event.at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

