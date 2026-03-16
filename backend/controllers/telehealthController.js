import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import TelehealthPayment from "../models/TelehealthPayment.js";
import User from "../models/User.js";
import TelehealthSetting from "../models/TelehealthSetting.js";
import Session from "../models/Session.js";

// ==================== DASHBOARD ====================
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalDoctors,
      activeDoctors,
      pendingDoctors,
      totalUsers,
      activeUsers,
      upcomingAppointments,
      completedConsultations,
      pendingAppointments,
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ status: "approved" }),
      Doctor.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isActive: true }),
      Appointment.countDocuments({
        status: { $in: ["pending", "confirmed"] },
        scheduledAt: { $gte: new Date() },
      }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "pending" }),
      TelehealthPayment.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      TelehealthPayment.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      TelehealthPayment.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      TelehealthPayment.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // Get consultation trends
    const consultationTrends = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get revenue trends
    const revenueTrends = await TelehealthPayment.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get pending approvals and disputes
    const pendingApprovals = await Doctor.countDocuments({ status: "pending" });
    const disputes = await Appointment.countDocuments({ disputeStatus: "pending" });

    res.json({
      metrics: {
        totalDoctors,
        activeDoctors,
        pendingDoctors,
        totalUsers,
        activeUsers,
        upcomingAppointments,
        completedConsultations,
        pendingAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        dailyRevenue: dailyRevenue[0]?.total || 0,
      },
      trends: {
        consultations: consultationTrends,
        revenue: revenueTrends,
      },
      notifications: {
        pendingApprovals,
        disputes,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getLiveConsultations = async (req, res) => {
  try {
    const liveSessions = await Session.find({
      status: { $in: ["active", "ongoing"] },
    })
      .populate("appointment", "appointmentNumber scheduledAt consultationType status")
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ startTime: -1 })
      .lean();

    const waitingSessions = await Session.find({
      status: { $in: ["scheduled", "waiting"] },
    })
      .populate("appointment", "appointmentNumber scheduledAt consultationType status")
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const now = Date.now();
    const mapSession = (session) => {
      const elapsedSeconds = session.startTime ? Math.max(0, Math.floor((now - new Date(session.startTime).getTime()) / 1000)) : 0;
      const sessionHealth = session.doctorJoined && session.patientJoined
        ? "connected"
        : session.doctorJoined
          ? "waiting_for_patient"
          : session.patientJoined
            ? "waiting_for_doctor"
            : "not_joined";
      return {
        _id: session._id,
        status: session.status,
        startTime: session.startTime,
        elapsedSeconds,
        consultationType: session.consultationType,
        doctorJoined: Boolean(session.doctorJoined),
        patientJoined: Boolean(session.patientJoined),
        sessionHealth,
        meetingId: session.meetingId || "",
        appointment: session.appointment || null,
        patient: session.patient || null,
        doctor: session.doctor || null,
      };
    };

    const active = liveSessions.map(mapSession);
    const queue = waitingSessions.map(mapSession);

    return res.json({
      metrics: {
        activeCount: active.length,
        waitingCount: queue.length,
        bothJoinedCount: active.filter((item) => item.doctorJoined && item.patientJoined).length,
      },
      active,
      queue,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("getLiveConsultations error:", error);
    return res.status(500).json({ message: "Failed to fetch live consultations" });
  }
};

// ==================== DOCTOR MANAGEMENT ====================
export const getDoctors = async (req, res) => {
  try {
    const { status, specialization, location, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (specialization) query.specialization = new RegExp(specialization, "i");
    if (location) {
      query.$or = [
        { "location.city": new RegExp(location, "i") },
        { "location.state": new RegExp(location, "i") },
      ];
    }
    if (search) {
      query.$or = [
        ...(query.$or || []),
        { specialization: new RegExp(search, "i") },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doctors = await Doctor.find(query)
      .populate("user", "name email phone")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getDoctors error:", error);
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id)
      .populate("user", "name email phone dateOfBirth")
      .populate("approvedBy", "name")
      .lean();

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Get doctor's appointments stats
    const stats = await Appointment.aggregate([
      { $match: { doctor: doctor._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ doctor, stats });
  } catch (error) {
    console.error("getDoctorById error:", error);
    res.status(500).json({ message: "Failed to fetch doctor" });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "approved";
    doctor.approvedAt = new Date();
    doctor.approvedBy = req.userId;
    await doctor.save();

    res.json({ message: "Doctor approved successfully", doctor });
  } catch (error) {
    console.error("approveDoctor error:", error);
    res.status(500).json({ message: "Failed to approve doctor" });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "rejected";
    doctor.rejectionReason = reason;
    await doctor.save();

    res.json({ message: "Doctor rejected successfully", doctor });
  } catch (error) {
    console.error("rejectDoctor error:", error);
    res.status(500).json({ message: "Failed to reject doctor" });
  }
};

export const suspendDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "suspended";
    doctor.suspendedReason = reason;
    doctor.suspendedAt = new Date();
    await doctor.save();

    res.json({ message: "Doctor suspended successfully", doctor });
  } catch (error) {
    console.error("suspendDoctor error:", error);
    res.status(500).json({ message: "Failed to suspend doctor" });
  }
};

export const reactivateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "approved";
    doctor.suspendedReason = undefined;
    doctor.suspendedAt = undefined;
    await doctor.save();

    res.json({ message: "Doctor reactivated successfully", doctor });
  } catch (error) {
    console.error("reactivateDoctor error:", error);
    res.status(500).json({ message: "Failed to reactivate doctor" });
  }
};

// ==================== APPOINTMENT MANAGEMENT ====================
export const getAppointments = async (req, res) => {
  try {
    const {
      doctor,
      user,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (doctor) query.doctor = doctor;
    if (user) query.user = user;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate("user", "name email phone")
      .populate("doctor", "specialization")
      .populate("doctor.user", "name")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getAppointments error:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("user", "name email phone")
      .populate("doctor")
      .populate("doctor.user", "name email")
      .populate("prescription")
      .populate("payment")
      .lean();

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ appointment });
  } catch (error) {
    console.error("getAppointmentById error:", error);
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.scheduledAt = new Date(scheduledAt);
    appointment.status = "confirmed";
    await appointment.save();

    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    console.error("rescheduleAppointment error:", error);
    res.status(500).json({ message: "Failed to reschedule appointment" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = "admin";
    appointment.cancellationReason = reason;
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error("cancelAppointment error:", error);
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, refundAmount } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.disputeStatus = "resolved";
    appointment.resolvedBy = req.userId;
    await appointment.save();

    // If refund is approved, process it
    if (refundAmount > 0 && appointment.payment) {
      const payment = await TelehealthPayment.findById(appointment.payment);
      if (payment) {
        payment.refundRequest.status = "approved";
        payment.refundRequest.refundAmount = refundAmount;
        payment.refundRequest.processedAt = new Date();
        payment.paymentStatus = "refunded";
        await payment.save();
      }
    }

    res.json({ message: "Dispute resolved successfully", appointment });
  } catch (error) {
    console.error("resolveDispute error:", error);
    res.status(500).json({ message: "Failed to resolve dispute" });
  }
};

// ==================== PAYMENT & REFUNDS ====================
export const getPayments = async (req, res) => {
  try {
    const {
      doctor,
      user,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (doctor) query.doctor = doctor;
    if (user) query.user = user;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await TelehealthPayment.find(query)
      .populate("user", "name email")
      .populate("doctor", "specialization")
      .populate("doctor.user", "name")
      .populate("appointment", "appointmentNumber scheduledAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await TelehealthPayment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getPayments error:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: "approve" or "reject"

    const payment = await TelehealthPayment.findById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (action === "approve") {
      payment.refundRequest.status = "approved";
      payment.refundRequest.processedAt = new Date();
      payment.refundRequest.refundAmount = payment.amount;
      payment.paymentStatus = "refunded";
    } else if (action === "reject") {
      payment.refundRequest.status = "rejected";
      payment.refundRequest.processedAt = new Date();
    }

    await payment.save();

    res.json({ message: `Refund ${action}d successfully`, payment });
  } catch (error) {
    console.error("processRefund error:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
};

// ==================== REPORTS & ANALYTICS ====================
export const getConsultationReports = async (req, res) => {
  try {
    const { doctor, specialization, startDate, endDate } = req.query;

    const matchQuery = { status: "completed" };
    if (doctor) matchQuery.doctor = doctor;
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const consultations = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      { $unwind: "$doctorInfo" },
      {
        $group: {
          _id: "$doctor",
          doctorName: { $first: "$doctorInfo.specialization" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ consultations });
  } catch (error) {
    console.error("getConsultationReports error:", error);
    res.status(500).json({ message: "Failed to fetch consultation reports" });
  }
};

export const getRevenueReports = async (req, res) => {
  try {
    const { doctor, specialization, startDate, endDate, groupBy } = req.query;

    const matchQuery = { paymentStatus: "completed" };
    if (doctor) matchQuery.doctor = doctor;
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const groupFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const revenue = await TelehealthPayment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ revenue });
  } catch (error) {
    console.error("getRevenueReports error:", error);
    res.status(500).json({ message: "Failed to fetch revenue reports" });
  }
};

export const getDoctorPerformance = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" })
      .populate("user", "name")
      .lean();

    const performance = await Promise.all(
      doctors.map(async (doctor) => {
        const [appointments, revenue] = await Promise.all([
          Appointment.countDocuments({ doctor: doctor._id, status: "completed" }),
          TelehealthPayment.aggregate([
            {
              $match: {
                doctor: doctor._id,
                paymentStatus: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ]);

        return {
          doctor: {
            id: doctor._id,
            name: doctor.user?.name || "N/A",
            specialization: doctor.specialization,
          },
          consultations: appointments,
          revenue: revenue[0]?.total || 0,
          rating: doctor.rating?.average || 0,
        };
      })
    );

    res.json({ performance });
  } catch (error) {
    console.error("getDoctorPerformance error:", error);
    res.status(500).json({ message: "Failed to fetch doctor performance" });
  }
};

// ==================== PRESCRIPTIONS ====================
export const getPrescriptions = async (req, res) => {
  try {
    const { user, doctor, page = 1, limit = 10 } = req.query;

    const query = {};
    if (user) query.user = user;
    if (doctor) query.doctor = doctor;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prescriptions = await Prescription.find(query)
      .populate("user", "name email")
      .populate("doctor", "specialization")
      .populate("doctor.user", "name")
      .populate("appointment", "appointmentNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getPrescriptions error:", error);
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
};

// ==================== SETTINGS ====================
export const getSettings = async (req, res) => {
  try {
    const commissionSetting = await TelehealthSetting.findOne({ key: "platformCommissionPercent" }).lean();
    const commissionPercent = Number(commissionSetting?.value ?? 12);
    const settings = {
      platformCommissionPercent: commissionPercent,
      consultationFeeMin: 100,
      consultationFeeMax: 5000,
      refundPolicy: "Full refund within 24 hours of cancellation",
      notificationTemplates: {
        appointmentConfirmed: "Your appointment has been confirmed for {date} at {time}",
        appointmentReminder: "Reminder: Your appointment is scheduled for {date} at {time}",
        prescriptionReady: "Your prescription is ready. Please check your account.",
      },
      languageSupport: ["English", "Hindi"],
      timezone: "Asia/Kolkata",
      emergencyHelpline: {
        enabled: true,
        number: "+91-1800-XXX-XXXX",
      },
    };
    res.json(settings);
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    if (typeof settings.platformCommissionPercent === "number") {
      await TelehealthSetting.findOneAndUpdate(
        { key: "platformCommissionPercent" },
        {
          key: "platformCommissionPercent",
          value: settings.platformCommissionPercent,
          updatedBy: req.userId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("updateSettings error:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};
