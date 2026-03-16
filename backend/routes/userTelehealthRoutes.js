import express from "express";
import {
  getUserDashboardStats,
  getUserDoctors,
  getUserDoctorById,
  getDoctorAvailableSlots,
  bookAppointment,
  getUserAppointments,
  getUserAppointmentById,
  cancelUserAppointment,
  rescheduleUserAppointment,
  getUserPrescriptions,
  getUserPrescriptionById,
  getUserPayments,
  processPayment,
  requestRefund,
  getPaymentDetails,
  generateInvoicePDF,
  getUserSettings,
  updateUserSettings,
  getConsultationMessages,
  sendConsultationMessage,
  completeAppointment,
  startSession,
  joinSession,
  endSession,
  getSessionStatus,
  requestVideoConsultation,
  respondVideoConsultationRequest,
  getVideoConsultationStatus,
  getConsultationIntake,
  upsertConsultationIntake,
  getConsultationHistory,
  acceptAppointment,
  rejectAppointment,
  createPrescription,
  getDoctorProfile,
  getDoctorAvailability,
  updateDoctorProfile,
  updateDoctorAvailability,
  getDoctorAppointments,
  completeAppointmentDoctor,
  updateAppointmentNotes,
  getDoctorEarnings,
  getDoctorPatients,
  getRecentHealthData,
  getPatientHealthData,
  getDoctorNotifications,
  markDoctorNotificationRead,
  markAllDoctorNotificationsRead,
  getDoctorSettings,
  updateDoctorSettings,
  getPrescriptionPdf,
  forwardPrescription,
  getConsultationSummary,
  rateDoctorForAppointment,
} from "../controllers/userTelehealthController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require user authentication
router.use(protect);

// Dashboard
router.get("/dashboard/stats", getUserDashboardStats);

// Doctor Profile & Availability (must come BEFORE /doctors/:id)
router.get("/doctors/profile", getDoctorProfile);
router.put("/doctors/profile", updateDoctorProfile);
router.get("/doctors/availability", getDoctorAvailability);
router.put("/doctors/availability", updateDoctorAvailability);
router.get("/doctors/settings", getDoctorSettings);
router.put("/doctors/settings", updateDoctorSettings);

// Doctor Directory
router.get("/doctors", getUserDoctors);
router.get("/doctors/:id", getUserDoctorById);
router.get("/doctors/:id/slots", getDoctorAvailableSlots);

// Appointments (shared patient + doctor)
router.get("/appointments", getUserAppointments);
router.get("/appointments/:id", getUserAppointmentById);
router.post("/appointments", bookAppointment);
router.put("/appointments/:id/cancel", cancelUserAppointment);
router.put("/appointments/:id/reschedule", rescheduleUserAppointment);
router.put("/appointments/:id/complete", completeAppointment);
router.put("/appointments/:id/accept", acceptAppointment);
router.put("/appointments/:id/reject", rejectAppointment);
router.put("/appointments/:id/complete-doctor", completeAppointmentDoctor);
router.put("/appointments/:id/notes", updateAppointmentNotes);
router.post("/appointments/:id/video/request", requestVideoConsultation);
router.put("/appointments/:id/video/respond", respondVideoConsultationRequest);
router.get("/appointments/:id/video/status", getVideoConsultationStatus);
router.get("/appointments/:id/summary", getConsultationSummary);
router.post("/appointments/:id/rate", rateDoctorForAppointment);
router.get("/appointments/:id/intake", getConsultationIntake);
router.post("/appointments/:id/intake", upsertConsultationIntake);

// Consultation Messages
router.get("/appointments/:id/messages", getConsultationMessages);
router.post("/appointments/:id/messages", sendConsultationMessage);

// Session Management
router.post("/session/start", startSession);
router.post("/session/join", joinSession);
router.post("/session/end", endSession);
router.get("/session/:appointmentId/status", getSessionStatus);
router.get("/consultations/history", getConsultationHistory);

// Prescriptions (shared: patient reads, doctor creates)
router.get("/prescriptions", getUserPrescriptions);
router.post("/prescriptions", createPrescription);
router.get("/prescriptions/:id/pdf", getPrescriptionPdf);
router.post("/prescriptions/:id/forward", forwardPrescription);
router.get("/prescriptions/:id", getUserPrescriptionById);

// Payments
router.get("/payments", getUserPayments);
router.post("/payments/process", processPayment);
router.get("/payments/:id/invoice", generateInvoicePDF);
router.post("/payments/:id/refund-request", requestRefund);
router.get("/payments/:id", getPaymentDetails);

// Doctor Earnings
router.get("/earnings", getDoctorEarnings);

// Doctor Patients / Health Data
router.get("/patients", getDoctorPatients);
router.get("/health-data/recent", getRecentHealthData);
router.get("/health-data/:patientId", getPatientHealthData);

// Doctor Notifications
router.get("/notifications", getDoctorNotifications);
router.put("/notifications/read-all", markAllDoctorNotificationsRead);
router.put("/notifications/:id/read", markDoctorNotificationRead);

// User Settings
router.get("/user/settings", getUserSettings);
router.put("/user/settings", updateUserSettings);

export default router;
