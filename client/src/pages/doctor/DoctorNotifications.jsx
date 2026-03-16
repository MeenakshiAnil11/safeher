import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaComment,
  FaExclamationCircle,
  FaReply,
} from "react-icons/fa";
import api from "../../services/api";
import DoctorProfileGate from "../../components/doctor/DoctorProfileGate";
import useDoctorProfileStatus from "../../hooks/useDoctorProfileStatus";
import "./DoctorNotifications.css";

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { profileLoading, profileCompleted, doctorName } = useDoctorProfileStatus();

  useEffect(() => {
    if (profileCompleted) {
      fetchNotifications();
    } else if (!profileLoading) {
      setLoading(false);
    }
  }, [profileLoading, profileCompleted]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/telehealth/notifications").catch(() => ({
        data: { notifications: [] },
      }));
      
      const notificationsData = response.data.notifications || [];
      
      if (notificationsData.length === 0) {
        // Mock data matching the design
        setNotifications([
          {
            _id: "notif-1",
            type: "appointment",
            title: "New Appointment Booked",
            message: "Sarah Miller scheduled a video consultation for Feb 2, 2026 at 2:00 PM. Please review and confirm the appointment.",
            time: new Date(Date.now() - 5 * 60000).toISOString(),
            read: false,
            hasActions: true,
          },
          {
            _id: "notif-2",
            type: "message",
            title: "New Patient Message",
            message: "John Doe sent you a message regarding his medication side effects. Please review when possible.",
            time: new Date(Date.now() - 15 * 60000).toISOString(),
            read: false,
            hasActions: true,
          },
          {
            _id: "notif-3",
            type: "alert",
            title: "Admin Alert",
            message: "Please update your availability calendar for next week. The system requires updated schedules by end of day.",
            time: new Date(Date.now() - 60 * 60000).toISOString(),
            read: false,
            hasActions: false,
          },
          {
            _id: "notif-4",
            type: "appointment",
            title: "Appointment Cancelled",
            message: "An appointment was cancelled by the patient.",
            time: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
            read: false,
            hasActions: false,
          },
          {
            _id: "notif-5",
            type: "appointment",
            title: "Appointment Reminder",
            message: "You have an upcoming appointment tomorrow at 10:00 AM.",
            time: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
            read: true,
            hasActions: false,
          },
          {
            _id: "notif-6",
            type: "message",
            title: "New Patient Message",
            message: "Patient sent a follow-up message.",
            time: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
            read: true,
            hasActions: false,
          },
          {
            _id: "notif-7",
            type: "alert",
            title: "System Alert",
            message: "System maintenance scheduled for this weekend.",
            time: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
            read: true,
            hasActions: false,
          },
          {
            _id: "notif-8",
            type: "appointment",
            title: "Appointment Confirmed",
            message: "Patient confirmed their appointment.",
            time: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
            read: true,
            hasActions: false,
          },
          {
            _id: "notif-9",
            type: "message",
            title: "New Patient Message",
            message: "Patient has a question about their prescription.",
            time: new Date(Date.now() - 7 * 60 * 60000).toISOString(),
            read: true,
            hasActions: false,
          },
          {
            _id: "notif-10",
            type: "alert",
            title: "Alert",
            message: "New feature available in the portal.",
            time: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
            read: true,
            hasActions: false,
          },
        ]);
      } else {
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/telehealth/notifications/${id}/read`).catch(() => {
        console.log("Notification marked as read (mock)");
      });
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/telehealth/notifications/read-all").catch(() => {
        console.log("All notifications marked as read (mock)");
      });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
    }
  };

  const handleAccept = (id) => {
    console.log("Accept notification:", id);
    handleMarkAsRead(id);
  };

  const handleDecline = (id) => {
    console.log("Decline notification:", id);
    handleMarkAsRead(id);
  };

  const handleReply = (id) => {
    console.log("Reply to notification:", id);
    handleMarkAsRead(id);
  };

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif._id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return <FaCalendarAlt />;
      case "message":
        return <FaComment />;
      case "alert":
        return <FaExclamationCircle />;
      default:
        return <FaBell />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "appointment":
        return "#8b5cf6"; // Purple
      case "message":
        return "#8b5cf6"; // Purple
      case "alert":
        return "#f59e0b"; // Orange
      default:
        return "#8b5cf6";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "appointments":
        return notifications.filter((n) => n.type === "appointment");
      case "messages":
        return notifications.filter((n) => n.type === "message");
      case "alerts":
        return notifications.filter((n) => n.type === "alert");
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const appointmentsCount = notifications.filter((n) => n.type === "appointment").length;
  const messagesCount = notifications.filter((n) => n.type === "message").length;
  const alertsCount = notifications.filter((n) => n.type === "alert").length;

  if (loading || profileLoading) {
    return <div className="doctor-notifications-loading">Loading notifications...</div>;
  }

  if (!profileCompleted) {
    return (
      <DoctorProfileGate
        doctorName={doctorName}
        sectionTitle="notifications"
        description="Complete your profile to unlock Notifications."
      />
    );
  }

  return (
    <div className="doctor-notifications">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          <p className="header-subtitle">{unreadCount} unread notifications</p>
        </div>
        <div className="header-actions">
          <button className="btn-action-outline" onClick={handleMarkAllAsRead}>
            <FaCheck /> Mark All as Read
          </button>
          <button className="btn-action-outline" onClick={handleClearAll}>
            <FaTimes /> Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notifications-filters">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-tab ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-tab ${filter === "appointments" ? "active" : ""}`}
          onClick={() => setFilter("appointments")}
        >
          Appointments ({appointmentsCount})
        </button>
        <button
          className={`filter-tab ${filter === "messages" ? "active" : ""}`}
          onClick={() => setFilter("messages")}
        >
          Messages ({messagesCount})
        </button>
        <button
          className={`filter-tab ${filter === "alerts" ? "active" : ""}`}
          onClick={() => setFilter("alerts")}
        >
          Alerts ({alertsCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const iconColor = getIconColor(notification.type);
            return (
              <div
                key={notification._id}
                className={`notification-card ${notification.read ? "read" : "unread"}`}
              >
                <div className="notification-card-header">
                  <div className="notification-left">
                    <div className="notification-icon" style={{ color: iconColor }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-title-group">
                      <h3 className="notification-title">
                        {notification.title}
                        {!notification.read && <span className="unread-dot"></span>}
                      </h3>
                    </div>
                  </div>
                  <span className="notification-time">{formatTime(notification.time)}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-actions">
                  {notification.type === "appointment" && notification.hasActions && !notification.read && (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(notification._id)}
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => handleDecline(notification._id)}
                      >
                        <FaTimes /> Decline
                      </button>
                    </>
                  )}
                  {notification.type === "message" && notification.hasActions && !notification.read && (
                    <button
                      className="btn-reply"
                      onClick={() => handleReply(notification._id)}
                    >
                      <FaReply /> Reply
                    </button>
                  )}
                  <div className="notification-actions-right">
                    {!notification.read && (
                      <button
                        className="link-mark-read"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      className="btn-dismiss"
                      onClick={() => handleDismiss(notification._id)}
                      title="Dismiss"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
