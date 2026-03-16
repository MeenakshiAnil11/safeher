// backend/controllers/partnerDashboardController.js
import PartnerAccess from "../models/PartnerAccess.js";
import PregnancyLog from "../models/PregnancyLog.js";
import Appointment from "../models/Appointment.js";
import WeeklyMessage from "../models/WeeklyMessage.js";
import crypto from "crypto";

// Get partner dashboard data
export const getPartnerDashboard = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Access token is required" 
      });
    }

    // Find partner access record
    const partnerAccess = await PartnerAccess.findOne({ 
      accessToken: token, 
      isActive: true 
    });

    if (!partnerAccess) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid or expired access token" 
      });
    }

    // Update last accessed
    partnerAccess.lastAccessed = new Date();
    await partnerAccess.save();

    // Get shared data based on permissions
    const sharedData = await getSharedData(partnerAccess.user, partnerAccess.permissions);
    
    // Get notifications
    const notifications = await getNotifications(partnerAccess.user);

    res.json({ 
      success: true, 
      partnerData: {
        name: partnerAccess.partnerName,
        email: partnerAccess.partnerEmail
      },
      sharedData,
      notifications
    });
  } catch (error) {
    console.error("Get partner dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch partner dashboard" });
  }
};

// Create partner access token
export const createPartnerAccess = async (req, res) => {
  try {
    const { partnerName, partnerEmail, permissions, expiresInDays } = req.body;
    
    // Generate unique access token
    const accessToken = generateAccessToken();
    
    // Calculate expiration date
    const expiresAt = expiresInDays ? 
      new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : 
      null;

    const partnerAccess = await PartnerAccess.create({
      user: req.userId,
      accessToken,
      partnerName,
      partnerEmail,
      permissions: permissions || {
        viewProgress: true,
        viewLogs: true,
        viewAppointments: true,
        viewMessages: true,
        receiveNotifications: true
      },
      expiresAt
    });

    res.status(201).json({ success: true, partnerAccess });
  } catch (error) {
    console.error("Create partner access error:", error);
    res.status(500).json({ success: false, message: "Failed to create partner access" });
  }
};

// Update partner access permissions
export const updatePartnerAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, isActive } = req.body;

    const partnerAccess = await PartnerAccess.findOneAndUpdate(
      { _id: id, user: req.userId },
      { permissions, isActive },
      { new: true }
    );

    if (!partnerAccess) {
      return res.status(404).json({ 
        success: false, 
        message: "Partner access not found" 
      });
    }

    res.json({ success: true, partnerAccess });
  } catch (error) {
    console.error("Update partner access error:", error);
    res.status(500).json({ success: false, message: "Failed to update partner access" });
  }
};

// Delete partner access
export const deletePartnerAccess = async (req, res) => {
  try {
    const { id } = req.params;
    
    const partnerAccess = await PartnerAccess.findOneAndDelete({
      _id: id,
      user: req.userId
    });
    
    if (!partnerAccess) {
      return res.status(404).json({ 
        success: false, 
        message: "Partner access not found" 
      });
    }
    
    res.json({ success: true, message: "Partner access deleted successfully" });
  } catch (error) {
    console.error("Delete partner access error:", error);
    res.status(500).json({ success: false, message: "Failed to delete partner access" });
  }
};

// Get shared data based on permissions
async function getSharedData(userId, permissions) {
  const sharedData = {};

  // Get pregnancy progress
  if (permissions.viewProgress) {
    const latestLog = await PregnancyLog.findOne({ user: userId })
      .sort({ date: -1 })
      .lean();

    if (latestLog) {
      sharedData.pregnancyProgress = {
        currentWeek: latestLog.week,
        trimester: latestLog.trimester,
        dueDate: calculateDueDate(latestLog.date, latestLog.week),
        daysRemaining: calculateDaysRemaining(latestLog.date, latestLog.week)
      };
    }
  }

  // Get recent logs
  if (permissions.viewLogs) {
    const recentLogs = await PregnancyLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(5)
      .select('date week trimester mood notes symptoms')
      .lean();

    sharedData.recentLogs = recentLogs.map(log => ({
      date: log.date,
      type: 'health',
      data: log.notes || 'Health log entry',
      mood: log.mood || 'neutral'
    }));
  }

  // Get upcoming appointments
  if (permissions.viewAppointments) {
    const upcomingAppointments = await Appointment.find({ 
      user: userId,
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(5)
      .lean();

    sharedData.upcomingEvents = upcomingAppointments.map(appointment => ({
      id: appointment._id,
      type: 'appointment',
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location
    }));
  }

  // Get weekly message
  if (permissions.viewMessages && sharedData.pregnancyProgress) {
    const weeklyMessage = await WeeklyMessage.findOne({
      week: sharedData.pregnancyProgress.currentWeek,
      isActive: true
    }).lean();

    if (weeklyMessage) {
      sharedData.weeklyMessage = weeklyMessage;
    }
  }

  return sharedData;
}

// Get notifications for partner
async function getNotifications(userId) {
  // This would typically fetch from a notifications collection
  // For demo purposes, we'll return mock notifications
  return [
    {
      id: 1,
      type: "milestone",
      title: "20-Week Milestone Reached!",
      message: "Sarah has reached the halfway point of her pregnancy journey.",
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: 2,
      type: "appointment",
      title: "Upcoming Appointment",
      message: "24-week checkup scheduled for February 1st at 10:00 AM.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false
    }
  ];
}

// Generate unique access token
function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Calculate due date (simplified)
function calculateDueDate(pregnancyStartDate, currentWeek) {
  const dueDate = new Date(pregnancyStartDate);
  dueDate.setDate(dueDate.getDate() + (40 - currentWeek) * 7);
  return dueDate.toISOString().split('T')[0];
}

// Calculate days remaining
function calculateDaysRemaining(pregnancyStartDate, currentWeek) {
  const dueDate = new Date(pregnancyStartDate);
  dueDate.setDate(dueDate.getDate() + (40 - currentWeek) * 7);
  const today = new Date();
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
