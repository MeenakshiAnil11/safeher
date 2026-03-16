import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";

const TelehealthContext = createContext();

export function useTelehealth() {
  return useContext(TelehealthContext);
}

export function TelehealthProvider({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Shared state for workflow connections
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      // Fetch from multiple sources to aggregate notifications
      const [appointmentsRes, prescriptionsRes, paymentsRes] = await Promise.all([
        api.get("/telehealth/appointments?limit=20").catch(() => ({ data: { appointments: [] } })),
        api.get("/telehealth/prescriptions?limit=10").catch(() => ({ data: { prescriptions: [] } })),
        api.get("/telehealth/payments?limit=10").catch(() => ({ data: { payments: [] } })),
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const prescriptions = prescriptionsRes.data.prescriptions || [];
      const payments = paymentsRes.data.payments || [];

      const notificationList = [];
      const now = new Date();

      // Appointment reminders (upcoming within 24 hours)
      appointments
        .filter((apt) => apt.status === "confirmed" && new Date(apt.scheduledAt) > now)
        .forEach((apt) => {
          const appointmentDate = new Date(apt.scheduledAt);
          const hoursUntil = (appointmentDate - now) / (1000 * 60 * 60);
          
          if (hoursUntil <= 24) {
            notificationList.push({
              id: `apt-reminder-${apt._id}`,
              type: "appointment_reminder",
              title: "Appointment Reminder",
              message: `You have an appointment with Dr. ${apt.doctor?.user?.name || "your doctor"} ${hoursUntil < 1 ? "in less than an hour" : `in ${Math.floor(hoursUntil)} hours`}`,
              time: apt.scheduledAt,
              read: false,
              data: { appointmentId: apt._id, doctorId: apt.doctor?._id },
              action: { type: "navigate", path: "/telehealth/appointments" },
            });
          }
        });

      // New appointment confirmations (created in last 7 days)
      appointments
        .filter((apt) => {
          const createdAt = new Date(apt.createdAt);
          const daysSinceCreated = (now - createdAt) / (1000 * 60 * 60 * 24);
          return apt.status === "confirmed" && daysSinceCreated <= 7;
        })
        .forEach((apt) => {
          notificationList.push({
            id: `apt-confirmed-${apt._id}`,
            type: "appointment_confirmed",
            title: "Appointment Confirmed",
            message: `Your appointment with Dr. ${apt.doctor?.user?.name || "your doctor"} has been confirmed`,
            time: apt.createdAt,
            read: true, // Mark as read by default
            data: { appointmentId: apt._id },
            action: { type: "navigate", path: "/telehealth/appointments" },
          });
        });

      // New prescriptions (issued in last 7 days)
      prescriptions
        .filter((pres) => {
          const issuedAt = new Date(pres.createdAt || pres.issuedAt);
          const daysSinceIssued = (now - issuedAt) / (1000 * 60 * 60 * 24);
          return daysSinceIssued <= 7;
        })
        .forEach((pres) => {
          notificationList.push({
            id: `pres-${pres._id}`,
            type: "prescription_ready",
            title: "Prescription Ready",
            message: `New prescription from Dr. ${pres.doctor?.user?.name || "your doctor"} is ready for review`,
            time: pres.createdAt || pres.issuedAt,
            read: false,
            data: { prescriptionId: pres._id },
            action: { type: "navigate", path: "/telehealth/prescriptions" },
          });
        });

      // Payment notifications (completed in last 7 days)
      payments
        .filter((pay) => {
          const paidAt = new Date(pay.createdAt);
          const daysSincePaid = (now - paidAt) / (1000 * 60 * 60 * 24);
          return pay.paymentStatus === "completed" && daysSincePaid <= 7;
        })
        .forEach((pay) => {
          notificationList.push({
            id: `pay-${pay._id}`,
            type: "payment_success",
            title: "Payment Successful",
            message: `Payment of ₹${pay.amount?.toFixed(2) || "0.00"} completed successfully`,
            time: pay.createdAt,
            read: true,
            data: { paymentId: pay._id },
            action: { type: "navigate", path: "/telehealth/payments" },
          });
        });

      // Completed consultations (last 7 days)
      appointments
        .filter((apt) => {
          if (apt.status !== "completed") return false;
          const completedAt = new Date(apt.completedAt || apt.scheduledAt);
          const daysSinceCompleted = (now - completedAt) / (1000 * 60 * 60 * 24);
          return daysSinceCompleted <= 7;
        })
        .forEach((apt) => {
          notificationList.push({
            id: `consult-complete-${apt._id}`,
            type: "consultation_completed",
            title: "Consultation Completed",
            message: `Your consultation with Dr. ${apt.doctor?.user?.name || "your doctor"} has been completed`,
            time: apt.completedAt || apt.scheduledAt,
            read: true,
            data: { appointmentId: apt._id },
            action: { type: "navigate", path: "/telehealth/history" },
          });
        });

      // Sort by time, most recent first
      notificationList.sort((a, b) => new Date(b.time) - new Date(a.time));

      setNotifications(notificationList);
      setUnreadCount(notificationList.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Load notifications on mount + setup Socket.io
  useEffect(() => {
    if (user?.id || user?._id) {
      fetchNotifications();

      // Connect socket
      const sock = connectSocket();
      if (sock) {
        socketRef.current = sock;
        sock.on("connect", () => setSocketConnected(true));
        sock.on("disconnect", () => setSocketConnected(false));

        // Real-time notification listener
        sock.on("telehealth_notification", (notification) => {
          const newNotif = {
            id: notification._id || `rt-${Date.now()}`,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            time: notification.createdAt || new Date().toISOString(),
            read: false,
            data: notification,
            action: notification.actionUrl ? { type: "navigate", path: notification.actionUrl } : undefined,
          };
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

        // Dashboard refresh trigger
        sock.on("dashboard_refresh", () => {
          fetchNotifications();
        });

        // Earnings update for doctors
        sock.on("earnings_updated", () => {
          // Components can listen for this via socket directly
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("telehealth_notification");
        socketRef.current.off("dashboard_refresh");
        socketRef.current.off("earnings_updated");
      }
    };
  }, [user?.id, user?._id, fetchNotifications]);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
      time: notification.time || new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  // Clear a notification
  const clearNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Workflow: Select doctor for booking
  const selectDoctorForBooking = (doctor) => {
    setSelectedDoctor(doctor);
    // Store in sessionStorage for persistence across navigation
    sessionStorage.setItem("selectedDoctor", JSON.stringify(doctor));
  };

  // Workflow: Set current appointment for consultation
  const setAppointmentForConsultation = (appointment) => {
    setCurrentAppointment(appointment);
    sessionStorage.setItem("currentAppointment", JSON.stringify(appointment));
  };

  // Workflow: Start session
  const startConsultationSession = (session) => {
    setActiveSession(session);
    sessionStorage.setItem("activeSession", JSON.stringify(session));
    
    // Add notification
    addNotification({
      type: "session_started",
      title: "Session Started",
      message: "Your consultation session has started",
    });
  };

  // Workflow: End session
  const endConsultationSession = () => {
    const session = activeSession;
    setActiveSession(null);
    sessionStorage.removeItem("activeSession");
    
    if (session) {
      addNotification({
        type: "session_ended",
        title: "Session Ended",
        message: "Your consultation session has ended. Check your prescriptions for follow-up.",
      });
    }
  };

  // Clear selected doctor after booking
  const clearSelectedDoctor = () => {
    setSelectedDoctor(null);
    sessionStorage.removeItem("selectedDoctor");
  };

  // Load persisted state from sessionStorage on mount
  useEffect(() => {
    const storedDoctor = sessionStorage.getItem("selectedDoctor");
    const storedAppointment = sessionStorage.getItem("currentAppointment");
    const storedSession = sessionStorage.getItem("activeSession");

    if (storedDoctor) setSelectedDoctor(JSON.parse(storedDoctor));
    if (storedAppointment) setCurrentAppointment(JSON.parse(storedAppointment));
    if (storedSession) setActiveSession(JSON.parse(storedSession));
  }, []);

  const value = {
    // User context
    userId: user?.id || user?._id,
    user,

    // Socket
    socket: socketRef.current,
    socketConnected,

    // Doctor selection workflow
    selectedDoctor,
    selectDoctorForBooking,
    clearSelectedDoctor,

    // Appointment workflow
    currentAppointment,
    setAppointmentForConsultation,

    // Session workflow
    activeSession,
    startConsultationSession,
    endConsultationSession,

    // Notifications
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotification,
  };

  return (
    <TelehealthContext.Provider value={value}>
      {children}
    </TelehealthContext.Provider>
  );
}

export default TelehealthContext;
