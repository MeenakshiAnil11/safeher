import express from "express";
import {
  getDashboardStats,
  getLiveConsultations,
  getDoctors,
  getDoctorById,
  approveDoctor,
  rejectDoctor,
  suspendDoctor,
  reactivateDoctor,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  resolveDispute,
  getPayments,
  processRefund,
  getConsultationReports,
  getRevenueReports,
  getDoctorPerformance,
  getPrescriptions,
  getSettings,
  updateSettings,
} from "../controllers/telehealthController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/consultations/live", getLiveConsultations);

// Doctor Management
router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);
router.put("/doctors/:id/approve", approveDoctor);
router.put("/doctors/:id/reject", rejectDoctor);
router.put("/doctors/:id/suspend", suspendDoctor);
router.put("/doctors/:id/reactivate", reactivateDoctor);

// Appointment Management
router.get("/appointments", getAppointments);
router.get("/appointments/:id", getAppointmentById);
router.put("/appointments/:id/reschedule", rescheduleAppointment);
router.put("/appointments/:id/cancel", cancelAppointment);
router.put("/appointments/:id/resolve-dispute", resolveDispute);

// Payment & Refunds
router.get("/payments", getPayments);
router.put("/payments/:id/refund", processRefund);

// Reports & Analytics
router.get("/reports/consultations", getConsultationReports);
router.get("/reports/revenue", getRevenueReports);
router.get("/reports/doctor-performance", getDoctorPerformance);

// Prescriptions
router.get("/prescriptions", getPrescriptions);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
