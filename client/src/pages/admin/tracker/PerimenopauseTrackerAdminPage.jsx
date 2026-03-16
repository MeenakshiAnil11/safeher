import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerCrudSection from "./TrackerCrudSection";
import "./TrackerAdmin.css";

export default function PerimenopauseTrackerAdminPage() {
  return (
    <AdminLayout pageTitle="Perimenopause Mode Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <section className="tracker-admin-header">
          <h2>Perimenopause Mode Admin</h2>
          <p>Manage perimenopause resources, AI templates, simulation settings, and moderation controls.</p>
        </section>

        <div className="tracker-crud-grid">
          <TrackerCrudSection title="Symptom Library" storageKey="admin_peri_symptom_library" moduleKey="perimenopause" sectionKey="symptom-library" />
          <TrackerCrudSection title="Lifestyle Tips" storageKey="admin_peri_lifestyle_tips" moduleKey="perimenopause" sectionKey="lifestyle-tips" />
          <TrackerCrudSection title="AI Health Insights Templates" storageKey="admin_peri_ai_templates" moduleKey="perimenopause" sectionKey="ai-health-insights-templates" />
          <TrackerCrudSection title="Hormone Simulation Parameters" storageKey="admin_peri_hormone_parameters" moduleKey="perimenopause" sectionKey="hormone-simulation-parameters" />
          <TrackerCrudSection title="Community Moderation Tools" storageKey="admin_peri_community_moderation" moduleKey="perimenopause" sectionKey="community-moderation-tools" />
        </div>
      </div>
    </AdminLayout>
  );
}
