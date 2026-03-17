import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerModeAdminTabs from "./TrackerModeAdminTabs";
import "./TrackerAdmin.css";

export default function ConceiveTrackerAdminPage() {
  const governanceSections = [
    { title: "Fertility Tips", storageKey: "admin_conceive_fertility_tips", sectionKey: "fertility-tips" },
    { title: "Fertility Symptom Library", storageKey: "admin_conceive_symptom_library", sectionKey: "fertility-symptom-library" },
    { title: "Fertility Education Articles", storageKey: "admin_conceive_education_articles", sectionKey: "fertility-education-articles" },
    { title: "Fertility AI Recommendation Templates", storageKey: "admin_conceive_ai_templates", sectionKey: "fertility-ai-templates" },
    { title: "Fertility Window Algorithm Parameters", storageKey: "admin_conceive_algorithm_parameters", sectionKey: "fertility-window-parameters" },
  ];

  return (
    <AdminLayout pageTitle="Conceive Mode Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <TrackerModeAdminTabs
          moduleKey="conceive"
          moduleTitle="Conceive Mode Admin"
          moduleDescription="Manage conceive-mode governance, fertility data monitoring, alerts, reminders, and analytics."
          governanceSections={governanceSections}
        />
      </div>
    </AdminLayout>
  );
}
