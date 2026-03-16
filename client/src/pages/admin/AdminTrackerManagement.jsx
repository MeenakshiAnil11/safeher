import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import "./tracker/TrackerAdmin.css";

const trackerModes = [
  {
    title: "Period Tracking",
    description: "Manage cycle content, symptom library, tips and AI templates.",
    path: "/admin/tracker/period",
  },
  {
    title: "Conceive Mode",
    description: "Manage fertility guidance, symptom data and algorithm settings.",
    path: "/admin/tracker/conceive",
  },
  {
    title: "Pregnancy Mode",
    description: "Manage week-wise development, media resources and partner content.",
    path: "/admin/tracker/pregnancy",
  },
  {
    title: "Perimenopause Mode",
    description: "Manage symptoms, AI insights, hormone parameters and moderation tools.",
    path: "/admin/tracker/perimenopause",
  },
];

export default function AdminTrackerManagement() {
  return (
    <AdminLayout pageTitle="Tracker Management">
      <div className="tracker-admin-page">
        <section className="tracker-admin-header">
          <h2>Tracker Management</h2>
          <p>Select a tracker mode to manage its content, templates, and algorithm settings.</p>
        </section>

        <section className="tracker-hub-grid">
          {trackerModes.map((mode) => (
            <Link key={mode.title} to={mode.path} className="tracker-hub-card">
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
