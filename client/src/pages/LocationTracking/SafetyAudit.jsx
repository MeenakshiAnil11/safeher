import React, { useMemo, useState } from "react";
import "./SafetyAudit.css";

const INITIAL_RATINGS = {
  lighting: 0,
  crowd: 0,
  visibility: 0,
};

const RECENT_AUDITS = [
  {
    id: "a1",
    place: "Central Park Avenue",
    author: "Sarah M.",
    timeAgo: "15 min ago",
    lighting: 5,
    crowd: 4,
    visibility: 5,
    security: "Present",
  },
  {
    id: "a2",
    place: "Downtown Shopping District",
    author: "Emily R.",
    timeAgo: "1 hour ago",
    lighting: 4,
    crowd: 5,
    visibility: 4,
    security: "Present",
  },
  {
    id: "a3",
    place: "Riverside Walking Path",
    author: "Anna K.",
    timeAgo: "2 hours ago",
    lighting: 3,
    crowd: 2,
    visibility: 3,
    security: "Absent",
  },
];

const StarRow = ({ value, onRate, readOnly = false }) => (
  <div className="safety-audit-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`safety-audit-star ${value >= star ? "filled" : ""} ${readOnly ? "readonly" : ""}`}
        onClick={readOnly ? undefined : () => onRate(star)}
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

  const locationLabel = useMemo(() => {
    if (addressDetails?.display_name) {
      return addressDetails.display_name.split(",").slice(0, 2).join(",").trim();
    }
    return "Downtown Square, Main Street";
  }, [addressDetails]);

  const updateRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="safety-audit-page">
      <div className="safety-audit-head">
        <h1>Safety Audit</h1>
        <p>Help build a safer community by sharing your experience</p>
      </div>

      <div className="safety-audit-grid">
        <article className="safety-audit-card">
          <h2>Submit Safety Rating</h2>

          <div className="safety-audit-field">
            <label>Location</label>
            <div className="safety-audit-location">
              <span>📍</span>
              <strong>{locationLabel}</strong>
            </div>
            <small>Using your current location</small>
          </div>

          <div className="safety-audit-field safety-audit-rating-field">
            <label>Lighting (1-5 stars)</label>
            <StarRow value={ratings.lighting} onRate={(v) => updateRating("lighting", v)} />
          </div>

          <div className="safety-audit-field safety-audit-rating-field">
            <label>Crowd Density (1-5 stars)</label>
            <StarRow value={ratings.crowd} onRate={(v) => updateRating("crowd", v)} />
          </div>

          <div className="safety-audit-field safety-audit-rating-field">
            <label>Visibility (1-5 stars)</label>
            <StarRow value={ratings.visibility} onRate={(v) => updateRating("visibility", v)} />
          </div>

          <div className="safety-audit-field">
            <label>Security Presence</label>
            <div className="safety-audit-toggle">
              <button
                type="button"
                className={securityPresence === "yes" ? "active" : ""}
                onClick={() => setSecurityPresence("yes")}
              >
                Yes
              </button>
              <button
                type="button"
                className={securityPresence === "no" ? "active" : ""}
                onClick={() => setSecurityPresence("no")}
              >
                No
              </button>
            </div>
          </div>

          <button type="button" className="safety-audit-submit">
            ✈ Submit Audit
          </button>
        </article>

        <article className="safety-audit-card">
          <h2>Recent Audits Nearby</h2>
          <div className="safety-audit-list">
            {RECENT_AUDITS.map((audit) => (
              <div className="safety-audit-item" key={audit.id}>
                <h3>📍 {audit.place}</h3>
                <p className="safety-audit-meta">👤 {audit.author} &nbsp; ◷ {audit.timeAgo}</p>
                <div className="safety-audit-item-row">
                  <span>Lighting</span>
                  <StarRow value={audit.lighting} readOnly />
                </div>
                <div className="safety-audit-item-row">
                  <span>Crowd</span>
                  <StarRow value={audit.crowd} readOnly />
                </div>
                <div className="safety-audit-item-row">
                  <span>Visibility</span>
                  <StarRow value={audit.visibility} readOnly />
                </div>
                <div className="safety-audit-item-row">
                  <span>Security</span>
                  <span className={`safety-audit-pill ${audit.security === "Present" ? "present" : "absent"}`}>
                    {audit.security}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
