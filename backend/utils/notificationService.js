import TelehealthNotification from "../models/TelehealthNotification.js";
import { emitToUser } from "./socket.js";

export async function createAndEmitNotification({
  userId,
  type,
  title,
  message,
  relatedAppointment,
  relatedDoctor,
  relatedPatient,
  relatedPrescription,
  relatedPayment,
  actionUrl,
}) {
  try {
    const notification = await TelehealthNotification.create({
      user: userId,
      type,
      title,
      message,
      relatedAppointment,
      relatedDoctor,
      relatedPatient,
      relatedPrescription,
      relatedPayment,
      actionUrl,
    });

    emitToUser(userId, "telehealth_notification", {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      isRead: false,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error("createAndEmitNotification error:", error.message);
    return null;
  }
}

export async function notifyAppointmentBooked(appointment, doctorUserId, patientName) {
  const scheduledAt = new Date(appointment.scheduledAt).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // Notify doctor
  await createAndEmitNotification({
    userId: doctorUserId,
    type: "appointment_booked",
    title: "New Appointment Booked",
    message: `${patientName} has booked an appointment for ${scheduledAt}`,
    relatedAppointment: appointment._id,
    relatedPatient: appointment.user,
    actionUrl: "/doctor/appointments",
  });

  // Notify patient (confirmation)
  await createAndEmitNotification({
    userId: appointment.user,
    type: "appointment_confirmed",
    title: "Appointment Confirmed",
    message: `Your appointment for ${scheduledAt} has been confirmed`,
    relatedAppointment: appointment._id,
    actionUrl: "/telehealth/appointments",
  });

  // Emit dashboard refresh to both
  emitToUser(doctorUserId, "dashboard_refresh", { source: "appointment_booked" });
  emitToUser(appointment.user, "dashboard_refresh", { source: "appointment_booked" });
  emitToUser(doctorUserId, "new_appointment_booked", { appointmentId: appointment._id });
}

export async function notifyAppointmentAccepted(appointment, patientId, doctorName) {
  await createAndEmitNotification({
    userId: patientId,
    type: "doctor_accepted",
    title: "Appointment Accepted",
    message: `Dr. ${doctorName} has accepted your appointment`,
    relatedAppointment: appointment._id,
    actionUrl: "/telehealth/appointments",
  });
  emitToUser(patientId, "dashboard_refresh", { source: "appointment_accepted" });
  emitToUser(patientId, "appointment_accepted", { appointmentId: appointment._id });
}

export async function notifyAppointmentRejected(appointment, patientId, doctorName, reason) {
  await createAndEmitNotification({
    userId: patientId,
    type: "doctor_rejected",
    title: "Appointment Declined",
    message: `Dr. ${doctorName} has declined your appointment${reason ? ": " + reason : ""}`,
    relatedAppointment: appointment._id,
    actionUrl: "/telehealth/appointments",
  });
  emitToUser(patientId, "dashboard_refresh", { source: "appointment_rejected" });
}

export async function notifyAppointmentCancelled(appointment, cancelledByUserId, otherUserId, cancellerName) {
  await createAndEmitNotification({
    userId: otherUserId,
    type: "appointment_cancelled",
    title: "Appointment Cancelled",
    message: `${cancellerName} has cancelled the appointment`,
    relatedAppointment: appointment._id,
    actionUrl: cancelledByUserId === appointment.user?.toString()
      ? "/doctor/appointments"
      : "/telehealth/appointments",
  });
  emitToUser(otherUserId, "dashboard_refresh", { source: "appointment_cancelled" });
}

export async function notifyPrescriptionCreated(prescription, patientId, doctorName) {
  await createAndEmitNotification({
    userId: patientId,
    type: "prescription_created",
    title: "New Prescription",
    message: `Dr. ${doctorName} has issued a new prescription for you`,
    relatedPrescription: prescription._id,
    relatedAppointment: prescription.appointment,
    actionUrl: "/telehealth/prescriptions",
  });
  emitToUser(patientId, "dashboard_refresh", { source: "prescription_created" });
  emitToUser(patientId, "prescription_issued", { prescriptionId: prescription._id });
}

export async function notifyPaymentReceived(payment, doctorUserId, patientName, amount) {
  await createAndEmitNotification({
    userId: doctorUserId,
    type: "payment_received",
    title: "Payment Received",
    message: `₹${amount.toFixed(2)} received from ${patientName}`,
    relatedPayment: payment._id,
    relatedAppointment: payment.appointment,
    actionUrl: "/doctor/earnings",
  });
  emitToUser(doctorUserId, "earnings_updated", {
    paymentId: payment._id,
    amount,
  });
  emitToUser(doctorUserId, "dashboard_refresh", { source: "payment_received" });
  emitToUser(doctorUserId, "payment_completed", { paymentId: payment._id, amount });
}

export async function notifyConsultationStarted(appointmentId, doctorUserId, patientId, starterName) {
  const targetId = starterName === "patient" ? doctorUserId : patientId;
  await createAndEmitNotification({
    userId: targetId,
    type: "consultation_started",
    title: "Consultation Started",
    message: `Your consultation session is ready to join`,
    relatedAppointment: appointmentId,
    actionUrl: targetId === doctorUserId
      ? `/doctor/consultations?appointment=${appointmentId}`
      : `/telehealth/consultation/${appointmentId}`,
  });
  emitToUser(targetId, "consultation_starting", { appointmentId });
}

export async function notifyConsultationEnded(appointmentId, doctorUserId, patientId) {
  await createAndEmitNotification({
    userId: patientId,
    type: "consultation_ended",
    title: "Consultation Ended",
    message: "Your consultation has ended. Check prescriptions for follow-up details.",
    relatedAppointment: appointmentId,
    actionUrl: "/telehealth/prescriptions",
  });
  await createAndEmitNotification({
    userId: doctorUserId,
    type: "consultation_ended",
    title: "Consultation Ended",
    message: "Consultation session completed. You may issue a prescription.",
    relatedAppointment: appointmentId,
    actionUrl: "/doctor/prescriptions",
  });
  emitToUser(patientId, "dashboard_refresh", { source: "consultation_ended" });
  emitToUser(doctorUserId, "dashboard_refresh", { source: "consultation_ended" });
}
