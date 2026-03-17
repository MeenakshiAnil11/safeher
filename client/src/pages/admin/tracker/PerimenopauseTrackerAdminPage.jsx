import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerModeAdminTabs from "./TrackerModeAdminTabs";
import "./TrackerAdmin.css";

export default function PerimenopauseTrackerAdminPage() {
  const governanceSections = [
    { title: "Symptom Library", storageKey: "admin_peri_symptom_library", sectionKey: "symptom-library" },
    { title: "Lifestyle Tips", storageKey: "admin_peri_lifestyle_tips", sectionKey: "lifestyle-tips" },
    { title: "AI Health Insights Templates", storageKey: "admin_peri_ai_templates", sectionKey: "ai-health-insights-templates" },
    { title: "Hormone Simulation Parameters", storageKey: "admin_peri_hormone_parameters", sectionKey: "hormone-simulation-parameters" },
    { title: "Community Moderation Tools", storageKey: "admin_peri_community_moderation", sectionKey: "community-moderation-tools" },
  ];

  return (
    <AdminLayout pageTitle="Perimenopause Mode Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <TrackerModeAdminTabs
          moduleKey="perimenopause"
          moduleTitle="Perimenopause Mode Admin"
          moduleDescription="Manage perimenopause surveillance, resources, reminders, moderation, and reports."
          governanceSections={governanceSections}
        />
      </div>
    </AdminLayout>
  );
}
