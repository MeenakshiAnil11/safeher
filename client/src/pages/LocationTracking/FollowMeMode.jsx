import React, { useEffect, useMemo, useRef, useState } from "react";
import GoogleMapComponent from "../../components/GoogleMapComponent";
import locationService from "../../services/locationService";
import "./FollowMeMode.css";

const INITIAL_CONTACTS = [
  { id: "c1", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1-555-0123", active: true },
  { id: "c2", name: "Mike Davis", email: "mike.d@email.com", phone: "+1-555-0124", active: false },
  { id: "c3", name: "Emily Wilson", email: "emily.w@email.com", phone: "+1-555-0125", active: true },
];

const SAFE_ZONE_RADIUS_METERS = 500;

const haversineMeters = (a, b) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
};

export default function FollowMeMode() {
  const [sharingState, setSharingState] = useState("stopped"); // stopped | active | paused
  const [trackingIntervalSec, setTrackingIntervalSec] = useState(10);
  const [sharingStartedAt, setSharingStartedAt] = useState(null);
  const [linkExpiresAt, setLinkExpiresAt] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [shareCopied, setShareCopied] = useState(false);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [activityEvents, setActivityEvents] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    timestamp: new Date().toISOString(),
    accuracy: 12,
    address: "Downtown Square, Main Street",
  });
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [safeZoneCenter, setSafeZoneCenter] = useState(null);
  const [lastLocationUpdateAt, setLastLocationUpdateAt] = useState(Date.now());
  const [lastMovementAt, setLastMovementAt] = useState(Date.now());
  const warningStateRef = useRef({ noUpdate: false, noMovement: false, safeZoneExit: false });

  const shareLink = useMemo(
    () => `https://safeher.app/track/${Math.random().toString(36).slice(2, 12)}`,
    []
  );

  const isFollowMeActive = sharingState === "active";
  const isFollowMePaused = sharingState === "paused";
  const isSharingEnabled = isFollowMeActive || isFollowMePaused;

  const liveContacts = useMemo(() => contacts.filter((c) => c.active), [contacts]);

  const sharingActiveDuration = useMemo(() => {
    if (!sharingStartedAt || !isSharingEnabled) return "00:00:00";
    const elapsed = Math.max(0, nowMs - sharingStartedAt);
    const hours = String(Math.floor(elapsed / (1000 * 60 * 60))).padStart(2, "0");
    const minutes = String(Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
    const seconds = String(Math.floor((elapsed % (1000 * 60)) / 1000)).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, [sharingStartedAt, nowMs, isSharingEnabled]);

  const shareLinkTimeLeft = useMemo(() => {
    if (!linkExpiresAt || !isSharingEnabled) return "Not active";
    const left = Math.max(0, linkExpiresAt - nowMs);
    const minutes = String(Math.floor(left / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [linkExpiresAt, nowMs, isSharingEnabled]);

  const getLastUpdatedLabel = useMemo(() => {
    const diffSec = Math.max(0, Math.floor((nowMs - lastLocationUpdateAt) / 1000));
    return diffSec <= 1 ? "just now" : `${diffSec} sec ago`;
  }, [nowMs, lastLocationUpdateAt]);

  const addActivityEvent = (title, detail, tone = "info") => {
    setActivityEvents((prev) => [
      { id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, title, detail, tone, time: Date.now() },
      ...prev.slice(0, 39),
    ]);
  };

  useEffect(() => {
    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  const warningFlags = useMemo(() => {
    const noUpdate = isFollowMeActive && nowMs - lastLocationUpdateAt > Math.max(15000, trackingIntervalSec * 3000);
    const noMovement = isSharingEnabled && nowMs - lastMovementAt > 20 * 60 * 1000;
    const safeZoneExit =
      isSharingEnabled &&
      safeZoneCenter &&
      haversineMeters(
        { latitude: safeZoneCenter.latitude, longitude: safeZoneCenter.longitude },
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      ) > SAFE_ZONE_RADIUS_METERS;
    return { noUpdate, noMovement, safeZoneExit };
  }, [
    isFollowMeActive,
    isSharingEnabled,
    nowMs,
    lastLocationUpdateAt,
    trackingIntervalSec,
    lastMovementAt,
    safeZoneCenter,
    currentLocation,
  ]);

  useEffect(() => {
    const prev = warningStateRef.current;
    if (warningFlags.noUpdate && !prev.noUpdate) {
      addActivityEvent("Location update warning", "Location updates are delayed.", "warning");
    }
    if (warningFlags.noMovement && !prev.noMovement) {
      addActivityEvent("Inactivity alert", "No movement detected for 20 minutes.", "warning");
    }
    if (warningFlags.safeZoneExit && !prev.safeZoneExit) {
      addActivityEvent("Safe zone exit", "You moved outside your safe zone radius.", "danger");
    }
    warningStateRef.current = warningFlags;
  }, [warningFlags]);

  useEffect(() => {
    if (!isFollowMeActive || !sharingStartedAt) return undefined;

    const updateLocation = () => {
      setCurrentLocation((prev) => {
        const nextLocation = {
          ...prev,
          latitude: Number((prev.latitude + (Math.random() - 0.5) * 0.0009).toFixed(6)),
          longitude: Number((prev.longitude + (Math.random() - 0.5) * 0.0009).toFixed(6)),
          timestamp: new Date().toISOString(),
          accuracy: Math.max(5, Math.round(prev.accuracy + (Math.random() - 0.5) * 4)),
        };

        const movedMeters = haversineMeters(prev, nextLocation);
        if (movedMeters >= 8) setLastMovementAt(Date.now());
        setLastLocationUpdateAt(Date.now());
        setTrackingHistory((history) => [...history.slice(-59), nextLocation]);
        return nextLocation;
      });
    };

    const interval = window.setInterval(updateLocation, trackingIntervalSec * 1000);
    return () => window.clearInterval(interval);
  }, [isFollowMeActive, sharingStartedAt, trackingIntervalSec]);

  useEffect(() => {
    if (!isSharingEnabled || !linkExpiresAt) return;
    if (nowMs > linkExpiresAt) {
      setSharingState("stopped");
      addActivityEvent("Tracking expired", "Live sharing link expired.", "warning");
    }
  }, [nowMs, isSharingEnabled, linkExpiresAt]);

  useEffect(() => {
    if (!isFollowMeActive || liveContacts.length === 0) return undefined;
    const viewedInterval = window.setInterval(() => {
      const contact = liveContacts[Math.floor(Math.random() * liveContacts.length)];
      if (contact) {
        addActivityEvent("Contact viewed location", `${contact.name} checked your live location.`, "info");
      }
    }, 45000);
    return () => window.clearInterval(viewedInterval);
  }, [isFollowMeActive, liveContacts]);

  const handleStartSharing = () => {
    if (sharingState === "active") return;
    if (sharingState === "paused") {
      setSharingState("active");
      addActivityEvent("Tracking resumed", "Live location sharing resumed.", "success");
      return;
    }
    const startedAt = Date.now();
    setSharingState("active");
    setSharingStartedAt(startedAt);
    setLinkExpiresAt(startedAt + 60 * 60 * 1000);
    setTrackingHistory([currentLocation]);
    setSafeZoneCenter({ latitude: currentLocation.latitude, longitude: currentLocation.longitude });
    setLastLocationUpdateAt(Date.now());
    setLastMovementAt(Date.now());
    addActivityEvent("Tracking started", "Follow Me tracking started.", "success");
    addActivityEvent("Location shared", "Your live location is shared with trusted contacts.", "info");
    locationService.logActivityEvent("LOCATION_SHARING_ENABLED", "Location sharing enabled", currentLocation);
  };

  const handlePauseSharing = () => {
    if (sharingState !== "active") return;
    setSharingState("paused");
    addActivityEvent("Tracking paused", "Live sharing paused.", "warning");
    locationService.logActivityEvent("TRACKING_PAUSED", "Tracking paused", currentLocation);
  };

  const handleStopSharing = () => {
    if (sharingState === "stopped") return;
    setSharingState("stopped");
    setTrackingHistory([]);
    setSafeZoneCenter(null);
    addActivityEvent("Tracking stopped", "Live sharing stopped.", "danger");
    locationService.logActivityEvent("LOCATION_SHARING_STOPPED", "Location sharing stopped", currentLocation);
  };

  const handleToggleContact = (contactId) => {
    const target = contacts.find((c) => c.id === contactId);
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, active: !contact.active } : contact
      )
    );
    if (target) {
      addActivityEvent(
        target.active ? "Contact sharing disabled" : "Contact sharing enabled",
        `${target.name} ${target.active ? "stopped receiving" : "now receives"} updates.`,
        "info"
      );
    }
  };

  const handleRemoveContact = (contactId) => {
    const target = contacts.find((c) => c.id === contactId);
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    if (target) addActivityEvent("Contact removed", `${target.name} removed from trusted contacts.`, "warning");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  };

  const warningMessages = [
    warningFlags.noUpdate ? "Location updates delayed. Check GPS/network." : null,
    warningFlags.noMovement ? "No movement detected for 20 minutes." : null,
    warningFlags.safeZoneExit ? "You moved outside your safe zone." : null,
  ].filter(Boolean);

  return (
    <section className="follow-me-page">
      <header className="follow-me-header">
        <h1>Follow Me Mode</h1>
        <p>Real-time live safety tracking with trusted contacts</p>
      </header>

      <div className="followme-layout">
        <div className="followme-left-col">
          <article className="follow-card follow-controls-card">
            <div className="sharing-status-row">
              <span className={`sharing-pill ${isFollowMeActive ? "active" : isFollowMePaused ? "paused" : "stopped"}`}>
                <span className={`sharing-dot ${isFollowMeActive ? "pulse" : ""}`} />
                {isFollowMeActive ? "Sharing Active" : isFollowMePaused ? "Sharing Paused" : "Sharing Stopped"}
              </span>
              <span className="duration-pill">Duration: {sharingActiveDuration}</span>
            </div>

            <div className="tracking-info-grid">
              <div className="info-item">
                <span>Current location</span>
                <strong>{currentLocation.address}</strong>
              </div>
              <div className="info-item">
                <span>Last updated</span>
                <strong>{getLastUpdatedLabel}</strong>
              </div>
              <div className="info-item">
                <span>GPS accuracy</span>
                <strong>{Math.round(currentLocation.accuracy || 0)} meters</strong>
              </div>
              <div className="info-item">
                <span>Tracking points</span>
                <strong>{trackingHistory.length}</strong>
              </div>
            </div>

            <div className="controls-row">
              <button type="button" className="follow-btn start" onClick={handleStartSharing}>Start Sharing</button>
              <button type="button" className="follow-btn pause" onClick={handlePauseSharing}>Pause Sharing</button>
              <button type="button" className="follow-btn stop" onClick={handleStopSharing}>Stop Sharing</button>
              <div className="interval-select">
                <label htmlFor="tracking-interval">Update every</label>
                <select
                  id="tracking-interval"
                  value={trackingIntervalSec}
                  onChange={(e) => setTrackingIntervalSec(Number(e.target.value))}
                >
                  <option value={5}>5 sec</option>
                  <option value={10}>10 sec</option>
                  <option value={30}>30 sec</option>
                </select>
              </div>
            </div>

            {warningMessages.length > 0 ? (
              <div className="warning-stack">
                {warningMessages.map((warning) => (
                  <div key={warning} className="warning-alert">⚠ {warning}</div>
                ))}
              </div>
            ) : null}
          </article>

          {isSharingEnabled ? (
            <article className="follow-card follow-map-card">
              <div className="map-container">
                <GoogleMapComponent
                  location={currentLocation}
                  trackingHistory={trackingHistory}
                  showTrackingPath={true}
                  showPopup={false}
                  showAccuracyCircle={true}
                  zoom={15}
                  height="350px"
                  isActive={isFollowMeActive}
                />
              </div>
            </article>
          ) : (
            <article className="follow-card follow-empty-card">
              <div className="empty-icon">📍</div>
              <h3>Enable Follow Me to share your live location with trusted contacts</h3>
              <p>Start sharing to activate real-time map tracking, timeline updates, and safety alerts.</p>
            </article>
          )}

          <article className="follow-card link-share-card">
            <h3>Share this link with trusted contacts</h3>
            <div className="share-link-row">
              <input type="text" readOnly value={shareLink} />
              <button type="button" onClick={handleCopyLink}>{shareCopied ? "✓ Copied" : "Copy link"}</button>
            </div>
            <p className="expiry-text">Link expires in: <strong>{shareLinkTimeLeft}</strong></p>
          </article>

          <article className="follow-card follow-timeline-card">
            <h3>Activity Timeline</h3>
            <div className="timeline-scroll">
              {activityEvents.length ? (
                activityEvents.map((event) => (
                  <div key={event.id} className={`timeline-item tone-${event.tone}`}>
                    <div className="timeline-item-head">
                      <strong>{event.title}</strong>
                      <span>{new Date(event.time).toLocaleTimeString()}</span>
                    </div>
                    <p>{event.detail}</p>
                  </div>
                ))
              ) : (
                <p className="timeline-empty">No activity yet. Start sharing to generate timeline events.</p>
              )}
            </div>
          </article>
        </div>

        <aside className="follow-card follow-contacts-card">
          <h3>Trusted Contacts</h3>
          <div className="contacts-scroll">
            {contacts.map((contact) => (
              <article key={contact.id} className={`contact-row ${contact.active ? "active" : "inactive"}`}>
                <div className="contact-head">
                  <strong>{contact.name}</strong>
                  <span className={`contact-status ${contact.active ? "active" : "inactive"}`}>
                    {contact.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p>{contact.email}</p>
                <p>{contact.phone}</p>
                {isSharingEnabled && contact.active ? <small>◌ Receiving updates</small> : null}
                <div className="contact-actions">
                  <button type="button" onClick={() => handleToggleContact(contact.id)}>
                    {contact.active ? "Disable sharing" : "Enable sharing"}
                  </button>
                  <button type="button" className="remove" onClick={() => handleRemoveContact(contact.id)}>
                    Remove contact
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
