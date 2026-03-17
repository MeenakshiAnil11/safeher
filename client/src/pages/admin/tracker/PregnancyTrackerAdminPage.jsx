import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/AdminLayout";
import TrackerModeAdminTabs from "./TrackerModeAdminTabs";
import "./TrackerAdmin.css";

export default function PregnancyTrackerAdminPage() {
  const governanceSections = [
    {
      title: "Weekly Pregnancy Development Content",
      storageKey: "admin_pregnancy_weekly_development",
      sectionKey: "weekly-pregnancy-development-content",
      withWeekAssignment: true,
      weekLabel: "Week Assignment",
    },
    {
      title: "Pregnancy Nutrition Videos",
      storageKey: "admin_pregnancy_nutrition_videos",
      sectionKey: "pregnancy-nutrition-videos",
      withWeekAssignment: true,
      weekLabel: "Week Assignment",
    },
    {
      title: "Pregnancy Exercise Videos",
      storageKey: "admin_pregnancy_exercise_videos",
      sectionKey: "pregnancy-exercise-videos",
      withWeekAssignment: true,
      weekLabel: "Week Assignment",
    },
    {
      title: "Emotional Support Resources",
      storageKey: "admin_pregnancy_emotional_resources",
      sectionKey: "emotional-support-resources",
      withWeekAssignment: true,
      weekLabel: "Week Assignment",
    },
    {
      title: "Partner Support Resources",
      storageKey: "admin_pregnancy_partner_resources",
      sectionKey: "partner-support-resources",
      withWeekAssignment: true,
      weekLabel: "Week Assignment",
    },
    {
      title: "Baby Development Dataset",
      storageKey: "admin_pregnancy_baby_development_dataset",
      sectionKey: "baby-development-dataset",
      withWeekAssignment: true,
      weekLabel: "Week Assignment",
    },
  ];

  return (
    <AdminLayout pageTitle="Pregnancy Mode Admin">
      <div className="tracker-admin-page">
        <Link to="/admin/tracker" className="tracker-back-link">← Back to Tracker Management</Link>
        <TrackerModeAdminTabs
          moduleKey="pregnancy"
          moduleTitle="Pregnancy Mode Admin"
          moduleDescription="Manage pregnancy weekly content, health-risk workflows, reminder policies, moderation, and analytics."
          governanceSections={governanceSections}
        />
      </div>
    </AdminLayout>
  );
}
