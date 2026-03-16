import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./HealthInsights.css";

const PHASE_LIFESTYLE_RECOMMENDATIONS = {
  menstrual: [
    "Prioritize warm, iron-rich meals and hydration.",
    "Choose restorative movement and extra sleep.",
  ],
  follicular: [
    "Leverage higher energy with progressive workouts.",
    "Plan high-focus tasks in this phase when possible.",
  ],
  ovulation: [
    "Stay hydrated and include protein-rich recovery meals.",
    "Use peak energy for cardio and social activities.",
  ],
  luteal: [
    "Reduce caffeine and sodium if bloating increases.",
    "Use lighter workouts and consistent bedtime routines.",
  ],
};

const INTENSITY_SCORE = { light: 1, medium: 2, heavy: 3 };

export default function HealthInsights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [currentPhase, setCurrentPhase] = useState("follicular");
  const [cycles, setCycles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [insightsRes, predictionRes, phaseRes, historyRes] = await Promise.all([
          api.get("/periods/insights"),
          api.get("/periods/prediction"),
          api.get("/periods/current-phase"),
          api.get("/periods/history"),
        ]);

        setInsights(insightsRes.data || {});
        setPrediction(predictionRes.data || {});
        setCurrentPhase(phaseRes.data?.phase || "follicular");
        setCycles(Array.isArray(historyRes.data?.cycles) ? historyRes.data.cycles : []);
      } catch (loadError) {
        console.error("Failed to load health insights:", loadError);
        setError("Unable to load insights right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cycleAnalysis = useMemo(() => {
    const avgCycleLength = insights?.avgCycleLength || 28;
    const avgDuration = insights?.avgDuration || 5;
    const regularity = insights?.isIrregular ? "Irregular trend" : "Mostly regular trend";
    return { avgCycleLength, avgDuration, regularity };
  }, [insights]);

  const symptomTrends = useMemo(() => {
    const symptomCount = new Map();
    let severityTotal = 0;
    let severitySamples = 0;

    cycles.forEach((cycle) => {
      const symptoms = Array.isArray(cycle.symptoms) ? cycle.symptoms : [];
      symptoms.forEach((symptom) => {
        symptomCount.set(symptom, (symptomCount.get(symptom) || 0) + 1);
      });
      const score = INTENSITY_SCORE[(cycle.intensity || "").toLowerCase()];
      if (score) {
        severityTotal += score;
        severitySamples += 1;
      }
    });

    const sortedSymptoms = [...symptomCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxFreq = sortedSymptoms[0]?.[1] || 1;
    const avgSeverityScore = severitySamples ? severityTotal / severitySamples : 0;
    const severityLabel = avgSeverityScore >= 2.5 ? "High" : avgSeverityScore >= 1.5 ? "Moderate" : "Low";

    return {
      topSymptoms: sortedSymptoms.map(([name, count]) => ({
        name,
        count,
        width: Math.max(18, Math.round((count / maxFreq) * 100)),
      })),
      severityLabel,
    };
  }, [cycles]);

  const phaseTips = PHASE_LIFESTYLE_RECOMMENDATIONS[currentPhase] || PHASE_LIFESTYLE_RECOMMENDATIONS.follicular;

  const predictiveInsights = useMemo(() => {
    const nextPeriodStart = prediction?.nextPeriodStart || insights?.nextPeriodStart || null;
    const fertileWindow = Array.isArray(prediction?.fertileWindow) ? prediction.fertileWindow : [];

    const nextPeriodText = nextPeriodStart
      ? new Date(nextPeriodStart).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })
      : "Not enough data yet";

    const fertileText =
      fertileWindow.length === 2
        ? `${new Date(fertileWindow[0]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${new Date(fertileWindow[1]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`
        : "Track more cycles to predict window";

    return { nextPeriodText, fertileText };
  }, [prediction, insights]);

  const personalizedAlerts = useMemo(() => {
    const alerts = [];
    if (insights?.isIrregular) {
      alerts.push("Cycle irregularity detected across recent logs. Consider reviewing with your provider.");
    }
    if (symptomTrends.severityLabel === "High") {
      alerts.push("Higher symptom severity trend detected. Add rest, hydration, and symptom logs consistently.");
    }
    if ((insights?.totalCycles || 0) < 3) {
      alerts.push("Track at least 3 full cycles to improve prediction accuracy.");
    }
    if (alerts.length === 0) {
      alerts.push("No critical alerts right now. Keep logging daily to maintain insight quality.");
    }
    return alerts;
  }, [insights, symptomTrends]);

  if (loading) return <div className="hi-loading">Loading insights...</div>;
  if (error) return <div className="hi-error">{error}</div>;

  return (
    <section className="health-insights">
      <div className="hi-status-strip">
        <strong>{insights?.isIrregular ? "Attention Needed" : "Healthy Trend"}</strong>
        <span>{insights?.note || "Insights are based on your logged cycle data."}</span>
      </div>

      <section className="hi-section">
        <h3>Cycle Analysis</h3>
        <div className="hi-three-col">
          <div className="hi-metric">
            <span>Average Cycle Length</span>
            <strong>{cycleAnalysis.avgCycleLength} days</strong>
          </div>
          <div className="hi-metric">
            <span>Average Duration</span>
            <strong>{cycleAnalysis.avgDuration} days</strong>
          </div>
          <div className="hi-metric">
            <span>Regularity Trend</span>
            <strong>{cycleAnalysis.regularity}</strong>
          </div>
        </div>
      </section>

      <section className="hi-section">
        <h3>Symptom Trends</h3>
        {symptomTrends.topSymptoms.length ? (
          <div className="hi-bars">
            {symptomTrends.topSymptoms.map((item) => (
              <div className="hi-bar-row" key={item.name}>
                <span>{item.name}</span>
                <div className="hi-bar-track">
                  <div className="hi-bar-fill" style={{ width: `${item.width}%` }} />
                </div>
                <small>{item.count} logs</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="hi-muted">No symptom logs yet. Log symptoms to view trend frequency.</p>
        )}
        <p className="hi-muted">Average severity trend: <strong>{symptomTrends.severityLabel}</strong></p>
      </section>

      <section className="hi-section">
        <h3>Lifestyle Recommendations ({currentPhase} phase)</h3>
        <ul className="hi-list">
          {phaseTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="hi-section">
        <h3>Predictive Insights</h3>
        <div className="hi-two-col">
          <div className="hi-panel">
            <span>Next Period Prediction</span>
            <strong>{predictiveInsights.nextPeriodText}</strong>
          </div>
          <div className="hi-panel">
            <span>Fertile Window</span>
            <strong>{predictiveInsights.fertileText}</strong>
          </div>
        </div>
      </section>

      <section className="hi-section">
        <h3>Personalized Alerts</h3>
        <ul className="hi-alerts">
          {personalizedAlerts.map((alert) => (
            <li key={alert}>{alert}</li>
          ))}
        </ul>
      </section>

      <section className="hi-section">
        <h3>Health Tips</h3>
        <div className="hi-tips-grid">
          <article className="hi-tip">
            <h4>🥗 Nutrition</h4>
            <p>Match meals to your phase: iron support in menstrual days, protein and fiber during luteal days.</p>
          </article>
          <article className="hi-tip">
            <h4>💧 Hydration</h4>
            <p>Aim for consistent hydration daily, and increase fluids if bloating or cramps intensify.</p>
          </article>
          <article className="hi-tip">
            <h4>🏃 Exercise</h4>
            <p>Use higher-intensity sessions in follicular/ovulation phases and lighter recovery in luteal/menstrual.</p>
          </article>
          <article className="hi-tip">
            <h4>😴 Sleep</h4>
            <p>Keep a stable bedtime routine and target 7-9 hours, especially around hormonal fluctuation windows.</p>
          </article>
        </div>
      </section>

      <section className="hi-section">
        <h3>Tracking Summary</h3>
        <div className="hi-summary-grid">
          <div className="hi-summary-item">
            <span>Cycles Tracked</span>
            <strong>{insights?.totalCycles || 0}</strong>
          </div>
          <div className="hi-summary-item">
            <span>Days of Data</span>
            <strong>{insights?.totalDays || 0}</strong>
          </div>
          <div className="hi-summary-item">
            <span>Common Symptoms</span>
            <strong>{insights?.commonSymptoms || "None logged"}</strong>
          </div>
          <div className="hi-summary-item">
            <span>Lifestyle Habits</span>
            <strong>{currentPhase === "luteal" ? "Recovery-focused" : "Balanced active"}</strong>
          </div>
        </div>
      </section>
    </section>
  );
}
