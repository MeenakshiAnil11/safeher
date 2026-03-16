import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerCrudSection from "./TrackerCrudSection";
import "./TrackerAdmin.css";

export default function PeriodTrackerAdminPage() {
  return (
    <AdminLayout pageTitle="Period Tracking Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <section className="tracker-admin-header">
          <h2>Period Tracking Admin</h2>
          <p>Manage core cycle tracking content, education, and AI templates.</p>
        </section>

        <div className="tracker-crud-grid">
          <TrackerCrudSection title="Symptom Library" storageKey="admin_period_symptom_library" moduleKey="period" sectionKey="symptom-library" />
          <TrackerCrudSection title="Cycle Education Articles" storageKey="admin_period_cycle_articles" moduleKey="period" sectionKey="cycle-education-articles" />
          <TrackerCrudSection title="Period Health Tips" storageKey="admin_period_health_tips" moduleKey="period" sectionKey="period-health-tips" />
          <TrackerCrudSection title="AI Insight Templates" storageKey="admin_period_ai_templates" moduleKey="period" sectionKey="ai-insight-templates" />
          <TrackerCrudSection title="Cycle Prediction Settings" storageKey="admin_period_prediction_settings" moduleKey="period" sectionKey="cycle-prediction-settings" />
        </div>
      </div>
    </AdminLayout>
  );
}
