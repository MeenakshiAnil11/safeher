import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  getCyclePhase,
  getExerciseRecommendations,
} from "../../utils/cycleExerciseRecommendations";
import "./CycleExerciseRecommendationsCard.css";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getTodayStart = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export default function CycleExerciseRecommendationsCard() {
  const [phase, setPhase] = useState("");
  const [cycleDay, setCycleDay] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCycleRecommendation = async () => {
      try {
        setError("");
        const response = await api.get("/periods/current-phase");
        const lastPeriodStartDate = response.data?.lastPeriodStart;
        const cycleLength = Number(response.data?.avgCycleLength) || 28;

        if (!lastPeriodStartDate) {
          setError("Cycle data not available yet. Please log your period to view recommendations.");
          return;
        }

        const startDate = new Date(lastPeriodStartDate);
        if (Number.isNaN(startDate.getTime())) {
          setError("Could not parse cycle data. Please update your cycle logs.");
          return;
        }

        const diffDays = Math.floor((getTodayStart() - new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / MS_PER_DAY);
        const normalizedDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
        const currentCycleDay = normalizedDay + 1;

        const currentPhase = getCyclePhase(currentCycleDay);
        const nextRecommendations = getExerciseRecommendations(currentPhase);

        setCycleDay(currentCycleDay);
        setPhase(currentPhase);
        setRecommendations(nextRecommendations);
      } catch (loadError) {
        console.error("Failed to load cycle exercise recommendations:", loadError);
        setError("Unable to load exercise recommendations right now.");
      }
    };

    loadCycleRecommendation();
  }, []);

  return (
    <section className="cycle-exercise-card">
      <h3>Exercise Recommendations</h3>
      {error ? (
        <p className="cycle-exercise-error">{error}</p>
      ) : (
        <>
          <p className="cycle-exercise-phase">
            Cycle Phase: <strong>{phase}</strong>
            {cycleDay ? <span> (Day {cycleDay})</span> : null}
          </p>
          <div className="cycle-exercise-list-wrap">
            <p className="cycle-exercise-subtitle">Recommended Exercises:</p>
            <ul>
              {recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
