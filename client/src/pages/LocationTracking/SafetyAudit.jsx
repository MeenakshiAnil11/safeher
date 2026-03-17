import React, { useEffect, useMemo, useState } from "react";
import GoogleMapComponent from "../../components/GoogleMapComponent";
import api from "../../services/api";
import "./SafetyAudit.css";

const INITIAL_RATINGS = {
  lighting: 0,
  crowd: 0,
  visibility: 0,
};

const StarRow = ({ value, onRate, readOnly = false, onHover = null, onLeave = null }) => (
  <div className="safety-audit-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`safety-audit-star ${value >= star ? "filled" : ""} ${readOnly ? "readonly" : ""}`}
        onClick={readOnly ? undefined : () => onRate(star)}
        onMouseEnter={readOnly || !onHover ? undefined : () => onHover(star)}
        onMouseLeave={readOnly || !onLeave ? undefined : onLeave}
        aria-label={`Rate ${star} stars`}
      >
        ★
      </button>
    ))}
  </div>
);

export default function SafetyAudit({ addressDetails }) {
  const [ratings, setRatings] = useState(INITIAL_RATINGS);
  const [securityPresence, setSecurityPresence] = useState("");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [hoverRatings, setHoverRatings] = useState(INITIAL_RATINGS);
  const [activeFilter, setActiveFilter] = useState("today");
  const [audits, setAudits] = useState([]);
  const [dangerZones, setDangerZones] = useState([]);
  const [dashboardScore, setDashboardScore] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const locationLabel = useMemo(() => {
    if (addressDetails?.display_name) {
      return addressDetails.display_name.split(",").slice(0, 2).join(",").trim();
    }
    return "Downtown Square, Main Street";
  }, [addressDetails]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 30,
          timestamp: new Date().toISOString(),
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    const fetchAuditData = async () => {
      setLoading(true);
      try {
        let userId = "me";
        try {
          const localUser = JSON.parse(localStorage.getItem("user") || "{}");
          userId = localUser?._id || localUser?.id || "me";
        } catch (e) {
          userId = "me";
        }

        const [auditRes, zoneRes, dashboardRes, alertRes] = await Promise.allSettled([
          api.get("/location/admin/safety-audits"),
          api.get("/location/danger-zones"),
          api.get("/location/dashboard"),
          api.get(`/alerts/user/${userId}`, { params: { limit: 5 } }),
        ]);

        if (auditRes.status === "fulfilled") {
          const normalized = (auditRes.value.data?.reports || []).map((item, idx) => ({
            id: item._id || `audit-${idx}`,
            title: item.title || "Community safety audit",
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            safetyRating: Number(item.safetyRating) || 0,
            source: item.source || "community",
            updatedAt: item.updatedAt || item.createdAt || null,
            radiusMeters: Number(item.radiusMeters) || 600,
          }));
          setAudits(normalized);
        } else {
          setAudits([]);
        }

        if (zoneRes.status === "fulfilled") {
          setDangerZones(zoneRes.value.data?.zones || []);
        } else {
          setDangerZones([]);
        }

        if (dashboardRes.status === "fulfilled") {
          setDashboardScore(Number(dashboardRes.value.data?.safetyScore) || null);
        } else {
          setDashboardScore(null);
        }

        if (alertRes.status === "fulfilled") {
          setAlerts(alertRes.value.data?.alerts || []);
        } else {
          setAlerts([]);
        }
      } catch (error) {
        setAudits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, []);

  const toSafetyLabel = (score) => {
    if (score >= 70) return "Safe";
    if (score >= 40) return "Moderate";
    return "Risky";
  };

  const toSafetyTone = (score) => {
    if (score >= 70) return "safe";
    if (score >= 40) return "moderate";
    return "risky";
  };

  const toDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatTimeAgo = (value) => {
    const date = toDate(value);
    if (!date) return "Unknown time";
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const haversineKm = (from, to) => {
    if (!from || !to) return Number.POSITIVE_INFINITY;
    const R = 6371;
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLon = ((to.lng - from.lng) * Math.PI) / 180;
    const lat1 = (from.lat * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const filteredAudits = useMemo(() => {
    const now = Date.now();
    return audits.filter((audit) => {
      const ts = toDate(audit.updatedAt)?.getTime();
      const age = ts ? now - ts : Number.POSITIVE_INFINITY;
      const score = audit.safetyRating;

      if (activeFilter === "today") return age <= 24 * 60 * 60 * 1000;
      if (activeFilter === "last7") return age <= 7 * 24 * 60 * 60 * 1000;
      if (activeFilter === "highrisk") return score < 40;
      if (activeFilter === "nearby") {
        if (!currentLocation) return false;
        return (
          haversineKm(
            { lat: currentLocation.latitude, lng: currentLocation.longitude },
            { lat: audit.latitude, lng: audit.longitude }
          ) <= 3
        );
      }
      return true;
    });
  }, [audits, activeFilter, currentLocation]);

  const summaryMetrics = useMemo(() => {
    const baseScores = audits.map((a) => a.safetyRating).filter((s) => Number.isFinite(s));
    const averageScore = baseScores.length
      ? Math.round(baseScores.reduce((sum, v) => sum + v, 0) / baseScores.length)
      : dashboardScore || 0;
    const lightingScore = baseScores.length ? Math.round(averageScore * 0.94) : 0;
    const crowdScore = baseScores.length
      ? Math.round(baseScores.filter((s) => s < 55).length / baseScores.length * 100)
      : 0;
    const riskScore = 100 - averageScore;

    return {
      averageScore,
      lightingScore,
      crowdScore,
      riskScore,
      riskLevel: toSafetyLabel(averageScore),
    };
  }, [audits, dashboardScore]);

  const ratingAverage = useMemo(() => {
    const values = [ratings.lighting, ratings.crowd, ratings.visibility];
    const numeric = values.filter(Boolean);
    if (!numeric.length) return 0;
    return Number((numeric.reduce((sum, v) => sum + v, 0) / numeric.length).toFixed(1));
  }, [ratings]);

  const ratingMood = useMemo(() => {
    if (ratingAverage >= 4) return "Safe 😊";
    if (ratingAverage >= 2.5) return "Moderate 😐";
    if (ratingAverage > 0) return "Risky ⚠";
    return "Not rated";
  }, [ratingAverage]);

  const insightMostUnsafeTime = useMemo(() => {
    if (!audits.length) return "No data yet";
    const buckets = {};
    audits.forEach((item) => {
      const dt = toDate(item.updatedAt);
      if (!dt) return;
      const hour = dt.getHours();
      if (!buckets[hour]) buckets[hour] = { total: 0, count: 0 };
      buckets[hour].total += item.safetyRating;
      buckets[hour].count += 1;
    });
    const entries = Object.entries(buckets).map(([hour, val]) => ({
      hour: Number(hour),
      score: val.total / val.count,
    }));
    if (!entries.length) return "No data yet";
    entries.sort((a, b) => a.score - b.score);
    const worst = entries[0];
    return `${String(worst.hour).padStart(2, "0")}:00 - ${String((worst.hour + 1) % 24).padStart(2, "0")}:00`;
  }, [audits]);

  const insightSafestArea = useMemo(() => {
    if (!filteredAudits.length) return "No nearby audit data";
    const sorted = [...filteredAudits].sort((a, b) => b.safetyRating - a.safetyRating);
    return `${sorted[0].title} (${sorted[0].safetyRating}/100)`;
  }, [filteredAudits]);

  const mapCircles = useMemo(() => {
    const auditCircles = audits.map((audit) => ({
      lat: audit.latitude,
      lng: audit.longitude,
      radius: audit.radiusMeters || 500,
      fillColor: audit.safetyRating >= 70 ? "#22C55E" : audit.safetyRating >= 40 ? "#F59E0B" : "#EF4444",
      strokeColor: audit.safetyRating >= 70 ? "#15803d" : audit.safetyRating >= 40 ? "#b45309" : "#b91c1c",
      fillOpacity: 0.12,
      strokeOpacity: 0.78,
      strokeWeight: 2,
    }));
    const dangerCircles = dangerZones
      .filter((zone) => zone.zoneType === "circle" && zone.center)
      .map((zone) => ({
        lat: Number(zone.center.lat),
        lng: Number(zone.center.lng),
        radius: Number(zone.radius) || 500,
        fillColor: "#EF4444",
        strokeColor: "#dc2626",
        fillOpacity: 0.08,
        strokeOpacity: 0.5,
        strokeWeight: 1.5,
      }));

    return [...auditCircles, ...dangerCircles];
  }, [audits, dangerZones]);

  const mapMarkers = useMemo(
    () =>
      audits.map((item) => ({
        lat: item.latitude,
        lng: item.longitude,
        title: `${item.title} (${item.safetyRating}/100)`,
      })),
    [audits]
  );

  const updateRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submitAudit = async () => {
    if (!currentLocation) {
      setErrorMessage("Current location is required to submit an audit.");
      return;
    }
    if (!ratings.lighting || !ratings.crowd || !ratings.visibility) {
      setErrorMessage("Please rate lighting, crowd density, and visibility.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setMessage("");
    try {
      const normalizedScore = Math.round(
        ((ratings.lighting + ratings.crowd + ratings.visibility) / 15) * 100 +
          (securityPresence === "yes" ? 5 : securityPresence === "no" ? -5 : 0)
      );
      const safetyRating = Math.max(0, Math.min(100, normalizedScore));

      await api.post("/location/admin/safety-audits", {
        title: comment?.trim() || locationLabel || "Community safety audit",
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radiusMeters: 600,
        safetyRating,
        source: "community",
        isActive: true,
      });

      setMessage("Safety audit submitted successfully.");
      setRatings(INITIAL_RATINGS);
      setSecurityPresence("");
      setComment("");
      setPhotoFile(null);
      setPhotoPreview("");
      setActiveFilter("today");

      const refreshed = await api.get("/location/admin/safety-audits");
      const normalized = (refreshed.data?.reports || []).map((item, idx) => ({
        id: item._id || `audit-${idx}`,
        title: item.title || "Community safety audit",
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        safetyRating: Number(item.safetyRating) || 0,
        source: item.source || "community",
        updatedAt: item.updatedAt || item.createdAt || null,
        radiusMeters: Number(item.radiusMeters) || 600,
      }));
      setAudits(normalized);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to submit audit from this account. Contact admin access owner."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="safety-audit-page">
        <div className="safety-audit-loading">
          <div className="safety-audit-spinner" />
          <p>Loading safety intelligence...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="safety-audit-page">
      <div className="safety-audit-head">
        <h1>Safety Audit</h1>
        <p>Community safety intelligence powered by real location reports</p>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span className="summary-icon">🛡️</span>
          <div>
            <p>Overall Safety Score</p>
            <h3>{summaryMetrics.averageScore}/100</h3>
          </div>
          <span className={`summary-badge tone-${toSafetyTone(summaryMetrics.averageScore)}`}>
            {toSafetyLabel(summaryMetrics.averageScore)}
          </span>
        </article>
        <article className="summary-card">
          <span className="summary-icon">💡</span>
          <div>
            <p>Lighting Score</p>
            <h3>{summaryMetrics.lightingScore}/100</h3>
          </div>
          <span className={`summary-badge tone-${toSafetyTone(summaryMetrics.lightingScore)}`}>
            {toSafetyLabel(summaryMetrics.lightingScore)}
          </span>
        </article>
        <article className="summary-card">
          <span className="summary-icon">👥</span>
          <div>
            <p>Crowd Level</p>
            <h3>{summaryMetrics.crowdScore}%</h3>
          </div>
          <span className="summary-badge tone-moderate">
            {summaryMetrics.crowdScore >= 60 ? "High" : summaryMetrics.crowdScore >= 30 ? "Medium" : "Low"}
          </span>
        </article>
        <article className="summary-card">
          <span className="summary-icon">⚠</span>
          <div>
            <p>Risk Level</p>
            <h3>{summaryMetrics.riskScore}/100</h3>
          </div>
          <span className={`summary-badge tone-${toSafetyTone(summaryMetrics.averageScore)}`}>
            {summaryMetrics.riskLevel}
          </span>
        </article>
      </div>

      <div className="audit-middle-grid">
        <article className="safety-audit-card form-card">
          <h2>Submit Safety Rating</h2>

          <div className="safety-audit-field">
            <label>Location</label>
            <div className="safety-audit-location">
              <span>📍</span>
              <strong>{locationLabel}</strong>
            </div>
            <small>Using your current location</small>
          </div>

          <div className="rating-cards-grid">
            <div className="rating-mini-card">
              <label>Lighting</label>
              <StarRow
                value={hoverRatings.lighting || ratings.lighting}
                onRate={(v) => updateRating("lighting", v)}
                onHover={(v) => setHoverRatings((prev) => ({ ...prev, lighting: v }))}
                onLeave={() => setHoverRatings((prev) => ({ ...prev, lighting: 0 }))}
              />
            </div>
            <div className="rating-mini-card">
              <label>Crowd Density</label>
              <StarRow
                value={hoverRatings.crowd || ratings.crowd}
                onRate={(v) => updateRating("crowd", v)}
                onHover={(v) => setHoverRatings((prev) => ({ ...prev, crowd: v }))}
                onLeave={() => setHoverRatings((prev) => ({ ...prev, crowd: 0 }))}
              />
            </div>
            <div className="rating-mini-card">
              <label>Visibility</label>
              <StarRow
                value={hoverRatings.visibility || ratings.visibility}
                onRate={(v) => updateRating("visibility", v)}
                onHover={(v) => setHoverRatings((prev) => ({ ...prev, visibility: v }))}
                onLeave={() => setHoverRatings((prev) => ({ ...prev, visibility: 0 }))}
              />
            </div>
            <div className="rating-mini-card">
              <label>Security</label>
              <div className="safety-audit-toggle">
                <button
                  type="button"
                  className={securityPresence === "yes" ? "active" : ""}
                  onClick={() => setSecurityPresence("yes")}
                >
                  Present
                </button>
                <button
                  type="button"
                  className={securityPresence === "no" ? "active" : ""}
                  onClick={() => setSecurityPresence("no")}
                >
                  Absent
                </button>
              </div>
            </div>
          </div>

          <div className="audit-mood-row">
            <span>Live Rating</span>
            <strong>{ratingAverage ? `${ratingAverage}/5` : "—"}</strong>
            <span className="mood-pill">{ratingMood}</span>
          </div>

          <div className="safety-audit-field">
            <label>Share your experience...</label>
            <textarea
              className="audit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe lighting, crowd behavior, or any concerns in this area."
              rows={4}
            />
          </div>

          <div className="safety-audit-field">
            <label>Upload area photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            {photoFile ? (
              <div className="photo-preview-wrap">
                <img src={photoPreview} alt="Audit upload preview" className="photo-preview" />
                <small>{photoFile.name}</small>
              </div>
            ) : null}
          </div>

          {message ? <p className="audit-message success">{message}</p> : null}
          {errorMessage ? <p className="audit-message error">{errorMessage}</p> : null}

          <button type="button" className="safety-audit-submit" onClick={submitAudit} disabled={submitting}>
            {submitting ? "Submitting..." : "✈ Submit Audit"}
          </button>
        </article>

        <article className="safety-audit-card map-card">
          <div className="map-card-head">
            <h2>Map View</h2>
            <p>Current location, audit markers, and color-coded safety zones</p>
          </div>
          <div className="map-container">
            <GoogleMapComponent
              location={currentLocation}
              showPopup={false}
              zoom={14}
              height="400px"
              circles={mapCircles}
              markers={mapMarkers}
            />
          </div>
        </article>
      </div>

      <div className="audit-bottom-grid">
        <article className="safety-audit-card recent-audits-card">
          <div className="audits-head">
            <h2>Recent Audits</h2>
            <div className="audit-filters">
              <button
                className={activeFilter === "today" ? "active" : ""}
                onClick={() => setActiveFilter("today")}
                type="button"
              >
                Today
              </button>
              <button
                className={activeFilter === "last7" ? "active" : ""}
                onClick={() => setActiveFilter("last7")}
                type="button"
              >
                Last 7 days
              </button>
              <button
                className={activeFilter === "highrisk" ? "active" : ""}
                onClick={() => setActiveFilter("highrisk")}
                type="button"
              >
                High Risk Areas
              </button>
              <button
                className={activeFilter === "nearby" ? "active" : ""}
                onClick={() => setActiveFilter("nearby")}
                type="button"
              >
                Nearby
              </button>
            </div>
          </div>
          <div className="safety-audit-list">
            {filteredAudits.length > 0 ? (
              filteredAudits.map((audit) => (
                <div className="safety-audit-item" key={audit.id}>
                  <div className="audit-item-head">
                    <h3>📍 {audit.title}</h3>
                    <span className={`safety-audit-pill ${toSafetyTone(audit.safetyRating)}`}>
                      {toSafetyLabel(audit.safetyRating)}
                    </span>
                  </div>
                  <p className="safety-audit-meta">
                    👤 {audit.source || "Community"} &nbsp; ◷ {formatTimeAgo(audit.updatedAt)}
                  </p>
                  <div className="safety-audit-item-row">
                    <span>Safety Score</span>
                    <strong>{audit.safetyRating}/100</strong>
                  </div>
                  <div className="safety-audit-item-row">
                    <span>Community Rating</span>
                    <StarRow value={Math.max(1, Math.round((audit.safetyRating / 100) * 5))} readOnly />
                  </div>
                </div>
              ))
            ) : (
              <div className="safety-audit-empty">No audits found for this filter.</div>
            )}
          </div>
        </article>

        <article className="safety-audit-card insights-card">
          <h2>Community Insights</h2>
          <div className="insight-row">
            <span>Most unsafe time</span>
            <strong>{insightMostUnsafeTime}</strong>
          </div>
          <div className="insight-row">
            <span>Safest nearby area</span>
            <strong>{insightSafestArea}</strong>
          </div>
          <div className="insight-row">
            <span>Recent alerts</span>
            <strong>{alerts.length || 0}</strong>
          </div>
          {alerts.length ? (
            <ul className="alerts-mini-list">
              {alerts.slice(0, 3).map((alert) => (
                <li key={alert._id || alert.id}>
                  <span>{alert.message || "Safety alert"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="insight-empty">No recent safety alerts.</p>
          )}
        </article>
      </div>
    </section>
  );
}
