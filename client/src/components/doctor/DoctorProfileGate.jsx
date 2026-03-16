import React from "react";
import { Link } from "react-router-dom";

export default function DoctorProfileGate({
  doctorName = "Doctor",
  sectionTitle = "this section",
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">
        Welcome, Dr. {doctorName}!
      </h2>
      <p className="text-slate-600">
        {description || `Complete your profile to unlock ${sectionTitle}.`}
      </p>
      <Link
        to="/doctor/profile"
        className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Complete Profile
      </Link>
    </div>
  );
}
