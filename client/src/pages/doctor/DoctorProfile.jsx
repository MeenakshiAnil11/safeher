import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaClock,
  FaCalendarAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaImage,
  FaCamera,
} from "react-icons/fa";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import WeeklyAvailability from "../../components/doctor/WeeklyAvailability";
import "./DoctorProfile.css";

const EMPTY_DOCTOR_PROFILE = {
  fullName: "",
  name: "",
  email: "",
  phone: "",
  specialization: "",
  institution: "",
  qualifications: "",
  languages: [],
  bio: "",
  experience: "",
  license: "",
  licenseNumber: "",
  videoConsultationFee: "",
  chatConsultationFee: "",
  followUpFee: "",
  photo: null,
  verificationStatus: "pending",
  profileCompleted: false,
};

const DEFAULT_WEEKLY_AVAILABILITY = [
  { day: "Monday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Tuesday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Wednesday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Thursday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Friday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Saturday", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00" },
];

const normalizeAvailabilityData = (rawAvailability) => {
  if (!rawAvailability) return DEFAULT_WEEKLY_AVAILABILITY;

  if (Array.isArray(rawAvailability)) {
    const normalized = rawAvailability
      .map((item) => ({
        day: item.day,
        enabled: item.enabled !== undefined ? Boolean(item.enabled) : true,
        startTime: item.startTime || "09:00",
        endTime: item.endTime || "17:00",
      }))
      .filter((item) => item.day);
    return normalized.length > 0 ? normalized : DEFAULT_WEEKLY_AVAILABILITY;
  }

  if (Array.isArray(rawAvailability.timeSlots)) {
    const slotMap = new Map(
      rawAvailability.timeSlots.map((slot) => [
        slot.day,
        {
          day: slot.day,
          enabled: true,
          startTime: slot.startTime || "09:00",
          endTime: slot.endTime || "17:00",
        },
      ])
    );
    return DEFAULT_WEEKLY_AVAILABILITY.map((dayRow) => slotMap.get(dayRow.day) || dayRow);
  }

  return DEFAULT_WEEKLY_AVAILABILITY;
};

export default function DoctorProfile({ doctor: doctorProp }) {
  const formatQualifications = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const normalizeItem = (item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const degree = item.degree || item.name || item.label || "";
      if (!degree) return "";
      const institution = item.institution ? ` - ${item.institution}` : "";
      const year = item.year ? ` (${item.year})` : "";
      return `${degree}${institution}${year}`;
    };
    if (Array.isArray(value)) {
      const formatted = value.map(normalizeItem).filter(Boolean).join(", ");
      return formatted || "";
    }
    if (typeof value === "object") {
      return normalizeItem(value) || "";
    }
    return "";
  };

  const normalizeLanguages = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item;
          if (!item || typeof item !== "object") return "";
          return item.name || item.label || item.degree || "";
        })
        .filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((lang) => lang.trim())
        .filter(Boolean);
    }
    return [];
  };
  const [doctor, setDoctor] = useState(EMPTY_DOCTOR_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [availability, setAvailability] = useState(DEFAULT_WEEKLY_AVAILABILITY);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchDoctorAppointments();
  }, []);

  useEffect(() => {
    if (!doctorProp) return;
    const isProfileCompleted = Boolean(doctorProp.profileCompleted);
    setDoctor((prev) => ({
      ...prev,
      ...EMPTY_DOCTOR_PROFILE,
      ...doctorProp,
      fullName: doctorProp.fullName || doctorProp.name || "",
      name: doctorProp.name || doctorProp.fullName || "",
      email: isProfileCompleted ? (doctorProp.email || "") : "",
      phone: isProfileCompleted ? (doctorProp.phone || "") : "",
      specialization: isProfileCompleted ? (doctorProp.specialization || "") : "",
      institution: isProfileCompleted ? (doctorProp.institution || "") : "",
      experience: isProfileCompleted
        ? (typeof doctorProp.experience === "number"
            ? doctorProp.experience
            : Number(doctorProp.experience) || "")
        : "",
      languages: isProfileCompleted ? normalizeLanguages(doctorProp.languages) : [],
      license: isProfileCompleted ? (doctorProp.license || doctorProp.licenseNumber || "") : "",
      licenseNumber: isProfileCompleted ? (doctorProp.licenseNumber || doctorProp.license || "") : "",
      bio: isProfileCompleted ? (doctorProp.bio || "") : "",
      videoConsultationFee: isProfileCompleted
        ? (doctorProp.videoConsultationFee ?? "")
        : "",
      chatConsultationFee: isProfileCompleted
        ? (doctorProp.chatConsultationFee ?? "")
        : "",
      followUpFee: isProfileCompleted
        ? (doctorProp.followUpFee ?? "")
        : "",
      profileCompleted: isProfileCompleted,
    }));
  }, [doctorProp]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const doctorEmail = currentUser?.email ? encodeURIComponent(currentUser.email) : "";
      const profileUrl = doctorEmail ? `/doctor-profile?email=${doctorEmail}` : "/doctor-profile";
      const response = await api.get(profileUrl);
      const doctorData = response?.data?.doctor || response?.data || {};
      const isProfileCompleted = Boolean(doctorData.profileCompleted);
      const institutionFromQualification = Array.isArray(doctorData.qualifications)
        ? doctorData.qualifications.find((item) => item?.institution)?.institution
        : "";
      const normalizedDoctor = {
        ...EMPTY_DOCTOR_PROFILE,
        ...doctorData,
        fullName: doctorData.fullName || doctorData.name || doctorData.user?.name || "",
        name: doctorData.name || doctorData.user?.name || "",
        email: isProfileCompleted ? (doctorData.email || doctorData.user?.email || "") : "",
        phone: isProfileCompleted ? (doctorData.phone || doctorData.user?.phone || "") : "",
        specialization: isProfileCompleted ? (doctorData.specialization || "") : "",
        experience: isProfileCompleted
          ? (typeof doctorData.experience === "number"
              ? doctorData.experience
              : Number(doctorData.experience) || "")
          : "",
        institution: isProfileCompleted ? (doctorData.institution || institutionFromQualification || "") : "",
        qualifications: isProfileCompleted ? formatQualifications(doctorData.qualifications) : "",
        languages: isProfileCompleted ? normalizeLanguages(doctorData.languages) : [],
        license: isProfileCompleted ? (doctorData.license || doctorData.licenseNumber || "") : "",
        licenseNumber: isProfileCompleted ? (doctorData.licenseNumber || doctorData.license || "") : "",
        bio: isProfileCompleted ? (doctorData.bio || "") : "",
        videoConsultationFee: isProfileCompleted ? (doctorData.videoConsultationFee ?? "") : "",
        chatConsultationFee: isProfileCompleted ? (doctorData.chatConsultationFee ?? "") : "",
        followUpFee: isProfileCompleted ? (doctorData.followUpFee ?? "") : "",
        photo: doctorData.photo || doctorData.user?.profilePicture || null,
        profileCompleted: isProfileCompleted,
      };
      setDoctor(normalizedDoctor);

      // Fetch availability
      const availResponse = await api.get("/telehealth/doctors/availability").catch(() => ({
        data: { availability: { timeSlots: [] } },
      }));
      if (availResponse.data.availability) {
        setAvailability(normalizeAvailabilityData(availResponse.data.availability));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setDoctor(EMPTY_DOCTOR_PROFILE);
      setProfileError(error?.response?.data?.message || "Doctor profile not loaded.");
      toast.error("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "fullName") {
      setDoctor((prev) => ({ ...prev, fullName: value, name: value }));
      return;
    }
    // Handle number inputs
    if (name === "experience" || name === "videoConsultationFee" || name === "chatConsultationFee" || name === "followUpFee") {
      setDoctor((prev) => ({ ...prev, [name]: value === "" ? "" : parseInt(value, 10) }));
    } else {
      setDoctor((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctor((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvailability = async (updatedAvailability = availability) => {
    try {
      setSaving(true);
      setSaveMessage("");
      const timeSlots = (updatedAvailability || [])
        .filter((dayRow) => dayRow.enabled)
        .map((dayRow) => ({
          day: dayRow.day,
          startTime: dayRow.startTime || "09:00",
          endTime: dayRow.endTime || "17:00",
        }));

      await api.put("/telehealth/doctors/availability", { timeSlots });

      if (isEditing) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        await api.put("/doctor-profile", {
          ...doctor,
          name: doctor.fullName || doctor.name || "",
          email: doctor.email || currentUser?.email || "",
          licenseNumber: doctor.license || doctor.licenseNumber || "",
          profileCompleted: true,
        });
        setDoctor((prev) => ({ ...prev, profileCompleted: true }));
        setIsEditing(false);
      }

      setAvailability(normalizeAvailabilityData(updatedAvailability));
      setSaveMessage(isEditing ? "Profile and availability updated successfully." : "Availability updated successfully.");
      toast.success(isEditing ? "Profile saved successfully." : "Availability saved successfully.");
    } catch (error) {
      console.error("Error saving availability:", error);
      const backendMessage = error?.response?.data?.message;
      const fallbackMessage = isEditing ? "Failed to save changes." : "Failed to save availability.";
      setProfileError(backendMessage || fallbackMessage);
      toast.error(backendMessage || (isEditing ? "Failed to save profile." : "Failed to save availability."));
    } finally {
      setSaving(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const response = await api.get("/telehealth/appointments?limit=5&view=doctor");
      const appointments = Array.isArray(response?.data?.appointments)
        ? response.data.appointments
        : [];
      setDoctorAppointments(appointments);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      setDoctorAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const formatAppointmentDateTime = (isoString) => {
    if (!isoString) return "Date not available";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="doctor-profile-loading">
        <div className="doctor-profile-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  const initial = (doctor.fullName || doctor.name)
    ? (doctor.fullName || doctor.name).charAt(0).toUpperCase()
    : "D";
  return (
    <div className="doctor-profile">
      {/* Profile Header Section */}
      <div className="profile-header-section">
        <div className="profile-header-photo">
          <div className="profile-photo-large">
            {doctor.photo ? (
              <img src={doctor.photo} alt="Doctor" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <label className="photo-upload-overlay">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <div className="profile-header-info">
          <div className="profile-name-row">
            <h2>Doctor</h2>
            {doctor.verificationStatus === "approved" && (
              <div className="verification-badge-large">
                <FaCheckCircle className="check-icon" />
                <span>Approved</span>
              </div>
            )}
          </div>
          <p className="profile-specialization-text">{doctor.specialization}</p>
          <p className="profile-qualifications-text">{formatQualifications(doctor.qualifications)}</p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="basic-info-section relative">
        <div className="section-header-with-edit">
          <h3 className="section-title">Basic Information</h3>
        </div>
        {!isEditing && (
          <button
            type="button"
            aria-label="Edit basic information"
            className="absolute top-2 right-2 text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit className="inline mr-1" />
            Edit
          </button>
        )}
        {profileError ? (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {profileError || "Doctor profile not loaded."}
          </p>
        ) : null}
        {saveMessage ? (
          <p className="text-sm text-emerald-700 mb-3" role="status" aria-live="polite">
            {saveMessage}
          </p>
        ) : null}
        <div className="basic-info-grid grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-fullName">Full Name</label>
            <input
              id="doctor-fullName"
              type="text"
              name="fullName"
              value={doctor.fullName || doctor.name || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-email">Email</label>
            <input
              id="doctor-email"
              type="email"
              name="email"
              value={doctor.email || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-phone">Phone</label>
            <input
              id="doctor-phone"
              type="tel"
              name="phone"
              value={doctor.phone || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-specialization">Specialization</label>
            <input
              id="doctor-specialization"
              type="text"
              name="specialization"
              value={doctor.specialization || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-institution">Institution</label>
            <input
              id="doctor-institution"
              type="text"
              name="institution"
              value={doctor.institution || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-languages">Languages</label>
            <input
              id="doctor-languages"
              type="text"
              name="languages"
              value={normalizeLanguages(doctor.languages).join(", ")}
              onChange={(e) => {
                const languagesArray = e.target.value.split(",").map(lang => lang.trim()).filter(lang => lang);
                setDoctor((prev) => ({ ...prev, languages: languagesArray }));
              }}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-experience">Experience</label>
            <input
              id="doctor-experience"
              type="number"
              name="experience"
              value={doctor.experience ?? ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
          <div className="info-field flex flex-col space-y-2">
            <label htmlFor="doctor-license">License</label>
            <input
              id="doctor-license"
              type="text"
              name="license"
              value={doctor.license || ""}
              onChange={(e) => {
                const value = e.target.value;
                setDoctor((prev) => ({ ...prev, license: value, licenseNumber: value }));
              }}
              readOnly={!isEditing}
              className={`form-input w-full ${!isEditing ? "readonly" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Professional Bio Section */}
      <div className="bio-section">
        <h3 className="section-title">Professional Bio</h3>
        <textarea
          name="bio"
          value={doctor.bio || ""}
          onChange={handleInputChange}
          readOnly={!isEditing}
          className={`bio-textarea ${!isEditing ? "readonly" : ""}`}
          rows="4"
        />
      </div>

      {/* Consultation Fee Settings Section */}
      <div className="fee-settings-section">
        <h3 className="section-title">Consultation Fee Settings</h3>
        <div className="fee-fields-grid">
          <div className="fee-field">
            <label>Video Consultation Fee (USD)</label>
            <input
              type="number"
              name="videoConsultationFee"
              value={doctor.videoConsultationFee ?? ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input ${!isEditing ? "readonly" : ""}`}
              min="0"
            />
          </div>
          <div className="fee-field">
            <label>Chat Consultation Fee (USD)</label>
            <input
              type="number"
              name="chatConsultationFee"
              value={doctor.chatConsultationFee ?? ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input ${!isEditing ? "readonly" : ""}`}
              min="0"
            />
          </div>
          <div className="fee-field">
            <label>Follow-up Fee (USD)</label>
            <input
              type="number"
              name="followUpFee"
              value={doctor.followUpFee ?? ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`form-input ${!isEditing ? "readonly" : ""}`}
              min="0"
            />
          </div>
        </div>
      </div>

      <WeeklyAvailability
        availability={availability}
        onChange={setAvailability}
        onSave={handleSaveAvailability}
        saving={saving}
        showCancel={isEditing}
        onCancel={() => {
          setIsEditing(false);
          fetchProfile();
        }}
      />

      {/* Recent Appointments Section */}
      <div className="doctor-profile-appointments-card">
        <h3 className="section-title">
          <FaCalendarAlt /> Recent Appointments
        </h3>
        {appointmentsLoading ? (
          <p className="appointments-empty-text">Loading appointments...</p>
        ) : doctorAppointments.length === 0 ? (
          <p className="appointments-empty-text">
            No appointments yet. New bookings will appear here.
          </p>
        ) : (
          <div className="doctor-profile-appointments-list">
            {doctorAppointments.map((appointment) => {
              const patientName =
                appointment?.user?.name ||
                appointment?.patient?.user?.name ||
                "Patient";
              const status = appointment?.status || "pending";
              return (
                <div key={appointment._id} className="doctor-profile-appointment-item">
                  <div>
                    <p className="appointment-patient-name">{patientName}</p>
                    <p className="appointment-date-time">
                      {formatAppointmentDateTime(appointment?.scheduledAt)}
                    </p>
                  </div>
                  <span className={`appointment-status-chip status-${status}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
