import React from "react";
import { FaUser } from "react-icons/fa";
import DoctorCard from "./DoctorCard";

export default function DirectoryGrid({ doctors, loading, onBookAppointment }) {
  if (loading) {
    return <div className="loading-state">Loading doctors...</div>;
  }

  if (doctors.length === 0) {
    return (
      <div className="empty-state">
        <FaUser className="empty-icon" />
        <p>No doctors found</p>
        <p className="empty-subtitle">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="doctors-grid">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor._id}
          doctor={doctor}
          onBookAppointment={onBookAppointment}
        />
      ))}
    </div>
  );
}
