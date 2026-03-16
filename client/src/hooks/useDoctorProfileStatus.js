import { useEffect, useState } from "react";
import api from "../services/api";

export default function useDoctorProfileStatus() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const loadProfileStatus = async () => {
      try {
        setProfileLoading(true);
        const response = await api.get("/doctor-profile");
        const doctor = response?.data?.doctor || response?.data || {};
        const resolvedName = doctor.fullName || doctor.name || doctor.user?.name || "Doctor";
        setDoctorName(resolvedName);
        setDoctorProfile(doctor);
        setProfileCompleted(Boolean(doctor.profileCompleted));
      } catch (error) {
        setProfileCompleted(false);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfileStatus();
  }, []);

  return { profileLoading, profileCompleted, doctorName, doctorProfile };
}
