import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import getPregnancyWeekContent from "../../data/pregnancyWeekContent";
import { pregnancyExercises as pregnancyExercisesData } from "../../data/pregnancyExercises";
import { getExerciseRecommendations } from "../../services/pregnancyPersonalizationService";
import PregnancyVideoSection from "../../components/PregnancyVideoSection";
import "./PregnancyExercises.css";

const EXERCISES = {
  first: [
    { emoji: "🚶", name: "Walking", duration: "20-30 minutes", desc: "Low-impact cardiovascular exercise" },
    { emoji: "🏊", name: "Swimming", duration: "20-30 minutes", desc: "Full-body workout without stress on joints" },
    { emoji: "🧘", name: "Prenatal Yoga", duration: "15-20 minutes", desc: "Flexibility, balance, and relaxation" },
    { emoji: "💪", name: "Pelvic Floor Exercises", duration: "5-10 minutes", desc: "Strengthens muscles for labor and recovery" },
  ],
  second: [
    { emoji: "🚶", name: "Walking", duration: "25-35 minutes", desc: "Supports stamina and healthy circulation" },
    { emoji: "🏊", name: "Swimming", duration: "20-30 minutes", desc: "Relieves pressure on lower back and joints" },
    { emoji: "🧘", name: "Prenatal Yoga", duration: "20-25 minutes", desc: "Improves posture and flexibility" },
    { emoji: "💪", name: "Pelvic Floor Exercises", duration: "8-12 minutes", desc: "Builds pelvic support for delivery" },
  ],
  third: [
    { emoji: "🚶", name: "Walking", duration: "15-25 minutes", desc: "Gentle movement and mood support" },
    { emoji: "🏊", name: "Swimming", duration: "15-25 minutes", desc: "Eases body weight pressure and swelling" },
    { emoji: "🧘", name: "Prenatal Yoga", duration: "15-20 minutes", desc: "Breathing, relaxation, and gentle mobility" },
    { emoji: "💪", name: "Pelvic Floor Exercises", duration: "8-10 minutes", desc: "Supports labor readiness and control" },
  ],
};

const BREATHING = [
  {
    title: "Deep Belly Breathing",
    steps: [
      "Sit comfortably",
      "Place hand on belly",
      "Breathe in slowly through nose for 4 counts",
      "Exhale through mouth for 6 counts",
      "Repeat 10 times",
    ],
  },
  {
    title: "4-7-8 Breathing",
    steps: [
      "Inhale through nose for 4 counts",
      "Hold breath for 7 counts",
      "Exhale through mouth for 8 counts",
      "Repeat 4 cycles",
    ],
  },
];

const TIPS = [
  "Stay hydrated before, during, and after exercise",
  "Avoid exercises lying flat on your back after first trimester",
  "Listen to your body and don't overexert",
  "Wear comfortable, supportive clothing and shoes",
  "Avoid contact sports and activities with fall risk",
];

const getTrimesterFromWeek = (week) => {
  if (week <= 12) return "first";
  if (week <= 26) return "second";
  return "third";
};

export default function PregnancyExercises({ currentWeek }) {
  const [trimester, setTrimester] = useState(getTrimesterFromWeek(currentWeek || 20));
  const [safeExercises, setSafeExercises] = useState(getPregnancyWeekContent(currentWeek || 20).exercise.exercises);
  const [exerciseTips, setExerciseTips] = useState(getPregnancyWeekContent(currentWeek || 20).exercise.tips);
  const [breathingTechniques, setBreathingTechniques] = useState(getPregnancyWeekContent(currentWeek || 20).exercise.breathing);
  const [healthData, setHealthData] = useState({});
  const [completedMap, setCompletedMap] = useState({});
  const [completedDays, setCompletedDays] = useState([]);
  const [videoExercise, setVideoExercise] = useState(null);
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale");
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    const loadWellness = async () => {
      try {
        const week = currentWeek || 20;
        const nextTrimester = getTrimesterFromWeek(week);
        setTrimester(nextTrimester);
        const dynamic = getPregnancyWeekContent(week);
        setSafeExercises(dynamic.exercise.exercises);
        setExerciseTips(dynamic.exercise.tips);
        setBreathingTechniques(dynamic.exercise.breathing);
        const logsRes = await api.get("/pregnancy/logs?limit=1");
        const latest = Array.isArray(logsRes.data?.logs) ? logsRes.data.logs[0] : {};
        setHealthData(latest || {});

      } catch (error) {
        console.error("Failed to load wellness exercises:", error);
        const dynamic = getPregnancyWeekContent(currentWeek || 20);
        setSafeExercises(dynamic.exercise.exercises);
        setExerciseTips(dynamic.exercise.tips);
        setBreathingTechniques(dynamic.exercise.breathing);
      }
    };

    loadWellness();
  }, [currentWeek]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const logsRes = await api.get("/pregnancy/logs?limit=1");
        const latest = Array.isArray(logsRes.data?.logs) ? logsRes.data.logs[0] : {};
        setHealthData(latest || {});
      } catch (error) {
        // Keep prior exercise personalization if refresh fails.
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pregWorkoutProgress") || "{}");
      setCompletedMap(saved.completedMap || {});
      setCompletedDays(saved.completedDays || []);
    } catch {
      setCompletedMap({});
      setCompletedDays([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "pregWorkoutProgress",
      JSON.stringify({ completedMap, completedDays })
    );
  }, [completedMap, completedDays]);

  const trimesterExercises = useMemo(
    () => {
      const triNumber = trimester === "first" ? 1 : trimester === "second" ? 2 : 3;
      const dataMatches = pregnancyExercisesData.filter((item) => item.trimester.includes(triNumber));
      if (trimester === getTrimesterFromWeek(currentWeek || 20) && safeExercises?.length) {
        return safeExercises.map((item) => {
          const fromDataset = dataMatches.find((d) => d.name.toLowerCase() === item.name.toLowerCase());
          return {
            ...item,
            videoUrl: fromDataset?.videoUrl || dataMatches[0]?.videoUrl || "",
            benefits: fromDataset?.benefits || item.desc,
          };
        });
      }
      return dataMatches.length ? dataMatches : EXERCISES[trimester];
    },
    [trimester, safeExercises, currentWeek]
  );

  const personalizedExercise = useMemo(
    () => getExerciseRecommendations(currentWeek || 20, healthData),
    [currentWeek, healthData]
  );

  const safetyAlerts = useMemo(() => personalizedExercise.cautions, [personalizedExercise]);

  const aiExercisePlan = useMemo(() => {
    if (personalizedExercise.plan.length) return personalizedExercise.plan.slice(0, 3);
    return trimesterExercises.slice(0, 3).map((item) => `${item.name} - ${item.duration}`);
  }, [personalizedExercise, trimesterExercises]);

  const weeklyProgress = useMemo(() => Math.min(7, new Set(completedDays).size), [completedDays]);
  const currentVideoWatchUrl = useMemo(() => {
    const embed = String(videoExercise?.videoUrl || "");
    if (!embed.includes("/embed/")) return "";
    return embed.replace("/embed/", "/watch?v=").split("?")[0];
  }, [videoExercise]);

  const handleToggleComplete = (exerciseName) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [exerciseName]: !prev[exerciseName] };
      if (!prev[exerciseName]) {
        const today = new Date().toISOString().split("T")[0];
        setCompletedDays((days) => (days.includes(today) ? days : [...days, today]));
      }
      return next;
    });
  };

  useEffect(() => {
    if (!breathRunning) return undefined;
    const timer = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;
        setBreathPhase((phase) => {
          if (phase === "Inhale") {
            setBreathSeconds(2);
            return "Hold";
          }
          if (phase === "Hold") {
            setBreathSeconds(6);
            return "Exhale";
          }
          setBreathSeconds(4);
          return "Inhale";
        });
        return 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathRunning]);

  return (
    <section className="preg-ex-page">
      <article className="preg-ex-ai-plan">
        <h2>AI Exercise Plan</h2>
        <p>Week {currentWeek || 20} recommendations:</p>
        <ul>
          {aiExercisePlan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      {safetyAlerts.length ? (
        <article className="preg-ex-safety-alert">
          <h3>⚠ AI Safety Alert</h3>
          {safetyAlerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </article>
      ) : null}

      <article className="workout-tracker-card">
        <PregnancyVideoSection
          category="exercise"
          week={currentWeek || 20}
          title="🎥 Recommended Pregnancy Exercise Videos"
        />
      </article>

      <div className="preg-ex-info">
        <span>🛡 Important:</span> Always consult with your healthcare provider before starting any
        exercise program. Stop immediately if you experience pain, dizziness, or unusual symptoms.
      </div>

      <div className="preg-ex-trimester-tabs">
        <button className={trimester === "first" ? "active" : ""} onClick={() => setTrimester("first")}>
          1st Trimester
        </button>
        <button className={trimester === "second" ? "active" : ""} onClick={() => setTrimester("second")}>
          2nd Trimester
        </button>
        <button className={trimester === "third" ? "active" : ""} onClick={() => setTrimester("third")}>
          3rd Trimester
        </button>
      </div>

      <div className="preg-ex-grid">
        {trimesterExercises.map((item) => (
          <article className="preg-ex-card" key={item.name}>
            <div className="preg-ex-icon">{item.emoji}</div>
            <div>
              <h3>{item.name}</h3>
              <small>{item.duration}</small>
              <p>{item.benefits || item.desc}</p>
              <div className="exercise-actions">
                <button type="button" onClick={() => setVideoExercise(item)}>
                  Watch Exercise Video
                </button>
                <label className="exercise-check">
                  <input
                    type="checkbox"
                    checked={Boolean(completedMap[item.name])}
                    onChange={() => handleToggleComplete(item.name)}
                  />
                  Completed
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="workout-tracker-card">
        <h2>Workout Tracker</h2>
        <div className="workout-checklist">
          {trimesterExercises.slice(0, 3).map((item) => (
            <label key={`track-${item.name}`}>
              <input
                type="checkbox"
                checked={Boolean(completedMap[item.name])}
                onChange={() => handleToggleComplete(item.name)}
              />
              <span>{item.name}</span>
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              checked={Boolean(completedMap["Breathing Exercise"])}
              onChange={() => handleToggleComplete("Breathing Exercise")}
            />
            <span>Breathing Exercise</span>
          </label>
        </div>
        <div className="workout-progress">
          <strong>
            {weeklyProgress} / 7 days completed
          </strong>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(weeklyProgress / 7) * 100}%` }} />
          </div>
        </div>
      </section>

      <section className="preg-ex-breath">
        <h2>⇆ Breathing Exercises for Labor</h2>
        <div className="breath-timer">
          <div className={`breath-circle ${breathPhase.toLowerCase()}`}>
            <strong>{breathPhase}</strong>
            <span>{breathSeconds}s</span>
          </div>
          <div className="breath-controls">
            <p>Inhale 4s • Hold 2s • Exhale 6s</p>
            <div>
              <button type="button" onClick={() => setBreathRunning(true)}>
                Start
              </button>
              <button
                type="button"
                onClick={() => {
                  setBreathRunning(false);
                  setBreathPhase("Inhale");
                  setBreathSeconds(4);
                }}
              >
                Stop
              </button>
            </div>
          </div>
        </div>
        <div className="preg-ex-breath-grid">
          {breathingTechniques.map((item) => (
            <article className="breath-card" key={item.title}>
              <h4>{item.title}</h4>
              <ol>
                {item.steps.map((step, idx) => (
                  <li key={`${item.title}-${step}`}>
                    <span>{idx + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="preg-ex-tips">
        <h2>💞 Exercise Tips for Pregnancy</h2>
        <ul>
          {exerciseTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      {videoExercise?.videoUrl ? (
        <div className="exercise-video-modal">
          <div className="exercise-video-dialog">
            <div className="video-modal-head">
              <h3>{videoExercise.name} Video</h3>
              <button type="button" onClick={() => setVideoExercise(null)}>
                ✕
              </button>
            </div>
            <div className="video-frame-wrap">
              <iframe
                src={videoExercise.videoUrl}
                title={videoExercise.name}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {currentVideoWatchUrl ? (
              <div className="exercise-video-fallback">
                <a href={currentVideoWatchUrl} target="_blank" rel="noopener noreferrer">
                  ▶ Open on YouTube
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
