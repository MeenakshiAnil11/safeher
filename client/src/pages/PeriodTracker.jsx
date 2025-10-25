// client/src/pages/PeriodTracker.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
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

// Styles
import "./PeriodTracker/periodTracker.css";

export default function PeriodTracker() {
  const [activeTab, setActiveTab] = useState("calendar");

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
          <Link to="/dashboard" className="pt-dashboard-link">Back to Dashboard</Link>
        </aside>

        {/* Main Content */}
        <main className="pt-main">
          {activeTab === "cycle" && <CycleOverview />}
          {activeTab === "calendar" && (
            <div className="calendar-container">
              <h3>Your Cycle Calendar</h3>
              <CalendarView />
            </div>
          )}
          {activeTab === "log" && (
            <div className="pt-card">
              <h3>Log Your Cycle</h3>
              <LogCycle />
            </div>
          )}
          {activeTab === "history" && (
            <div className="pt-card">
              <h3>Cycle History</h3>
              <CycleHistory />
            </div>
          )}
          {activeTab === "insights" && (
            <div className="pt-card">
              <h3>Insights</h3>
              <HealthInsights />
            </div>
          )}
          {activeTab === "exercises" && (
            <div className="pt-card">
              <h3>Exercise Recommendations</h3>
              <ExerciseRecommendations />
            </div>
          )}
          {activeTab === "reminders" && (
            <div className="pt-card">
              <h3>Reminders & Notifications</h3>
              <Reminders />
            </div>
          )}
          {activeTab === "education" && (
            <div className="pt-card">
              <h3>Educational Content</h3>
              <EducationalContent />
            </div>
          )}
          {activeTab === "community" && (
            <div className="pt-card">
              <h3>Community Support</h3>
              <CommunitySupport />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
