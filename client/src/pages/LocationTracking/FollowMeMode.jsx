import React, { useMemo, useState } from "react";
import "./FollowMeMode.css";

const CONTACTS = [
  { id: "c1", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1-555-0123", active: true },
  { id: "c2", name: "Mike Davis", email: "mike.d@email.com", phone: "+1-555-0124", active: false },
  { id: "c3", name: "Emily Wilson", email: "emily.w@email.com", phone: "+1-555-0125", active: true },
];

export default function FollowMeMode() {
  const [isFollowMeActive, setIsFollowMeActive] = useState(false);
  const shareLink = "https://safeher.app/track/nub5k3gc42a";

  const liveContacts = useMemo(
    () => CONTACTS.filter((c) => c.active),
    []
  );

  return (
    <section className="follow-me-page">
      <header className="follow-me-header">
        <h1>Follow Me Mode</h1>
        <p>Share your live location with trusted contacts</p>
      </header>

      <div className="follow-me-notice">
        <span>ⓘ</span>
        <p>
          <strong>Privacy Notice:</strong> Your location will be shared in real-time with selected contacts.
          You can stop sharing at any time.
        </p>
      </div>

      <div className="follow-me-grid">
        <div className="follow-me-left-col">
          <article className="follow-me-status-card">
            <div className={`follow-me-icon ${isFollowMeActive ? "active" : ""}`}>📶</div>
            <h2>{isFollowMeActive ? "Follow Me Active" : "Follow Me Inactive"}</h2>
            <p>
              {isFollowMeActive
                ? "Your location is being shared with trusted contacts. They can see your real-time position."
                : "Enable Follow Me mode to share your live location with trusted contacts for your safety."}
            </p>
            <button
              type="button"
              className={`follow-me-toggle-btn ${isFollowMeActive ? "stop" : "start"}`}
              onClick={() => setIsFollowMeActive((v) => !v)}
            >
              {isFollowMeActive ? "Stop Sharing" : "Enable Follow Me"}
            </button>
          </article>

          {isFollowMeActive && (
            <>
              <article className="follow-me-share-card">
                <h3>⟲ Share Link</h3>
                <p>Share this secure link with anyone you want to track your location</p>
                <div className="follow-me-share-row">
                  <input type="text" readOnly value={shareLink} />
                  <button type="button">📋 Copy</button>
                </div>
              </article>

              <article className="follow-me-live-card">
                <div className="follow-me-live-top">
                  <span className="live-pill">● LIVE</span>
                  <span className="timer-pill">◷ 00:12:34</span>
                </div>
                <div className="follow-me-live-center">
                  <div className="pin">📍</div>
                  <h4>Live Location</h4>
                  <p>Your real-time position is being tracked</p>
                </div>
                <div className="follow-me-current-location">
                  <strong>📍 Current Location</strong>
                  <span>Downtown Square, Main Street</span>
                  <small>Last updated: Just now</small>
                </div>
              </article>
            </>
          )}
        </div>

        <aside className="follow-me-contacts-card">
          <div className="follow-me-contacts-head">
            <h3>⚭ Trusted Contacts</h3>
            <button type="button">⌁</button>
          </div>
          <div className="follow-me-contacts-list">
            {CONTACTS.map((contact) => (
              <article className={`follow-me-contact-item ${contact.active ? "active" : ""}`} key={contact.id}>
                <div className="follow-me-contact-top">
                  <strong>{contact.name}</strong>
                  <span className={`status-pill ${contact.active ? "active" : "inactive"}`}>
                    {contact.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p>{contact.email}</p>
                <p>{contact.phone}</p>
                {isFollowMeActive && contact.active ? <small>◌ Receiving your location</small> : null}
              </article>
            ))}
          </div>
          <div className="follow-me-tip">
            <strong>🛡 Tip:</strong> Add family members and close friends as trusted contacts for enhanced safety.
          </div>
        </aside>
      </div>
    </section>
  );
}
