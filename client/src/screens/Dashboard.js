import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import { getUser } from "../services/auth";
import api from "../services/api";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [lastSOS, setLastSOS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate("/login");
    } else {
      setUser(u);
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const vitalsRes = await api.get("/health/vitals");
      setVitals(vitalsRes.data.items?.length ? vitalsRes.data.items[0] : null);

      const periodsRes = await api.get("/periods/history");
      setPeriods(periodsRes.data.cycles || []);

      const sosRes = await api.get("/sos");
      const sortedSOS = sosRes.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLastSOS(sortedSOS.length ? sortedSOS[0] : null);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getNextPeriodInfo = () => {
    if (!periods.length) {
      return { nextPeriodDate: null, daysUntilNext: null };
    }
    const lastPeriod = periods[0];
    const avgCycleLength = 28;
    const lastStartDate = new Date(lastPeriod.startDate);
    const nextPeriodDate = new Date(lastStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

    const today = new Date();
    const diffTime = nextPeriodDate - today;
    const daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { nextPeriodDate, daysUntilNext };
  };

  const { nextPeriodDate, daysUntilNext } = getNextPeriodInfo();

  const formatLastSOS = () => {
    if (!lastSOS) return "No alerts yet";
    const date = new Date(lastSOS.createdAt);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleSOS = async () => {
    const confirmed = await new Promise((resolve) => {
      let seconds = 3;
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.inset = "0";
      modal.style.background = "rgba(0,0,0,0.5)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = 9999;

      const box = document.createElement("div");
      box.style.background = "#fff";
      box.style.padding = "24px";
      box.style.borderRadius = "18px";
      box.style.width = "min(420px, 92%)";
      box.style.textAlign = "center";
      box.style.boxShadow = "0 18px 34px rgba(15,23,42,0.12)";

      const title = document.createElement("h3");
      title.textContent = "Are you sure?";
      title.style.color = "#ef4444";
      title.style.marginBottom = "8px";
      const p = document.createElement("p");
      p.textContent = `SOS will be sent in ${seconds}s...`;
      p.style.margin = "0";

      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "12px";
      btnRow.style.justifyContent = "center";
      btnRow.style.marginTop = "18px";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn ghost";
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = () => {
        cleanup();
        resolve(false);
      };

      const sendBtn = document.createElement("button");
      sendBtn.className = "btn primary";
      sendBtn.textContent = "Send Now";
      sendBtn.onclick = () => {
        cleanup();
        resolve(true);
      };

      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(sendBtn);
      box.appendChild(title);
      box.appendChild(p);
      box.appendChild(btnRow);
      modal.appendChild(box);
      document.body.appendChild(modal);

      const timer = setInterval(() => {
        seconds -= 1;
        p.textContent = `SOS will be sent in ${seconds}s...`;
        if (seconds <= 0) {
          clearInterval(timer);
          cleanup();
          resolve(true);
        }
      }, 1000);

      function cleanup() {
        clearInterval(timer);
        modal.remove();
      }
    });

    if (!confirmed) return;

    const getPosition = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

    const coords = await getPosition();

    try {
      await api.post("/sos", {
        lat: coords?.lat,
        lng: coords?.lng,
        message: "SOS triggered from dashboard",
      });
      alert("✅ SOS Sent! Help is on the way.");
      fetchDashboardData();
    } catch (e) {
      console.error(e);
      alert("❌ Failed to send SOS. Please try again or call a helpline.");
    }
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  const friendlyName = user.name?.split(" ")[0] || "Explorer";
  const nextPeriodLabel = () => {
    if (daysUntilNext === null) return "Log your cycle";
    if (daysUntilNext <= 0) return "Due now";
    if (daysUntilNext === 1) return "In 1 day";
    return `In ${daysUntilNext} days`;
  };

  const nextPeriodDateText = nextPeriodDate
    ? nextPeriodDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Keep tracking to refine predictions";

  const metrics = [
    {
      key: "cycle",
      title: "Next Period",
      value: nextPeriodLabel(),
      note: nextPeriodDate ? `Expected ${nextPeriodDateText}` : nextPeriodDateText,
      accent: "pink",
      icon: "🌸",
    },
    {
      key: "sos",
      title: "Last SOS Alert",
      value: formatLastSOS(),
      note: lastSOS ? "Tap SOS if you need help" : "No alerts sent yet",
      accent: "purple",
      icon: "🆘",
    },
    {
      key: "heart",
      title: "Heart Rate",
      value: vitals?.heartRateBpm ? `${vitals.heartRateBpm} bpm` : "Track now",
      note: "Resting goal 60-100 bpm",
      accent: "orange",
      icon: "❤️",
    },
    {
      key: "bp",
      title: "Blood Pressure",
      value: vitals ? `${vitals.systolic}/${vitals.diastolic}` : "Add vitals",
      note: "Keep it near 120/80",
      accent: "teal",
      icon: "🩺",
    },
    {
      key: "bmi",
      title: "BMI",
      value: vitals?.bmi ?? "Add vitals",
      note: "Updated from your latest entry",
      accent: "blue",
      icon: "⚖️",
    },
    {
      key: "weight",
      title: "Weight",
      value: vitals?.weightKg ? `${vitals.weightKg} kg` : "Log weight",
      note: "Track trends weekly",
      accent: "green",
      icon: "🏋️",
    },
  ];

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container page-with-header">
      <UserHeader onSidebarToggle={handleSidebarToggle} />
      <div className="dashboard-body">
        <UserSidebar className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`} />
        <main className="dashboard-main">
          <section className="dashboard-hero soft-surface">
            <div className="hero-text">
              <span className="hero-badge">{getGreeting()}, {friendlyName}</span>
              <h1>
                Your wellbeing summary <span>🌱</span>
              </h1>
              <p>
                Stay on top of your cycle, health vitals, and emergency readiness
                with a calm, soft interface crafted just for you.
              </p>
              <div className="hero-meta">
                <div className="meta-pill">Next period: {nextPeriodLabel()}</div>
                <div className="meta-pill">Last SOS: {formatLastSOS()}</div>
              </div>
            </div>
            <div className="hero-actions">
              <button className="sos-button" onClick={handleSOS}>
                <span className="sos-icon">🚨</span>
                <span className="sos-label">Send SOS Alert</span>
              </button>
              <p className="sos-hint">We will notify your trusted contacts instantly.</p>
            </div>
          </section>

          <section className="metrics-section">
            <div className="section-heading">
              <div>
                <h2>Health Snapshot</h2>
                <p>Key indicators from your latest entries.</p>
              </div>
              <button className="section-cta" onClick={() => navigate("/health")}>Update vitals</button>
            </div>
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <article key={metric.key} className={`metric soft-tile ${metric.accent}`}>
                  <div className="metric-icon" aria-hidden="true">
                    {metric.icon}
                  </div>
                  <div className="metric-content">
                    <h4>{metric.title}</h4>
                    <p>{metric.value}</p>
                    <span className="metric-note">{metric.note}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="quick-actions-section">
            <div className="section-heading">
              <div>
                <h2>Continue your journey</h2>
                <p>Shortcuts to keep caring for your mind and body.</p>
              </div>
            </div>
            <div className="quick-actions">
              <Link to="/health" className="action-card soft-surface green">
                <span className="icon">💗</span>
                <h3>Health Vitals</h3>
                <p>Log your daily health metrics</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/period-tracker" className="action-card soft-surface purple">
                <span className="icon">📅</span>
                <h3>Period Tracker</h3>
                <p>Track your cycle and symptoms</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/my-contacts" className="action-card soft-surface red">
                <span className="icon">🛡️</span>
                <h3>My Emergency Contacts</h3>
                <p>Manage trusted contacts</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/resources" className="action-card soft-surface blue">
                <span className="icon">📚</span>
                <h3>Resource Hub</h3>
                <p>Browse health &amp; safety resources</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/helplines" className="action-card soft-surface orange">
                <span className="icon">📞</span>
                <h3>Helplines</h3>
                <p>Quick access to emergency support</p>
                <span className="action-arrow">→</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
