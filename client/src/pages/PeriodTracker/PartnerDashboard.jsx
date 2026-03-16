import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { babyDevelopment } from "../../data/babyDevelopment";
import { partnerSupportTips } from "../../data/partnerSupportTips";
import { weeklyPartnerTips } from "../../data/weeklyPartnerTips";
import { partnerResources } from "../../data/partnerResources";
import { babyBondingActivities } from "../../data/babyBondingActivities";
import { partnerWeeklyMissions } from "../../data/partnerWeeklyMissions";
import { getPartnerAIAdvice } from "../../services/partnerAIEngine";
import PartnerAIAssistant from "../../components/PartnerAIAssistant";
import "./PartnerDashboard.css";

const SUPPORT_AREAS = [
  {
    icon: "💞",
    title: "Emotional Support",
    desc: "Listen without judgment, validate her feelings, and offer reassurance.",
    points: ["Active listening", "Regular check-ins", "Words of encouragement"],
  },
  {
    icon: "🤝",
    title: "Physical Support",
    desc: "Help with physical tasks and provide comfort during discomfort.",
    points: ["Foot massages", "Help with chores", "Prepare meals"],
  },
  {
    icon: "📚",
    title: "Educational Support",
    desc: "Learn about pregnancy, labor, and parenting together.",
    points: ["Attend classes", "Read books", "Watch videos"],
  },
  {
    icon: "🛠",
    title: "Practical Support",
    desc: "Help prepare for the baby's arrival and manage daily tasks.",
    points: ["Set up nursery", "Handle finances", "Plan logistics"],
  },
];

const FALLBACK_APPTS = [
  {
    title: "Prenatal Checkup",
    doctor: "Dr. Emily Johnson",
    date: "2026-03-15T10:00:00.000Z",
    location: "Women Wellness Clinic",
    note: "Consider attending together",
    tone: "pink",
    telehealthLink: "",
  },
  {
    title: "Ultrasound Scan",
    doctor: "Women's Health Center",
    date: "2026-03-22T14:30:00.000Z",
    location: "Women's Health Center",
    note: "Great opportunity to see baby!",
    tone: "teal",
    telehealthLink: "https://meet.google.com/",
  },
];

const getTrimester = (week) => {
  if (week <= 12) return "First";
  if (week <= 27) return "Second";
  return "Third";
};

const nearestByWeek = (collection, week, fallback) => {
  const safeWeek = Number(week) || 20;
  const candidates = Object.keys(collection)
    .map((key) => Number(key))
    .filter((num) => !Number.isNaN(num))
    .sort((a, b) => Math.abs(a - safeWeek) - Math.abs(b - safeWeek));
  if (!candidates.length) return fallback;
  return collection[candidates[0]] || fallback;
};

const parseDateTime = (item = {}) => {
  const raw = item?.time || item?.date;
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatDateTime = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return { date: "--", time: "--" };
  return {
    date: parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
};

export default function PartnerDashboard({ currentWeek: currentWeekProp, dueDate: dueDateProp }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(Number(currentWeekProp) || 24);
  const [dueDate, setDueDate] = useState(dueDateProp || "2026-06-15");
  const [appointments, setAppointments] = useState(FALLBACK_APPTS);
  const [healthData, setHealthData] = useState({});
  const [completedMissions, setCompletedMissions] = useState([]);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [weekRes, apptRes, logsRes] = await Promise.allSettled([
          api.get("/pregnancy/current-week"),
          api.get("/pregnancy/appointments"),
          api.get("/pregnancy/logs?limit=1"),
        ]);

        const weekFromApi =
          weekRes.status === "fulfilled" ? Number(weekRes.value.data?.currentWeek) : null;
        const dueDateFromApi =
          weekRes.status === "fulfilled" ? weekRes.value.data?.dueDate : null;

        setCurrentWeek(Number(currentWeekProp) || weekFromApi || 24);
        setDueDate(dueDateProp || dueDateFromApi || "2026-06-15");

        const apiAppointments =
          apptRes.status === "fulfilled" && Array.isArray(apptRes.value.data?.appointments)
            ? apptRes.value.data.appointments
            : FALLBACK_APPTS;
        setAppointments(apiAppointments.length ? apiAppointments : FALLBACK_APPTS);

        const latestLog =
          logsRes.status === "fulfilled" && Array.isArray(logsRes.value.data?.logs)
            ? logsRes.value.data.logs[0]
            : {};
        setHealthData(latestLog || {});
      } catch (error) {
        console.error("Failed loading partner dashboard context:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentWeekProp, dueDateProp]);

  const daysUntilDue = useMemo(() => {
    return Math.max(0, 280 - (Number(currentWeek) * 7));
  }, [currentWeek]);

  const trimester = useMemo(() => getTrimester(Number(currentWeek) || 20), [currentWeek]);

  const trimesterKey = useMemo(() => trimester.toLowerCase(), [trimester]);

  const supportAreas = useMemo(() => {
    const dynamicPoints = partnerSupportTips[trimesterKey] || partnerSupportTips.second;
    return SUPPORT_AREAS.map((area, index) => ({
      ...area,
      points: [
        ...area.points.slice(0, 2),
        dynamicPoints[index % dynamicPoints.length],
      ],
    }));
  }, [trimesterKey]);

  const partnerTips = useMemo(
    () =>
      weeklyPartnerTips[currentWeek] ||
      partnerSupportTips[trimesterKey] ||
      partnerSupportTips.second,
    [currentWeek, trimesterKey]
  );

  const weekMissions = useMemo(
    () => partnerWeeklyMissions[currentWeek] || partnerWeeklyMissions[20] || [],
    [currentWeek]
  );

  const missionStorageKey = useMemo(
    () => `partnerMissionsWeek${currentWeek}`,
    [currentWeek]
  );

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(missionStorageKey) || "[]");
    setCompletedMissions(Array.isArray(saved) ? saved : []);
  }, [missionStorageKey]);

  const babyInfo = useMemo(
    () =>
      babyDevelopment[currentWeek] ||
      nearestByWeek(
        babyDevelopment,
        currentWeek,
        { size: "About 9 inches long", fact: "Baby development is progressing each week." }
      ),
    [currentWeek]
  );

  const bondingInfo = useMemo(
    () =>
      babyBondingActivities[currentWeek] ||
      nearestByWeek(
        babyBondingActivities,
        currentWeek,
        {
          activity: "Talk gently to your baby for a few minutes daily.",
          description: "Consistent voices can support early family bonding.",
        }
      ),
    [currentWeek]
  );

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter((item) => {
        const parsed = parseDateTime(item);
        return parsed ? parsed.getTime() > now : true;
      })
      .sort((a, b) => {
        const da = parseDateTime(a)?.getTime() || Number.MAX_SAFE_INTEGER;
        const db = parseDateTime(b)?.getTime() || Number.MAX_SAFE_INTEGER;
        return da - db;
      });
  }, [appointments]);

  const tomorrowAppointments = useMemo(() => {
    const now = Date.now();
    return upcomingAppointments.filter((item) => {
      const parsed = parseDateTime(item);
      if (!parsed) return false;
      const diff = parsed.getTime() - now;
      return diff > 0 && diff < 86400000;
    });
  }, [upcomingAppointments]);

  const aiAdvice = useMemo(
    () => getPartnerAIAdvice(currentWeek, healthData),
    [currentWeek, healthData]
  );

  const completedMissionCount = useMemo(
    () => weekMissions.filter((mission) => completedMissions.includes(mission.id)).length,
    [weekMissions, completedMissions]
  );

  const missionProgress = useMemo(() => {
    if (!weekMissions.length) return 0;
    return Math.round((completedMissionCount / weekMissions.length) * 100);
  }, [completedMissionCount, weekMissions.length]);

  const toggleMission = (missionId) => {
    setCompletedMissions((prev) => {
      const next = prev.includes(missionId)
        ? prev.filter((id) => id !== missionId)
        : [...prev, missionId];
      localStorage.setItem(missionStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const openResource = (resource) => {
    navigate(resource.link);
  };

  return (
    <section className="partner-page">
      <article className="partner-gradient-summary">
        <div className="partner-ai-header-actions">
          <button
            type="button"
            className="partner-ai-launch-btn"
            onClick={() => setAiAssistantOpen(true)}
          >
            🤖 Ask AI Assistant
          </button>
        </div>
        <div>
          <small>Current Week</small>
          <h2>Week {currentWeek}</h2>
        </div>
        <div>
          <small>Trimester</small>
          <h2>{trimester}</h2>
        </div>
        <div>
          <small>Days Until Due Date</small>
          <h2>{daysUntilDue} days</h2>
        </div>
        <footer>
          <span>◷ Baby Size This Week:</span>
          <strong>{babyInfo.size}</strong>
        </footer>
      </article>

      <section className="partner-section-card">
        <h3>♡ How to Support Your Partner</h3>
        <div className="support-grid">
          {supportAreas.map((item) => (
            <article key={item.title} className="support-item">
              <h4>
                <span>{item.icon}</span>
                {item.title}
              </h4>
              <p>{item.desc}</p>
              <ul>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-section-card">
        <h3>💡 Partner Tips for This Week</h3>
        <span className="week-pill">Week {currentWeek}</span>
        <ol className="tips-list">
          {partnerTips.map((tip, idx) => (
            <li key={tip}>
              <span>{idx + 1}</span>
              <p>{tip}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="partner-section-card missions-card">
        <h3>✅ Partner Weekly Missions</h3>
        <span className="week-pill">Week {currentWeek}</span>

        <div className="mission-checklist">
          {weekMissions.map((mission) => (
            <label key={`${currentWeek}-${mission.id}`} className="mission-item">
              <input
                type="checkbox"
                checked={completedMissions.includes(mission.id)}
                onChange={() => toggleMission(mission.id)}
              />
              <span>{mission.task}</span>
            </label>
          ))}
        </div>

        <div className="mission-progress">
          <strong>Mission Progress</strong>
          <p>
            {completedMissionCount} / {weekMissions.length || 0} completed
          </p>
          <div className="mission-progress-track">
            <div className="mission-progress-fill" style={{ width: `${missionProgress}%` }} />
          </div>
        </div>

        {weekMissions.length > 0 && completedMissionCount === weekMissions.length ? (
          <div className="mission-success">
            Great job! You're doing amazing supporting your partner this week.
          </div>
        ) : null}
      </section>

      <section className="partner-section-card">
        <h3>🗓 Upcoming Appointments</h3>
        {tomorrowAppointments.length ? (
          <div className="appointment-reminder">
            <strong>Reminder:</strong> {tomorrowAppointments[0].title} appointment tomorrow.
          </div>
        ) : null}
        <div className="upcoming-list">
          {upcomingAppointments.map((item) => (
            <article key={`${item._id || item.id || item.title}`} className={`upcoming-item ${item.tone || "pink"}`}>
              <strong>{item.title}</strong>
              <p>{item.doctor}</p>
              <small>
                {formatDateTime(item.time || item.date).date} • {formatDateTime(item.time || item.date).time}
              </small>
              <small>{item.location || "Location TBD"}</small>
              <em>💡 {item.note}</em>
              <div className="appointment-actions">
                <button type="button">Attend Together</button>
                {item.telehealthLink ? (
                  <button type="button" onClick={() => window.open(item.telehealthLink, "_blank")}>
                    Join Telehealth
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-section-card">
        <h3>🤖 AI Partner Suggestions</h3>
        <ul className="ai-advice-list">
          {aiAdvice.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="baby-week-card">
        <h3>🌀 What Baby is Doing This Week</h3>
        <p>{babyInfo.fact}</p>
        <div className="try-box">
          <strong>Try This:</strong>
          <p>{bondingInfo.activity}</p>
          <small>{bondingInfo.description}</small>
        </div>
      </section>

      <section className="partner-section-card resources">
        <h3>Partner Resources</h3>
        <div className="resource-grid">
          {partnerResources.map((item) => (
            <article
              key={item.title}
              className="resource-item clickable"
              onClick={() => openResource(item)}
              role="button"
              tabIndex={0}
            >
              <span>{item.icon}</span>
              <strong>{item.title}</strong>
            </article>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="partner-loading-overlay">
          <div className="loader" />
          <span>Loading partner dashboard...</span>
        </div>
      ) : null}

      <PartnerAIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        pregnancyWeek={currentWeek}
        healthData={healthData}
      />
    </section>
  );
}
