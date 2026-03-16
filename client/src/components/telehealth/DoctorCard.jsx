import React from "react";
import { FaStar, FaClock, FaMapMarkerAlt, FaVideo, FaComments, FaUser, FaCalendarCheck } from "react-icons/fa";
import { getImageUrl } from "../../utils/imageUtils";

export default function DoctorCard({ doctor, onBookAppointment }) {
  const normalizeDisplayList = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return "";
        if (item.label) return String(item.label);
        if (item.name) return String(item.name);
        if (item.degree) {
          const institution = item.institution ? ` - ${item.institution}` : "";
          const year = item.year ? ` (${item.year})` : "";
          return `${item.degree}${institution}${year}`;
        }
        return "";
      })
      .filter(Boolean);
  };
  const getDoctorPhoto = (doctor) => {
    if (doctor.user?.profilePicture) {
      return getImageUrl(doctor.user.profilePicture);
    }
    return null;
  };

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <FaVideo />;
      case "chat":
        return <FaComments />;
      case "in-person":
        return <FaUser />;
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
        return "In-person";
      default:
        return type;
    }
  };

  const photo = getDoctorPhoto(doctor);
  const maskedDoctorName = "Doctor";
  const rating = doctor.rating?.average || 0;
  const reviewCount = doctor.rating?.count || 0;
  const experience = doctor.experience || 0;
  const location = doctor.location
    ? `${doctor.location.city || ""}, ${doctor.location.state || ""}`.trim()
    : "";
  const languages = normalizeDisplayList(doctor.languages);
  const consultationTypes = ["video", "chat", "in-person"]; // Default consultation types
  const fee = doctor.consultationFee || 0;
  
  // Check availability based on timeSlots
  const hasAvailability = doctor.availability?.timeSlots?.length > 0;
  const availableToday = hasAvailability; // Simplified - can be enhanced with actual date checking

  return (
    <div className="doctor-card">
      <div className="doctor-card-content">
        <div className="doctor-photo-container">
          {photo ? (
            <img src={photo} alt={maskedDoctorName} className="doctor-photo" />
          ) : (
            <div className="doctor-avatar">DR</div>
          )}
        </div>

        <div className="doctor-info">
          <div className="doctor-header-info">
            <h3 className="doctor-name">{maskedDoctorName}</h3>
            <p className="specialization">{doctor.specialization}</p>
            <div className="doctor-meta">
              <div className="rating-group">
                <FaStar className="star-icon" />
                <span className="rating-text">
                  {rating.toFixed(1)} ({reviewCount})
                </span>
              </div>
              <div className="experience-group">
                <FaClock className="clock-icon" />
                <span className="experience-text">{experience} years</span>
              </div>
            </div>
          </div>

          {location && (
            <div className="location-group">
              <FaMapMarkerAlt className="location-icon" />
              <span className="location-text">{location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="doctor-details-section">
        {languages.length > 0 && (
          <div className="languages-section">
            <span className="section-label">Languages:</span>
            <div className="tags-container">
              {languages.map((lang, idx) => (
                <span key={idx} className="tag language-tag">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {consultationTypes.length > 0 && (
          <div className="consult-types-section">
            <span className="section-label">Consult types:</span>
            <div className="tags-container">
              {consultationTypes.map((type, idx) => (
                <span key={idx} className="tag consult-tag">
                  {getConsultationTypeIcon(type)}
                  {getConsultationTypeLabel(type)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="doctor-card-footer">
        <div className="footer-left">
          <div className="price-section">
            <span className="price-amount">₹{fee}</span>
            <span className="price-label">/ session</span>
          </div>
          {availableToday && (
            <div className="availability-section">
              <span className="availability-tag available-today">Available</span>
            </div>
          )}
        </div>
        <div className="footer-right">
          <button
            className="btn-book-now"
            onClick={() => onBookAppointment(doctor)}
          >
            <FaCalendarCheck /> Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
