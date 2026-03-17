import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import { Circle, GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import "./admin.css"; // optional: keep your table and form styles

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
const REFRESH_INTERVAL_MS = 8000;

const toDate = (value) => {
  const dt = value ? new Date(value) : null;
  return dt && !Number.isNaN(dt.getTime()) ? dt : null;
};

const toTimeAgo = (value) => {
  const dt = toDate(value);
  if (!dt) return "Unknown";
  const mins = Math.floor((Date.now() - dt.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const haversineMeters = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const ADMIN_TABS = [
  { id: "overview", label: "🏠 Overview" },
  { id: "live-map", label: "🗺️ Live Map" },
  { id: "sos-logs", label: "🚨 SOS Logs" },
  { id: "zones", label: "📍 Zones" },
  { id: "reports", label: "📄 Reports" },
];

export default function AdminSOSLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedHistoryUserId, setSelectedHistoryUserId] = useState("");
  const [selectedMapUser, setSelectedMapUser] = useState(null);

  const [dangerZones, setDangerZones] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [safetyAudits, setSafetyAudits] = useState([]);
  const [followSessions, setFollowSessions] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  const [topUnsafeZones, setTopUnsafeZones] = useState([]);
  const [heatmapPointsCount, setHeatmapPointsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [pulseTick, setPulseTick] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneLat, setNewZoneLat] = useState("");
  const [newZoneLng, setNewZoneLng] = useState("");
  const [newZoneRadius, setNewZoneRadius] = useState("500");
  const [newZoneSeverity, setNewZoneSeverity] = useState("high");

  const [newSafeZoneName, setNewSafeZoneName] = useState("");
  const [newSafeZoneLat, setNewSafeZoneLat] = useState("");
  const [newSafeZoneLng, setNewSafeZoneLng] = useState("");
  const [newSafeZoneRadius, setNewSafeZoneRadius] = useState("500");

  const [dangerDraft, setDangerDraft] = useState({});
  const [safeDraft, setSafeDraft] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const loadSOSLogs = async () => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (selectedUserId) params.append("userId", selectedUserId);
    const res = await api.get(`/admin/sos?${params.toString()}`);
    setLogs(res.data.logs || []);
  };

  const loadUsers = async () => {
    const res = await api.get("/admin/users?role=user&limit=200");
    setUsers(res.data?.users || []);
  };

  const loadGeoData = async () => {
    const [zonesRes, analyticsRes, safeRes, auditRes] = await Promise.allSettled([
      api.get("/location/admin/danger-zones"),
      api.get("/location/admin/unsafe-zones/analytics"),
      api.get("/location/safe-zones"),
      api.get("/location/admin/safety-audits"),
    ]);

    setDangerZones(zonesRes.status === "fulfilled" ? zonesRes.value.data?.zones || [] : []);
    setTopUnsafeZones(
      analyticsRes.status === "fulfilled" ? analyticsRes.value.data?.topUnsafeZones || [] : []
    );
    setHeatmapPointsCount(
      analyticsRes.status === "fulfilled" ? (analyticsRes.value.data?.heatmapPoints || []).length : 0
    );
    setSafeZones(safeRes.status === "fulfilled" ? safeRes.value.data || [] : []);
    setSafetyAudits(auditRes.status === "fulfilled" ? auditRes.value.data?.reports || [] : []);
  };

  const loadFollowSessions = async (usersList, logsList) => {
    const candidates = (usersList || []).slice(0, 20);
    if (!candidates.length) {
      setFollowSessions([]);
      return;
    }
    const responses = await Promise.allSettled(
      candidates.map((user) => api.get(`/activity/${user._id}`, { params: { limit: 20 } }))
    );
    const sessions = responses.map((res, index) => {
      const user = candidates[index];
      const events = res.status === "fulfilled" ? res.value.data?.events || [] : [];
      const latest = events[0];
      const latestType = latest?.eventType || "";
      const latestMs = toDate(latest?.timestamp)?.getTime() || 0;
      const enabled = events.find((e) => e.eventType === "LOCATION_SHARING_ENABLED");
      const stopped = events.find((e) => e.eventType === "LOCATION_SHARING_STOPPED");
      const paused = events.find((e) => e.eventType === "TRACKING_PAUSED");
      let statusValue = "Stopped";
      if (enabled && (!stopped || toDate(enabled.timestamp) > toDate(stopped.timestamp))) statusValue = "Active";
      if (
        paused &&
        enabled &&
        toDate(paused.timestamp) > toDate(enabled.timestamp) &&
        (!stopped || toDate(paused.timestamp) > toDate(stopped.timestamp))
      ) {
        statusValue = "Paused";
      }
      const durationMs =
        statusValue !== "Stopped" && enabled ? Date.now() - (toDate(enabled.timestamp)?.getTime() || Date.now()) : 0;
      const relatedLogs = logsList.filter((l) => l.user?._id === user._id);
      return {
        userId: user._id,
        userName: user.name,
        status: statusValue,
        durationMs,
        lastEventAt: latestMs,
        sharedContactsCount: Number(user.emergencyContactsCount || user.contactsCount || 0),
        inactive: statusValue === "Active" && Date.now() - latestMs > 15 * 60 * 1000,
        latestType,
        relatedLogs,
      };
    });
    setFollowSessions(sessions);
  };

  const buildSystemAlerts = (usersMapMarkers, sosLogs, zones, sessions) => {
    const alerts = [];
    usersMapMarkers.forEach((m) => {
      if (m.statusTone === "idle") {
        alerts.push({
          id: `idle-${m.userId}`,
          level: "warning",
          message: `${m.name} appears inactive for long duration.`,
        });
      }
      zones.forEach((z) => {
        if (!z.center) return;
        const dist = haversineMeters(m.lat, m.lng, z.center.lat, z.center.lng);
        if (dist <= Number(z.radius || 0)) {
          alerts.push({
            id: `danger-${m.userId}-${z._id}`,
            level: "danger",
            message: `${m.name} entered danger zone "${z.name}".`,
          });
        }
      });
    });

    const openLogs = sosLogs.filter((l) => l.status === "open" && l.coords?.lat && l.coords?.lng);
    const bucket = {};
    openLogs.forEach((log) => {
      const key = `${Number(log.coords.lat).toFixed(3)}_${Number(log.coords.lng).toFixed(3)}`;
      bucket[key] = (bucket[key] || 0) + 1;
    });
    Object.entries(bucket).forEach(([key, count]) => {
      if (count >= 2) {
        alerts.push({
          id: `multi-${key}`,
          level: "danger",
          message: `Multiple SOS alerts detected in the same area (${count}).`,
        });
      }
    });

    sessions.forEach((s) => {
      if (s.inactive) {
        alerts.push({
          id: `session-${s.userId}`,
          level: "warning",
          message: `Follow-me session for ${s.userName} is inactive.`,
        });
      }
    });
    setSystemAlerts(alerts.slice(0, 20));
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadSOSLogs(), loadUsers(), loadGeoData()]);
    } finally {
      setLoading(false);
    }
  };

  const updateSOSStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/sos/${id}/status`, { status: newStatus });
      loadSOSLogs();
    } catch (err) {
      alert("Error updating status");
    }
  };

  useEffect(() => {
    loadAll();
  }, [status, from, to, selectedUserId]);

  useEffect(() => {
    const t = window.setInterval(() => {
      loadSOSLogs();
      loadGeoData();
      loadUsers();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [status, from, to, selectedUserId]);

  useEffect(() => {
    const t = window.setInterval(() => setPulseTick((v) => (v + 1) % 1000), 1000);
    return () => window.clearInterval(t);
  }, []);

  const createDangerZone = async () => {
    if (!newZoneName || !newZoneLat || !newZoneLng) {
      alert("Please enter name and coordinates.");
      return;
    }
    try {
      await api.post("/location/admin/danger-zones", {
        name: newZoneName,
        zoneType: "circle",
        center: { lat: Number(newZoneLat), lng: Number(newZoneLng) },
        radius: Number(newZoneRadius || 500),
        severity: newZoneSeverity,
      });
      setNewZoneName("");
      setNewZoneLat("");
      setNewZoneLng("");
      setNewZoneRadius("500");
      setNewZoneSeverity("high");
      loadGeoData();
    } catch (error) {
      alert("Failed to create danger zone");
    }
  };

  const removeDangerZone = async (id) => {
    if (!window.confirm("Remove this danger zone?")) return;
    await api.delete(`/location/admin/danger-zones/${id}`);
    loadGeoData();
  };

  const updateDangerZone = async (zone) => {
    const draft = dangerDraft[zone._id] || {};
    const radius = Number(draft.radius || zone.radius || 500);
    const severity = draft.severity || zone.severity || "medium";
    await api.put(`/location/admin/danger-zones/${zone._id}`, {
      radius,
      severity,
    });
    loadGeoData();
  };

  const createSafeZone = async () => {
    if (!newSafeZoneName || !newSafeZoneLat || !newSafeZoneLng) {
      alert("Please enter safe zone name and coordinates.");
      return;
    }
    await api.post("/location/safe-zones", {
      name: newSafeZoneName,
      latitude: Number(newSafeZoneLat),
      longitude: Number(newSafeZoneLng),
      radius: Number(newSafeZoneRadius || 500),
      description: "Global safe zone (admin scoped)",
    });
    setNewSafeZoneName("");
    setNewSafeZoneLat("");
    setNewSafeZoneLng("");
    setNewSafeZoneRadius("500");
    loadGeoData();
  };

  const updateSafeZone = async (zone) => {
    const draft = safeDraft[zone._id] || {};
    const radius = Number(draft.radius || zone.radius || 500);
    await api.put(`/location/safe-zones/${zone._id}`, {
      ...zone,
      radius,
    });
    loadGeoData();
  };

  const deleteSafeZone = async (zoneId) => {
    if (!window.confirm("Delete this safe zone?")) return;
    await api.delete(`/location/safe-zones/${zoneId}`);
    loadGeoData();
  };

  const updateAuditState = async (auditId, action) => {
    if (action === "delete") {
      await api.delete(`/location/admin/safety-audits/${auditId}`);
    } else if (action === "approve") {
      await api.put(`/location/admin/safety-audits/${auditId}`, { isActive: true });
    } else if (action === "reject") {
      await api.put(`/location/admin/safety-audits/${auditId}`, { isActive: false });
    }
    loadGeoData();
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    window.open(`/api/admin/sos/export?${params.toString()}`, "_blank");
  };

  const latestUserLocations = useMemo(() => {
    const latestByUser = new Map();
    logs.forEach((log) => {
      const userId = log.user?._id || log.userId;
      if (!userId || !log.coords?.lat || !log.coords?.lng) return;
      const existing = latestByUser.get(userId);
      if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
        latestByUser.set(userId, log);
      }
    });

    return users
      .map((user) => {
        const latest = latestByUser.get(user._id);
        if (!latest) return null;
        const minsSinceUpdate = Math.floor((Date.now() - new Date(latest.createdAt).getTime()) / 60000);
        const hasOpenSOS = logs.some((l) => (l.user?._id === user._id || l.userId === user._id) && l.status === "open");
        const statusTone = hasOpenSOS ? "sos" : minsSinceUpdate > 10 ? "idle" : "normal";
        return {
          userId: user._id,
          name: user.name || "User",
          lat: Number(latest.coords.lat),
          lng: Number(latest.coords.lng),
          createdAt: latest.createdAt,
          coords: latest.coords,
          statusTone,
          trackingStatus: hasOpenSOS ? "SOS" : minsSinceUpdate > 10 ? "Idle" : "Active",
        };
      })
      .filter(Boolean);
  }, [logs, users]);

  useEffect(() => {
    loadFollowSessions(users, logs);
  }, [users, logs]);

  useEffect(() => {
    buildSystemAlerts(latestUserLocations, logs, dangerZones, followSessions);
  }, [latestUserLocations, logs, dangerZones, followSessions]);

  const selectedUserPath = useMemo(() => {
    if (!selectedMapUser) return [];
    return logs
      .filter((log) => (log.user?._id || log.userId) === selectedMapUser.userId && log.coords?.lat && log.coords?.lng)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((log) => ({ lat: Number(log.coords.lat), lng: Number(log.coords.lng), ts: log.createdAt }));
  }, [logs, selectedMapUser]);

  const historyPath = useMemo(() => {
    if (!selectedHistoryUserId) return [];
    return logs
      .filter((log) => (log.user?._id || log.userId) === selectedHistoryUserId && log.coords?.lat && log.coords?.lng)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((log) => ({ lat: Number(log.coords.lat), lng: Number(log.coords.lng), ts: log.createdAt }));
  }, [logs, selectedHistoryUserId]);

  useEffect(() => {
    if (!isReplaying || historyPath.length === 0) return;
    const t = window.setInterval(() => {
      setReplayIndex((idx) => {
        if (idx >= historyPath.length - 1) {
          window.clearInterval(t);
          return idx;
        }
        return idx + 1;
      });
    }, 800);
    return () => window.clearInterval(t);
  }, [isReplaying, historyPath]);

  const replayPoint = historyPath[replayIndex];

  const analytics = useMemo(() => {
    const activeUsers = latestUserLocations.filter((u) => u.statusTone === "normal").length;
    const activeSessions = followSessions.filter((s) => s.status === "Active").length;
    const openSOS = logs.filter((l) => l.status === "open").length;
    const dangerCount = dangerZones.length;

    const dayBuckets = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, label: d.toLocaleDateString(undefined, { weekday: "short" }), sos: 0, active: 0 };
    });
    logs.forEach((l) => {
      const key = new Date(l.createdAt).toISOString().slice(0, 10);
      const bucket = dayBuckets.find((b) => b.key === key);
      if (bucket) bucket.sos += 1;
    });
    latestUserLocations.forEach((u) => {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      const bucket = dayBuckets.find((b) => b.key === key);
      if (bucket) bucket.active += 1;
    });

    return { activeUsers, activeSessions, openSOS, dangerCount, dayBuckets };
  }, [latestUserLocations, followSessions, logs, dangerZones]);

  const mapCenter = latestUserLocations[0]
    ? { lat: latestUserLocations[0].lat, lng: latestUserLocations[0].lng }
    : { lat: 20.5937, lng: 78.9629 };

  const markerColor = (tone) => (tone === "sos" ? "#ef4444" : tone === "idle" ? "#f59e0b" : "#22c55e");
  const getStatusBadgeClass = (value) => {
    if (value === "open") return "status-open";
    if (value === "closed") return "status-resolved";
    return "status-ack";
  };
  const getStatusLabel = (value) => {
    if (value === "handled") return "Acknowledged";
    if (value === "closed") return "Resolved";
    return "Open";
  };

  return (
    <AdminLayout pageTitle="🗺️ Admin Location Tracking">
      <div className="admin-page admin-location-monitor page-container">
        <div className="admin-module-tabs" role="tablist" aria-label="Admin Location Tracking Sections">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`admin-module-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <div className="empty-state-admin">⌛ Loading live monitoring data...</div> : null}

        <section className={`admin-tab-panel ${activeTab === "overview" ? "active" : ""}`} role="tabpanel">
          <div className="monitor-summary-grid">
            <div className="monitor-summary-card users">
              <span className="summary-icon" aria-hidden="true">👥</span>
              <span className="card-title">👤 Total Active Users</span>
              <strong className="card-value">{analytics.activeUsers}</strong>
            </div>
            <div className="monitor-summary-card sessions">
              <span className="summary-icon" aria-hidden="true">🟢</span>
              <span className="card-title">✅ Active Sessions</span>
              <strong className="card-value">{analytics.activeSessions}</strong>
            </div>
            <div className="monitor-summary-card sos">
              <span className="summary-icon" aria-hidden="true">🚨</span>
              <span className="card-title">🚨 SOS Alerts (Open)</span>
              <strong className="card-value">{analytics.openSOS}</strong>
            </div>
            <div className="monitor-summary-card danger">
              <span className="summary-icon" aria-hidden="true">⚠</span>
              <span className="card-title">📍 Danger Zones</span>
              <strong className="card-value">{analytics.dangerCount}</strong>
            </div>
          </div>

          <div className="monitor-two-col">
            <div className="admin-card monitor-alerts-card">
              <h3 className="section-header">🚨 Real-time Alerts</h3>
              <div className="scroll-panel alerts-panel">
                {systemAlerts.length ? (
                  systemAlerts.map((alert) => (
                    <div key={alert.id} className={`system-alert-row ${alert.level}`}>
                      <span aria-hidden="true">⚠</span>
                      <span className="alert-text">{alert.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>Start tracking to see live updates</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card">
              <h3 className="section-header">🧭 Follow Me Session Monitoring</h3>
              <div className="followme-panel">
                <div className="session-grid">
                {followSessions.map((session) => (
                  <div key={session.userId} className={`session-card ${session.inactive ? "inactive" : ""}`}>
                    <div className="session-head">
                      <div className="session-user">
                        <span className="session-avatar">{(session.userName || "U").charAt(0).toUpperCase()}</span>
                        <strong>{session.userName}</strong>
                      </div>
                      <span className={`session-status status-badge ${session.status.toLowerCase()}`}>{session.status}</span>
                    </div>
                    <p>📞 Shared contacts: {session.sharedContactsCount}</p>
                    <p>⏱ Duration: {Math.max(0, Math.floor(session.durationMs / 60000))} min</p>
                    <p>Last event: {toTimeAgo(session.lastEventAt)}</p>
                  </div>
                ))}
                {followSessions.length === 0 ? (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>Start tracking to see live updates</span>
                  </div>
                ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="section-header">📊 Analytics</h3>
            <div className="mini-chart-grid">
              <div className="mini-chart-card">
                <h4 className="section-header">📊 SOS Trends Overview</h4>
                <div className="bar-row">
                  {analytics.dayBuckets.map((bucket) => (
                    <div key={`sos-${bucket.key}`} className="bar-col">
                      <div
                        className="bar-fill danger"
                        style={{ height: `${Math.max(10, bucket.sos * 14)}px` }}
                        title={`${bucket.label}: ${bucket.sos} SOS alerts`}
                      />
                      <span>{bucket.label}</span>
                      <small>{bucket.sos}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mini-chart-card">
                <h4 className="section-header">📈 User Activity Trends</h4>
                <div className="bar-row">
                  {analytics.dayBuckets.map((bucket) => (
                    <div key={`act-${bucket.key}`} className="bar-col">
                      <div
                        className="bar-fill primary"
                        style={{ height: `${Math.max(10, bucket.active * 14)}px` }}
                        title={`${bucket.label}: ${bucket.active} active users`}
                      />
                      <span>{bucket.label}</span>
                      <small>{bucket.active}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`admin-tab-panel ${activeTab === "live-map" ? "active" : ""}`} role="tabpanel">
          <div className="monitor-map-grid">
            <div className="admin-card monitor-map-card">
              <div className="card-head-row">
                <h3 className="section-header">🗺️ Live Map Tracking</h3>
                <p>Auto-refresh every 8 seconds</p>
              </div>
              {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY" ? (
                <div className="empty-state-admin">Add `REACT_APP_GOOGLE_MAPS_API_KEY` to load map.</div>
              ) : (
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "400px", borderRadius: "16px" }}
                    center={mapCenter}
                    zoom={5}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
                  >
                    {latestUserLocations.map((u) => (
                      <React.Fragment key={u.userId}>
                        <Marker
                          position={{ lat: u.lat, lng: u.lng }}
                          icon={{
                            path: window.google?.maps.SymbolPath.CIRCLE,
                            fillColor: markerColor(u.statusTone),
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                            scale: 8,
                          }}
                          onClick={() => setSelectedMapUser(u)}
                        />
                        {u.statusTone === "sos" ? (
                          <Circle
                            center={{ lat: u.lat, lng: u.lng }}
                            radius={150 + (pulseTick % 6) * 20}
                            options={{
                              fillColor: "#ef4444",
                              fillOpacity: 0.08,
                              strokeColor: "#ef4444",
                              strokeOpacity: 0.6,
                              strokeWeight: 1.5,
                            }}
                          />
                        ) : null}
                      </React.Fragment>
                    ))}

                    {selectedMapUser ? (
                      <InfoWindow
                        position={{ lat: selectedMapUser.lat, lng: selectedMapUser.lng }}
                        onCloseClick={() => setSelectedMapUser(null)}
                      >
                        <div className="map-user-popup">
                          <strong>{selectedMapUser.name}</strong>
                          <p>Updated: {toTimeAgo(selectedMapUser.createdAt)}</p>
                          <p>
                            Coordinates: {selectedMapUser.coords.lat.toFixed(5)}, {selectedMapUser.coords.lng.toFixed(5)}
                          </p>
                          <p>Status: {selectedMapUser.trackingStatus}</p>
                        </div>
                      </InfoWindow>
                    ) : null}

                    {selectedUserPath.length > 1 ? (
                      <Polyline
                        path={selectedUserPath.map((p) => ({ lat: p.lat, lng: p.lng }))}
                        options={{ strokeColor: "#2563eb", strokeOpacity: 0.9, strokeWeight: 3 }}
                      />
                    ) : null}

                    {dangerZones.map((zone) =>
                      zone.center ? (
                        <Circle
                          key={zone._id}
                          center={{ lat: zone.center.lat, lng: zone.center.lng }}
                          radius={zone.radius || 500}
                          options={{
                            fillColor: "#ef4444",
                            fillOpacity: 0.12,
                            strokeColor: "#dc2626",
                            strokeOpacity: 0.75,
                            strokeWeight: 2,
                          }}
                        />
                      ) : null
                    )}

                    {safeZones.map((zone) => (
                      <Circle
                        key={zone._id}
                        center={{ lat: zone.latitude, lng: zone.longitude }}
                        radius={zone.radius || 500}
                        options={{
                          fillColor: "#22c55e",
                          fillOpacity: 0.08,
                          strokeColor: "#16a34a",
                          strokeOpacity: 0.7,
                          strokeWeight: 2,
                        }}
                      />
                    ))}
                  </GoogleMap>
                </LoadScript>
              )}
              {latestUserLocations.length === 0 ? (
                <div className="empty-state">
                  <p>No data available</p>
                  <span>Start tracking to see live updates</span>
                </div>
              ) : null}
            </div>

            <div className="admin-card monitor-alerts-card">
              <h3 className="section-header">🚨 Real-time Alerts</h3>
              <div className="scroll-panel alerts-panel">
                {systemAlerts.length ? (
                  systemAlerts.map((alert) => (
                    <div key={alert.id} className={`system-alert-row ${alert.level}`}>
                      <span aria-hidden="true">⚠</span>
                      <span className="alert-text">{alert.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>Start tracking to see live updates</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={`admin-tab-panel ${activeTab === "sos-logs" ? "active" : ""}`} role="tabpanel">
          <div className="admin-card">
            <h3 className="section-header">🚨 SOS Alert Management</h3>
            <div className="admin-controls" style={{ marginBottom: 10 }}>
              <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="handled">Acknowledged</option>
                <option value="closed">Resolved</option>
              </select>
              <select className="admin-select" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
              <input className="admin-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input className="admin-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              <button className="admin-btn ghost" onClick={exportCSV}>Export CSV</button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l._id} className={`table-row ${l.status !== "closed" ? "unresolved" : ""}`}>
                      <td>{l.user?.name || "Unknown"}</td>
                      <td>{new Date(l.createdAt).toLocaleString()}</td>
                      <td>{l.address || (l.coords ? `${l.coords.lat}, ${l.coords.lng}` : "N/A")}</td>
                      <td>
                        <span className={`status-pill status-badge ${getStatusBadgeClass(l.status)}`}>{getStatusLabel(l.status)}</span>
                      </td>
                      <td>
                        {l.status === "open" ? (
                          <button className="admin-btn small" onClick={() => updateSOSStatus(l._id, "handled")}>Acknowledge</button>
                        ) : null}
                        {l.status !== "closed" ? (
                          <button className="admin-btn small" onClick={() => updateSOSStatus(l._id, "closed")}>Resolve</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 ? (
                <div className="empty-state">
                  <p>No data available</p>
                  <span>Start tracking to see live updates</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className={`admin-tab-panel ${activeTab === "zones" ? "active" : ""}`} role="tabpanel">
          <div className="monitor-two-col">
            <div className="admin-card">
              <h3 className="section-header">📍 Safe Zone Control</h3>
              <div className="admin-controls" style={{ marginBottom: 10 }}>
                <input className="admin-input" placeholder="Safe zone name" value={newSafeZoneName} onChange={(e) => setNewSafeZoneName(e.target.value)} />
                <input className="admin-input" placeholder="Latitude" value={newSafeZoneLat} onChange={(e) => setNewSafeZoneLat(e.target.value)} />
                <input className="admin-input" placeholder="Longitude" value={newSafeZoneLng} onChange={(e) => setNewSafeZoneLng(e.target.value)} />
                <input className="admin-input" placeholder="Radius (m)" value={newSafeZoneRadius} onChange={(e) => setNewSafeZoneRadius(e.target.value)} />
                <button className="admin-btn primary btn-primary" onClick={createSafeZone}>Create Global Safe Zone</button>
              </div>
              <div className="zones-cards-grid">
                {safeZones.map((zone) => {
                  const tone = zone.radius >= 900 ? "danger" : zone.radius >= 500 ? "moderate" : "safe";
                  return (
                    <div key={zone._id} className="zone-row zone-card-item">
                      <div>
                        <strong>{zone.name}</strong>
                        <p>
                          {zone.latitude?.toFixed?.(4)}, {zone.longitude?.toFixed?.(4)} • {zone.radius}m •
                          <span className={`zone-tone ${tone}`}> {tone === "safe" ? "Safe" : tone === "moderate" ? "Moderate" : "Dangerous"}</span>
                        </p>
                      </div>
                      <div className="row-actions">
                        <input
                          className="admin-input tiny"
                          placeholder="Radius"
                          value={safeDraft[zone._id]?.radius ?? zone.radius}
                          onChange={(e) =>
                            setSafeDraft((prev) => ({
                              ...prev,
                              [zone._id]: { ...(prev[zone._id] || {}), radius: e.target.value },
                            }))
                          }
                        />
                        <button className="admin-btn small" onClick={() => updateSafeZone(zone)}>Save</button>
                        <button className="admin-btn small danger btn-danger" onClick={() => deleteSafeZone(zone._id)}>Delete</button>
                      </div>
                    </div>
                  );
                })}
                {safeZones.length === 0 ? (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>No zones created yet</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="admin-card">
              <h3 className="section-header">⚠ Danger Zone Management</h3>
              <div className="admin-controls" style={{ marginBottom: 10 }}>
                <input className="admin-input" placeholder="Zone name" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} />
                <input className="admin-input" placeholder="Latitude" value={newZoneLat} onChange={(e) => setNewZoneLat(e.target.value)} />
                <input className="admin-input" placeholder="Longitude" value={newZoneLng} onChange={(e) => setNewZoneLng(e.target.value)} />
                <input className="admin-input" placeholder="Radius (m)" value={newZoneRadius} onChange={(e) => setNewZoneRadius(e.target.value)} />
                <select className="admin-select" value={newZoneSeverity} onChange={(e) => setNewZoneSeverity(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button className="admin-btn primary btn-primary" onClick={createDangerZone}>Add Zone</button>
              </div>
              <div className="zones-cards-grid">
                {dangerZones.map((zone) => (
                  <div key={zone._id} className="zone-row zone-card-item">
                    <div>
                      <strong>{zone.name}</strong>
                      <p>
                        {zone.center?.lat?.toFixed?.(4)}, {zone.center?.lng?.toFixed?.(4)} • {zone.radius}m • {zone.severity}
                      </p>
                    </div>
                    <div className="row-actions">
                      <input
                        className="admin-input tiny"
                        placeholder="Radius"
                        value={dangerDraft[zone._id]?.radius ?? zone.radius}
                        onChange={(e) =>
                          setDangerDraft((prev) => ({
                            ...prev,
                            [zone._id]: { ...(prev[zone._id] || {}), radius: e.target.value },
                          }))
                        }
                      />
                      <select
                        className="admin-select tiny"
                        value={dangerDraft[zone._id]?.severity ?? zone.severity}
                        onChange={(e) =>
                          setDangerDraft((prev) => ({
                            ...prev,
                            [zone._id]: { ...(prev[zone._id] || {}), severity: e.target.value },
                          }))
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button className="admin-btn small" onClick={() => updateDangerZone(zone)}>Save</button>
                      <button className="admin-btn small danger btn-danger" onClick={() => removeDangerZone(zone._id)}>Delete</button>
                    </div>
                  </div>
                ))}
                {dangerZones.length === 0 ? (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>No danger zones created</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className={`admin-tab-panel ${activeTab === "reports" ? "active" : ""}`} role="tabpanel">
          <div className="monitor-two-col">
            <div className="admin-card">
              <h3 className="section-header">📄 Safety Audit Moderation</h3>
              <div className="scroll-panel">
                {safetyAudits.map((audit) => (
                  <div key={audit._id} className="zone-row">
                    <div>
                      <strong>{audit.title}</strong>
                      <p>
                        {audit.latitude?.toFixed?.(4)}, {audit.longitude?.toFixed?.(4)} • Score {audit.safetyRating}/100 •
                        {audit.isActive ? " Approved" : " Rejected"}
                      </p>
                    </div>
                    <div className="row-actions">
                      <button className="admin-btn small" onClick={() => updateAuditState(audit._id, "approve")}>Approve</button>
                      <button className="admin-btn small" onClick={() => updateAuditState(audit._id, "reject")}>Reject</button>
                      <button className="admin-btn small" onClick={() => updateAuditState(audit._id, "delete")}>Delete</button>
                    </div>
                  </div>
                ))}
                {safetyAudits.length === 0 ? (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>No reports found</span>
                  </div>
                ) : null}
                <h4 className="section-header">📌 Frequently Reported Unsafe Locations</h4>
                {topUnsafeZones.map((row, index) => (
                  <div key={row._id || index} className="unsafe-row">
                    <span>{index + 1}. {row.name || "Unknown Zone"}</span>
                    <strong>{row.incidents} incidents</strong>
                  </div>
                ))}
                <p className="muted-line">Heatmap points (last 7 days): {heatmapPointsCount}</p>
                {topUnsafeZones.length === 0 ? (
                  <div className="empty-state">
                    <p>No data available</p>
                    <span>Start tracking to see live updates</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="admin-card">
              <h3 className="section-header">🧭 User Tracking History Replay</h3>
              <div className="admin-controls">
                <select className="admin-select" value={selectedHistoryUserId} onChange={(e) => { setSelectedHistoryUserId(e.target.value); setReplayIndex(0); }}>
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
                <button className="admin-btn primary btn-primary" onClick={() => setIsReplaying(true)} disabled={!historyPath.length}>Replay</button>
                <button className="admin-btn ghost" onClick={() => { setIsReplaying(false); setReplayIndex(0); }}>Reset</button>
              </div>
              <div className="history-map-wrap">
                {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY" ? (
                  <div className="empty-state-admin">Map unavailable without API key.</div>
                ) : (
                  <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "260px", borderRadius: "12px" }}
                      center={replayPoint ? { lat: replayPoint.lat, lng: replayPoint.lng } : mapCenter}
                      zoom={13}
                    >
                      {historyPath.length > 1 ? (
                        <Polyline
                          path={historyPath.map((p) => ({ lat: p.lat, lng: p.lng }))}
                          options={{ strokeColor: "#6C63FF", strokeOpacity: 0.85, strokeWeight: 3 }}
                        />
                      ) : null}
                      {historyPath[0] ? <Marker position={{ lat: historyPath[0].lat, lng: historyPath[0].lng }} label="S" /> : null}
                      {historyPath[historyPath.length - 1] ? (
                        <Marker position={{ lat: historyPath[historyPath.length - 1].lat, lng: historyPath[historyPath.length - 1].lng }} label="E" />
                      ) : null}
                      {replayPoint ? (
                        <Marker
                          position={{ lat: replayPoint.lat, lng: replayPoint.lng }}
                          icon={{
                            path: window.google?.maps.SymbolPath.CIRCLE,
                            fillColor: "#ef4444",
                            fillOpacity: 1,
                            strokeColor: "#fff",
                            strokeWeight: 2,
                            scale: 7,
                          }}
                        />
                      ) : null}
                    </GoogleMap>
                  </LoadScript>
                )}
              </div>
              <p className="muted-line">
                {historyPath.length ? `Route points: ${historyPath.length} • Replay index: ${replayIndex + 1}` : "No route history"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
