import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { pregnancyWeeks } from "../../data/pregnancyWeeks";
import { calculatePregnancyRisks } from "../../services/pregnancyRiskService";
import { generateCarePlan } from "../../services/carePlanService";
import "./CarePlanPage.css";

export default function CarePlanPage({ currentWeek: currentWeekProp = 20 }) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    bpSystolic: 0,
    bpDiastolic: 0,
    bloodSugar: 0,
    hemoglobin: 0,
    weightGain: 0,
    symptoms: [],
    sleepHours: 0,
    exerciseDuration: 0,
    mealsEaten: 0,
    waterIntake: 0,
  });
  const [checkState, setCheckState] = useState({});

  const week = Math.min(40, Math.max(1, Number(currentWeekProp) || 20));
  const progress = Math.round((week / 40) * 100);
  const weekData = useMemo(() => pregnancyWeeks[week] || pregnancyWeeks[20], [week]);
  const trimesterLabel = useMemo(() => {
    if (week <= 13) return "First Trimester";
    if (week <= 27) return "Second Trimester";
    return "Third Trimester";
  }, [week]);
  const riskResult = useMemo(
    () =>
      calculatePregnancyRisks({
        systolic: userData.bpSystolic,
        diastolic: userData.bpDiastolic,
        bloodSugar: userData.bloodSugar,
        hemoglobin: userData.hemoglobin,
        weightGain: userData.weightGain,
        symptoms: userData.symptoms,
      }),
    [userData]
  );
  const carePlan = useMemo(
    () => generateCarePlan({ ...userData, riskResult }, weekData),
    [userData, riskResult, weekData]
  );
  const healthScore = useMemo(() => {
    const mealsScore = Math.min(10, (Number(userData.mealsEaten) || 0) * 2);
    const waterScore = Math.min(10, (Number(userData.waterIntake) || 0) * 2);
    const nutrition = Math.round(mealsScore + waterScore);

    const exercise = Math.round(Math.min(20, ((Number(userData.exerciseDuration) || 0) / 30) * 20));
    const sleep = Math.round(Math.min(20, ((Number(userData.sleepHours) || 0) / 8) * 20));

    const systolic = Number(userData.bpSystolic) || 0;
    const diastolic = Number(userData.bpDiastolic) || 0;
    const sugar = Number(userData.bloodSugar) || 0;
    const hemoglobin = Number(userData.hemoglobin) || 0;
    let vitals = 20;
    if (systolic > 140 || diastolic > 90) vitals -= 8;
    else if (systolic > 130 || diastolic > 85) vitals -= 4;
    if (sugar > 140) vitals -= 6;
    else if (sugar > 120) vitals -= 3;
    if (hemoglobin > 0 && hemoglobin < 11) vitals -= 4;
    vitals = Math.max(0, vitals);

    const symptomsCount = (userData.symptoms || []).length;
    const symptoms = Math.max(0, 20 - Math.min(20, symptomsCount * 3));

    const total = nutrition + exercise + sleep + vitals + symptoms;
    const label = total >= 85 ? "Excellent" : total >= 70 ? "Good" : "Needs Attention";

    return {
      total,
      label,
      nutrition,
      exercise,
      sleep,
      vitals,
      symptoms,
    };
  }, [userData]);
  const completedCount = useMemo(
    () => Object.values(checkState).filter(Boolean).length,
    [checkState]
  );
  const weeklyEncouragement = useMemo(() => {
    if (week <= 13) {
      return "You are building the strongest foundation for your baby. Small healthy habits each day make a big difference.";
    }
    if (week <= 27) {
      return "This is a growth phase for both you and your baby. Keep your routine steady and celebrate your weekly wins.";
    }
    return "You are in the final stretch. Prioritize rest, hydration, and calm preparation for delivery.";
  }, [week]);

  useEffect(() => {
    const loadCarePlanData = async () => {
      try {
        setLoading(true);
        const logsRes = await api.get("/pregnancy/logs");
        const logs = Array.isArray(logsRes.data?.logs) ? logsRes.data.logs : [];
        const latest = logs[0] || {};

        const mergedSymptoms = [
          ...(Array.isArray(latest?.symptoms) ? latest.symptoms.map((item) => item?.name || item) : []),
          ...(latest?.fatigue ? ["fatigue"] : []),
          ...(latest?.swelling ? ["swelling"] : []),
          ...(latest?.backPain ? ["back pain"] : []),
        ];

        setUserData({
          bpSystolic: Number(latest?.systolic ?? latest?.bloodPressure?.systolic) || 0,
          bpDiastolic: Number(latest?.diastolic ?? latest?.bloodPressure?.diastolic) || 0,
          bloodSugar: Number(latest?.bloodSugar) || 0,
          hemoglobin: Number(latest?.hemoglobin ?? latest?.hb) || 0,
          weightGain: Number(latest?.weightGain) || 0,
          symptoms: mergedSymptoms,
          sleepHours: Number(latest?.sleepHours) || 0,
          exerciseDuration: Number(latest?.exerciseDuration) || 0,
          mealsEaten: Number(latest?.mealsEaten) || 0,
          waterIntake: Number(latest?.waterIntake) || 0,
        });
      } catch (error) {
        console.error("Failed to load care plan data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCarePlanData();
  }, [week]);

  useEffect(() => {
    const initialChecklist = Object.fromEntries(
      (carePlan.checklist || []).map((item) => [item, false])
    );
    setCheckState(initialChecklist);
  }, [carePlan.checklist]);

  const toggleChecklist = (item) => {
    setCheckState((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <section className="care-plan-page">
      <header className="care-plan-header">
        <div>
          <h2>Your Personalized Care Plan</h2>
          <p>Week {week} Care Plan</p>
        </div>
        <span className="care-plan-trimester-badge">{trimesterLabel}</span>
      </header>

      <div className="care-plan-progress-card">
        <div className="care-plan-progress-head">
          <strong>Pregnancy Progress</strong>
          <span>{progress}%</span>
        </div>
        <div className="care-plan-progress-track">
          <div className="care-plan-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {loading ? <p className="care-plan-loading">Generating your care plan...</p> : null}

      <div className="care-plan-grid">
        <article className="care-plan-card">
          <h3>Health Goals</h3>
          <ul>
            {carePlan.healthGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </article>

        <article className="care-plan-card">
          <h3>Nutrition Plan</h3>
          <ul>
            {carePlan.nutrition.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="care-plan-card">
          <h3>Exercise Plan</h3>
          <ul>
            {carePlan.exercise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="care-plan-card">
          <h3>Doctor Advice</h3>
          <ul>
            {carePlan.doctorAdvice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="care-plan-card">
          <h3>Weekly Checklist</h3>
          <p className="care-plan-meta">
            {completedCount} / {carePlan.checklist.length} completed
          </p>
          <div className="care-plan-checklist">
            {carePlan.checklist.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={Boolean(checkState[item])}
                  onChange={() => toggleChecklist(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="care-plan-card">
          <h3>Pregnancy Health Score</h3>
          <div className="care-plan-score">
            <strong>{healthScore.total} / 100</strong>
            <span>{healthScore.label}</span>
          </div>
          <div className="care-plan-score-grid">
            <p>Nutrition: {healthScore.nutrition}/20</p>
            <p>Exercise: {healthScore.exercise}/20</p>
            <p>Sleep: {healthScore.sleep}/20</p>
            <p>Vitals: {healthScore.vitals}/20</p>
            <p>Symptoms: {healthScore.symptoms}/20</p>
          </div>
        </article>

        <article className="care-plan-card care-plan-wide">
          <h3>Smart Recommendations</h3>
          <ul>
            {carePlan.smartRecommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {carePlan.riskAlerts.length ? (
            <div className="care-plan-alerts">
              {carePlan.riskAlerts.map((alert) => (
                <p key={alert}>⚠ {alert}</p>
              ))}
            </div>
          ) : null}
        </article>

        <article className="care-plan-card care-plan-wide care-plan-encouragement">
          <h3>Weekly Encouragement</h3>
          <p>{weeklyEncouragement}</p>
          {weekData?.development ? <small>{weekData.development}</small> : null}
        </article>
      </div>
    </section>
  );
}
