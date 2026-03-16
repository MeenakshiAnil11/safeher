import React from "react";
import "./FindSupport.css";

const SUPPORT_ITEMS = [
  {
    id: "s1",
    name: "Women's Safety Helpline",
    type: "NGO",
    address: "24/7 National Hotline",
    distance: "Nationwide",
    hours: "24/7",
  },
  {
    id: "s2",
    name: "Central Police Station",
    type: "Police",
    address: "456 Law Enforcement Blvd, Downtown",
    distance: "1.2 km",
    hours: "24/7",
  },
  {
    id: "s3",
    name: "SafeHaven Women's Shelter",
    type: "Shelter",
    address: "89 Hope Street, Midtown",
    distance: "0.9 km",
    hours: "Open now",
  },
];

export default function FindSupport() {
  return (
    <section className="find-support-page">
      <header className="find-support-head">
        <h1>Find Support</h1>
        <p>Access verified help centers and emergency contacts</p>
      </header>

      <section className="find-support-alert">
        <div>
          <h2>Emergency Helplines</h2>
          <p>Available 24/7 for immediate assistance</p>
        </div>
        <div className="find-support-alert-actions">
          <button type="button">📞 911 - Emergency</button>
          <button type="button">📞 Women's Helpline</button>
        </div>
      </section>

      <div className="find-support-grid">
        <article className="find-support-map-card">
          <div className="find-support-tags">
            <span>🛡️ Central Police Station</span>
            <span>🏠 SafeHaven Women's Shelter</span>
            <span>♡ Hope & Help Women's Center</span>
          </div>

          <div className="find-support-map-center">
            <div className="map-pin">📍</div>
            <h3>Support Centers Map</h3>
            <p>Verified support locations near you</p>
          </div>

          <div className="find-support-legend">
            <h4>Legend</h4>
            <p>○ Police Stations</p>
            <p>♡ NGOs</p>
            <p>⌂ Shelters</p>
          </div>

          <div className="find-support-you-here">● You are here</div>
        </article>

        <aside className="find-support-directory">
          <h2>Support Directory</h2>
          <div className="find-support-list">
            {SUPPORT_ITEMS.map((item) => (
              <article className="find-support-item" key={item.id}>
                <h3>{item.name}</h3>
                <small>{item.type}</small>
                <p className="address">⌖ {item.address}</p>
                <p className="meta-row">
                  <span>Distance:</span>
                  <strong>{item.distance}</strong>
                </p>
                <p className="meta-row">
                  <span>Hours:</span>
                  <strong>{item.hours}</strong>
                </p>
                <div className="find-support-actions">
                  <button type="button" className="call-now">📞 Call Now</button>
                  <button type="button" className="navigate">↗ Navigate</button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <section className="find-support-resources">
        <h3>Additional Resources</h3>
        <div className="find-support-resource-grid">
          <article>
            <h4>↗ Safety Tips</h4>
            <p>Learn how to stay safe</p>
          </article>
          <article>
            <h4>↗ Legal Aid</h4>
            <p>Access legal support</p>
          </article>
          <article>
            <h4>↗ Community</h4>
            <p>Join support groups</p>
          </article>
        </div>
      </section>
    </section>
  );
}
