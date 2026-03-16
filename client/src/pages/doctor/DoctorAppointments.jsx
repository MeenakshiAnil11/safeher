import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVideo,
  FaComments,
  FaCheckCircle,
  FaTimes,
  FaEdit,
  FaList,
  FaCalendar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DoctorProfileGate from "../../components/doctor/DoctorProfileGate";
import useDoctorProfileStatus from "../../hooks/useDoctorProfileStatus";
import { respondVideoSessionRequest } from "../../services/sessionService";
import "./DoctorAppointments.css";

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { profileLoading, profileCompleted, doctorName } = useDoctorProfileStatus();

  useEffect(() => {
    if (profileCompleted) {
      fetchAppointments();
    } else if (!profileLoading) {
      setLoading(false);
    }
  }, [profileLoading, profileCompleted]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/appointments?view=doctor");

      const appointmentsData = response.data.appointments || [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [];
    
    if (statusFilter === "all") {
      filtered = appointments;
    } else {
      filtered = appointments.filter((apt) => apt.status === statusFilter);
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    setFilteredAppointments(filtered);
  };

  const handleAccept = async (appointmentId) => {
    try {
      await api.put(`/telehealth/appointments/${appointmentId}/accept`).catch(() => {
        console.log("Appointment accepted (mock)");
      });
      fetchAppointments();
      alert("Appointment accepted successfully!");
    } catch (error) {
      console.error("Error accepting appointment:", error);
      alert("Failed to accept appointment");
    }
  };

  const handleReject = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to reject this appointment?")) return;

    try {
      await api.put(`/telehealth/appointments/${appointmentId}/reject`).catch(() => {
        console.log("Appointment rejected (mock)");
      });
      fetchAppointments();
      alert("Appointment rejected");
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert("Failed to reject appointment");
    }
  };

  const handleReschedule = (appointmentId) => {
    const newDate = prompt("Enter new date and time (YYYY-MM-DD HH:MM):");
    if (newDate) {
      const newDateTime = new Date(newDate).toISOString();
      api
        .put(`/telehealth/appointments/${appointmentId}/reschedule`, {
          scheduledAt: newDateTime,
        })
        .then(() => {
          fetchAppointments();
          alert("Appointment rescheduled successfully!");
        })
        .catch((error) => {
          console.error("Error rescheduling appointment:", error);
          alert("Failed to reschedule appointment");
        });
    }
  };

  const handleApproveVideoCall = async (appointmentId) => {
    try {
      await respondVideoSessionRequest(appointmentId, "approve");
      fetchAppointments();
      alert("Video call approved.");
    } catch (error) {
      console.error("Error approving video call:", error);
      alert(error.message || "Failed to approve video call.");
    }
  };

  const handleDeclineVideoCall = async (appointmentId) => {
    const reason = window.prompt("Reason for declining video call (optional):", "") || "";
    try {
      await respondVideoSessionRequest(appointmentId, "decline", reason);
      fetchAppointments();
      alert("Video call declined.");
    } catch (error) {
      console.error("Error declining video call:", error);
      alert(error.message || "Failed to decline video call.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const formatTime = (dateString, duration = 30) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const minutesStr = minutes.toString().padStart(2, "0");
    return `${hour12}:${minutesStr} ${period} (${duration} min)`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { label: "Confirmed", class: "status-confirmed" },
      pending: { label: "Pending", class: "status-pending" },
      completed: { label: "Completed", class: "status-completed" },
      cancelled: { label: "Cancelled", class: "status-cancelled" },
    };
    return badges[status] || { label: status, class: "status-default" };
  };

  const getConsultationIcon = (type) => {
    return type === "video" ? <FaVideo /> : <FaComments />;
  };

  const getPatientInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "P";
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledAt).toISOString().split("T")[0];
      return aptDate === dateStr;
    });
  };

  const formatTimeForCalendar = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const minutesStr = minutes.toString().padStart(2, "0");
    return `${hour12}:${minutesStr} ${period}`;
  };

  const getAppointmentColor = (status) => {
    const colors = {
      confirmed: "#3b82f6", // blue (#3b82f6)
      pending: "#eab308", // yellow (#eab308)
      completed: "#60a5fa", // light blue (#60a5fa)
      cancelled: "#ef4444", // red
    };
    return colors[status] || "#8b5cf6"; // default purple
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading || profileLoading) {
    return <div className="doctor-appointments-loading">Loading appointments...</div>;
  }

  if (!profileCompleted) {
    return (
      <DoctorProfileGate
        doctorName={doctorName}
        sectionTitle="appointments"
        description="Complete your profile to unlock Appointments."
      />
    );
  }

  return (
    <div className="doctor-appointments">
      <div className="appointments-header">
        <h1>Appointments</h1>
        <div className="view-mode-toggle">
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <FaList /> List
          </button>
          <button
            className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            <FaCalendar /> Calendar
          </button>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="status-filters">
        <button
          className={`status-filter-btn ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>
        <button
          className={`status-filter-btn ${statusFilter === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`status-filter-btn ${statusFilter === "confirmed" ? "active" : ""}`}
          onClick={() => setStatusFilter("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`status-filter-btn ${statusFilter === "completed" ? "active" : ""}`}
          onClick={() => setStatusFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`status-filter-btn ${statusFilter === "cancelled" ? "active" : ""}`}
          onClick={() => setStatusFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments Table */}
      {viewMode === "list" ? (
        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state-cell">
                    <div className="empty-state">
                      <FaCalendarAlt className="empty-icon" />
                      <p>No appointments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  const statusBadge = getStatusBadge(appointment.status);
                  const patientName =
                    appointment.user?.name ||
                    appointment.patient?.user?.name ||
                    "Patient";
                  return (
                    <tr key={appointment._id}>
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar-small">
                            {getPatientInitial(patientName)}
                          </div>
                          <span className="patient-name">{patientName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="datetime-cell">
                          <span className="date-text">{formatDate(appointment.scheduledAt)}</span>
                          <span className="time-text">{formatTime(appointment.scheduledAt, appointment.duration || 30)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="type-cell">
                          {getConsultationIcon(appointment.consultationType)}
                          <span className="type-text">
                            {appointment.consultationType?.charAt(0).toUpperCase() +
                              appointment.consultationType?.slice(1) || "Video"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="reason-text">{appointment.reason || "General consultation"}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          {appointment.status === "pending" && (
                            <>
                              <button
                                className="btn-accept-small"
                                onClick={() => handleAccept(appointment._id)}
                                title="Accept"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                className="btn-reject-small"
                                onClick={() => handleReject(appointment._id)}
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <>
                              {appointment.consultationType === "video" &&
                              appointment?.videoSession?.approvalStatus === "requested" ? (
                                <>
                                  <button
                                    className="btn-accept-small"
                                    onClick={() => handleApproveVideoCall(appointment._id)}
                                    title="Approve Video Call"
                                  >
                                    <FaCheckCircle />
                                  </button>
                                  <button
                                    className="btn-reject-small"
                                    onClick={() => handleDeclineVideoCall(appointment._id)}
                                    title="Decline Video Call"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="btn-reschedule-small"
                                    onClick={() => handleReschedule(appointment._id)}
                                  >
                                    <FaClock /> Reschedule
                                  </button>
                                  <button
                                    className="btn-reschedule-small"
                                    onClick={() => navigate(`/doctor/consultations?appointment=${appointment._id}`)}
                                  >
                  <FaVideo /> Start Session
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          {(appointment.status === "completed" || appointment.status === "cancelled") && (
                            <span className="no-actions">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="calendar-view">
          <div className="calendar-container">
            {/* Calendar Header */}
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
                ←
              </button>
              <h2 className="calendar-month-title">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
                →
              </button>
            </div>

            {/* Day Headers */}
            <div className="calendar-weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {getDaysInMonth(currentMonth).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                }

                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={date.toISOString()}
                    className={`calendar-day ${isToday ? "today" : ""}`}
                  >
                    <div className="calendar-day-number">{date.getDate()}</div>
                    <div className="calendar-appointments">
                      {dayAppointments.map((appointment) => {
                        const patientName =
                          appointment.user?.name ||
                          appointment.patient?.user?.name ||
                          "Patient";
                        const time = formatTimeForCalendar(appointment.scheduledAt);
                        const color = getAppointmentColor(appointment.status);
                        
                        return (
                          <div
                            key={appointment._id}
                            className="calendar-appointment-block"
                            style={{ backgroundColor: color }}
                            title={`${time} - ${patientName}`}
                          >
                            {time} - {patientName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
