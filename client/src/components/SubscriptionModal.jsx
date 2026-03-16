import React from "react";

export default function SubscriptionModal({ open, onClose, onSubscribe }) {
  if (!open) return null;

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div className="subscription-modal" onClick={(event) => event.stopPropagation()}>
        <h3>SafeHer Premium</h3>
        <p>Unlock premium maternal health knowledge.</p>
        <ul>
          <li>Full pregnancy guides</li>
          <li>Expert video lessons</li>
          <li>AI health insights</li>
        </ul>
        <div className="subscription-price">₹199/month</div>
        <div className="subscription-actions">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={onSubscribe}>
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
