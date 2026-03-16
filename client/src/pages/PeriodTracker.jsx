// client/src/pages/PeriodTracker.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";

// Subcomponents
import CalendarView from "./PeriodTracker/CalendarView";
import LogCycle from "./PeriodTracker/LogCycle";
import CycleHistory from "./PeriodTracker/CycleHistory";
import HealthInsights from "./PeriodTracker/HealthInsights";
import Reminders from "./PeriodTracker/Reminders";
import EducationalContent from "./PeriodTracker/EducationalContent";
import CommunitySupport from "./PeriodTracker/CommunitySupport";
import ExerciseRecommendations from "./PeriodTracker/ExerciseRecommendations";
import CycleOverview from "./PeriodTracker/CycleOverview";
import CycleExerciseRecommendationsCard from "./PeriodTracker/CycleExerciseRecommendationsCard";
import PeriodAIDoctorChatbot from "../components/PeriodAIDoctorChatbot";

// Styles
import "./PeriodTracker/periodTracker.css";

export default function PeriodTracker() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "calendar");

  const tabs = [
    { key: "cycle", label: "🔁 Cycle" },
    { key: "calendar", label: "📅 Calendar" },
    { key: "log", label: "📝 Log Cycle" },
    { key: "history", label: "📖 History" },
    { key: "insights", label: "📊 Insights" },
    { key: "exercises", label: "🏃‍♀️ Exercises" },
    { key: "reminders", label: "🔔 Reminders" },
    { key: "education", label: "📚 Education" },
    { key: "community", label: "🤝 Community" },
  ];

  const workflow = ["log", "insights", "exercises", "reminders", "history"];

  const sectionMeta = {
    cycle: {
      title: "Cycle Overview",
      subtitle: "Track your current phase, cycle stats, and personalized highlights.",
    },
    calendar: {
      title: "Cycle Calendar",
      subtitle: "See period, fertile, and ovulation highlights in one timeline.",
    },
    log: {
      title: "Log Cycle",
      subtitle: "Capture flow, symptoms, and wellness signals with validation guidance.",
    },
    history: {
      title: "Cycle History",
      subtitle: "Review trends, exports, and progression over recent cycles.",
    },
    insights: {
      title: "Insights Analysis",
      subtitle: "Dynamic analysis of cycle regularity, symptoms, and lifestyle factors.",
    },
    exercises: {
      title: "Exercise Recommendations",
      subtitle: "Phase-specific workouts, videos, and AI-powered fitness guidance.",
    },
    reminders: {
      title: "Reminders",
      subtitle: "Smart scheduling for period, ovulation, and exercise consistency.",
    },
    education: {
      title: "Education",
      subtitle: "Expert articles, FAQs, and trusted menstrual-health resources.",
    },
    community: {
      title: "Community",
      subtitle: "Moderated discussions and peer support in a safe space.",
    },
  };

  const currentMeta = sectionMeta[activeTab] || sectionMeta.calendar;

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="pt-wrapper page-with-header">
      {/* Header */}
      <UserHeader />

      {/* Main container (Sidebar + Content) */}
      <div className="period-tracker-container">
        {/* Sidebar */}
        <aside className="pt-sidebar">
          <h2>🌸 Period Tracker</h2>
          <nav className="pt-nav">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? "active" : ""}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          
          {/* Back Button */}
          <div className="pt-back-to-dashboard">
            <Link to="/period-tracking" className="pt-back-link">
              ← Back to Mode Selection
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pt-main">
          <section className="pt-section pt-section-header">
            <h3>{currentMeta.title}</h3>
            <p>{currentMeta.subtitle}</p>
            <div className="pt-workflow-nav">
              {workflow.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={activeTab === step ? "active" : ""}
                  onClick={() => setActiveTab(step)}
                >
                  {tabs.find((t) => t.key === step)?.label || step}
                </button>
              ))}
            </div>
          </section>

          {activeTab === "cycle" && (
            <section className="pt-section">
              <CycleOverview />
              <CycleExerciseRecommendationsCard />
            </section>
          )}
          {activeTab === "calendar" && (
            <section className="pt-section calendar-container">
              <CalendarView />
            </section>
          )}
          {activeTab === "log" && (
            <section className="pt-section">
              <LogCycle />
            </section>
          )}
          {activeTab === "history" && (
            <section className="pt-section">
              <CycleHistory />
            </section>
          )}
          {activeTab === "insights" && (
            <section className="pt-section">
              <HealthInsights />
            </section>
          )}
          {activeTab === "exercises" && (
            <section className="pt-section">
              <ExerciseRecommendations />
            </section>
          )}
          {activeTab === "reminders" && (
            <section className="pt-section">
              <Reminders />
            </section>
          )}
          {activeTab === "education" && (
            <section className="pt-section">
              <EducationalContent />
            </section>
          )}
          {activeTab === "community" && (
            <section className="pt-section">
              <CommunitySupport />
            </section>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
      <PeriodAIDoctorChatbot />
    </div>
  );
}
