import React from "react";
import { FaClock } from "react-icons/fa";

export default function AppointmentModal({
  errorMessage = "",
  slots = [],
  onSlotSelect,
  selectedSlot = "",
  loading = false,
}) {
  const inlineMessage = errorMessage || (!loading && slots.length === 0 ? "No appointments available" : "");

  return (
    <div className="booking-time-section">
      <label className="booking-label">
        <FaClock className="label-icon" />
        Choose Time
      </label>

      {loading ? <p className="slots-state-text">Loading slots...</p> : null}

      {inlineMessage ? (
        <p className="slot-error-message text-sm text-red-600 mt-2" role="alert" aria-live="polite">
          {inlineMessage}
        </p>
      ) : null}

      <div className="time-slots-grid">
        {slots.map((time, idx) => (
          <button
            key={idx}
            type="button"
            className={`time-slot-btn ${selectedSlot === time ? "selected" : ""}`}
            onClick={() => onSlotSelect?.(time)}
            aria-label={`Book appointment at ${time}`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
}
