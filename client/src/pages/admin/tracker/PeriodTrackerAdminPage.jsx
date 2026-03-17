import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerModeAdminTabs from "./TrackerModeAdminTabs";
import "./TrackerAdmin.css";

export default function PeriodTrackerAdminPage() {
  const governanceSections = [
    { title: "Symptom Library", storageKey: "admin_period_symptom_library", sectionKey: "symptom-library" },
    { title: "Cycle Education Articles", storageKey: "admin_period_cycle_articles", sectionKey: "cycle-education-articles" },
    { title: "Period Health Tips", storageKey: "admin_period_health_tips", sectionKey: "period-health-tips" },
    { title: "AI Insight Templates", storageKey: "admin_period_ai_templates", sectionKey: "ai-insight-templates" },
    { title: "Cycle Prediction Settings", storageKey: "admin_period_prediction_settings", sectionKey: "cycle-prediction-settings" },
  ];

  return (
    <AdminLayout pageTitle="Period Tracking Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <TrackerModeAdminTabs
          moduleKey="period"
          moduleTitle="Period Tracking Admin"
          moduleDescription="Manage period content governance, user-log quality, risk alerts, reminder templates, and analytics."
          governanceSections={governanceSections}
        />
      </div>
    </AdminLayout>
  );
}
