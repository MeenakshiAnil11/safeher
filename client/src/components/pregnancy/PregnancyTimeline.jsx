import React, { useMemo } from "react";
import "./PregnancyTimeline.css";

const getTrimesterLabel = (week) => {
  if (week <= 13) return "First Trimester";
  if (week <= 27) return "Second Trimester";
  return "Third Trimester";
};

export default function PregnancyTimeline({ currentWeek = 1, onWeekSelect }) {
  const weeks = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), []);
  const trimesterLabel = getTrimesterLabel(currentWeek);

  return (
    <section className="pregnancy-timeline-card">
      <div className="pregnancy-timeline-head">
        <h3>Pregnancy Timeline</h3>
        <p>Week 1 - Week 40</p>
      </div>

      <div className="pregnancy-timeline-trimester">
        <strong>{trimesterLabel}</strong>
        <span>Current Week: {currentWeek}</span>
      </div>

      <div className="pregnancy-timeline-grid">
        {weeks.map((week) => (
          <button
            key={week}
            type="button"
            onClick={() => onWeekSelect?.(week)}
            className={`pregnancy-week-btn ${currentWeek === week ? "active" : ""}`}
          >
            {week}
          </button>
        ))}
      </div>
    </section>
  );
}
