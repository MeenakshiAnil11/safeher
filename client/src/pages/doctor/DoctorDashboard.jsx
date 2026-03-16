import React, { useState, useEffect, useCallback } from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaDollarSign,
  FaBell,
  FaClock,
  FaCalendarAlt,
  FaComments,
  FaExclamationTriangle,
  FaTimes,
  FaCheckCircle as FaCheckVerified,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getSocket, connectSocket } from "../../services/socket";
import useDoctorProfileStatus from "../../hooks/useDoctorProfileStatus";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const formatQualifications = (value) => {
    if (!value) return "MD";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item;
          if (!item || typeof item !== "object") return "";
          const degree = item.degree || item.name || item.label || "";
          if (!degree) return "";
          const institution = item.institution ? ` - ${item.institution}` : "";
          const year = item.year ? ` (${item.year})` : "";
          return `${degree}${institution}${year}`;
        })
        .filter(Boolean)
        .join(", ");
    }
    if (typeof value === "object") {
      const degree = value.degree || value.name || value.label || "";
      if (!degree) return "MD";
      const institution = value.institution ? ` - ${value.institution}` : "";
      const year = value.year ? ` (${value.year})` : "";
      return `${degree}${institution}${year}`;
    }
    return "MD";
  };
  const [stats, setStats] = useState({
    upcomingAppointments: 12,
    completedConsultations: 847,
    earningsThisMonth: 12450,
    appointmentsToday: 12,
  });
  const [notifications, setNotifications] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profileLoading, profileCompleted, doctorName: profileDoctorName, doctorProfile } = useDoctorProfileStatus();

  useEffect(() => {
    if (!profileLoading && profileCompleted) {
      fetchDashboardData();
    } else if (!profileLoading && !profileCompleted) {
      setDoctor(doctorProfile);
      setStats({
        upcomingAppointments: 0,
        completedConsultations: 0,
        earningsThisMonth: 0,
        appointmentsToday: 0,
      });
      setNotifications([]);
      setTodaySchedule([]);
      setLoading(false);
    }

    // Connect socket for real-time updates
    const sock = getSocket() || connectSocket();
    if (sock) {
      const handleRefresh = () => fetchDashboardData();
      sock.on("dashboard_refresh", handleRefresh);
      sock.on("telehealth_notification", handleRefresh);
      return () => {
        sock.off("dashboard_refresh", handleRefresh);
        sock.off("telehealth_notification", handleRefresh);
      };
    }
  }, [profileLoading, profileCompleted, doctorProfile]);

  useEffect(() => {
    if (!profileCompleted) return undefined;
    const poller = setInterval(() => {
      fetchDashboardData();
    }, 12000);
    return () => clearInterval(poller);
  }, [profileCompleted]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hrs < 24) return `${hrs} hr ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor profile
      const doctorRes = await api.get(`/telehealth/doctors/profile`).catch(() => ({ data: { doctor: null } }));
      const doctorData = doctorRes.data.doctor || {};
      const normalizedDoctor = {
        ...doctorData,
        name: doctorData.name || doctorData.user?.name || "",
        photo: doctorData.photo || doctorData.user?.profilePicture || null,
      };
      setDoctor(normalizedDoctor);

      // Fetch doctor appointments (backend defaults to scheduled + active for doctor view).
      const appointmentsRes = await api.get("/telehealth/appointments?limit=100&view=doctor").catch(() => ({ data: { appointments: [] } }));
      const appointmentList = appointmentsRes.data.appointments || [];
      const upcoming = appointmentList.filter((apt) => ["scheduled", "active", "confirmed"].includes(apt.status));
      const completed = appointmentList.filter((apt) => ["ended", "completed"].includes(apt.status));

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAppointments = upcoming.filter((apt) => {
        const aptDate = new Date(apt.scheduledAt || apt.appointmentDate || apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      // Calculate earnings
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const thisMonthCompleted = completed.filter(apt => {
        const aptDate = new Date(apt.completedAt || apt.date);
        return aptDate >= thisMonth;
      });
      const earnings = thisMonthCompleted.length * (normalizedDoctor.consultationFee || 500);

      setStats({
        upcomingAppointments: upcoming.length,
        completedConsultations: completed.length,
        earningsThisMonth: earnings,
        appointmentsToday: todayAppointments.length,
      });

      // Build today's schedule from real appointments
      const upcomingSchedule = upcoming
      .filter((apt) => {
        const aptDate = new Date(apt.scheduledAt);
        return !Number.isNaN(aptDate.getTime());
      })
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 6)
      .map((apt, i) => ({
        id: apt._id || i,
        appointmentId: apt._id,
        scheduledAt: apt.scheduledAt,
        patientName: apt.user?.name || "Patient",
        type: apt.notes || "Consultation",
        status: apt.status || "scheduled",
        consultationType: `${(apt.consultationType || "chat").charAt(0).toUpperCase() + (apt.consultationType || "chat").slice(1)} Consultation`,
        time: new Date(apt.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        date: new Date(apt.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));
      setTodaySchedule(upcomingSchedule);

      // Fetch real notifications first, then fallback to mock
      let notificationList = [];
      try {
        const notifRes = await api.get("/telehealth/notifications?limit=5");
        const realNotifs = notifRes.data.notifications || [];
        notificationList = realNotifs.map(n => ({
          id: n._id,
          type: n.type?.includes("appointment") ? "booking" : n.type?.includes("message") ? "message" : "admin",
          title: n.title,
          message: n.message,
          time: formatTimeAgo(n.createdAt),
          icon: n.type?.includes("appointment") ? FaCalendarAlt : n.type?.includes("message") ? FaComments : FaBell,
          read: n.isRead,
        }));
      } catch (e) { /* fallback below */ }

      if (notificationList.length === 0) {
        notificationList = [];
      }

      setNotifications(notificationList);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || profileLoading) {
    return <div className="doctor-dashboard-loading">Loading...</div>;
  }

  const resolvedName = doctor?.name || doctor?.user?.name || "";
  const initial = resolvedName ? resolvedName.charAt(0).toUpperCase() : "D";
  const doctorName = resolvedName || profileDoctorName || "Doctor";
  const specialization = doctor?.specialization || "";
  const qualifications = formatQualifications(doctor?.qualifications);
  const experience = doctor?.experience || 12;
  
  // Format specialization as "{Specialization} Specialist"
  const specializationText = `${specialization} Specialist`;
  const getStatusLabel = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "active") return "Active";
    if (normalized === "ended" || normalized === "completed") return "Ended";
    return "Scheduled";
  };
  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "active") return "active";
    if (normalized === "ended" || normalized === "completed") return "ended";
    return "scheduled";
  };

  return (
    <div className="doctor-dashboard">
      {/* Top Section - Doctor Profile Banner and Appointments Today */}
      <div className="dashboard-top-section">
        <div className="doctor-profile-banner">
          <div className="profile-banner-content">
            <div className="profile-banner-avatar">
              {doctor?.photo ? (
                <img src={doctor.photo} alt={doctor.name} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="profile-banner-info">
              <div className="profile-banner-header">
                <h2>
                  {profileCompleted ? `${doctorName}, ${qualifications}` : `Welcome, Dr. ${doctorName}!`}
                  {doctor?.verificationStatus === "approved" && (
                    <span className="verified-checkmark">
                      <FaCheckVerified />
                    </span>
                  )}
                </h2>
              </div>
              {profileCompleted ? (
                <>
                  <p className="profile-specialization">{specializationText}</p>
                  <p className="profile-meta">Board Certified • {experience} years experience</p>
                </>
              ) : (
                <>
                  <p className="profile-specialization">Please complete your profile to get started.</p>
                  <p className="profile-meta">Complete your profile to unlock this section.</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="appointments-today-card">
          <div className="appointments-today-content">
            <h3>{stats.appointmentsToday}</h3>
            <p>Appointments Today</p>
          </div>
        </div>
      </div>

      {/* Middle Section - Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-content">
            <p className="metric-label">Upcoming Appointments</p>
            <h3 className="metric-value">{stats.upcomingAppointments}</h3>
            <p className="metric-change">{profileCompleted ? "+3 from yesterday" : "No data yet"}</p>
          </div>
          <div className="metric-icon-wrapper calendar">
            <FaCalendarCheck className="metric-icon" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <p className="metric-label">Completed Consultations</p>
            <h3 className="metric-value">{stats.completedConsultations}</h3>
            <p className="metric-change">{profileCompleted ? "+24 this month" : "No data yet"}</p>
          </div>
          <div className="metric-icon-wrapper check">
            <FaCheckCircle className="metric-icon" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <p className="metric-label">Earnings This Month</p>
            <h3 className="metric-value">${stats.earningsThisMonth.toLocaleString()}</h3>
            <p className="metric-change">{profileCompleted ? "+15% vs last month" : "No data yet"}</p>
          </div>
          <div className="metric-icon-wrapper dollar">
            <FaDollarSign className="metric-icon" />
          </div>
        </div>
      </div>

      {/* Bottom Section - Today's Schedule and Recent Notifications */}
      <div className="dashboard-bottom-section">
        {/* Today's Schedule */}
        <div className="schedule-section">
          <div className="section-header">
            <h3>Upcoming Appointments</h3>
            <Link to="/doctor/appointments" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="schedule-list">
            {todaySchedule.length === 0 ? (
              <div className="empty-state">
                <p>{profileCompleted ? "No upcoming appointments yet." : "Complete your profile to unlock this section."}</p>
              </div>
            ) : (
              todaySchedule.map((appointment) => (
                <div key={appointment.id} className="schedule-item">
                  <div className="schedule-icon">
                    <FaClock />
                  </div>
                  <div className="schedule-content">
                    <h4>{appointment.patientName}</h4>
                    <p className="schedule-type">{appointment.type}</p>
                    <p className="schedule-consultation">{appointment.consultationType}</p>
                    <p className="schedule-time">{appointment.time} • {appointment.date}</p>
                    <div className="schedule-footer">
                      <span className={`schedule-status ${getStatusClass(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                      {["scheduled", "active", "confirmed"].includes(String(appointment.status || "").toLowerCase()) ? (
                        new Date(appointment.scheduledAt) <= new Date() ? (
                          <button
                            type="button"
                            className="schedule-start-btn"
                            onClick={() => navigate(`/doctor/consultations?appointment=${appointment.appointmentId}`)}
                          >
                            Start Session
                          </button>
                        ) : (
                          <span className="schedule-wait-text">Available at appointment time</span>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="notifications-section">
          <div className="section-header">
            <h3>Recent Notifications</h3>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>{profileCompleted ? "No new notifications" : "No data yet"}</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div key={notif.id} className={`notification-item ${notif.read ? "read" : ""}`}>
                    <div className={`notification-icon ${notif.type}`}>
                      <Icon />
                    </div>
                    <div className="notification-content">
                      <h4>{notif.title}</h4>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
