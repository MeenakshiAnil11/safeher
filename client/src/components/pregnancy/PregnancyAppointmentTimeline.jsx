import React, { useMemo } from "react";
import "./PregnancyAppointmentTimeline.css";

const CHECKPOINTS = [
  { week: 8, title: "First Prenatal Visit", keywords: ["prenatal", "checkup"] },
  { week: 12, title: "Ultrasound Scan", keywords: ["ultrasound", "scan"] },
  { week: 20, title: "Anatomy Scan", keywords: ["anatomy"] },
  { week: 24, title: "Glucose Screening", keywords: ["glucose"] },
  { week: 32, title: "Growth Scan", keywords: ["growth"] },
  { week: 36, title: "Final Prenatal Visit", keywords: ["final prenatal", "prenatal"] },
];

export default function PregnancyAppointmentTimeline({ currentWeek = 20, appointments = [] }) {
  const points = useMemo(() => {
    const now = new Date();
    return CHECKPOINTS.map((point) => {
      const related = appointments.find((appt) => {
        const title = String(appt.title || "").toLowerCase();
        return point.keywords.some((keyword) => title.includes(keyword));
      });
      const apptDate = related ? new Date(related.time || related.date) : null;
      const completed = apptDate ? apptDate < now : currentWeek > point.week;
      const upcoming = !completed;

      return {
        ...point,
        completed,
        upcoming,
        current: Math.abs(currentWeek - point.week) <= 1,
      };
    });
  }, [appointments, currentWeek]);

  return (
    <article className="preg-appt-timeline-card">
      <div className="timeline-head">
        <h3>Pregnancy Care Timeline</h3>
        <span>Current Week: {currentWeek}</span>
      </div>
      <div className="timeline-list">
        {points.map((point) => (
          <div
            key={point.week}
            className={`timeline-item ${point.completed ? "completed" : "upcoming"} ${
              point.current ? "current" : ""
            }`}
          >
            <div className="timeline-dot">{point.completed ? "✔" : "●"}</div>
            <div className="timeline-content">
              <strong>Week {point.week}</strong>
              <p>{point.title}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
