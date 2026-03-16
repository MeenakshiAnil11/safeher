import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerCrudSection from "./TrackerCrudSection";
import "./TrackerAdmin.css";

export default function PregnancyTrackerAdminPage() {
  return (
    <AdminLayout pageTitle="Pregnancy Mode Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <section className="tracker-admin-header">
          <h2>Pregnancy Mode Admin</h2>
          <p>Manage week-based pregnancy content and assign resources to specific weeks.</p>
        </section>

        <div className="tracker-crud-grid">
          <TrackerCrudSection
            title="Weekly Pregnancy Development Content"
            storageKey="admin_pregnancy_weekly_development"
            moduleKey="pregnancy"
            sectionKey="weekly-pregnancy-development-content"
            withWeekAssignment
            weekLabel="Week Assignment"
          />
          <TrackerCrudSection
            title="Pregnancy Nutrition Videos"
            storageKey="admin_pregnancy_nutrition_videos"
            moduleKey="pregnancy"
            sectionKey="pregnancy-nutrition-videos"
            withWeekAssignment
            weekLabel="Week Assignment"
          />
          <TrackerCrudSection
            title="Pregnancy Exercise Videos"
            storageKey="admin_pregnancy_exercise_videos"
            moduleKey="pregnancy"
            sectionKey="pregnancy-exercise-videos"
            withWeekAssignment
            weekLabel="Week Assignment"
          />
          <TrackerCrudSection
            title="Emotional Support Resources"
            storageKey="admin_pregnancy_emotional_resources"
            moduleKey="pregnancy"
            sectionKey="emotional-support-resources"
            withWeekAssignment
            weekLabel="Week Assignment"
          />
          <TrackerCrudSection
            title="Partner Support Resources"
            storageKey="admin_pregnancy_partner_resources"
            moduleKey="pregnancy"
            sectionKey="partner-support-resources"
            withWeekAssignment
            weekLabel="Week Assignment"
          />
          <TrackerCrudSection
            title="Baby Development Dataset"
            storageKey="admin_pregnancy_baby_development_dataset"
            moduleKey="pregnancy"
            sectionKey="baby-development-dataset"
            withWeekAssignment
            weekLabel="Week Assignment"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
