import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaVideo,
  FaPhone,
  FaComment,
  FaDownload,
  FaStar,
  FaUserMd,
  FaClock,
  FaFileAlt,
} from "react-icons/fa";
import api from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import "./AppointmentHistory.css";

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "timeline"

  useEffect(() => {
    fetchAppointmentHistory();
  }, []);

  const fetchAppointmentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/consultations/history");
      const consultations = response.data.consultations || [];
      const appointments = consultations.map((item) => ({
        _id: item.appointmentId?._id || item.appointmentId || item.consultationId || item._id,
        consultationId: item.consultationId || item._id,
        scheduledAt: item.appointmentId?.scheduledAt || item.startTime || item.createdAt,
        consultationType: item.consultationType || item.appointmentId?.consultationType || "video",
        doctor: item.doctorId,
        doctorNotes: item.notes || "",
        prescription: item.appointmentId?.prescription || null,
        payment: item.appointmentId?.payment || null,
      }));
      // Sort by date, most recent first
      appointments.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
      setAppointments(appointments);
    } catch (error) {
      console.error("Error fetching appointment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSummary = async (appointmentId) => {
    try {
      const response = await api.get(`/telehealth/appointments/${appointmentId}/summary`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `appointment-summary-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download summary. Generating...");
      // Fallback: Generate summary on client side or show message
    }
  };

  const handleRateDoctor = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRatingModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConsultationTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Video Call";
      case "audio":
        return "Audio Call";
      case "chat":
        return "Chat";
      default:
        return type;
    }
  };

  const getConsultationIcon = (type) => {
    switch (type) {
      case "video":
        return <FaVideo />;
      case "audio":
        return <FaPhone />;
      case "chat":
        return <FaComment />;
      default:
        return <FaVideo />;
    }
  };

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

  return (
    <div className="appointment-history-page">
      <div className="page-header">
        <div>
          <h2>Consultation History</h2>
          <p>View your completed consultations, prescriptions, and invoices</p>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            List View
          </button>
          <button
            className={`toggle-btn ${viewMode === "timeline" ? "active" : ""}`}
            onClick={() => setViewMode("timeline")}
          >
            Timeline View
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading appointment history...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <p>No appointment history</p>
          <p className="empty-subtitle">
            Your completed appointments will appear here
          </p>
        </div>
      ) : (
        <div className={`history-container ${viewMode}`}>
          {appointments.map((appointment, index) => {
            const photo = getDoctorPhoto(appointment.doctor);
            const initials = getDoctorInitials(appointment.doctor);

            return (
              <div key={appointment._id} className="history-card">
                {viewMode === "timeline" && (
                  <div className="timeline-marker">
                    <div className="timeline-line"></div>
                    <div className="timeline-dot"></div>
                  </div>
                )}

                <div className="history-card-content">
                  {/* Doctor Info */}
                  <div className="history-doctor-info">
                    <div className="doctor-photo-container">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Doctor"
                          className="doctor-photo"
                        />
                      ) : (
                        <div className="doctor-avatar">{initials}</div>
                      )}
                    </div>
                    <div className="doctor-details">
                      <h3 className="doctor-name">
                        {appointment.doctor?.user?.name || "Doctor"}
                      </h3>
                      <p className="specialization">
                        {appointment.doctor?.specialization || "General Physician"}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="history-details">
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{formatDate(appointment.scheduledAt)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Time</span>
                        <span className="detail-value">
                          {new Date(appointment.scheduledAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="detail-item">
                      {getConsultationIcon(appointment.consultationType)}
                      <div className="detail-content">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">
                          {getConsultationTypeLabel(appointment.consultationType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {appointment.doctorNotes && (
                    <div className="notes-section">
                      <h4 className="notes-title">
                        <FaFileAlt className="notes-icon" />
                        Doctor Notes
                      </h4>
                      <p className="notes-text">{appointment.doctorNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="history-actions">
                    <button className="btn-download" onClick={() => handleDownloadSummary(appointment._id)}>
                      <FaDownload /> Download Summary
                    </button>
                    {appointment?.prescription?._id && (
                      <button
                        className="btn-download"
                        onClick={() => window.open(`/telehealth/prescriptions`, "_self")}
                      >
                        Prescription Link
                      </button>
                    )}
                    {appointment?.payment?._id && (
                      <button
                        className="btn-download"
                        onClick={() => window.open(`/telehealth/payments`, "_self")}
                      >
                        Invoice Link
                      </button>
                    )}
                    <button
                      className="btn-rate"
                      onClick={() => handleRateDoctor(appointment)}
                    >
                      <FaStar /> Rate Doctor
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedAppointment && (
        <RatingModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowRatingModal(false);
            setSelectedAppointment(null);
            fetchAppointmentHistory();
          }}
        />
      )}
    </div>
  );
}

function RatingModal({ appointment, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    try {
      setLoading(true);
      await api.post(`/telehealth/appointments/${appointment._id}/rate`, {
        rating,
        feedback,
      });
      alert("Thank you for your feedback!");
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={`star ${star <= (hoveredRating || rating) ? "filled" : "empty"}`}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => setRating(star)}
      />
    ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Rate Your Experience</h3>
        <p className="modal-subtitle">
          How was your consultation with {appointment.doctor?.user?.name || "Doctor"}?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label className="rating-label">Your Rating</label>
            <div className="stars-container">{renderStars()}</div>
            {rating > 0 && (
              <p className="rating-text">
                {rating === 5 && "Excellent"}
                {rating === 4 && "Very Good"}
                {rating === 3 && "Good"}
                {rating === 2 && "Fair"}
                {rating === 1 && "Poor"}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Your Feedback (Optional)</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
              className="feedback-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading || rating === 0}>
              {loading ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
