import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerCrudSection from "./TrackerCrudSection";
import "./TrackerAdmin.css";

export default function ConceiveTrackerAdminPage() {
  return (
    <AdminLayout pageTitle="Conceive Mode Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <section className="tracker-admin-header">
          <h2>Conceive Mode Admin</h2>
          <p>Manage fertility-focused resources, recommendation templates, and algorithm parameters.</p>
        </section>

        <div className="tracker-crud-grid">
          <TrackerCrudSection title="Fertility Tips" storageKey="admin_conceive_fertility_tips" moduleKey="conceive" sectionKey="fertility-tips" />
          <TrackerCrudSection title="Fertility Symptom Library" storageKey="admin_conceive_symptom_library" moduleKey="conceive" sectionKey="fertility-symptom-library" />
          <TrackerCrudSection title="Fertility Education Articles" storageKey="admin_conceive_education_articles" moduleKey="conceive" sectionKey="fertility-education-articles" />
          <TrackerCrudSection title="Fertility AI Recommendation Templates" storageKey="admin_conceive_ai_templates" moduleKey="conceive" sectionKey="fertility-ai-templates" />
          <TrackerCrudSection title="Fertility Window Algorithm Parameters" storageKey="admin_conceive_algorithm_parameters" moduleKey="conceive" sectionKey="fertility-window-parameters" />
        </div>
      </div>
    </AdminLayout>
  );
}
