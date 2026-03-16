import React, { useState, useEffect, useCallback } from "react";
import {
  FaCalendarCheck,
  FaFilePrescription,
  FaStethoscope,
  FaBell,
  FaCheck,
  FaArrowRight,
  FaUserMd,
  FaVideo,
  FaHistory,
  FaCreditCard,
  FaHeartbeat,
  FaStar,
  FaClock,
  FaShieldAlt,
  FaLightbulb,
  FaChartLine,
  FaCommentMedical,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useTelehealth } from "../../context/TelehealthContext";
import "./TelehealthDashboard.css";

export default function TelehealthDashboard() {
  const navigate = useNavigate();
  const { notifications: contextNotifications, unreadCount, markAsRead, markAllAsRead, socket } = useTelehealth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    nextAppointmentDate: null,
    prescriptions: 0,
    lastPrescriptionDate: null,
    recentConsultations: 0,
    lastDoctorName: null,
    pendingPayments: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingConsultation, setUpcomingConsultation] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [upcomingRes, pendingRes, prescriptionsRes, consultationsRes, paymentsRes] = await Promise.all([
        api.get("/telehealth/appointments?status=upcoming&limit=50").catch(() => ({ data: { appointments: [] } })),
        api.get("/telehealth/appointments?status=pending&limit=50").catch(() => ({ data: { appointments: [] } })),
        api.get("/telehealth/prescriptions?limit=50").catch(() => ({ data: { prescriptions: [] } })),
        api.get("/telehealth/appointments?status=ended&limit=50").catch(() => ({ data: { appointments: [] } })),
        api.get("/telehealth/payments?limit=50").catch(() => ({ data: { payments: [], summary: {} } })),
      ]);

      let appointments = [
        ...(upcomingRes.data.appointments || []),
        ...(pendingRes.data.appointments || []),
      ];

      let allMockAppointments = [];
      try {
        allMockAppointments = JSON.parse(localStorage.getItem("mockAppointments") || "[]");
        const now = new Date();
        const upcomingMock = allMockAppointments.filter((apt) => {
          const d = new Date(apt.scheduledAt);
          return d > now && (apt.status === "confirmed" || apt.status === "pending");
        });
        const existingIds = new Set(appointments.map((a) => a._id));
        appointments = [...appointments, ...upcomingMock.filter((a) => !existingIds.has(a._id))];
      } catch (e) { /* ignore */ }

      const prescriptions = prescriptionsRes.data.prescriptions || [];
      const consultations = consultationsRes.data.appointments || [];

      // Completed mock appointments
      const completedMock = allMockAppointments.filter((a) => a.status === "completed");
      const allConsultations = [...consultations];
      const consultIds = new Set(allConsultations.map((c) => c._id));
      completedMock.forEach((m) => { if (!consultIds.has(m._id)) allConsultations.push(m); });

      const upcomingSorted = [...appointments]
        .filter((a) => new Date(a.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      const nextAppointment = upcomingSorted[0];
      setUpcomingConsultation(nextAppointment || null);

      const lastPrescription = prescriptions.length > 0
        ? [...prescriptions].sort((a, b) => new Date(b.createdAt || b.issuedAt) - new Date(a.createdAt || a.issuedAt))[0]
        : null;

      const lastConsultation = allConsultations.length > 0
        ? [...allConsultations].sort((a, b) => new Date(b.completedAt || b.scheduledAt) - new Date(a.completedAt || a.scheduledAt))[0]
        : null;

      // Pending payments: count mock appointments with status "pending" payment
      const apiPending = paymentsRes.data?.summary?.pendingPayments || 0;
      const mockPendingCount = allMockAppointments.filter((a) => a.status === "pending").length;
      const pendingPayments = apiPending + mockPendingCount;

      setStats({
        upcomingAppointments: appointments.length,
        nextAppointmentDate: nextAppointment?.scheduledAt || null,
        prescriptions: prescriptions.length,
        lastPrescriptionDate: lastPrescription?.createdAt || lastPrescription?.issuedAt || null,
        recentConsultations: allConsultations.length,
        lastDoctorName: lastConsultation?.doctor?.user?.name || lastConsultation?.doctor?.name || null,
        pendingPayments,
      });

      // Build real recent activity from all data sources
      const activityItems = [];
      const allApts = [...appointments, ...allConsultations];
      const seenIds = new Set();
      allMockAppointments.forEach((a) => {
        if (!seenIds.has(a._id)) {
          seenIds.add(a._id);
          allApts.push(a);
        }
      });

      [...appointments].sort((a, b) => new Date(b.createdAt || b.scheduledAt) - new Date(a.createdAt || a.scheduledAt))
        .slice(0, 3).forEach((apt) => {
          const doctorName = apt.doctor?.user?.name || apt.doctor?.name || "a doctor";
          activityItems.push({
            text: `Appointment booked with ${doctorName}`,
            time: apt.createdAt || apt.scheduledAt,
            icon: "appointment",
          });
        });

      [...allConsultations].sort((a, b) => new Date(b.completedAt || b.scheduledAt) - new Date(a.completedAt || a.scheduledAt))
        .slice(0, 2).forEach((c) => {
          const doctorName = c.doctor?.user?.name || c.doctor?.name || "a doctor";
          activityItems.push({
            text: `Consultation completed with ${doctorName}`,
            time: c.completedAt || c.scheduledAt,
            icon: "consultation",
          });
        });

      [...prescriptions].sort((a, b) => new Date(b.createdAt || b.issuedAt) - new Date(a.createdAt || a.issuedAt))
        .slice(0, 2).forEach((p) => {
          activityItems.push({
            text: `Prescription received — ${p.diagnosis || "General"}`,
            time: p.createdAt || p.issuedAt,
            icon: "prescription",
          });
        });

      activityItems.sort((a, b) => new Date(b.time) - new Date(a.time));

      if (activityItems.length === 0) {
        activityItems.push(
          { text: "Welcome! Book your first appointment to get started", time: new Date().toISOString(), icon: "appointment" },
          { text: "Explore doctors across 12+ specializations", time: new Date().toISOString(), icon: "consultation" },
        );
      }

      setRecentActivity(activityItems.slice(0, 5));

      // Notifications
      const notificationList = [];
      if (nextAppointment) {
        const hoursUntil = (new Date(nextAppointment.scheduledAt) - new Date()) / 3600000;
        if (hoursUntil <= 48 && hoursUntil > 0) {
          notificationList.push({
            id: `apt-${nextAppointment._id}`,
            type: "reminder",
            message: `Appointment with ${nextAppointment.doctor?.user?.name || nextAppointment.doctor?.name || "your doctor"} ${hoursUntil < 1 ? "in less than an hour" : `in ${Math.floor(hoursUntil)} hours`}`,
            time: formatTimeAgo(nextAppointment.scheduledAt),
            read: false,
          });
        }
      }
      if (lastPrescription && new Date(lastPrescription.createdAt || lastPrescription.issuedAt) > new Date(Date.now() - 7 * 86400000)) {
        notificationList.push({
          id: `pres-${lastPrescription._id}`,
          type: "prescription",
          message: "Your prescription is ready for review",
          time: formatTimeAgo(lastPrescription.createdAt || lastPrescription.issuedAt),
          read: false,
        });
      }
      if (appointments.length > 0) {
        notificationList.push({ id: "apt-count", type: "info", message: `You have ${appointments.length} upcoming appointment${appointments.length > 1 ? "s" : ""}`, time: "Just now", read: false });
      }
      notificationList.push({ id: "sys-1", type: "system", message: "New telehealth features are now available", time: "2 days ago", read: true });
      setNotifications(notificationList);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount + re-fetch when user navigates back or socket event fires
  useEffect(() => {
    fetchDashboardData();

    const handleFocus = () => fetchDashboardData();
    const handleVisibility = () => { if (document.visibilityState === "visible") fetchDashboardData(); };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // Real-time refresh via socket
    if (socket) {
      const handleRefresh = () => fetchDashboardData();
      socket.on("dashboard_refresh", handleRefresh);
      socket.on("telehealth_notification", handleRefresh);
      return () => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleVisibility);
        socket.off("dashboard_refresh", handleRefresh);
        socket.off("telehealth_notification", handleRefresh);
      };
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchDashboardData, socket]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  // Navigation handlers
  const handleViewAppointments = () => {
    navigate("/telehealth/appointments");
  };

  const handleViewHistory = () => {
    navigate("/telehealth/history");
  };

  const handleViewPrescriptions = () => {
    navigate("/telehealth/prescriptions");
  };

  const handleViewNotifications = () => {
    navigate("/telehealth/notifications");
  };

  const topDoctors = [
    { name: "Dr. Patricia Brown", spec: "Gynecology", rating: 4.9, reviews: 223, img: "https://randomuser.me/api/portraits/women/44.jpg", available: true },
    { name: "Dr. Rachel Green", spec: "Obstetrics", rating: 4.9, reviews: 245, img: "https://randomuser.me/api/portraits/women/36.jpg", available: true },
    { name: "Dr. Emily Chen", spec: "Cardiology", rating: 4.9, reviews: 234, img: "https://randomuser.me/api/portraits/women/47.jpg", available: false },
    { name: "Dr. Catherine Brooks", spec: "Oncology", rating: 4.9, reviews: 210, img: "https://randomuser.me/api/portraits/women/48.jpg", available: true },
  ];

  const healthTips = [
    { icon: <FaHeartbeat />, title: "Regular Check-ups", desc: "Schedule routine screenings for early detection of health issues. Preventive care saves lives.", color: "#ec4899" },
    { icon: <FaLightbulb />, title: "Mental Wellness", desc: "Practice mindfulness and don't hesitate to seek professional help for stress or anxiety.", color: "#f59e0b" },
    { icon: <FaShieldAlt />, title: "Vaccinations", desc: "Stay up to date with recommended vaccinations including HPV, flu, and COVID boosters.", color: "#22c55e" },
  ];

  const activityIconMap = {
    appointment: <FaCalendarCheck />,
    consultation: <FaVideo />,
    prescription: <FaFilePrescription />,
  };

  return (
    <div className="telehealth-dashboard-user">
      {/* Welcome Card */}
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2>{getGreeting()}, {user.name || "User"}!</h2>
            <p>Manage your health consultations and appointments</p>
          </div>
        </div>
        <button className="btn-book-appointment" onClick={() => navigate("/telehealth/doctors")}>
          <FaVideo /> Book Consultation
        </button>
      </div>

      {/* Quick Stats Grid — 4 cards */}
      <div className="stats-grid four-col">
        <div className="stat-card clickable" onClick={handleViewAppointments}>
          <div className="stat-icon-wrapper"><FaCalendarCheck className="stat-icon" /></div>
          <div className="stat-content">
            <h3>{stats.upcomingAppointments}</h3>
            <p className="stat-label">Appointments</p>
            <p className="stat-subtitle">{stats.nextAppointmentDate ? `Next: ${formatDateTime(stats.nextAppointmentDate)}` : "No upcoming appointments"}</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={handleViewPrescriptions}>
          <div className="stat-icon-wrapper prescription"><FaFilePrescription className="stat-icon" /></div>
          <div className="stat-content">
            <h3>{stats.prescriptions}</h3>
            <p className="stat-label">Prescriptions</p>
            <p className="stat-subtitle">{stats.lastPrescriptionDate ? `Last: ${formatDate(stats.lastPrescriptionDate)}` : "No prescriptions yet"}</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={handleViewHistory}>
          <div className="stat-icon-wrapper consult"><FaStethoscope className="stat-icon" /></div>
          <div className="stat-content">
            <h3>{stats.recentConsultations}</h3>
            <p className="stat-label">Consultations</p>
            <p className="stat-subtitle">{stats.lastDoctorName ? `Last: ${stats.lastDoctorName}` : "No consultations yet"}</p>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate("/telehealth/payments")}>
          <div className="stat-icon-wrapper payment"><FaCreditCard className="stat-icon" /></div>
          <div className="stat-content">
            <h3>{stats.pendingPayments}</h3>
            <p className="stat-label">Pending Payments</p>
            <p className="stat-subtitle">{stats.pendingPayments > 0 ? `${stats.pendingPayments} payment${stats.pendingPayments > 1 ? "s" : ""} pending` : "All invoices up to date"}</p>
          </div>
        </div>
      </div>

      {upcomingConsultation && (
        <div className="td-schedule-banner">
          <div className="td-schedule-left">
            <FaUserMd className="td-schedule-icon" />
            <div>
              <h3>Upcoming Consultation</h3>
              <p>
                {upcomingConsultation?.doctor?.user?.name || "Doctor"} - {formatDateTime(upcomingConsultation.scheduledAt)}
              </p>
            </div>
          </div>
          <button
            className="btn-book-appointment"
            onClick={() => navigate(`/telehealth/consultation/${upcomingConsultation._id}`)}
          >
            Join Call
          </button>
        </div>
      )}

      {/* Two-column layout: Top Doctors + Health Tips */}
      <div className="td-two-col">
        {/* Top Rated Doctors */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title-wrapper"><FaStar className="section-icon" style={{ color: "#f59e0b" }} /><h3>Top Rated Doctors</h3></div>
            <button className="btn-view-all" onClick={() => navigate("/telehealth/doctors")}>View All <FaArrowRight /></button>
          </div>
          <div className="td-doctors-list">
            {topDoctors.map((doc, i) => (
              <div key={i} className="td-doctor-row" onClick={() => navigate("/telehealth/doctors")}>
                <img src={doc.img} alt={doc.name} className="td-doctor-img" />
                <div className="td-doctor-info">
                  <strong>{doc.name}</strong>
                  <span>{doc.spec}</span>
                </div>
                <div className="td-doctor-meta">
                  <span className="td-rating"><FaStar /> {doc.rating}</span>
                  <span className={`td-avail ${doc.available ? "online" : ""}`}>{doc.available ? "Available" : "Busy"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Tips */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title-wrapper"><FaLightbulb className="section-icon" style={{ color: "#f59e0b" }} /><h3>Health Tips for You</h3></div>
          </div>
          <div className="td-tips-list">
            {healthTips.map((tip, i) => (
              <div key={i} className="td-tip-card">
                <div className="td-tip-icon" style={{ background: `${tip.color}15`, color: tip.color }}>{tip.icon}</div>
                <div><strong>{tip.title}</strong><p>{tip.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="td-wellness-score">
            <div className="td-ws-header"><FaHeartbeat /><span>Your Wellness Score</span></div>
            <div className="td-ws-bar"><div className="td-ws-fill" style={{ width: "78%" }} /></div>
            <div className="td-ws-footer"><span>78/100 — Good</span><span>Keep it up!</span></div>
          </div>
        </div>
      </div>

      {/* Two-column layout: Recent Activity + Notifications */}
      <div className="td-two-col">
        {/* Recent Activity */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title-wrapper"><FaHistory className="section-icon" /><h3>Recent Activity</h3></div>
            <button className="btn-view-all" onClick={handleViewHistory}>View All <FaArrowRight /></button>
          </div>
          <div className="td-activity-list">
            {recentActivity.map((act, i) => (
              <div key={i} className="td-activity-item">
                <div className="td-activity-icon">{activityIconMap[act.icon] || <FaChartLine />}</div>
                <div className="td-activity-info"><p>{act.text}</p><span>{formatTimeAgo(act.time)}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="section-card notifications-panel">
          <div className="section-header">
            <div className="section-title-wrapper"><FaBell className="section-icon" /><h3>Notifications</h3>{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</div>
            <div className="section-actions">
              {unreadCount > 0 && <button className="btn-mark-all-read" onClick={markAllAsRead}><FaCheck /> Mark all read</button>}
              <button className="btn-view-all" onClick={handleViewNotifications}>View All <FaArrowRight /></button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state"><p>No new notifications</p></div>
          ) : (
            <div className="notifications-list">
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className={`notification-item ${notif.read ? "read" : "unread"}`} onClick={() => toggleNotificationRead(notif.id)}>
                  <div className="notification-indicator" />
                  <div className="notification-content">
                    <div className="notification-type">{notif.type}</div>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                  {!notif.read && <button className="btn-mark-read" onClick={(e) => { e.stopPropagation(); toggleNotificationRead(notif.id); }}><FaCheck /></button>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Schedule Banner */}
      <div className="td-schedule-banner">
        <div className="td-schedule-left">
          <FaClock className="td-schedule-icon" />
          <div>
            <h3>Your Next Appointment</h3>
            <p>{stats.nextAppointmentDate ? `Scheduled for ${formatDateTime(stats.nextAppointmentDate)}` : "No upcoming appointments. Book one now to stay on top of your health!"}</p>
          </div>
        </div>
        <button className="btn-book-appointment" onClick={() => navigate("/telehealth/doctors")}>{stats.nextAppointmentDate ? "View Details" : "Book Now"} <FaArrowRight /></button>
      </div>
    </div>
  );
}
