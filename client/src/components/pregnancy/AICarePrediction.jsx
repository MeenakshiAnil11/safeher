import React, { useMemo } from "react";
import { getUpcomingCare } from "../../services/prenatalCarePredictor";
import "./AICarePrediction.css";

export default function AICarePrediction({ currentWeek = 20, onSchedule }) {
  const recommendations = useMemo(() => getUpcomingCare(currentWeek, 3), [currentWeek]);

  return (
    <article className="ai-care-prediction-card">
      <div className="ai-care-prediction-head">
        <h3>AI Prenatal Care Prediction</h3>
        <span>Week {currentWeek}</span>
      </div>
      <p>Based on your current pregnancy week, these checkups are recommended next:</p>
      <div className="ai-care-prediction-list">
        {recommendations.length ? (
          recommendations.map((item) => (
            <div key={`${item.week}-${item.test}`} className="ai-care-prediction-item">
              <strong>Week {item.week}</strong>
              <span>{item.test}</span>
            </div>
          ))
        ) : (
          <div className="ai-care-prediction-item">
            <strong>Up to date</strong>
            <span>No upcoming scheduled recommendations after this week.</span>
          </div>
        )}
      </div>
      <button
        type="button"
        className="gradient-btn"
        onClick={() => onSchedule?.(recommendations[0]?.test || "")}
      >
        Schedule Appointment
      </button>
    </article>
  );
}
