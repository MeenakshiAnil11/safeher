import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useTelehealth } from "../../context/TelehealthContext";
import AppointmentCard from "../../components/telehealth/AppointmentCard";
import { requestVideoSession } from "../../services/sessionService";
import "./Appointments.css";

export default function Appointments() {
  const navigate = useNavigate();
  const { setAppointmentForConsultation, addNotification } = useTelehealth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab === "upcoming") {
        // Get confirmed and pending appointments that are in the future
        params.append("status", "upcoming");
      } else if (activeTab === "past") {
        // Get completed appointments
        params.append("status", "ended");
      } else if (activeTab === "cancelled") {
        // Get cancelled appointments
        params.append("status", "cancelled");
      }
      
      let fetchedAppointments = [];
      
      // Fetch from backend API
      try {
        const response = await api.get(`/telehealth/appointments?${params}`);
        fetchedAppointments = response.data.appointments || [];
      } catch (apiError) {
        console.error("Error fetching appointments from API:", apiError);
        // Continue with empty array, will merge with localStorage appointments
      }
      
      // Also get mock appointments from localStorage
      try {
        const mockAppointments = JSON.parse(localStorage.getItem("mockAppointments") || "[]");
        
        // Filter mock appointments based on active tab
        const filteredMockAppointments = mockAppointments.filter((apt) => {
          if (activeTab === "upcoming") {
            const scheduledDate = new Date(apt.scheduledAt);
            const now = new Date();
            return scheduledDate > now && ["confirmed", "pending", "scheduled", "waiting", "ongoing", "active"].includes(apt.status);
          } else if (activeTab === "past") {
            return ["completed", "ended"].includes(apt.status);
          } else if (activeTab === "cancelled") {
            return apt.status === "cancelled";
          }
          return false;
        });
        
        // Merge with fetched appointments (avoid duplicates)
        const existingIds = new Set(fetchedAppointments.map(apt => apt._id));
        const uniqueMockAppointments = filteredMockAppointments.filter(apt => !existingIds.has(apt._id));
        fetchedAppointments = [...fetchedAppointments, ...uniqueMockAppointments];
      } catch (storageError) {
        console.error("Error reading mock appointments from localStorage:", storageError);
      }
      
      // Sort by scheduled date (newest first for past, oldest first for upcoming)
      fetchedAppointments.sort((a, b) => {
        const dateA = new Date(a.scheduledAt);
        const dateB = new Date(b.scheduledAt);
        return activeTab === "past" ? dateB - dateA : dateA - dateB;
      });
      
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    const reason = window.prompt("Reason for cancellation:");
    if (!reason) return;
    try {
      await api.put(`/telehealth/appointments/${id}/cancel`, { reason });
      fetchAppointments();
      
      // Add notification
      addNotification({
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: "Your appointment has been successfully cancelled.",
      });
      
      alert("Appointment cancelled successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleJoinCall = async (appointment) => {
    try {
      // Set the appointment in context for the consultation page
      setAppointmentForConsultation(appointment);

      const isVideoConsultation = appointment.consultationType === "video";
      const approvalStatus = appointment?.videoSession?.approvalStatus || "none";

      if (!isVideoConsultation) {
        navigate(`/telehealth/consultation/${appointment._id}`);
        return;
      }

      if (approvalStatus === "requested" || approvalStatus === "approved") {
        navigate(`/telehealth/consultation/${appointment._id}`);
        return;
      }

      await requestVideoSession(appointment._id);
      alert("Video consultation request sent. Waiting for doctor approval.");
      navigate(`/telehealth/consultation/${appointment._id}`);
    } catch (error) {
      alert(error.message || "Unable to start video consultation request.");
    }
  };

  const canJoinCall = (appointment) => {
    if (!["confirmed", "scheduled", "waiting", "ongoing", "active"].includes(appointment.status)) return false;
    const now = new Date();
    const scheduledDate = new Date(appointment.scheduledAt);
    // Allow joining 15 minutes before scheduled time
    const joinTime = new Date(scheduledDate.getTime() - 15 * 60 * 1000);
    return now >= joinTime;
  };

  const getJoinButtonLabel = (appointment) => {
    if (appointment.status === "pending") return "Waiting Doctor Approval";
    if (appointment.consultationType !== "video") return "Join Now";
    const approvalStatus = appointment?.videoSession?.approvalStatus || "none";
    if (approvalStatus === "approved") return "Join Video Session";
    if (approvalStatus === "requested") return "Waiting Approval";
    if (approvalStatus === "declined") return "Request Video Again";
    return "Start Video Session";
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>Manage your healthcare appointments.</p>
      </div>

      {/* Tabs */}
      <div className="appointments-tabs">
        <button
          className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`tab-button ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past
        </button>
        <button
          className={`tab-button ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="loading-state">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <p>No {activeTab} appointments found</p>
          {activeTab === "upcoming" && (
            <button
              className="btn-primary"
              onClick={() => navigate("/telehealth/doctors")}
            >
              Book Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((apt) => {
            const normalizedShowActions = activeTab === "upcoming" && ["confirmed", "pending", "scheduled", "waiting", "ongoing", "active"].includes(apt.status);
            const canJoinNow = ["confirmed", "scheduled", "waiting", "ongoing", "active"].includes(apt.status);

            return (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                showActions={normalizedShowActions}
                onJoin={normalizedShowActions && canJoinNow ? handleJoinCall : null}
                onReschedule={normalizedShowActions ? handleReschedule : null}
                onCancel={normalizedShowActions ? handleCancel : null}
                joinButtonLabel={getJoinButtonLabel(apt)}
              />
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}

function RescheduleModal({ appointment, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment.scheduledAt) {
      const date = new Date(appointment.scheduledAt);
      setFormData({
        date: date.toISOString().split("T")[0],
        time: date.toTimeString().slice(0, 5),
      });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);
      await api.put(`/telehealth/appointments/${appointment._id}/reschedule`, {
        scheduledAt: scheduledAt.toISOString(),
      });
      alert("Appointment rescheduled successfully!");
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Reschedule Appointment</h3>
        <p className="modal-subtitle">
          Reschedule your appointment with Doctor
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="form-group">
            <label>New Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Rescheduling..." : "Confirm Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
