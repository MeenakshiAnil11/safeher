import React, { useMemo, useState, useEffect } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  FiAlertTriangle,
  FiClock,
  FiInfo,
  FiMapPin,
  FiNavigation,
  FiPauseCircle,
  FiPlayCircle,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';
import api from '../../services/api';
import './DashboardOverview.css';

const SCORE_MAX = 100;
const toDate = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

const formatDateTime = (value) => {
  const validDate = toDate(value);
  return validDate ? validDate.toLocaleString() : 'Not available';
};

const formatTimeOnly = (value) => {
  const validDate = toDate(value);
  return validDate ? validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
};

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const formatDistance = (km) => {
  const safeValue = Number(km) || 0;
  if (safeValue < 1) return `${Math.round(safeValue * 1000)} m`;
  return `${safeValue.toFixed(2)} km`;
};

const hasValidCoordinates = (location) =>
  Number.isFinite(Number(location?.latitude)) && Number.isFinite(Number(location?.longitude));

const getTimelineMeta = (eventType = '', description = '') => {
  const normalized = `${eventType} ${description}`.toLowerCase();
  if (normalized.includes('sos')) return { icon: '🚨', tone: 'danger', title: 'SOS Triggered' };
  if (normalized.includes('exit') || normalized.includes('paused')) {
    return { icon: '⚠️', tone: 'warning', title: description || eventType };
  }
  if (normalized.includes('entered') || normalized.includes('started') || normalized.includes('enabled')) {
    return { icon: '✅', tone: 'success', title: description || eventType };
  }
  return { icon: '📍', tone: 'success', title: description || eventType };
};

const getSafetyLabel = (score) => {
  if (score >= 70) return 'Safe';
  if (score >= 40) return 'Moderate';
  return 'Risky';
};

const getRiskTone = (riskLevel = '') => {
  const normalized = String(riskLevel).toLowerCase();
  if (normalized.includes('high')) return 'danger';
  if (normalized.includes('moderate')) return 'warning';
  return 'success';
};

const getSignalMeta = (accuracy, hasLocation) => {
  if (!hasLocation) return { label: 'Offline', tone: 'offline', icon: <FiWifiOff />, bars: 0 };
  if (accuracy <= 25) return { label: 'Connected', tone: 'connected', icon: <FiWifi />, bars: 4 };
  if (accuracy <= 80) return { label: 'Weak Signal', tone: 'weak', icon: <FiWifi />, bars: 2 };
  return { label: 'Offline', tone: 'offline', icon: <FiWifiOff />, bars: 1 };
};

const generateMockMovementData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    distance: Math.floor(Math.random() * 10) + 2,
    avgSpeed: Math.floor(Math.random() * 20) + 12,
    idleHours: Number((Math.random() * 2.4).toFixed(1))
  }));
};

const generateMockActivityData = () => {
  const now = Date.now();
  return [
    { time: new Date(now - 30 * 60 * 1000).toISOString(), action: 'Entered Safe Zone', place: 'Campus Gate' },
    { time: new Date(now - 75 * 60 * 1000).toISOString(), action: 'Live Tracking Started', place: 'Central Park' },
    { time: new Date(now - 130 * 60 * 1000).toISOString(), action: 'Left Safe Zone', place: 'City Center' }
  ];
};

export default function DashboardOverview({
  currentLocation,
  isTracking,
  sosActive,
  onToggleTracking,
  onOpenFullMap
}) {
  const [loading, setLoading] = useState(true);
  const [trackingStartedAt, setTrackingStartedAt] = useState(null);
  const [localSOSAlerts, setLocalSOSAlerts] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    trackingStatus: 'No Signal',
    lastUpdateTime: null,
    lastKnownLocation: null,
    safetyScore: 75,
    safetyLevel: 'Safe',
    recentMovement: [],
    recentActivity: [],
    recentSOSAlerts: []
  });

  useEffect(() => {
    if (currentLocation) {
      setDashboardData((prev) => ({
        ...prev,
        lastKnownLocation: currentLocation,
        lastUpdateTime: currentLocation.timestamp,
        trackingStatus: isTracking ? 'Active' : 'Paused'
      }));
    }
  }, [currentLocation, isTracking]);

  useEffect(() => {
    let localUser = {};
    try {
      localUser = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      localUser = {};
    }
    const currentUserId = localUser?._id || localUser?.id || 'me';

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/location/dashboard');
        const apiData = response?.data || {};
        const normalizedAlerts = (apiData.recentSOSAlerts || []).map((alert, idx) => ({
          ...alert,
          id: alert.id || alert._id || `alert-${idx}`,
          status: (alert.status || 'open').toLowerCase()
        }));

        const score = Number(apiData.safetyScore) || 75;
        setDashboardData({
          ...apiData,
          trackingStatus: isTracking ? 'Active' : 'Paused',
          safetyScore: score,
          safetyLevel: apiData.safetyLevel || getSafetyLabel(score),
          lastUpdateTime: currentLocation?.timestamp || apiData.lastUpdateTime
        });
        setLocalSOSAlerts(normalizedAlerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const fallbackScore = 75;
        setDashboardData({
          trackingStatus: isTracking ? 'Active' : 'Paused',
          lastUpdateTime: currentLocation?.timestamp,
          lastKnownLocation: currentLocation,
          safetyScore: fallbackScore,
          safetyLevel: getSafetyLabel(fallbackScore),
          recentMovement: generateMockMovementData(),
          recentActivity: generateMockActivityData(),
          recentSOSAlerts: []
        });
        setLocalSOSAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchActivityTimeline = async () => {
      try {
        const response = await api.get(`/activity/${currentUserId}`, { params: { limit: 30 } });
        setActivityTimeline(response.data?.events || []);
      } catch (error) {
        console.error('Error fetching activity timeline:', error);
        setActivityTimeline([]);
      }
    };

    fetchDashboardData();
    fetchActivityTimeline();
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchActivityTimeline();
    }, 5000);
    return () => clearInterval(interval);
  }, [isTracking, sosActive, currentLocation]);

  useEffect(() => {
    if (isTracking && !trackingStartedAt) setTrackingStartedAt(new Date());
    if (!isTracking) setTrackingStartedAt(null);
  }, [isTracking, trackingStartedAt]);

  const locationData = dashboardData.lastKnownLocation || currentLocation;
  const validCoordinates = hasValidCoordinates(locationData);
  const locationAccuracy = Number(locationData?.accuracy) || null;
  const signal = getSignalMeta(locationAccuracy, validCoordinates);

  const safeScore = Math.max(0, Math.min(SCORE_MAX, Number(dashboardData.safetyScore) || 0));
  const scoreLabel = dashboardData.safetyLevel || getSafetyLabel(safeScore);
  const riskPrediction = dashboardData.riskPrediction || {
    riskScore: 0,
    riskLevel: 'Safe',
    recommendation: 'Safe: Conditions look stable. Keep tracking active for continuous protection.',
    timestamp: null
  };
  const riskScore = Math.max(0, Math.min(100, Number(riskPrediction.riskScore) || 0));
  const riskLevel = riskPrediction.riskLevel || 'Safe';
  const riskTone = getRiskTone(riskLevel);
  const sessionDurationMs = isTracking && trackingStartedAt ? Date.now() - trackingStartedAt.getTime() : 0;

  const movementAnalytics = useMemo(
    () =>
      (dashboardData.recentMovement || []).map((item, idx) => ({
        day: item.day || item.label || `D${idx + 1}`,
        distance: Number(item.distance) || 0,
        avgSpeed: Number(item.avgSpeed) || Number(item.averageSpeed) || Number((8 + Math.random() * 20).toFixed(1)),
        idleHours: Number(item.idleHours) || Number((Math.random() * 2).toFixed(1))
      })),
    [dashboardData.recentMovement]
  );

  const movementSummary = useMemo(() => {
    if (!movementAnalytics.length) return { totalDistance: 0, avgSpeed: 0, idleHours: 0 };
    const totalDistance = movementAnalytics.reduce((sum, item) => sum + item.distance, 0);
    const avgSpeed = movementAnalytics.reduce((sum, item) => sum + item.avgSpeed, 0) / movementAnalytics.length;
    const idleHours = movementAnalytics.reduce((sum, item) => sum + item.idleHours, 0);
    return { totalDistance, avgSpeed, idleHours };
  }, [movementAnalytics]);

  const trackingPoints = dashboardData.totalTrackingPoints || dashboardData.recentActivity?.length || 0;
  const totalDistance = dashboardData.totalDistance ?? movementSummary.totalDistance;

  const gaugeRadius = 44;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeStrokeDashoffset = gaugeCircumference - (safeScore / SCORE_MAX) * gaugeCircumference;
  const riskGaugeRadius = 36;
  const riskGaugeCircumference = 2 * Math.PI * riskGaugeRadius;
  const riskGaugeStrokeDashoffset = riskGaugeCircumference - (riskScore / 100) * riskGaugeCircumference;

  const updateAlertStatus = (alertId, status) => {
    setLocalSOSAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, status } : alert))
    );
  };

  if (loading) {
    return (
      <div className="dashboard-overview dashboard-container">
        <div className="dashboard-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card skeleton-card">
              <div className="skeleton-line skeleton-line-lg" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview dashboard-container">
      <div className="dashboard-grid">
        <article className="card current-location">
          <div className="card-header">
            <h3><FiMapPin /> Current Location</h3>
            <span className={`status-pill status-pill-${signal.tone}`}>
              {signal.icon}
              {signal.label === 'Connected' ? 'Online' : signal.label}
            </span>
          </div>
          {locationData ? (
            <>
              <div className="location-rows">
                <div className="meta-row">
                  <span>Coordinates</span>
                  <strong className="mono">
                    {validCoordinates
                      ? `${Number(locationData.latitude).toFixed(6)}, ${Number(locationData.longitude).toFixed(6)}`
                      : 'Location unavailable'}
                  </strong>
                </div>
                <div className="meta-row">
                  <span>Address</span>
                  <strong>{locationData.address || dashboardData.lastKnownLocation?.address || 'Address unavailable'}</strong>
                </div>
                <div className="meta-row">
                  <span>Accuracy</span>
                  <strong>{locationAccuracy ? `±${Math.round(locationAccuracy)}m` : 'N/A'}</strong>
                </div>
                <div className="meta-row">
                  <span>Last update</span>
                  <strong>{formatDateTime(dashboardData.lastUpdateTime || locationData.timestamp)}</strong>
                </div>
              </div>
              <div className="gps-bars" title="Estimated GPS quality based on accuracy radius">
                {[1, 2, 3, 4].map((bar) => (
                  <span key={bar} className={`gps-bar ${bar <= signal.bars ? 'active' : ''}`} />
                ))}
                <span className="gps-label">GPS signal strength</span>
              </div>
            </>
          ) : (
            <div className="friendly-empty"><p>📍 No live location yet. Start tracking to load current position details.</p></div>
          )}
        </article>

        <article className="card tracking-status">
          <div className="card-header">
            <h3><FiNavigation /> Tracking Status</h3>
            <span className={`status-pill ${isTracking ? 'status-pill-connected' : 'status-pill-weak'}`}>
              {isTracking ? <FiPlayCircle /> : <FiPauseCircle />}
              {isTracking ? 'Active' : 'Paused'}
            </span>
          </div>
          <div className="tracking-metrics">
            <div className="metric-item"><span>Session duration</span><strong>{formatDuration(sessionDurationMs)}</strong></div>
            <div className="metric-item"><span>Total distance</span><strong>{formatDistance(totalDistance)}</strong></div>
            <div className="metric-item"><span>Tracking points</span><strong>{trackingPoints}</strong></div>
          </div>
          <div className="tracking-controls">
            {isTracking && <span className="active-pulse" aria-label="Tracking active indicator" />}
            <button onClick={onToggleTracking} className="primary-btn">{isTracking ? 'Pause Tracking' : 'Start Tracking'}</button>
          </div>
        </article>

        <article className="card safety-score">
          <div className="card-header">
            <h3><FiShield /> Safety Score</h3>
            <span className="hint-icon" title="Score combines safe-zone proximity, movement consistency, signal quality, and recent SOS risk events."><FiInfo /></span>
          </div>
          <div className="safety-gauge-wrap">
            <svg className="safety-gauge" viewBox="0 0 120 120" role="img" aria-label={`Safety score ${safeScore}`}>
              <circle cx="60" cy="60" r={gaugeRadius} className="gauge-bg" />
              <circle cx="60" cy="60" r={gaugeRadius} className={`gauge-progress gauge-${scoreLabel.toLowerCase()}`} strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeStrokeDashoffset} />
            </svg>
            <div className="gauge-center"><strong>{safeScore}</strong><span>/100</span></div>
          </div>
          <div className={`level-pill level-${scoreLabel.toLowerCase()}`}>{scoreLabel}</div>
          <p className="muted-text">Higher scores indicate safer context and stronger location confidence.</p>
        </article>

        <article className="card risk-prediction risk-prediction-card">
          <div className="card-header">
            <h3><FiShield /> Risk Prediction</h3>
            <span className={`status-pill status-pill-${riskTone}`}>{riskLevel}</span>
          </div>
          <div className="risk-gauge-wrap">
            <svg className="risk-gauge" viewBox="0 0 100 100" role="img" aria-label={`Risk score ${riskScore}`}>
              <circle cx="50" cy="50" r={riskGaugeRadius} className="risk-gauge-bg" />
              <circle
                cx="50"
                cy="50"
                r={riskGaugeRadius}
                className={`risk-gauge-progress tone-${riskTone}`}
                strokeDasharray={riskGaugeCircumference}
                strokeDashoffset={riskGaugeStrokeDashoffset}
              />
            </svg>
            <div className="risk-gauge-center">
              <strong>{riskScore}</strong>
              <span>/100</span>
            </div>
          </div>
          <div className="risk-score-row">
            <span>Risk score</span>
            <strong>{riskScore}/100</strong>
          </div>
          <div className={`risk-recommendation tone-${riskTone}`}>
            <p>{riskPrediction.recommendation}</p>
          </div>
          <p className="muted-text">
            Last evaluated: {formatDateTime(riskPrediction.timestamp)}
          </p>
        </article>

        <article className="card map-preview">
          <div className="card-header">
            <h3><FiTarget /> Map Preview</h3>
          </div>
          <div className="map-container map-preview-shell">
            {validCoordinates ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationData.longitude - 0.005},${locationData.latitude - 0.005},${locationData.longitude + 0.005},${locationData.latitude + 0.005}&layer=mapnik&marker=${locationData.latitude},${locationData.longitude}&lat=${locationData.latitude}&lon=${locationData.longitude}&zoom=16`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                title="Dashboard map preview"
              />
            ) : (
              <div className="map-empty">Location unavailable</div>
            )}
            <div className="map-overlay">
              <span className="map-dot current-dot" title="Current location marker" />
              <span className="safe-zone-circle zone-a" title="Safe zone circle" />
              <span className="safe-zone-circle zone-b" title="Safe zone circle" />
              <svg className="path-overlay" viewBox="0 0 100 100" aria-hidden="true"><path d="M10 70 Q30 40 50 55 T90 28" /></svg>
            </div>
          </div>
          <div className="map-legend">
            <span><i className="legend-point current" /> Current marker</span>
            <span><i className="legend-point safe" /> Safe zones</span>
            <span><i className="legend-point path" /> Recent path</span>
          </div>
          <button className="ghost-btn" onClick={onOpenFullMap}>Open Full Map</button>
        </article>

        <article className="card movement-chart">
          <div className="card-header"><h3><FiTrendingUp /> Movement Analytics</h3></div>
          <div className="stats-row">
            <div className="stat-card"><span>Distance / day</span><strong>{(movementSummary.totalDistance / Math.max(movementAnalytics.length, 1)).toFixed(2)} km</strong></div>
            <div className="stat-card"><span>Average speed</span><strong>{movementSummary.avgSpeed.toFixed(1)} km/h</strong></div>
            <div className="stat-card"><span>Idle time</span><strong>{movementSummary.idleHours.toFixed(1)} h</strong></div>
          </div>
          <div className="chart-container">
          {movementAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={movementAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(value, key) => {
                    if (key === 'distance') return [`${value} km`, 'Distance'];
                    if (key === 'avgSpeed') return [`${value} km/h`, 'Avg speed'];
                    return [`${value} h`, 'Idle time'];
                  }}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="distance" name="Distance" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgSpeed" name="Avg speed" stroke="#22C55E" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="idleHours" name="Idle time" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="friendly-empty"><p>📈 Start tracking to view movement analytics.</p></div>
          )}
          </div>
        </article>

        <article className="card activity-timeline">
          <div className="card-header"><h3><FiClock /> Safety Activity Timeline</h3></div>
          <div className="timeline-card">
          {activityTimeline.length > 0 ? (
            <div className="timeline-vertical">
              {activityTimeline.map((event, idx) => {
                const meta = getTimelineMeta(event.eventType, event.description);
                const hasCoords =
                  Number.isFinite(Number(event.location?.lat)) &&
                  Number.isFinite(Number(event.location?.lng));
                return (
                  <div key={`${event._id || idx}-${idx}`} className={`timeline-event tone-${meta.tone}`}>
                    <span className="timeline-marker">{meta.icon}</span>
                    <div className="timeline-content">
                      <div className="activity-title">
                        <strong>{meta.title}</strong>
                        <span>{formatTimeOnly(event.timestamp)}</span>
                      </div>
                      <p>{formatDateTime(event.timestamp)}</p>
                      <small>
                        {hasCoords
                          ? `${Number(event.location.lat).toFixed(5)}, ${Number(event.location.lng).toFixed(5)}`
                          : 'Location unavailable'}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="friendly-empty"><p>🕒 No activity events yet.</p></div>
          )}
          </div>
        </article>

        <article className="card sos-alerts">
          <div className="card-header"><h3><FiAlertTriangle /> Recent SOS Alerts</h3></div>
          <div className="sos-alerts-container">
            {localSOSAlerts.length > 0 ? (
              <div className="sos-alert-list">
                {localSOSAlerts.map((alert) => (
                  <div key={alert.id} className="sos-alert-item">
                    <div className="sos-alert-head">
                      <span className="sos-time">{formatDateTime(alert.time || alert.timestamp)}</span>
                      <span className={`status-pill status-${alert.status}`}>{alert.status}</span>
                    </div>
                    <p>{alert.location || 'Location unavailable'}</p>
                    <div className="sos-actions">
                      <button onClick={() => updateAlertStatus(alert.id, 'acknowledged')}>Acknowledge</button>
                      <button onClick={() => updateAlertStatus(alert.id, 'resolved')}>Resolve</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="friendly-empty"><p>🚨 No SOS alerts in the recent log.</p></div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

