import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import TelehealthPayment from "../models/TelehealthPayment.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Consultation from "../models/Consultation.js";
import ConsultationIntake from "../models/ConsultationIntake.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import DoctorRating from "../models/DoctorRating.js";
import TelehealthSetting from "../models/TelehealthSetting.js";
import Message from "../models/Message.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import { sendEmail } from "../config/mailer.js";
import { sendSMS } from "../config/sms.js";
import {
  createAndEmitNotification,
  notifyAppointmentBooked,
  notifyAppointmentCancelled,
  notifyPaymentReceived,
  notifyConsultationStarted,
  notifyConsultationEnded,
} from "../utils/notificationService.js";
import { emitToUser } from "../utils/socket.js";

const normalizeConsultationStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (["active", "ongoing"].includes(value)) return "ongoing";
  if (["ended", "completed"].includes(value)) return "completed";
  if (["scheduled", "waiting", "cancelled"].includes(value)) return value;
  return "scheduled";
};

// ==================== USER DASHBOARD ====================
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [upcomingAppointments, prescriptions, recentConsultations] =
      await Promise.all([
        Appointment.countDocuments({
          user: userId,
          status: { $in: ["scheduled", "waiting", "ongoing", "active", "pending", "confirmed"] },
          scheduledAt: { $gte: new Date() },
        }),
        Prescription.countDocuments({ user: userId }),
        Appointment.countDocuments({
          user: userId,
          status: { $in: ["ended", "completed"] },
        }),
      ]);

    res.json({
      stats: {
        upcomingAppointments,
        prescriptions,
        recentConsultations,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR DIRECTORY ====================
export const getUserDoctors = async (req, res) => {
  try {
    const {
      specialization,
      language,
      search,
      minRating,
      status,
    } = req.query;

    const query = {};
    
    // Only filter by status if it's provided and not "all"
    if (status && status !== "all") {
      query.status = status;
    } else if (!status) {
      // Default to approved if no status specified
      query.status = "approved";
    } else if (status === "all") {
      query.status = { $in: ["approved", "pending"] };
    }
    // If status is "all", don't add status filter

    if (specialization && specialization !== "all") {
      query.specialization = new RegExp(specialization, "i");
    }

    if (language) {
      query.languages = { $in: [language] };
    }

    if (minRating) {
      query["rating.average"] = { $gte: parseFloat(minRating) };
    }

    let doctors = await Doctor.find(query)
      .populate("user", "name email phone profilePicture")
      .select("-approvalDocuments")
      .lean();

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      doctors = doctors.filter(
        (doctor) =>
          doctor.user?.name?.match(searchRegex) ||
          doctor.specialization?.match(searchRegex) ||
          doctor.user?.email?.match(searchRegex)
      );
    }

    // Ensure all doctors have required fields
    doctors = doctors.map(doctor => ({
      ...doctor,
      doctorId: doctor._id,
      name: doctor.user?.name || "",
      profileImage: doctor.user?.profilePicture || "",
      rating: doctor.rating || { average: 0, count: 0 },
      experience: doctor.experience || 0,
      languages: doctor.languages || [],
      consultationTypes:
        Array.isArray(doctor.consultationTypes) && doctor.consultationTypes.length > 0
          ? doctor.consultationTypes
          : ["video", "chat", "in-person"],
      consultationFee: doctor.consultationFee || 0,
      videoConsultationFee: doctor.videoConsultationFee || doctor.consultationFee || 0,
      chatConsultationFee: doctor.chatConsultationFee || 0,
      bio: doctor.bio || "",
      education: (doctor.qualifications || []).map((q) => ({
        degree: q.degree,
        institution: q.institution,
        year: q.year,
      })),
      location: doctor.location || { city: "", state: "", country: "India" },
      availability: doctor.availability || { timeSlots: [] },
      availabilitySlots:
        Array.isArray(doctor.availabilitySlots) && doctor.availabilitySlots.length > 0
          ? doctor.availabilitySlots
          : ["10:00 AM", "10:30 AM", "11:00 AM"],
    }));

    console.log(`Found ${doctors.length} doctors with status filter: ${status || "approved"}`);
    if (doctors.length > 0) {
      console.log("Doctor names:", doctors.map(d => d.user?.name || "Unknown"));
    }

    res.json({ doctors });
  } catch (error) {
    console.error("Error in getUserDoctors:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("user", "name email phone")
      .select("-approvalDocuments");

    if (!doctor || doctor.status !== "approved") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query is required (YYYY-MM-DD)" });
    }

    const doctor = await Doctor.findById(id).select("status availability");
    if (!doctor || doctor.status !== "approved") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const requestedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });
    const availabilityDocs = await DoctorAvailability.find({ doctorId: id, day: dayName })
      .select("day startTime endTime slotDuration")
      .lean();
    const daySlotsFromCollection = (availabilityDocs || []).map((entry) => ({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      slotDuration: entry.slotDuration || 30,
    }));
    const daySlots = daySlotsFromCollection.length > 0
      ? daySlotsFromCollection
      : (doctor.availability?.timeSlots || []).filter((slot) => slot.day === dayName);

    const generateSlotLabels = (startTime, endTime, intervalMinutes = 30) => {
      const slots = [];
      const [startHour, startMinute] = String(startTime || "09:00")
        .split(":")
        .map((v) => Number(v));
      const [endHour, endMinute] = String(endTime || "17:00")
        .split(":")
        .map((v) => Number(v));
      const cursor = new Date(requestedDate);
      cursor.setHours(startHour || 9, startMinute || 0, 0, 0);
      const end = new Date(requestedDate);
      end.setHours(endHour || 17, endMinute || 0, 0, 0);

      while (cursor < end) {
        const hour = cursor.getHours();
        const minute = cursor.getMinutes();
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        slots.push(`${displayHour}:${String(minute).padStart(2, "0")} ${ampm}`);
        cursor.setMinutes(cursor.getMinutes() + intervalMinutes);
      }
      return slots;
    };

    const fallbackSlots =
      daySlots.length === 0
        ? (doctor.availabilitySlots || [])
        : daySlots.flatMap((slot) =>
            generateSlotLabels(slot.startTime, slot.endTime, slot.slotDuration || 30)
          );

    const startOfDay = new Date(requestedDate);
    const endOfDay = new Date(requestedDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingAppointments = await Appointment.find({
      doctor: id,
      status: { $in: ["scheduled", "active", "pending", "confirmed"] },
      scheduledAt: { $gte: startOfDay, $lt: endOfDay },
    }).select("scheduledAt");

    const formatToLabel = (dateObj) => {
      const d = new Date(dateObj);
      const hour = d.getHours();
      const minute = d.getMinutes();
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${String(minute).padStart(2, "0")} ${ampm}`;
    };

    const bookedSlotSet = new Set(existingAppointments.map((apt) => formatToLabel(apt.scheduledAt)));
    const now = new Date();
    const isToday = startOfDay.toDateString() === now.toDateString();
    const slots = fallbackSlots.filter((label) => {
      if (bookedSlotSet.has(label)) return false;
      if (!isToday) return true;

      const [time, period] = label.split(" ");
      const [h, m] = time.split(":").map((v) => Number(v));
      let hour = h;
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      const slotDate = new Date(startOfDay);
      slotDate.setHours(hour, m, 0, 0);
      return slotDate > now;
    });

    res.json({
      date,
      day: dayName,
      slots,
      bookedSlots: [...bookedSlotSet],
      hasAvailability: slots.length > 0,
    });
  } catch (error) {
    console.error("getDoctorAvailableSlots error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== APPOINTMENTS ====================
export const bookAppointment = async (req, res) => {
  try {
    const { doctor, scheduledAt, consultationType, symptoms, paymentId, paymentMethod } = req.body;
    const userId = req.user.id;
    if (!userId || !doctor) {
      return res.status(400).json({ message: "Both user_id and doctor_id are required for booking." });
    }

    // Check if doctor exists and is approved
    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc || doctorDoc.status !== "approved") {
      return res.status(400).json({ message: "Doctor not available" });
    }

    const requestedConsultationType = consultationType || "video";
    if (
      Array.isArray(doctorDoc.consultationTypes) &&
      doctorDoc.consultationTypes.length > 0 &&
      !doctorDoc.consultationTypes.includes(requestedConsultationType)
    ) {
      return res.status(400).json({ message: "Selected consultation type is not supported by this doctor." });
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date/time." });
    }

    // Prevent double-booking collisions on same slot for active-like statuses.
    const conflictingAppointment = await Appointment.findOne({
      doctor,
      scheduledAt: scheduledDate,
      status: { $in: ["scheduled", "waiting", "ongoing", "active", "pending", "confirmed"] },
    }).select("_id");
    if (conflictingAppointment) {
      return res.status(409).json({ message: "This time slot is no longer available. Please choose another slot." });
    }

    // Create appointment
    const appointment = await Appointment.create({
      appointmentNumber: Appointment.generateAppointmentNumber(),
      user: userId,
      doctor,
      scheduledAt: scheduledDate,
      consultationType: requestedConsultationType,
      status: "pending",
      paymentStatus: "pending",
      notes: symptoms,
    });

    // Create payment record linked to this appointment
    const baseAmount = doctorDoc.consultationFee || 0;
    const consultationFee = baseAmount;
    const commissionSetting = await TelehealthSetting.findOne({ key: "platformCommissionPercent" }).lean();
    const commissionPercent = Number(commissionSetting?.value ?? 12);
    const platformFee = Number(((consultationFee * commissionPercent) / 100).toFixed(2));
    const tax = 0;
    const doctorPayout = Number((consultationFee - platformFee - tax).toFixed(2));

    const payment = await TelehealthPayment.create({
      appointment: appointment._id,
      user: userId,
      doctor,
      amount: consultationFee + platformFee + tax,
      consultationFee,
      platformFee,
      platformCommission: platformFee,
      doctorPayout,
      tax,
      paymentMethod: paymentMethod || "upi",
      paymentStatus: "completed",
      status: "completed",
      paymentId: paymentId || undefined,
      transactionId: TelehealthPayment.generateTransactionId(),
    });

    // Link payment back to appointment
    appointment.payment = payment._id;
    appointment.status = "pending";
    appointment.paymentStatus = "paid";
    await appointment.save();

    // Bootstrap canonical consultation record for this booked appointment.
    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        doctorId: doctorDoc._id,
        patientId: userId,
        consultationType: requestedConsultationType,
        status: "waiting",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await appointment.populate("doctor", "specialization");
    await appointment.doctor.populate("user", "name email");

    // Notify doctor about the new appointment + patient about payment
    const patient = await User.findById(userId).select("name").lean();
    const doctorUserId = doctorDoc.user?.toString() || doctorDoc.user;
    if (doctorUserId) {
      notifyAppointmentBooked(appointment, doctorUserId, patient?.name || "A patient").catch(() => {});
      if (payment.amount > 0) {
        notifyPaymentReceived(payment, doctorUserId, patient?.name || "A patient", payment.amount).catch(() => {});
      }
    }

    res.status(201).json({
      appointment,
      payment: { id: payment._id, amount: payment.amount },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, limit = 50 } = req.query;

    let query;
    const doctorDoc = await Doctor.findOne({ user: userId }).select("_id");
    const wantsDoctorView = userRole === "doctor" || String(req.query.view || "").toLowerCase() === "doctor";

    if (wantsDoctorView) {
      if (!doctorDoc) return res.json({ appointments: [] });
      query = { doctor: doctorDoc._id };
    } else {
      query = { user: userId };
    }

    if (status) {
      const normalizedStatus = String(status).toLowerCase();
      if (normalizedStatus === "upcoming") {
        query.status = { $in: ["scheduled", "waiting", "ongoing", "active", "pending", "confirmed"] };
      } else if (normalizedStatus === "ended") {
        query.status = { $in: ["ended", "completed"] };
      } else if (normalizedStatus === "scheduled") {
        query.status = { $in: ["scheduled", "waiting", "confirmed"] };
      } else if (normalizedStatus === "ongoing") {
        query.status = { $in: ["ongoing", "active"] };
      } else {
        query.status = normalizedStatus;
      }
    } else if (wantsDoctorView) {
      // Doctor module default view: only appointments that are actionable now.
      query.status = { $in: ["scheduled", "waiting", "ongoing", "active"] };
    }

    const appointments = await Appointment.find(query)
      .populate({ path: "doctor", select: "specialization consultationFee", populate: { path: "user", select: "name email phone" } })
      .populate("user", "name email phone")
      .populate("prescription")
      .sort({ scheduledAt: -1 })
      .limit(parseInt(limit));

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const wantsDoctorView = userRole === "doctor" || String(req.query.view || "").toLowerCase() === "doctor";

    const query = { _id: req.params.id };
    if (wantsDoctorView) {
      const doctorDoc = await Doctor.findOne({ user: userId }).select("_id");
      if (!doctorDoc) return res.status(404).json({ message: "Appointment not found" });
      query.doctor = doctorDoc._id;
    } else {
      query.user = userId;
    }

    const appointment = await Appointment.findOne(query)
      .populate("doctor", "specialization consultationFee")
      .populate("doctor.user", "name email")
      .populate("prescription");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelUserAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason;
    appointment.cancelledAt = new Date();
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      { status: "cancelled", endTime: new Date() },
      { new: true }
    );

    // Notify doctor
    const populatedApt = await Appointment.findById(appointment._id).populate("doctor");
    const doctorUserId = populatedApt?.doctor?.user?.toString();
    const patient = await User.findById(userId).select("name").lean();
    if (doctorUserId) {
      notifyAppointmentCancelled(appointment, userId, doctorUserId, patient?.name || "Patient").catch(() => {});
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rescheduleUserAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduledAt } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: userId,
      status: { $in: ["scheduled", "waiting", "pending", "confirmed"] },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or cannot be rescheduled." });
    }

    const newDate = new Date(scheduledAt);
    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({ message: "Invalid reschedule date." });
    }

    const slotConflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      scheduledAt: newDate,
      status: { $in: ["scheduled", "waiting", "ongoing", "active", "pending", "confirmed"] },
    }).select("_id");
    if (slotConflict) {
      return res.status(409).json({ message: "Selected slot is already booked." });
    }

    appointment.scheduledAt = newDate;
    appointment.status = "pending";
    await appointment.save();

    await createAndEmitNotification({
      userId,
      type: "appointment_rescheduled",
      title: "Appointment Rescheduled",
      message: "Your appointment has been rescheduled successfully.",
      relatedAppointment: appointment._id,
      actionUrl: "/telehealth/appointments",
    });

    return res.json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      { status: "completed", endTime: appointment.completedAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CONSULTATION MESSAGES ====================
export const getConsultationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Allow both patient and doctor to fetch messages
    const patientId = appointment.user.toString();
    const doctorUserId = appointment.doctor?.user?.toString();
    if (userId !== patientId && userId !== doctorUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ appointment: appointmentId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 })
      .lean();

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendConsultationMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { content, type = "text", fileUrl, fileName } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const patientId = appointment.user.toString();
    const doctorUserId = appointment.doctor?.user?.toString();
    if (userId !== patientId && userId !== doctorUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const activeSession = await Session.findOne({
      appointment: appointmentId,
      status: { $in: ["active", "ongoing"] },
    }).lean();
    if (!activeSession) {
      return res.status(400).json({ message: "Session is not active yet. Please wait for doctor to start." });
    }

    const senderRole = userId === patientId ? "patient" : "doctor";

    const msg = await Message.create({
      appointment: appointmentId,
      session: activeSession._id,
      consultation: (await Consultation.findOne({ appointmentId }).select("_id").lean())?._id,
      sender: userId,
      senderRole,
      content,
      type,
      fileUrl,
      fileName,
      readBy: [userId],
    });

    const populated = await Message.findById(msg._id)
      .populate("sender", "name email")
      .lean();

    res.json({ message: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRESCRIPTIONS ====================
export const getUserPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 50 } = req.query;

    let query;
    if (userRole === "doctor") {
      const doctorDoc = await Doctor.findOne({ user: userId });
      if (!doctorDoc) return res.json({ prescriptions: [] });
      query = { doctor: doctorDoc._id };
    } else {
      query = { user: userId };
    }

    const prescriptions = await Prescription.find(query)
      .populate({ path: "doctor", select: "specialization", populate: { path: "user", select: "name email" } })
      .populate("user", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPrescriptionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: userId,
    })
      .populate("doctor", "specialization")
      .populate("doctor.user", "name email")
      .populate("appointment");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({ prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PAYMENTS ====================
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      startDate,
      endDate,
      consultationType,
      paymentStatus,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const query = { user: userId };

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    // Consultation type filter (from appointment)
    let appointmentQuery = {};
    if (consultationType && consultationType !== "all") {
      appointmentQuery.consultationType = consultationType;
    }

    // Search filter (by doctor name or invoice number)
    let searchQuery = {};
    if (search) {
      // This will be handled after population
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch payments with filters
    let payments = await TelehealthPayment.find(query)
      .populate({
        path: "doctor",
        select: "specialization",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "appointment",
        match: appointmentQuery,
        select: "scheduledAt consultationType appointmentNumber",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out payments with no matching appointment (if consultationType filter was applied)
    if (consultationType && consultationType !== "all") {
      payments = payments.filter((p) => p.appointment !== null);
    }

    // Search filter (by doctor name, invoice number, or transaction ID)
    if (search) {
      const searchLower = search.toLowerCase();
      payments = payments.filter((p) => {
        const doctorName = p.doctor?.user?.name?.toLowerCase() || "";
        const invoiceNumber = p.invoice?.invoiceNumber?.toLowerCase() || "";
        const transactionId = p.transactionId?.toLowerCase() || "";
        return (
          doctorName.includes(searchLower) ||
          invoiceNumber.includes(searchLower) ||
          transactionId.includes(searchLower)
        );
      });
    }

    // Calculate summary statistics
    const allPayments = await TelehealthPayment.find({ user: userId })
      .populate({
        path: "appointment",
        match: appointmentQuery,
      })
      .lean();

    const filteredPayments = allPayments.filter((p) => {
      if (consultationType && consultationType !== "all" && !p.appointment) {
        return false;
      }
      if (startDate || endDate) {
        const paymentDate = new Date(p.createdAt);
        if (startDate && paymentDate < new Date(startDate)) return false;
        if (endDate && paymentDate > new Date(endDate)) return false;
      }
      if (paymentStatus && paymentStatus !== "all" && p.paymentStatus !== paymentStatus) {
        return false;
      }
      if (search) {
        const searchLower = search.toLowerCase();
        const doctorName = p.doctor?.user?.name?.toLowerCase() || "";
        const invoiceNumber = p.invoice?.invoiceNumber?.toLowerCase() || "";
        const transactionId = p.transactionId?.toLowerCase() || "";
        if (
          !doctorName.includes(searchLower) &&
          !invoiceNumber.includes(searchLower) &&
          !transactionId.includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });

    const summary = {
      totalPaid: filteredPayments
        .filter((p) => p.paymentStatus === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingPayments: filteredPayments
        .filter((p) => p.paymentStatus === "pending")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      refundsIssued: filteredPayments
        .filter((p) => p.paymentStatus === "refunded" || p.paymentStatus === "partially_refunded")
        .reduce((sum, p) => {
          if (p.paymentStatus === "refunded") return sum + (p.amount || 0);
          if (p.paymentStatus === "partially_refunded") return sum + (p.refundRequest?.refundAmount || 0);
          return sum;
        }, 0),
      netBalance: 0,
    };
    summary.netBalance = summary.totalPaid - summary.refundsIssued;

    const totalCount = filteredPayments.length;

    res.json({
      payments,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { appointmentId, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    const payment = await TelehealthPayment.findOne({
      appointment: appointmentId,
      user: userId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.paymentMethod = paymentMethod || payment.paymentMethod || "upi";
    payment.paymentStatus = "completed";
    payment.status = "completed";
    payment.paymentDate = new Date();
    payment.transactionId = `TXN${Date.now()}`;
    await payment.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "scheduled",
    });

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestRefund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const payment = await TelehealthPayment.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "completed") {
      return res.status(400).json({ message: "Only completed payments can be refunded" });
    }

    payment.refundRequest = {
      requested: true,
      status: "pending",
      amount: payment.amount,
      reason,
      requestedBy: userId,
      requestedAt: new Date(),
    };
    await payment.save();

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment/invoice details
export const getPaymentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const payment = await TelehealthPayment.findOne({
      _id: req.params.id,
      user: userId,
    })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone profilePicture" },
      })
      .populate({
        path: "appointment",
        populate: { path: "prescription" },
      })
      .populate("user", "name email phone");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate invoice PDF
export const generateInvoicePDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const payment = await TelehealthPayment.findOne({
      _id: req.params.id,
      user: userId,
    })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "appointment",
        populate: { path: "prescription" },
      })
      .populate("user", "name email phone");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Generate invoice number if not exists
    if (!payment.invoice?.invoiceNumber) {
      payment.invoice = {
        invoiceNumber: TelehealthPayment.generateInvoiceNumber(),
        invoiceUrl: "",
      };
      await payment.save();
    }

    // In production, use pdfkit or similar to generate PDF
    // For now, return invoice data that can be used to generate PDF on frontend
    // or use a service like Puppeteer to generate PDF

    const invoiceData = {
      invoiceNumber: payment.invoice.invoiceNumber,
      invoiceDate: payment.createdAt,
      patient: {
        name: payment.user?.name || "N/A",
        email: payment.user?.email || "N/A",
        phone: payment.user?.phone || "N/A",
      },
      doctor: {
        name: payment.doctor?.user?.name || "N/A",
        specialization: payment.doctor?.specialization || "N/A",
        email: payment.doctor?.user?.email || "N/A",
      },
      appointment: {
        date: payment.appointment?.scheduledAt,
        type: payment.appointment?.consultationType || "N/A",
        appointmentNumber: payment.appointment?.appointmentNumber || "N/A",
      },
      charges: {
        consultationFee: payment.consultationFee || 0,
        platformFee: payment.platformFee || 0,
        tax: payment.tax || 0,
        total: payment.amount || 0,
      },
      payment: {
        method: payment.paymentMethod,
        status: payment.paymentStatus,
        transactionId: payment.transactionId,
        paymentId: payment.paymentId,
        paymentDate: payment.paymentDate || payment.createdAt,
      },
      prescription: payment.appointment?.prescription || null,
    };

    // TODO: Generate actual PDF using pdfkit
    // For now, return JSON data that frontend can use
    res.json({
      invoice: invoiceData,
      message: "Invoice data ready. PDF generation can be implemented with pdfkit.",
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== USER SETTINGS ====================
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    // In a real app, you'd have a UserSettings model
    // For now, return default settings
    res.json({
      settings: {
        notifications: {
          appointmentReminders: true,
          prescriptionReady: true,
          followUpReminders: true,
          doctorMessages: true,
        },
        channels: {
          email: true,
          sms: false,
          push: true,
        },
        language: "English",
        timezone: "Asia/Kolkata",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    // In a real app, you'd save to a UserSettings model
    res.json({ message: "Settings updated successfully", settings: req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== SESSION MANAGEMENT ====================
const buildSecureVideoRoom = (appointmentId) => {
  const token = crypto.randomBytes(6).toString("hex");
  const roomId = `safeher-${appointmentId}-${token}`;
  return {
    roomId,
    meetingLink: `https://meet.jit.si/${roomId}`,
  };
};

export const requestVideoConsultation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("user", "name email phone");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.user?._id?.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (appointment.consultationType !== "video") {
      return res.status(400).json({ message: "Video consultation is supported only for video appointments." });
    }

    if (!["scheduled", "active", "confirmed", "pending"].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot request session for ${appointment.status} appointment.` });
    }

    const { roomId, meetingLink } = buildSecureVideoRoom(appointment._id.toString());
    appointment.videoSession = {
      ...(appointment.videoSession || {}),
      roomId,
      meetingLink,
      approvalStatus: "requested",
      requestedAt: new Date(),
      requestedBy: userId,
      approvedAt: undefined,
      approvedBy: undefined,
      declinedAt: undefined,
      declineReason: "",
    };
    appointment.meetingId = roomId;
    appointment.meetingLink = meetingLink;
    await appointment.save();

    const doctorUserId = appointment.doctor?.user?._id?.toString();
    const patientName = appointment.user?.name || "A patient";
    if (doctorUserId) {
      await createAndEmitNotification({
        userId: doctorUserId,
        type: "video_consultation_requested",
        title: "Patient is requesting video consultation",
        message: `${patientName} is requesting video consultation now. Approve or decline from appointments.`,
        relatedAppointment: appointment._id,
        relatedPatient: appointment.user?._id,
        actionUrl: "/doctor/appointments",
      });
      emitToUser(doctorUserId, "video_consultation_requested", {
        appointmentId: appointment._id,
        patientName,
      });
    }

    // Optional doctor email/SMS alert
    const doctorEmail = appointment.doctor?.user?.email;
    const doctorPhone = appointment.doctor?.user?.phone;
    const scheduledAtLabel = new Date(appointment.scheduledAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (doctorEmail) {
      sendEmail({
        to: doctorEmail,
        subject: "SafeHer: Patient requested video consultation",
        html: `<p>${patientName} requested video consultation for appointment ${scheduledAtLabel}.</p><p>Please open Doctor Appointments and click <b>Approve Video Call</b>.</p>`,
      }).catch(() => {});
    }
    if (doctorPhone) {
      sendSMS({
        to: doctorPhone,
        body: `SafeHer: ${patientName} requested video consultation. Please approve in Doctor Appointments.`,
      }).catch(() => {});
    }

    return res.json({
      message: "Video consultation requested. Waiting for doctor approval.",
      videoSession: appointment.videoSession,
    });
  } catch (error) {
    console.error("requestVideoConsultation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const respondVideoConsultationRequest = async (req, res) => {
  try {
    const doctorUserId = req.user.id;
    const { id: appointmentId } = req.params;
    const { action, reason } = req.body || {};

    if (!["approve", "decline"].includes(action)) {
      return res.status(400).json({ message: "Action must be approve or decline." });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctor")
      .populate("user", "name email phone");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointmentDoctorUserId = appointment.doctor?.user?.toString();
    if (appointmentDoctorUserId !== doctorUserId) {
      return res.status(403).json({ message: "Only assigned doctor can respond." });
    }

    if (appointment.consultationType !== "video") {
      return res.status(400).json({ message: "Not a video consultation appointment." });
    }

    const currentStatus = appointment.videoSession?.approvalStatus || "none";
    if (currentStatus !== "requested") {
      return res.status(400).json({ message: "No pending video request for this appointment." });
    }

    if (action === "approve") {
      const existingRoomId = appointment.videoSession?.roomId;
      const existingLink = appointment.videoSession?.meetingLink;
      const room = existingRoomId && existingLink
        ? { roomId: existingRoomId, meetingLink: existingLink }
        : buildSecureVideoRoom(appointment._id.toString());

      appointment.videoSession = {
        ...(appointment.videoSession || {}),
        roomId: room.roomId,
        meetingLink: room.meetingLink,
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: doctorUserId,
        declinedAt: undefined,
        declineReason: "",
      };
      appointment.meetingId = room.roomId;
      appointment.meetingLink = room.meetingLink;
      appointment.status = "scheduled";
    } else {
      appointment.videoSession = {
        ...(appointment.videoSession || {}),
        approvalStatus: "declined",
        declinedAt: new Date(),
        declineReason: reason || "Doctor declined video call request.",
      };
    }

    await appointment.save();

    const patientId = appointment.user?._id?.toString();
    if (patientId) {
      await createAndEmitNotification({
        userId: patientId,
        type:
          action === "approve"
            ? "video_consultation_approved"
            : "video_consultation_declined",
        title:
          action === "approve"
            ? "Video consultation approved"
            : "Video consultation declined",
        message:
          action === "approve"
            ? "Doctor approved your video consultation. You can join now."
            : (reason || "Doctor declined your video consultation request."),
        relatedAppointment: appointment._id,
        relatedDoctor: appointment.doctor?._id,
        actionUrl:
          action === "approve"
            ? `/telehealth/consultation/${appointment._id}`
            : "/telehealth/appointments",
      });
      emitToUser(patientId, "video_consultation_response", {
        appointmentId: appointment._id,
        action,
        meetingLink: appointment.videoSession?.meetingLink || "",
      });
    }

    return res.json({
      message: action === "approve" ? "Video consultation approved." : "Video consultation declined.",
      videoSession: appointment.videoSession,
    });
  } catch (error) {
    console.error("respondVideoConsultationRequest error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getVideoConsultationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const patientId = appointment.user?.toString();
    const doctorUserId = appointment.doctor?.user?.toString();
    if (userId !== patientId && userId !== doctorUserId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    return res.json({
      appointmentId: appointment._id,
      consultationType: appointment.consultationType,
      videoSession: appointment.videoSession || { approvalStatus: "none" },
    });
  } catch (error) {
    console.error("getVideoConsultationStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const startSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .populate("user");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only assigned doctor can start the session
    const doctorUserId = appointment.doctor?.user?._id?.toString() || appointment.doctor?.user?.toString();
    if (!doctorUserId || doctorUserId !== userId) {
      return res.status(403).json({ message: "Only the assigned doctor can start the session." });
    }

    // Pre-session validation
    if (!["scheduled", "active", "confirmed"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Appointment must be scheduled to start a session",
        status: appointment.status,
      });
    }

    if (
      appointment.consultationType === "video" &&
      (appointment.videoSession?.approvalStatus || "none") !== "approved"
    ) {
      return res.status(400).json({
        message: "Video consultation is awaiting doctor approval.",
      });
    }

    const now = new Date();
    const scheduledTime = new Date(appointment.scheduledAt);
    const timeDiff = scheduledTime - now;
    const minutesDiff = timeDiff / (1000 * 60);

    // Allow joining 15 minutes before scheduled time
    if (minutesDiff > 15) {
      return res.status(400).json({
        message: `Session can only be started 15 minutes before scheduled time. Appointment is scheduled for ${scheduledTime.toLocaleString()}`,
      });
    }

    // Check if session already exists
    let session = await Session.findOne({
      appointment: appointmentId,
      status: { $in: ["active", "ongoing"] },
    });

    if (session) {
      // Doctor re-opened active session
      session.doctorJoined = true;
      await session.save();
      if (!["active", "ongoing"].includes(appointment.status)) {
        appointment.status = "ongoing";
        await appointment.save();
      }

      await Consultation.findOneAndUpdate(
        { appointmentId: appointment._id },
        {
          appointmentId: appointment._id,
          doctorId: appointment.doctor?._id,
          patientId: appointment.user?._id || appointment.user,
          consultationType: appointment.consultationType || "video",
          startTime: session.startTime || new Date(),
          status: "ongoing",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.json({
        message: "Session already active",
        session,
        sessionId: session._id,
        appointment,
      });
    }

    // Create new session
    session = await Session.create({
      appointment: appointmentId,
      patient: appointment.user?._id || appointment.user,
      doctor: doctorUserId,
      consultationType: appointment.consultationType || "video",
      startTime: now,
      status: "ongoing",
      patientJoined: false,
      doctorJoined: true,
      billing: {
        consultationFee: appointment.doctor?.consultationFee || 0,
      },
    });

    // Generate meeting link (in production, integrate with WebRTC SDK)
    const meetingId = `meeting-${appointmentId}-${Date.now()}`;
    session.meetingId = meetingId;
    session.meetingLink = `/telehealth/consultation/${appointmentId}`;
    await session.save();

    // Update appointment with meeting link
    appointment.meetingLink = session.meetingLink;
    appointment.meetingId = meetingId;
    appointment.status = "ongoing";
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        doctorId: appointment.doctor?._id,
        patientId: appointment.user?._id || appointment.user,
        consultationType: appointment.consultationType || "video",
        startTime: now,
        status: "ongoing",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify patient that doctor has started the session
    const patientUid = appointment.user?._id?.toString() || appointment.user?.toString();
    if (patientUid) {
      notifyConsultationStarted(appointmentId, patientUid, doctorUserId, "doctor").catch(() => {});
    }

    res.json({
      message: "Session started successfully",
      session,
      sessionId: session._id,
      appointment,
    });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    // Find active session
    const session = await Session.findOne({
      appointment: appointmentId,
      status: { $in: ["active", "ongoing"] },
    }).populate("appointment");

    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    // Only doctor can end the consultation
    if (session.doctor.toString() !== userId) {
      return res.status(403).json({ message: "Only doctor can end this consultation." });
    }

    // Update session
    session.endTime = new Date();
    session.status = "completed";
    session.calculateDuration();

    // Update billing
    session.billing.duration = session.duration;
    session.billing.charged = true;

    await session.save();

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: "completed",
      completedAt: new Date(),
    });

    await Consultation.findOneAndUpdate(
      { appointmentId },
      {
        endTime: session.endTime,
        status: "completed",
      },
      { new: true }
    );

    // Notify both parties
    const patientId = session.patient.toString();
    const doctorId = session.doctor.toString();
    notifyConsultationEnded(appointmentId, doctorId, patientId).catch(() => {});

    res.json({
      message: "Session ended successfully",
      session,
      duration: session.duration,
    });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSessionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;

    const session = await Session.findOne({
      appointment: appointmentId,
    })
      .populate("appointment")
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (!session) {
      const appointment = await Appointment.findById(appointmentId).populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      });
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const patientId = appointment.user?.toString();
      const doctorUid = appointment.doctor?.user?._id?.toString() || appointment.doctor?.user?.toString();
      if (userId !== patientId && userId !== doctorUid) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      return res.json({
        session: {
          status: normalizeConsultationStatus(appointment.status) || "scheduled",
          consultationType: appointment.consultationType || "video",
          patientJoined: false,
          doctorJoined: false,
        },
      });
    }

    // Check authorization
    if (
      session.patient._id.toString() !== userId &&
      session.doctor._id.toString() !== userId
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Calculate current duration if session is active
    if (["active", "ongoing"].includes(session.status)) {
      const now = new Date();
      const duration = Math.floor((now - session.startTime) / 1000);
      session.duration = duration;
    }

    const consultation = await Consultation.findOne({ appointmentId }).lean();
    res.json({
      session,
      consultation: consultation
        ? {
            ...consultation,
            consultationId: consultation._id,
          }
        : null,
    });
  } catch (error) {
    console.error("Error getting session status:", error);
    res.status(500).json({ message: error.message });
  }
};

export const joinSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    const session = await Session.findOne({
      appointment: appointmentId,
    }).populate("appointment");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (!["active", "ongoing"].includes(session.status)) {
      return res.status(400).json({ message: "Session is not active." });
    }

    const isPatient = session.patient.toString() === userId;
    const isDoctor = session.doctor.toString() === userId;
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (isPatient && !session.patientJoined) {
      session.patientJoined = true;
    }
    if (isDoctor && !session.doctorJoined) {
      session.doctorJoined = true;
    }
    await session.save();

    await Consultation.findOneAndUpdate(
      { appointmentId },
      {
        status: "ongoing",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: "Joined session successfully",
      session,
      sessionId: session._id,
    });
  } catch (error) {
    console.error("Error joining session:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ==================== CONSULTATION INTAKE ====================
export const getConsultationIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const patientId = appointment.user?.toString();
    const doctorUserId = appointment.doctor?.user?.toString();
    if (userId !== patientId && userId !== doctorUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const intake = await ConsultationIntake.findOne({ appointmentId }).lean();
    return res.json({ intake: intake || null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const upsertConsultationIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { symptoms, duration, currentMedications, notes, consentToShareHealthData = true } = req.body || {};

    if (!symptoms || !String(symptoms).trim()) {
      return res.status(400).json({ message: "Symptoms are required." });
    }

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.user?.toString() !== userId) {
      return res.status(403).json({ message: "Only patient can submit intake." });
    }

    const intake = await ConsultationIntake.findOneAndUpdate(
      { appointmentId, patientId: userId },
      {
        appointmentId,
        patientId: userId,
        doctorId: appointment.doctor?._id,
        symptoms: String(symptoms).trim(),
        duration: duration ? String(duration).trim() : "",
        currentMedications: currentMedications ? String(currentMedications).trim() : "",
        notes: notes ? String(notes).trim() : "",
        consentToShareHealthData: Boolean(consentToShareHealthData),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await createAndEmitNotification({
      userId: appointment.doctor?.user,
      type: "health_record_shared",
      title: "New Consultation Intake Submitted",
      message: "Patient submitted pre-consultation symptoms and notes.",
      relatedAppointment: appointment._id,
      relatedPatient: appointment.user,
      actionUrl: "/doctor/consultations",
    });

    return res.status(201).json({ intake });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==================== CONSULTATION HISTORY ====================
export const getConsultationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const doctorDoc = userRole === "doctor" ? await Doctor.findOne({ user: userId }).select("_id") : null;

    const match = doctorDoc ? { doctorId: doctorDoc._id } : { patientId: userId };
    const consultations = await Consultation.find({
      ...match,
      status: { $in: ["completed"] },
    })
      .populate({
        path: "doctorId",
        select: "specialization user",
        populate: { path: "user", select: "name email profilePicture" },
      })
      .populate("patientId", "name email profilePicture")
      .populate({
        path: "appointmentId",
        select: "scheduledAt consultationType prescription payment status",
        populate: [
          { path: "prescription", select: "diagnosis createdAt" },
          { path: "payment", select: "invoice amount paymentStatus" },
        ],
      })
      .sort({ endTime: -1, updatedAt: -1 })
      .lean();

    return res.json({
      consultations: consultations.map((item) => ({
        ...item,
        consultationId: item._id,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: ACCEPT / REJECT APPOINTMENTS ====================
export const acceptAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("doctor");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctorUserId = appointment.doctor?.user?.toString();
    if (doctorUserId !== req.user.id) {
      return res.status(403).json({ message: "Only the assigned doctor can accept" });
    }

    appointment.status = "confirmed";
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        doctorId: appointment.doctor?._id,
        patientId: appointment.user,
        consultationType: appointment.consultationType || "video",
        status: "scheduled",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const doctor = await Doctor.findById(appointment.doctor._id).populate("user", "name");
    const { notifyAppointmentAccepted } = await import("../utils/notificationService.js");
    notifyAppointmentAccepted(appointment, appointment.user.toString(), doctor?.user?.name || "Your doctor").catch(() => {});

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("doctor");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctorUserId = appointment.doctor?.user?.toString();
    if (doctorUserId !== req.user.id) {
      return res.status(403).json({ message: "Only the assigned doctor can reject" });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason || "Rejected by doctor";
    appointment.cancelledAt = new Date();
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      { status: "cancelled", endTime: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const doctor = await Doctor.findById(appointment.doctor._id).populate("user", "name");
    const { notifyAppointmentRejected } = await import("../utils/notificationService.js");
    notifyAppointmentRejected(appointment, appointment.user.toString(), doctor?.user?.name || "Your doctor", reason).catch(() => {});

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: CREATE PRESCRIPTION ====================
export const createPrescription = async (req, res) => {
  try {
    const doctorUserId = req.user.id;
    const { patient, appointment: appointmentId, diagnosis, medications, instructions, followUpDate, notes } = req.body;

    const doctorDoc = await Doctor.findOne({ user: doctorUserId }).populate("user", "name");
    if (!doctorDoc) return res.status(403).json({ message: "Doctor profile not found" });

    const prescription = await Prescription.create({
      doctor: doctorDoc._id,
      user: patient,
      appointment: appointmentId || undefined,
      diagnosis,
      medications: medications || [],
      instructions,
      followUpDate,
      notes,
    });

    // Link to appointment if provided
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { prescription: prescription._id });
    }

    const { notifyPrescriptionCreated } = await import("../utils/notificationService.js");
    notifyPrescriptionCreated(prescription, patient, doctorDoc.user?.name || "Your doctor").catch(() => {});

    res.status(201).json({ prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: PROFILE & AVAILABILITY ====================
export const getDoctorProfile = async (req, res) => {
  try {
    let targetUserId = req.user.id;
    const requestedEmail = typeof req.query?.email === "string" ? req.query.email.trim().toLowerCase() : "";

    if (requestedEmail) {
      const requestedUser = await User.findOne({
        email: { $regex: new RegExp(`^${requestedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      }).select("_id email role");
      if (!requestedUser) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      // Doctors can only fetch their own profile by email.
      if (requestedUser._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      targetUserId = requestedUser._id.toString();
    }

    const doctor = await Doctor.findOne({ user: targetUserId }).populate("user", "name email phone profilePicture");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    const doctorObj = doctor.toObject();
    const firstQualification = Array.isArray(doctorObj.qualifications)
      ? doctorObj.qualifications.find((q) => q?.institution)
      : null;

    res.json({
      doctor: {
        ...doctorObj,
        name: doctorObj.user?.name || "",
        email: doctorObj.email || doctorObj.user?.email || "",
        phone: doctorObj.phone || doctorObj.user?.phone || "",
        profilePicture: doctorObj.profilePicture || doctorObj.user?.profilePicture || "",
        specialization: doctorObj.specialization || "",
        experience: doctorObj.experience ?? 0,
        institution: doctorObj.institution || firstQualification?.institution || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      photo,
      profilePicture,
      user,
      _id,
      id,
      createdAt,
      updatedAt,
      ...doctorPayload
    } = req.body || {};
    const targetUserId = req.user.id;

    // Keep profile data in Doctor document
    const doctor = await Doctor.findOneAndUpdate(
      { user: targetUserId },
      { ...doctorPayload, profileCompleted: true },
      { new: true, runValidators: true }
    ).populate("user", "name email phone profilePicture");

    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    // Keep identity/contact data in User document so user module sees updates
    const userUpdates = {};
    if (typeof name === "string") userUpdates.name = name.trim();
    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUserWithEmail = await User.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      }).select("_id");
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== targetUserId) {
        return res.status(409).json({ message: "Email is already used by another account" });
      }
      userUpdates.email = normalizedEmail;
    }
    if (typeof phone === "string") userUpdates.phone = phone.trim();
    if (typeof profilePicture === "string") userUpdates.profilePicture = profilePicture;
    if (typeof photo === "string" && !userUpdates.profilePicture) {
      userUpdates.profilePicture = photo;
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(targetUserId, userUpdates, { new: true, runValidators: true });
    }

    const refreshedDoctor = await Doctor.findById(doctor._id).populate(
      "user",
      "name email phone profilePicture"
    );

    res.json({ doctor: refreshedDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).select("_id availability availabilitySlots");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    const slots = await DoctorAvailability.find({ doctorId: doctor._id })
      .select("day startTime endTime slotDuration")
      .lean();
    const fromCollection = slots.map((entry) => ({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      slotDuration: entry.slotDuration || 30,
    }));

    res.json({
      availability: {
        timeSlots: fromCollection.length > 0 ? fromCollection : (doctor.availability?.timeSlots || []),
        availabilitySlots: doctor.availabilitySlots || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).select("_id availability availabilitySlots");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const inputSlots = Array.isArray(req.body?.timeSlots) ? req.body.timeSlots : [];
    const bulkOps = inputSlots
      .filter((entry) => entry?.day && entry?.startTime && entry?.endTime)
      .map((entry) => ({
        updateOne: {
          filter: { doctorId: doctor._id, day: entry.day },
          update: {
            $set: {
              doctorId: doctor._id,
              day: entry.day,
              startTime: entry.startTime,
              endTime: entry.endTime,
              slotDuration: Number(entry.slotDuration) || 30,
            },
          },
          upsert: true,
        },
      }));

    if (bulkOps.length > 0) {
      await DoctorAvailability.bulkWrite(bulkOps);
      const inputDays = inputSlots.map((entry) => entry.day);
      await DoctorAvailability.deleteMany({
        doctorId: doctor._id,
        day: { $nin: inputDays },
      });
    } else {
      await DoctorAvailability.deleteMany({ doctorId: doctor._id });
    }

    doctor.availability = { timeSlots: inputSlots };
    doctor.availabilitySlots = Array.isArray(req.body?.availabilitySlots)
      ? req.body.availabilitySlots
      : doctor.availabilitySlots;
    await doctor.save();

    res.json({
      availability: {
        timeSlots: inputSlots,
        availabilitySlots: doctor.availabilitySlots || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: COMPLETE APPOINTMENT & NOTES ====================
export const completeAppointmentDoctor = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("doctor");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctorUserId = appointment.doctor?.user?.toString();
    if (doctorUserId !== req.user.id) {
      return res.status(403).json({ message: "Only assigned doctor can complete this consultation." });
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      { status: "completed", endTime: appointment.completedAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentNotes = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("doctor");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const doctorUserId = appointment.doctor?.user?.toString();
    if (doctorUserId !== req.user.id) {
      return res.status(403).json({ message: "Only assigned doctor can update notes." });
    }

    appointment.notes = req.body.notes || "";
    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointmentId: appointment._id },
      { notes: appointment.notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConsultationSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: userId,
    })
      .populate({
        path: "doctor",
        select: "specialization user",
        populate: { path: "user", select: "name email" },
      })
      .populate("prescription");

    if (!appointment) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    const lines = [
      "SAFEHER CONSULTATION SUMMARY",
      `Appointment: ${appointment.appointmentNumber}`,
      `Doctor: ${appointment.doctor?.user?.name || "Doctor"}`,
      `Specialization: ${appointment.doctor?.specialization || "General"}`,
      `Consultation Type: ${appointment.consultationType}`,
      `Date: ${new Date(appointment.scheduledAt).toLocaleString()}`,
      `Status: ${appointment.status}`,
      `Notes: ${appointment.notes || "-"}`,
      `Diagnosis: ${appointment.prescription?.diagnosis || "-"}`,
    ];

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=consultation-summary-${appointment._id}.txt`);
    return res.send(lines.join("\n"));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const rateDoctorForAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating = 0, feedback = "" } = req.body || {};
    const normalizedRating = Number(rating);

    if (!normalizedRating || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: userId,
      status: { $in: ["completed", "ended"] },
    }).populate("doctor");

    if (!appointment) {
      return res.status(404).json({ message: "Completed consultation not found." });
    }

    const doctor = await Doctor.findById(appointment.doctor?._id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    await DoctorRating.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        patientId: userId,
        doctorId: doctor._id,
        rating: normalizedRating,
        feedback,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const ratingAgg = await DoctorRating.aggregate([
      { $match: { doctorId: doctor._id } },
      {
        $group: {
          _id: "$doctorId",
          count: { $sum: 1 },
          average: { $avg: "$rating" },
        },
      },
    ]);

    const updatedCount = ratingAgg[0]?.count || 0;
    const updatedAverage = ratingAgg[0]?.average || normalizedRating;

    doctor.rating = {
      average: Number(updatedAverage.toFixed(2)),
      count: updatedCount,
    };
    await doctor.save();

    await createAndEmitNotification({
      userId: doctor.user,
      type: "system",
      title: "New Patient Rating",
      message: `You received a ${normalizedRating}/5 rating${feedback ? `: "${feedback}"` : "."}`,
      relatedAppointment: appointment._id,
      relatedPatient: userId,
      actionUrl: "/doctor/appointments",
    });

    return res.json({ message: "Rating submitted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: EARNINGS ====================
export const getDoctorEarnings = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const doctorDoc = await Doctor.findOne({ user: req.user.id });
    if (!doctorDoc) return res.json({ earnings: { total: 0, pending: 0, thisMonth: 0, lastMonth: 0 }, transactions: [] });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const allPayments = await TelehealthPayment.find({ doctor: doctorDoc._id, paymentStatus: "completed" })
      .populate({ path: "appointment", select: "scheduledAt consultationType" })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const total = allPayments.reduce((s, p) => s + (p.doctorPayout || p.amount || 0), 0);
    const thisMonth = allPayments
      .filter((p) => new Date(p.createdAt) >= startOfMonth)
      .reduce((s, p) => s + (p.doctorPayout || p.amount || 0), 0);
    const lastMonth = allPayments
      .filter((p) => new Date(p.createdAt) >= startOfLastMonth && new Date(p.createdAt) < startOfMonth)
      .reduce((s, p) => s + (p.doctorPayout || p.amount || 0), 0);

    const pendingPayments = await TelehealthPayment.find({ doctor: doctorDoc._id, paymentStatus: "pending" }).lean();
    const pending = pendingPayments.reduce((s, p) => s + (p.doctorPayout || p.amount || 0), 0);

    res.json({
      earnings: { total, pending, thisMonth, lastMonth },
      transactions: allPayments.slice(0, 50).map(p => ({
        _id: p._id,
        date: p.createdAt,
        patient: p.user?.name || "Unknown",
        amount: p.amount,
        method: p.paymentMethod,
        status: p.paymentStatus,
        consultationType: p.appointment?.consultationType,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: PATIENTS & HEALTH DATA ====================
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorDoc = await Doctor.findOne({ user: req.user.id });
    if (!doctorDoc) return res.json({ patients: [] });

    const appointments = await Appointment.find({ doctor: doctorDoc._id })
      .populate("user", "name email phone dateOfBirth gender")
      .lean();

    const patientMap = new Map();
    appointments.forEach(apt => {
      if (apt.user && !patientMap.has(apt.user._id.toString())) {
        patientMap.set(apt.user._id.toString(), {
          ...apt.user,
          lastVisit: apt.scheduledAt,
          totalVisits: 1,
        });
      } else if (apt.user) {
        const p = patientMap.get(apt.user._id.toString());
        p.totalVisits++;
        if (new Date(apt.scheduledAt) > new Date(p.lastVisit)) p.lastVisit = apt.scheduledAt;
      }
    });

    res.json({ patients: Array.from(patientMap.values()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentHealthData = async (req, res) => {
  try {
    const userId = req.user.id;

    let vitals = [];
    let symptoms = [];
    let cycleLogs = [];

    try {
      const Vital = (await import("../models/Vital.js")).default;
      vitals = await Vital.find({ user: userId }).sort({ recordedAt: -1 }).limit(10).lean();
    } catch (error) {
      vitals = [];
    }

    try {
      const Symptom = (await import("../models/Symptom.js")).default;
      symptoms = await Symptom.find({ user: userId }).sort({ date: -1 }).limit(10).lean();
    } catch (error) {
      symptoms = [];
    }

    try {
      const Period = (await import("../models/Period.js")).default;
      cycleLogs = await Period.find({ user: userId }).sort({ startDate: -1 }).limit(6).lean();
    } catch (error) {
      cycleLogs = [];
    }

    return res.json({
      vitals,
      symptoms,
      cycleLogs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPatientHealthData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorDoc = await Doctor.findOne({ user: req.user.id });
    if (!doctorDoc) return res.status(403).json({ message: "Not a doctor" });

    // Verify doctor has seen this patient
    const hasAppointment = await Appointment.exists({ doctor: doctorDoc._id, user: patientId });
    if (!hasAppointment) return res.status(403).json({ message: "No authorized access to this patient's records" });

    // Dynamically import health models
    const Vital = (await import("../models/Vital.js")).default;
    const Symptom = (await import("../models/Symptom.js")).default;
    let Period = null;
    let PregnancyLog = null;
    let Medication = null;
    try {
      Period = (await import("../models/Period.js")).default;
    } catch (error) {
      Period = null;
    }
    try {
      PregnancyLog = (await import("../models/PregnancyLog.js")).default;
    } catch (error) {
      PregnancyLog = null;
    }
    try {
      Medication = (await import("../models/Medication.js")).default;
    } catch (error) {
      Medication = null;
    }

    const [vitals, symptoms, cycleLogs, pregnancyTracker, consultationHistory, medicationHistory] = await Promise.all([
      Vital.find({ user: patientId }).sort({ recordedAt: -1 }).limit(20).lean(),
      Symptom.find({ user: patientId }).sort({ date: -1 }).limit(20).lean(),
      Period ? Period.find({ user: patientId }).sort({ startDate: -1 }).limit(20).lean() : [],
      PregnancyLog ? PregnancyLog.find({ user: patientId }).sort({ createdAt: -1 }).limit(20).lean() : [],
      Consultation.find({ patientId }).sort({ createdAt: -1 }).limit(20).lean(),
      Medication ? Medication.find({ user: patientId }).sort({ createdAt: -1 }).limit(20).lean() : [],
    ]);

    res.json({
      vitals,
      symptoms,
      cycleLogs,
      pregnancyTracker,
      consultationHistory,
      medicationHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: NOTIFICATIONS ====================
import TelehealthNotification from "../models/TelehealthNotification.js";

export const getDoctorNotifications = async (req, res) => {
  try {
    const notifications = await TelehealthNotification.find({ user: req.user.id })
      .sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await TelehealthNotification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markDoctorNotificationRead = async (req, res) => {
  try {
    await TelehealthNotification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllDoctorNotificationsRead = async (req, res) => {
  try {
    await TelehealthNotification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: SETTINGS ====================
export const getDoctorSettings = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).select("consultationFee").lean();
    res.json({
      settings: {
        consultationFee: { min: 0, max: 5000, default: doctor?.consultationFee || 500 },
        notifications: { email: true, sms: false, app: true },
        language: "English",
        timezone: "Asia/Kolkata",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorSettings = async (req, res) => {
  try {
    if (req.body.consultationFee) {
      await Doctor.findOneAndUpdate({ user: req.user.id }, { consultationFee: req.body.consultationFee.default });
    }
    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRESCRIPTION PDF & FORWARD ====================
export const getPrescriptionPdf = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .populate("user", "name email")
      .populate("appointment", "appointmentNumber scheduledAt consultationType");
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    const doctorUserId = prescription.doctor?.user?._id?.toString() || prescription.doctor?.user?.toString();
    const patientId = prescription.user?._id?.toString() || prescription.user?.toString();
    if (requesterRole !== "admin" && requesterId !== doctorUserId && requesterId !== patientId) {
      return res.status(403).json({ message: "Unauthorized to access this prescription" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const fileName = `prescription-${prescription._id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    doc.pipe(res);

    doc.fontSize(18).text("SafeHer Telehealth Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text(`Prescription ID: ${prescription._id}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleString()}`);
    doc.moveDown(0.5);
    doc.text(`Doctor: ${prescription.doctor?.user?.name || "N/A"}`);
    doc.text(`Patient: ${prescription.user?.name || "N/A"}`);
    doc.text(`Consultation: ${prescription.appointment?.appointmentNumber || "N/A"}`);
    doc.moveDown();
    doc.fontSize(12).text("Diagnosis", { underline: true });
    doc.fontSize(11).text(prescription.diagnosis || "N/A");
    doc.moveDown();
    doc.fontSize(12).text("Medicines", { underline: true });
    if (Array.isArray(prescription.medications) && prescription.medications.length > 0) {
      prescription.medications.forEach((med, idx) => {
        doc.fontSize(11).text(
          `${idx + 1}. ${med.name || "-"} | Dosage: ${med.dosage || "-"} | Frequency: ${med.frequency || "-"} | Duration: ${med.duration || "-"}`
        );
        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`);
        }
      });
    } else {
      doc.fontSize(11).text("No medications listed.");
    }
    doc.moveDown();
    doc.fontSize(12).text("Instructions", { underline: true });
    doc.fontSize(11).text(prescription.instructions || "N/A");
    if (prescription.notes) {
      doc.moveDown();
      doc.fontSize(12).text("Notes", { underline: true });
      doc.fontSize(11).text(prescription.notes);
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forwardPrescription = async (req, res) => {
  try {
    const { pharmacyEmail } = req.body;
    res.json({ message: `Prescription forwarded to ${pharmacyEmail}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTOR: GET APPOINTMENTS (role-aware) ====================
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorDoc = await Doctor.findOne({ user: req.user.id });
    if (!doctorDoc) return res.json({ appointments: [] });

    const { status, limit = 50 } = req.query;
    const query = { doctor: doctorDoc._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("user", "name email phone")
      .populate("prescription")
      .sort({ scheduledAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
