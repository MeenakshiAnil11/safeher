import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCalendarCheck,
  FaFilePrescription,
  FaCreditCard,
  FaVideo,
  FaCheckCircle,
  FaInfoCircle,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import { useTelehealth } from "../../context/TelehealthContext";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useTelehealth();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_reminder":
      case "appointment_confirmed":
        return <FaCalendarCheck className="notification-type-icon appointment" />;
      case "prescription_ready":
        return <FaFilePrescription className="notification-type-icon prescription" />;
      case "payment_success":
        return <FaCreditCard className="notification-type-icon payment" />;
      case "consultation_completed":
      case "session_started":
      case "session_ended":
        return <FaVideo className="notification-type-icon consultation" />;
      default:
        return <FaInfoCircle className="notification-type-icon default" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "appointment_reminder":
        return "Reminder";
      case "appointment_confirmed":
        return "Appointment";
      case "prescription_ready":
        return "Prescription";
      case "payment_success":
        return "Payment";
      case "consultation_completed":
        return "Consultation";
      case "session_started":
        return "Session";
      case "session_ended":
        return "Session";
      default:
        return "Notification";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on action
    if (notification.action?.type === "navigate" && notification.action?.path) {
      navigate(notification.action.path);
    }
  };

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleClear = (e, notificationId) => {
    e.stopPropagation();
    clearNotification(notificationId);
  };

  const groupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  notifications.forEach((notification) => {
    const notifDate = new Date(notification.time);
    if (notifDate >= todayStart) {
      groupedNotifications.today.push(notification);
    } else if (notifDate >= yesterdayStart) {
      groupedNotifications.yesterday.push(notification);
    } else if (notifDate >= weekStart) {
      groupedNotifications.thisWeek.push(notification);
    } else {
      groupedNotifications.older.push(notification);
    }
  });

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <FaBell className="header-icon" />
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <p>Stay updated with your healthcare activities</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-all" onClick={markAllAsRead}>
            <FaCheck /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <FaBell className="empty-icon" />
          <h3>No notifications</h3>
          <p>You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="notifications-container">
          {groupedNotifications.today.length > 0 && (
            <div className="notification-group">
              <h3 className="group-title">Today</h3>
              <div className="notifications-list">
                {groupedNotifications.today.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    getIcon={getNotificationIcon}
                    getTypeLabel={getNotificationTypeLabel}
                    formatTime={formatTime}
                    onClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                    onClear={handleClear}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.yesterday.length > 0 && (
            <div className="notification-group">
              <h3 className="group-title">Yesterday</h3>
              <div className="notifications-list">
                {groupedNotifications.yesterday.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    getIcon={getNotificationIcon}
                    getTypeLabel={getNotificationTypeLabel}
                    formatTime={formatTime}
                    onClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                    onClear={handleClear}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.thisWeek.length > 0 && (
            <div className="notification-group">
              <h3 className="group-title">This Week</h3>
              <div className="notifications-list">
                {groupedNotifications.thisWeek.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    getIcon={getNotificationIcon}
                    getTypeLabel={getNotificationTypeLabel}
                    formatTime={formatTime}
                    onClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                    onClear={handleClear}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.older.length > 0 && (
            <div className="notification-group">
              <h3 className="group-title">Older</h3>
              <div className="notifications-list">
                {groupedNotifications.older.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    getIcon={getNotificationIcon}
                    getTypeLabel={getNotificationTypeLabel}
                    formatTime={formatTime}
                    onClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                    onClear={handleClear}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  getIcon,
  getTypeLabel,
  formatTime,
  onClick,
  onMarkAsRead,
  onClear,
}) {
  return (
    <div
      className={`notification-card ${notification.read ? "read" : "unread"}`}
      onClick={() => onClick(notification)}
    >
      <div className="notification-icon-wrapper">
        {getIcon(notification.type)}
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-type-label">
            {getTypeLabel(notification.type)}
          </span>
          <span className="notification-time">{formatTime(notification.time)}</span>
        </div>
        <h4 className="notification-title">{notification.title}</h4>
        <p className="notification-message">{notification.message}</p>
      </div>
      <div className="notification-actions">
        {!notification.read && (
          <button
            className="btn-mark-read"
            onClick={(e) => onMarkAsRead(e, notification.id)}
            title="Mark as read"
          >
            <FaCheckCircle />
          </button>
        )}
        <button
          className="btn-clear"
          onClick={(e) => onClear(e, notification.id)}
          title="Remove"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
