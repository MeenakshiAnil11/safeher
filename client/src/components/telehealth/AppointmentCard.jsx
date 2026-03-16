import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaVideo, FaComment, FaHome, FaSpinner } from "react-icons/fa";
import { getImageUrl } from "../../utils/imageUtils";
import { startSession, validateSessionJoin } from "../../services/sessionService";
import "./AppointmentCard.css";

export default function AppointmentCard({
  appointment,
  onJoin,
  onReschedule,
  onCancel,
  showJoinButton = false,
  showActions = true,
  joinButtonLabel = "Join Now",
}) {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const getDoctorPhoto = (doctor) => {
    if (doctor?.user?.profilePicture) {
      return getImageUrl(doctor.user.profilePicture);
    }
    return null;
  };

  const getDoctorInitials = (doctor) => {
    const name = doctor?.user?.name || "Doctor";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "DR";
  };

  const getConsultationIcon = (type) => {
    switch (type) {
      case "video":
        return <FaVideo />;
      case "chat":
        return <FaComment />;
      case "in-person":
        return <FaHome />;
      default:
        return <FaVideo />;
    }
  };

  const getConsultationTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Video";
      case "chat":
        return "Chat";
      case "in-person":
        return "In-Person";
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const photo = getDoctorPhoto(appointment.doctor);
  const initials = getDoctorInitials(appointment.doctor);
  const doctorName = appointment.doctor?.user?.name || "Doctor";
  const specialization = appointment.doctor?.specialization || "General Physician";

  const handleJoinNow = async () => {
    // Pre-session validation
    const validation = validateSessionJoin(appointment);
    if (!validation.canJoin) {
      setJoinError(validation.errors[0]);
      setTimeout(() => setJoinError(null), 5000);
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      // Start session via API
      const response = await startSession(appointment._id);
      
      // Navigate to consultation interface based on type
      if (appointment.consultationType === "video") {
        navigate(`/telehealth/consultation/${appointment._id}`);
      } else if (appointment.consultationType === "chat") {
        navigate(`/telehealth/consultation/${appointment._id}`);
      } else {
        // For other types, navigate to consultation page
        navigate(`/telehealth/consultation/${appointment._id}`);
      }

      // Call custom onJoin handler if provided
      if (onJoin) {
        onJoin(appointment);
      }
    } catch (error) {
      console.error("Error joining session:", error);
      setJoinError(error.message || "Failed to join session. Please try again.");
      setIsJoining(false);
    }
  };

  return (
    <div className="appointment-card">
      {/* Left Section: Doctor Avatar */}
      <div className="appointment-avatar-section">
        {photo ? (
          <img
            src={photo}
            alt={doctorName}
            className="appointment-doctor-photo"
          />
        ) : (
          <div className="appointment-doctor-avatar">{initials}</div>
        )}
      </div>

      {/* Middle Section: Doctor Info & Appointment Details */}
      <div className="appointment-details-section">
        <div className="appointment-doctor-info">
          <h3 className="appointment-doctor-name">{doctorName}</h3>
          <p className="appointment-specialization">{specialization}</p>
        </div>

        <div className="appointment-info-items">
          <div className="appointment-info-item">
            <FaCalendarAlt className="appointment-info-icon" />
            <span className="appointment-info-text">{formatDate(appointment.scheduledAt)}</span>
          </div>
          <div className="appointment-info-item">
            <FaClock className="appointment-info-icon" />
            <span className="appointment-info-text">{formatTime(appointment.scheduledAt)}</span>
          </div>
          <div className="appointment-info-item">
            {getConsultationIcon(appointment.consultationType)}
            <span className="appointment-info-text">
              {getConsultationTypeLabel(appointment.consultationType)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Action Buttons */}
      {showActions && (
        <div className="appointment-actions-section">
          {onJoin && (
            <>
              <button
                className="btn-appointment-join"
                onClick={handleJoinNow}
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Connecting...
                  </>
                ) : (
                  joinButtonLabel
                )}
              </button>
              {joinError && (
                <div className="join-error-message">{joinError}</div>
              )}
            </>
          )}
          {onReschedule && (
            <button
              className="btn-appointment-reschedule"
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              className="btn-appointment-cancel"
              onClick={() => onCancel(appointment._id)}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
