import User from "../models/User.js";
import SOSLog from "../models/SOSLogs.js"; // fix import name to match file
import Helpline from "../models/Helpline.js";
import Resource from "../models/Resource.js";
import Feedback from "../models/Feedback.js";
import Event from "../models/Event.js";
import ExternalDirectory from "../models/ExternalDirectory.js";
import Quiz from "../models/Quiz.js";
import Vital from "../models/Vital.js";
import Symptom from "../models/Symptom.js";
import Period from "../models/Period.js";
import Vaccination from "../models/Vaccination.js";
import Record from "../models/Record.js";
import MoodLog from "../models/MoodLog.js";
import Exercise from "../models/Exercise.js";
import Sleep from "../models/Sleep.js";
import Nutrition from "../models/Nutrition.js";
import UserExerciseLog from "../models/UserExerciseLog.js";
import ExerciseReminder from "../models/ExerciseReminder.js";
import ExerciseChallenge from "../models/ExerciseChallenge.js";

import crypto from "crypto";

/** ───────────── USERS ───────────── **/

// List all users with optional filters
export const listUsers = async (req, res) => {
  try {
    const { q, role, active, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") },
      ];
    }
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === "true";

    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// List all exercises with filters, pagination, search
export const listExercises = async (req, res) => {
  try {
    const { q, phase, category, difficulty, approved, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (q) {
      filter.name = new RegExp(q, "i");
    }
    if (phase) filter.phase = phase;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (approved !== undefined) filter.approved = approved === "true";

    const exercises = await Exercise.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Exercise.countDocuments(filter);
    res.json({ exercises, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list exercises" });
  }
};

// Get a single exercise by ID
export const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: "Exercise not found" });
    res.json({ exercise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get exercise" });
  }
};

// Create a new exercise
export const createExercise = async (req, res) => {
  try {
    const exerciseData = req.body;
    const exercise = await Exercise.create(exerciseData);
    res.status(201).json({ exercise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create exercise" });
  }
};

// Update an existing exercise
export const updateExercise = async (req, res) => {
  try {
    const exerciseData = req.body;
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, exerciseData, { new: true });
    if (!exercise) return res.status(404).json({ message: "Exercise not found" });
    res.json({ exercise });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update exercise" });
  }
};

// Delete an exercise
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: "Exercise not found" });
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: "Exercise deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete exercise" });
  }
};

// Approve a suggested exercise
export const approveExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: "Exercise not found" });
    exercise.approved = true;
    await exercise.save();
    res.json({ message: "Exercise approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve exercise" });
  }
};

// List user exercise logs with filters and pagination
export const listUserExerciseLogs = async (req, res) => {
  try {
    const {
      userId,
      exerciseId,
      from,
      to,
      phase,
      category,
      completionStatus,
      page = 1,
      limit = 25,
      q,
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (exerciseId) filter.exercise = exerciseId;
    if (phase) filter.phase = phase;
    if (category) filter.category = category;
    if (completionStatus) filter.completionStatus = completionStatus;
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    // If q is provided, search user by name or email
    let userIds = [];
    if (q) {
      const users = await User.find({
        $or: [
          { name: new RegExp(q, "i") },
          { email: new RegExp(q, "i") },
        ],
      }).select("_id");
      userIds = users.map(u => u._id);
      filter.user = { $in: userIds };
    }

    const logs = await UserExerciseLog.find(filter)
      .populate("user", "name email")
      .populate("exercise", "name phase category difficulty")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await UserExerciseLog.countDocuments(filter);

    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list user exercise logs" });
  }
};

// Export user exercise logs as CSV
export const exportUserExerciseLogsCSV = async (req, res) => {
  try {
    const {
      userId,
      exerciseId,
      from,
      to,
      phase,
      category,
      completionStatus,
      q,
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (exerciseId) filter.exercise = exerciseId;
    if (phase) filter.phase = phase;
    if (category) filter.category = category;
    if (completionStatus) filter.completionStatus = completionStatus;
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    // If q is provided, search user by name or email
    let userIds = [];
    if (q) {
      const users = await User.find({
        $or: [
          { name: new RegExp(q, "i") },
          { email: new RegExp(q, "i") },
        ],
      }).select("_id");
      userIds = users.map(u => u._id);
      filter.user = { $in: userIds };
    }

    const logs = await UserExerciseLog.find(filter)
      .populate("user", "name email")
      .populate("exercise", "name phase category difficulty")
      .sort({ date: -1 })
      .lean();

    const header = [
      "date",
      "userName",
      "userEmail",
      "exerciseName",
      "phase",
      "category",
      "difficulty",
      "completionStatus",
      "notes",
    ];

    const rows = logs.map((log) => [
      log.date.toISOString(),
      log.user?.name || "",
      log.user?.email || "",
      log.exercise?.name || "",
      log.phase || "",
      log.category || "",
      log.exercise?.difficulty || "",
      log.completionStatus || "",
      (log.notes || "").replace(/,/g, " "),
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="user-exercise-logs-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export user exercise logs" });
  }
};

// Delete a user exercise log
export const deleteUserExerciseLog = async (req, res) => {
  try {
    const log = await UserExerciseLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    await UserExerciseLog.findByIdAndDelete(req.params.id);
    res.json({ message: "Log deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user exercise log" });
  }
};

// Update a user exercise log (correction)
export const updateUserExerciseLog = async (req, res) => {
  try {
    const logData = req.body;
    const log = await UserExerciseLog.findByIdAndUpdate(req.params.id, logData, {
      new: true,
    });
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json({ log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user exercise log" });
  }
};

// Get exercise analytics
export const getExerciseAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const logs = await UserExerciseLog.find(filter)
      .populate("user", "name email")
      .populate("exercise", "name phase category difficulty")
      .lean();

    const totalLogs = logs.length;
    const uniqueUsers = new Set(logs.map(log => log.user?._id?.toString())).size;
    const uniqueExercises = new Set(logs.map(log => log.exercise?._id?.toString())).size;

    // Completion status breakdown
    const completionStats = {
      completed: 0,
      skipped: 0,
      incomplete: 0,
    };
    logs.forEach(log => {
      completionStats[log.completionStatus] = (completionStats[log.completionStatus] || 0) + 1;
    });

    // Phase breakdown
    const phaseStats = {};
    logs.forEach(log => {
      const phase = log.phase || log.exercise?.phase || "Unknown";
      phaseStats[phase] = (phaseStats[phase] || 0) + 1;
    });

    // Category breakdown
    const categoryStats = {};
    logs.forEach(log => {
      const category = log.category || log.exercise?.category || "Unknown";
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // Difficulty breakdown
    const difficultyStats = {};
    logs.forEach(log => {
      const difficulty = log.exercise?.difficulty || "Unknown";
      difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
    });

    // Daily activity trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = logs.filter(log => new Date(log.date) >= thirtyDaysAgo);

    const dailyActivity = {};
    recentLogs.forEach(log => {
      const dateKey = log.date.toISOString().slice(0, 10);
      dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;
    });

    const dailyActivityChart = Object.entries(dailyActivity)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Top exercises by completion
    const exerciseCompletion = {};
    logs.forEach(log => {
      const exerciseName = log.exercise?.name || "Unknown";
      if (!exerciseCompletion[exerciseName]) {
        exerciseCompletion[exerciseName] = { total: 0, completed: 0 };
      }
      exerciseCompletion[exerciseName].total++;
      if (log.completionStatus === "completed") {
        exerciseCompletion[exerciseName].completed++;
      }
    });

    const topExercises = Object.entries(exerciseCompletion)
      .map(([name, stats]) => ({
        name,
        totalLogs: stats.total,
        completed: stats.completed,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.totalLogs - a.totalLogs)
      .slice(0, 10);

    res.json({
      overview: {
        totalLogs,
        uniqueUsers,
        uniqueExercises,
        completionRate: totalLogs > 0 ? Math.round((completionStats.completed / totalLogs) * 100) : 0,
      },
      completionStats,
      phaseStats,
      categoryStats,
      difficultyStats,
      dailyActivity: dailyActivityChart,
      topExercises,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get exercise analytics" });
  }
};

// Get a single user
export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
};

// Deactivate user
export const deactivateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  user.isActive = false;
  await user.save();
  res.json({ message: "User deactivated" });
};

// Activate user
export const activateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  user.isActive = true;
  await user.save();
  res.json({ message: "User activated" });
};

// Admin resets a user's password (temporary)
export const adminResetPassword = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });

  const temp = crypto.randomBytes(4).toString("hex");
  user.password = temp; // will be hashed in pre-save
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // TODO: send temp password by email/SMS here
  res.json({ message: "Temporary password generated", tempPassword: temp });
};

// Warn user
export const warnUser = async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  // TODO: send email/SMS notification here
  res.json({ message: `Warning sent to ${user.email}`, reason });
};

// Change user role
export const changeUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  user.role = role;
  await user.save();
  res.json({ message: "Role updated" });
};

/** ───────────── SOS LOGS ───────────── **/

export const listSOS = async (req, res) => {
  const { page = 1, limit = 50, status, userId, from, to } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  if (from || to) filter.createdAt = {};
  if (from) filter.createdAt.$gte = new Date(from);
  if (to) filter.createdAt.$lte = new Date(to);

  const logs = await SOSLog.find(filter)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();
  const total = await SOSLog.countDocuments(filter);
  res.json({ logs, total });
};

export const exportSOSCSV = async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) filter.createdAt = {};
  if (from) filter.createdAt.$gte = new Date(from);
  if (to) filter.createdAt.$lte = new Date(to);

  const logs = await SOSLog.find(filter)
    .populate("user", "name email phone")
    .lean();

  const header = [
    "timestamp",
    "userName",
    "userEmail",
    "phone",
    "lat",
    "lng",
    "address",
    "message",
    "status",
  ];
  const rows = logs.map((l) => [
    l.createdAt.toISOString(),
    l.user?.name || "",
    l.user?.email || "",
    l.user?.phone || "",
    l.coords?.lat || "",
    l.coords?.lng || "",
    (l.address || "").replace(/,/g, " "),
    (l.message || "").replace(/,/g, " "),
    l.status,
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="sos-logs-${Date.now()}.csv"`
  );
  res.send(csv);
};

export const updateSOSStatus = async (req, res) => {
  const { status } = req.body;
  const log = await SOSLog.findById(req.params.id);
  if (!log) return res.status(404).json({ message: "Not found" });
  log.status = status;
  // use req.user.id from protect middleware as acting admin ID
  if (status === "handled") log.handledBy = req.user.id;
  await log.save();
  res.json({ message: "Status updated" });
};

/** ───────────── HELPLINES ───────────── **/

export const listHelplines = async (req, res) => {
  const helplines = await Helpline.find({}).sort({ region: 1 }).lean();
  res.json({ helplines });
};

export const createHelpline = async (req, res) => {
  const h = await Helpline.create(req.body);
  res.status(201).json({ helpline: h });
};

export const updateHelpline = async (req, res) => {
  const h = await Helpline.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ helpline: h });
};

export const deleteHelpline = async (req, res) => {
  await Helpline.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

/** ───────────── RESOURCES ───────────── **/

export const listResources = async (req, res) => {
  try {
    const { page = 1, limit = 50, approved, verified, category, type, q } = req.query;
    const filter = {};

    if (approved !== undefined) filter.approved = approved === 'true';
    if (verified !== undefined) filter.verified = verified === 'true';
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    const resources = await Resource.find(filter)
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Resource.countDocuments(filter);
    res.json({ resources, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createResource = async (req, res) => {
  try {
    const resourceData = { ...req.body };

    // Set submittedBy to current admin user
    if (req.user && req.user._id) {
      resourceData.submittedBy = req.user._id;
      // Automatically approve and verify admin-submitted resources
      resourceData.approved = true;
      resourceData.verified = true;
    }

    // Handle file upload
    if (req.file) {
      resourceData.filePath = req.file.path;
      resourceData.type = resourceData.type || 'PDF'; // Default to PDF for uploads
    }

    // Parse arrays
    if (typeof resourceData.lang === 'string') {
      resourceData.lang = resourceData.lang.split(',').map(l => l.trim());
    }
    if (typeof resourceData.tags === 'string') {
      resourceData.tags = resourceData.tags.split(',').map(t => t.trim());
    }

    const r = await Resource.create(resourceData);
    await r.populate("submittedBy", "name email");
    res.status(201).json({ resource: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create resource" });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resourceData = { ...req.body };

    // Handle file upload
    if (req.file) {
      resourceData.filePath = req.file.path;
    }

    // Parse arrays
    if (typeof resourceData.lang === 'string') {
      resourceData.lang = resourceData.lang.split(',').map(l => l.trim());
    }
    if (typeof resourceData.tags === 'string') {
      resourceData.tags = resourceData.tags.split(',').map(t => t.trim());
    }

    const r = await Resource.findByIdAndUpdate(req.params.id, resourceData, {
      new: true,
    }).populate("submittedBy", "name email");

    if (!r) return res.status(404).json({ message: "Resource not found" });
    res.json({ resource: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update resource" });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });

    // TODO: Delete file from filesystem if exists
    // if (r.filePath) { fs.unlinkSync(r.filePath); }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete resource" });
  }
};

export const approveResource = async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });
    r.approved = true;
    await r.save();
    res.json({ message: "Approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve resource" });
  }
};

export const verifyResource = async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });
    r.verified = !r.verified; // Toggle verified status
    await r.save();
    res.json({ message: "Verification status updated", verified: r.verified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update verification status" });
  }
};

export const bulkImportResources = async (req, res) => {
  try {
    // TODO: Implement CSV/Excel parsing
    // For now, return placeholder
    res.json({ message: "Bulk import not implemented yet" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to import resources" });
  }
};

export const downloadResource = async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });

    if (!r.filePath) return res.status(404).json({ message: "File not found" });

    r.downloadCount += 1;
    await r.save();

    res.download(r.filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to download resource" });
  }
};

export const getResourceAnalytics = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const approvedResources = await Resource.countDocuments({ approved: true });
    const verifiedResources = await Resource.countDocuments({ verified: true });

    // Category breakdown
    const categoryStats = await Resource.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Type breakdown
    const typeStats = await Resource.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Top downloaded resources
    const topDownloaded = await Resource.find({ approved: true })
      .sort({ downloadCount: -1 })
      .limit(10)
      .select('title downloadCount category type')
      .lean();

    res.json({
      totalResources,
      approvedResources,
      verifiedResources,
      categoryStats,
      typeStats,
      topDownloaded
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get analytics" });
  }
};

/** ───────────── FEEDBACK ───────────── **/

export const listFeedback = async (req, res) => {
  const f = await Feedback.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ feedback: f });
};

export const respondFeedback = async (req, res) => {
  const { response } = req.body;
  const fb = await Feedback.findById(req.params.id);
  if (!fb) return res.status(404).json({ message: "Not found" });
  fb.adminResponse = response;
  fb.status = "responded";
  await fb.save();
  // TODO: optionally email user
  res.json({ message: "Responded" });
};

export const escalateFeedback = async (req, res) => {
  const fb = await Feedback.findById(req.params.id);
  if (!fb) return res.status(404).json({ message: "Not found" });
  fb.status = "Escalated";
  await fb.save();
  res.json({ message: "Escalated" });
};

/** ───────────── NOTIFICATIONS ───────────── **/

export const broadcastNotification = async (req, res) => {
  const { title, message, channels = ["email"], filter } = req.body;
  let users = [];
  if (filter) users = await User.find(filter).select("email phone");
  else users = await User.find({ isActive: true }).select("email phone");

  // For now just return count of targeted users
  // TODO: integrate email/SMS/push sending here
  res.json({
    message: `Broadcast prepared`,
    channels,
    targetUsers: users.length,
  });
};

/** ───────────── EVENTS ───────────── **/

export const listEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 }).lean();
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get events" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body };

    // Handle file upload
    if (req.file) {
      eventData.bannerImage = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(eventData);
    res.status(201).json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

export const toggleEventPublish = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.published = !event.published;
    await event.save();
    res.json({ message: "Publish status updated", published: event.published });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update publish status" });
  }
};

/** ───────────── EXTERNAL DIRECTORIES ───────────── **/

export const listExternalDirectories = async (req, res) => {
  try {
    const directories = await ExternalDirectory.find({}).sort({ order: 1 }).lean();
    res.json({ directories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get directories" });
  }
};

export const createExternalDirectory = async (req, res) => {
  try {
    const directory = await ExternalDirectory.create(req.body);
    res.status(201).json({ directory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create directory" });
  }
};

export const updateExternalDirectory = async (req, res) => {
  try {
    const directory = await ExternalDirectory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!directory) return res.status(404).json({ message: "Directory not found" });
    res.json({ directory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update directory" });
  }
};

export const deleteExternalDirectory = async (req, res) => {
  try {
    await ExternalDirectory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete directory" });
  }
};

/** ───────────── QUIZZES ───────────── **/

export const listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).lean();
    res.json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get quizzes" });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create quiz" });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update quiz" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};

/** ───────────── ADMIN PROFILE ───────────── **/

export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Already populated by protect middleware
    console.log("getProfile called, user:", user);
    if (!user) {
      console.log("Admin not found");
      return res.status(404).json({ message: "Admin not found" });
    }

    // Map to the expected profile structure
    const profile = {
      fullName: user.name,
      username: user.email, // Using email as username
      email: user.email,
      phoneNumber: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.updatedAt, // Using updatedAt as lastLogin approximation
      createdAt: user.createdAt,
      // Add defaults for missing fields
      profilePicture: user.profilePicture || null,
      alternateEmail: user.alternateEmail || null,
      address: user.address || null,
      twoFactorEnabled: false,
    };

    console.log("Profile response:", profile);
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get admin profile" });
  }
};

// New controller for profile picture upload
export const uploadProfilePicture = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save file path to user profile
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: "Profile picture uploaded", profilePicture: user.profilePicture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { fullName, phoneNumber, alternateEmail, address } = req.body;

    // Update fields if provided
    if (fullName) user.name = fullName;
    if (phoneNumber) user.phone = phoneNumber;
    if (alternateEmail) user.alternateEmail = alternateEmail;
    if (address) user.address = address;

    await user.save();

    // Return updated profile
    const profile = {
      fullName: user.name,
      username: user.email,
      email: user.email,
      phoneNumber: user.phone,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.updatedAt,
      createdAt: user.createdAt,
      profilePicture: null,
      alternateEmail: user.alternateEmail || null,
      address: user.address || null,
      twoFactorEnabled: false,
    };

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update admin profile" });
  }
};

/** ───────────── REPORTS & ANALYTICS ───────────── **/

export const reportsOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const sosCount = await SOSLog.countDocuments();
    const pendingResources = await Resource.countDocuments({ approved: false });

    res.json({ totalUsers, activeUsers, sosCount, pendingResources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get dashboard stats" });
  }
};

/** ───────────── HEALTH TRACKING ───────────── **/

export const listHealthRecords = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 50, from, to, symptoms, irregularities } = req.query;
    let records = [];

    if (type === 'vitals' || type === 'all') {
      const vitals = await Vital.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(vitals.map(v => ({ ...v, type: 'vitals' })));
    }

    if (type === 'symptoms' || type === 'all') {
      const symptomsQuery = {};
      const symptomsRecords = await Symptom.find(symptomsQuery)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(symptomsRecords.map(s => ({ ...s, type: 'symptoms' })));
    }

    if (type === 'periods' || type === 'all') {
      const periodQuery = {};

      // Date range filter
      if (from || to) {
        periodQuery.createdAt = {};
        if (from) periodQuery.createdAt.$gte = new Date(from);
        if (to) periodQuery.createdAt.$lte = new Date(to);
      }

      // Symptoms filter
      if (symptoms) {
        periodQuery.symptoms = { $in: symptoms.split(',').map(s => s.trim()) };
      }

      let periods = await Period.find(periodQuery)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      // Cycle irregularities filter
      if (irregularities === 'true') {
        // Calculate irregularities based on cycle length variance
        const userGroups = {};
        periods.forEach(p => {
          const userId = p.user._id.toString();
          if (!userGroups[userId]) userGroups[userId] = [];
          userGroups[userId].push(p);
        });

        const irregularPeriods = [];
        Object.values(userGroups).forEach(userPeriods => {
          if (userPeriods.length >= 2) {
            // Sort by start date
            userPeriods.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            // Calculate cycle lengths
            const cycleLengths = [];
            for (let i = 0; i < userPeriods.length - 1; i++) {
              const diff = Math.round((new Date(userPeriods[i + 1].startDate) - new Date(userPeriods[i].startDate)) / (24 * 60 * 60 * 1000));
              if (diff > 10 && diff < 90) cycleLengths.push(diff); // reasonable cycle lengths
            }

            if (cycleLengths.length >= 2) {
              const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
              const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
              const stdDev = Math.sqrt(variance);

              // Consider irregular if std dev > 7 days or avg outside 21-35
              const isIrregular = stdDev > 7 || avgLength < 21 || avgLength > 35;

              if (isIrregular) {
                irregularPeriods.push(...userPeriods);
              }
            }
          }
        });

        periods = irregularPeriods;
      }

      records = records.concat(periods.map(p => ({ ...p, type: 'periods' })));
    }

    if (type === 'vaccinations' || type === 'all') {
      const vaccinations = await Vaccination.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(vaccinations.map(v => ({ ...v, type: 'vaccinations' })));
    }

    if (type === 'records' || type === 'all') {
      const recordsQuery = {};
      const recordsData = await Record.find(recordsQuery)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(recordsData.map(r => ({ ...r, type: 'records' })));
    }

    if (type === 'moodlogs' || type === 'all') {
      const moodlogs = await MoodLog.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(moodlogs.map(m => ({ ...m, type: 'moodlogs' })));
    }

    if (type === 'sleep' || type === 'all') {
      const sleepRecords = await Sleep.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(sleepRecords.map(s => ({ ...s, type: 'sleep' })));
    }

    if (type === 'nutrition' || type === 'all') {
      const nutritionRecords = await Nutrition.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
      records = records.concat(nutritionRecords.map(n => ({ ...n, type: 'nutrition' })));
    }

    // Filter by user name/email if q is provided
    if (q) {
      records = records.filter(r =>
        r.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Sort all records by createdAt
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = records.slice(startIndex, endIndex);

    res.json({
      records: paginatedRecords,
      total: records.length,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get health records" });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to delete from each collection
    let deleted = false;
    deleted = await Vital.findByIdAndDelete(id) || deleted;
    deleted = await Symptom.findByIdAndDelete(id) || deleted;
    deleted = await Period.findByIdAndDelete(id) || deleted;
    deleted = await Vaccination.findByIdAndDelete(id) || deleted;
    deleted = await Record.findByIdAndDelete(id) || deleted;
    deleted = await MoodLog.findByIdAndDelete(id) || deleted;
    deleted = await Sleep.findByIdAndDelete(id) || deleted;
    deleted = await Nutrition.findByIdAndDelete(id) || deleted;

    if (!deleted) {
      return res.status(404).json({ message: "Health record not found" });
    }

    res.json({ message: "Health record deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete health record" });
  }
};

export const updatePeriodRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.symptoms && !Array.isArray(updates.symptoms)) {
      updates.symptoms = updates.symptoms.split(',').map(s => s.trim());
    }

    const period = await Period.findByIdAndUpdate(id, updates, { new: true })
      .populate('user', 'name email');

    if (!period) {
      return res.status(404).json({ message: "Period record not found" });
    }

    res.json({ message: "Period record updated", record: period });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update period record" });
  }
};

export const exportPeriodData = async (req, res) => {
  try {
    const { from, to, symptoms, irregularities } = req.query;
    const periodQuery = {};

    // Date range filter
    if (from || to) {
      periodQuery.createdAt = {};
      if (from) periodQuery.createdAt.$gte = new Date(from);
      if (to) periodQuery.createdAt.$lte = new Date(to);
    }

    // Symptoms filter
    if (symptoms) {
      periodQuery.symptoms = { $in: symptoms.split(',').map(s => s.trim()) };
    }

    let periods = await Period.find(periodQuery)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Cycle irregularities filter
    if (irregularities === 'true') {
      const userGroups = {};
      periods.forEach(p => {
        const userId = p.user._id.toString();
        if (!userGroups[userId]) userGroups[userId] = [];
        userGroups[userId].push(p);
      });

      const irregularPeriods = [];
      Object.values(userGroups).forEach(userPeriods => {
        if (userPeriods.length >= 2) {
          userPeriods.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

          const cycleLengths = [];
          for (let i = 0; i < userPeriods.length - 1; i++) {
            const diff = Math.round((new Date(userPeriods[i + 1].startDate) - new Date(userPeriods[i].startDate)) / (24 * 60 * 60 * 1000));
            if (diff > 10 && diff < 90) cycleLengths.push(diff);
          }

          if (cycleLengths.length >= 2) {
            const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
            const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
            const stdDev = Math.sqrt(variance);

            const isIrregular = stdDev > 7 || avgLength < 21 || avgLength > 35;

            if (isIrregular) {
              irregularPeriods.push(...userPeriods);
            }
          }
        }
      });

      periods = irregularPeriods;
    }

    const headers = [
      "userName",
      "userEmail",
      "startDate",
      "endDate",
      "duration",
      "intensity",
      "mood",
      "symptoms",
      "notes",
      "basalBodyTemperatureC",
      "restingHeartRateBpm",
      "createdAt"
    ];

    const rows = periods.map(p => [
      p.user?.name || "",
      p.user?.email || "",
      new Date(p.startDate).toISOString().slice(0, 10),
      p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : "",
      p.duration || "",
      p.intensity || "",
      p.mood || "",
      Array.isArray(p.symptoms) ? p.symptoms.join("|") : "",
      (p.notes || "").replace(/\n/g, " ").replace(/"/g, '""'),
      p.basalBodyTemperatureC || "",
      p.restingHeartRateBpm || "",
      new Date(p.createdAt).toISOString().slice(0, 10)
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.map(v => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=period-data-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export period data" });
  }
};

export const getPeriodAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    const periodQuery = {};

    // Date range filter
    if (from || to) {
      periodQuery.createdAt = {};
      if (from) periodQuery.createdAt.$gte = new Date(from);
      if (to) periodQuery.createdAt.$lte = new Date(to);
    }

    const periods = await Period.find(periodQuery)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate overall statistics
    const totalPeriods = periods.length;
    const totalUsers = new Set(periods.map(p => p.user._id.toString())).size;

    // Calculate average cycle lengths and irregularity rates
    const userGroups = {};
    periods.forEach(p => {
      const userId = p.user._id.toString();
      if (!userGroups[userId]) userGroups[userId] = [];
      userGroups[userId].push(p);
    });

    let totalCycleLengths = [];
    let irregularUsers = 0;
    let regularUsers = 0;
    const cycleLengthDistribution = {};
    const monthlyIrregularities = {};

    Object.values(userGroups).forEach(userPeriods => {
      if (userPeriods.length >= 2) {
        userPeriods.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        const cycleLengths = [];
        for (let i = 0; i < userPeriods.length - 1; i++) {
          const diff = Math.round((new Date(userPeriods[i + 1].startDate) - new Date(userPeriods[i].startDate)) / (24 * 60 * 60 * 1000));
          if (diff > 10 && diff < 90) {
            cycleLengths.push(diff);
            totalCycleLengths.push(diff);

            // Track cycle length distribution
            const lengthRange = Math.floor(diff / 5) * 5;
            cycleLengthDistribution[lengthRange] = (cycleLengthDistribution[lengthRange] || 0) + 1;

            // Track monthly irregularities
            const monthKey = new Date(userPeriods[i].startDate).toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyIrregularities[monthKey]) monthlyIrregularities[monthKey] = { total: 0, irregular: 0 };
            monthlyIrregularities[monthKey].total++;
          }
        }

        if (cycleLengths.length >= 2) {
          const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
          const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
          const stdDev = Math.sqrt(variance);

          const isIrregular = stdDev > 7 || avgLength < 21 || avgLength > 35;
          if (isIrregular) {
            irregularUsers++;
            // Mark irregular cycles for the month
            cycleLengths.forEach((_, index) => {
              if (index < userPeriods.length - 1) {
                const monthKey = new Date(userPeriods[index].startDate).toISOString().slice(0, 7);
                if (monthlyIrregularities[monthKey]) {
                  monthlyIrregularities[monthKey].irregular++;
                }
              }
            });
          } else {
            regularUsers++;
          }
        }
      }
    });

    const averageCycleLength = totalCycleLengths.length > 0
      ? Math.round(totalCycleLengths.reduce((a, b) => a + b, 0) / totalCycleLengths.length)
      : 0;

    const irregularityRate = (irregularUsers + regularUsers) > 0
      ? Math.round((irregularUsers / (irregularUsers + regularUsers)) * 100)
      : 0;

    // Calculate most common symptoms
    const symptomCounts = {};
    periods.forEach(p => {
      if (Array.isArray(p.symptoms)) {
        p.symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      }
    });

    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([symptom, count]) => ({ symptom, count }));

    // Prepare cycle length distribution for chart
    const cycleLengthChart = Object.entries(cycleLengthDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([range, count]) => ({
        range: `${range}-${parseInt(range) + 4} days`,
        count
      }));

    // Prepare monthly irregularities chart
    const monthlyIrregularitiesChart = Object.entries(monthlyIrregularities)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        totalCycles: data.total,
        irregularCycles: data.irregular || 0,
        percentage: data.total > 0 ? Math.round((data.irregular / data.total) * 100) : 0
      }));

    res.json({
      overview: {
        totalPeriods,
        totalUsers,
        averageCycleLength,
        irregularityRate
      },
      cycleLengthDistribution: cycleLengthChart,
      mostCommonSymptoms,
      monthlyIrregularities: monthlyIrregularitiesChart
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get period analytics" });
  }
};

/** ───────────── MOOD & SYMPTOMS ───────────── **/

export const listMoodAndSymptoms = async (req, res) => {
  try {
    const { q, mood, from, to, keyword, page = 1, limit = 50 } = req.query;
    let records = [];

    // Fetch MoodLogs
    const moodQuery = {};
    if (mood) moodQuery.mood = new RegExp(mood, "i");
    if (from || to) {
      moodQuery.date = {};
      if (from) moodQuery.date.$gte = new Date(from);
      if (to) moodQuery.date.$lte = new Date(to);
    }
    if (keyword) {
      moodQuery.$or = [
        { notes: new RegExp(keyword, "i") },
        { symptoms: { $in: [new RegExp(keyword, "i")] } }
      ];
    }

    const moodLogs = await MoodLog.find(moodQuery)
      .populate('user', 'name email')
      .sort({ date: -1 })
      .lean();
    records = records.concat(moodLogs.map(m => ({
      ...m,
      type: 'mood',
      intensity: 5, // default intensity since MoodLog doesn't have it
      symptoms: m.symptoms,
      createdAt: m.date // use date as createdAt for consistency
    })));

    // Fetch Symptoms
    const symptomQuery = {};
    if (from || to) {
      symptomQuery.date = {};
      if (from) symptomQuery.date.$gte = new Date(from);
      if (to) symptomQuery.date.$lte = new Date(to);
    }
    if (keyword) {
      symptomQuery.$or = [
        { notes: new RegExp(keyword, "i") },
        { tags: { $in: [new RegExp(keyword, "i")] } }
      ];
    }

    const symptoms = await Symptom.find(symptomQuery)
      .populate('user', 'name email')
      .sort({ date: -1 })
      .lean();
    records = records.concat(symptoms.map(s => ({
      ...s,
      type: 'symptoms',
      symptoms: s.tags,
      createdAt: s.date // use date as createdAt for consistency
    })));

    // Filter by user name/email if q is provided
    if (q) {
      records = records.filter(r =>
        r.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Sort all records by createdAt
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = records.slice(startIndex, endIndex);

    res.json({
      records: paginatedRecords,
      total: records.length,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get mood and symptoms records" });
  }
};

export const getMoodAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;
    const moodQuery = {};
    if (from || to) {
      moodQuery.date = {};
      if (from) moodQuery.date.$gte = new Date(from);
      if (to) moodQuery.date.$lte = new Date(to);
    }

    const moodLogs = await MoodLog.find(moodQuery).lean();

    // Mood frequency for pie chart
    const moodCounts = {};
    moodLogs.forEach(log => {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    });
    const pieData = Object.entries(moodCounts).map(([mood, count]) => ({ name: mood, value: count }));

    // Mood trend over time (count of each mood per day)
    const dailyMoods = {};
    moodLogs.forEach(log => {
      const dateKey = log.date.toISOString().slice(0, 10);
      if (!dailyMoods[dateKey]) dailyMoods[dateKey] = {};
      dailyMoods[dateKey][log.mood] = (dailyMoods[dateKey][log.mood] || 0) + 1;
    });

    const lineData = Object.entries(dailyMoods)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, moods]) => ({
        date,
        ...moods
      }));

    res.json({
      pieData,
      lineData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get mood analytics" });
  }
};

/** ───────────── EXERCISE REMINDERS ───────────── **/

export const listExerciseReminders = async (req, res) => {
  try {
    const { page = 1, limit = 25, active, q } = req.query;
    const filter = {};

    if (active !== undefined) filter.active = active === "true";
    if (q) {
      filter.title = new RegExp(q, "i");
    }

    const reminders = await ExerciseReminder.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await ExerciseReminder.countDocuments(filter);
    res.json({ reminders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list exercise reminders" });
  }
};

export const createExerciseReminder = async (req, res) => {
  try {
    const reminderData = req.body;

    // Validate required fields
    if (!reminderData.title || !reminderData.time || !reminderData.days) {
      return res.status(400).json({ message: "Title, time, and days are required" });
    }

    // Ensure days is an array
    if (!Array.isArray(reminderData.days)) {
      reminderData.days = [reminderData.days];
    }

    const reminder = await ExerciseReminder.create(reminderData);
    res.status(201).json({ reminder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create exercise reminder" });
  }
};

export const updateExerciseReminder = async (req, res) => {
  try {
    const reminderData = req.body;

    // Ensure days is an array if provided
    if (reminderData.days && !Array.isArray(reminderData.days)) {
      reminderData.days = [reminderData.days];
    }

    const reminder = await ExerciseReminder.findByIdAndUpdate(req.params.id, reminderData, { new: true });
    if (!reminder) return res.status(404).json({ message: "Exercise reminder not found" });
    res.json({ reminder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update exercise reminder" });
  }
};

export const deleteExerciseReminder = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: "Exercise reminder deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete exercise reminder" });
  }
};

/** ───────────── EXERCISE CHALLENGES ───────────── **/

export const listExerciseChallenges = async (req, res) => {
  try {
    // Placeholder implementation - return empty array for now
    // In a real implementation, this would query an ExerciseChallenge model
    const challenges = [
      {
        _id: "1",
        title: "30-Day Fitness Challenge",
        description: "Complete daily exercises for 30 days",
        startDate: "2024-01-01",
        endDate: "2024-01-30",
        targetParticipants: 100,
        reward: "Fitness Badge",
        active: true,
        createdAt: new Date()
      }
    ];
    res.json(challenges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list exercise challenges" });
  }
};

export const createExerciseChallenge = async (req, res) => {
  try {
    // Placeholder implementation
    const challenge = { ...req.body, _id: Date.now().toString(), createdAt: new Date() };
    res.status(201).json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create exercise challenge" });
  }
};

export const updateExerciseChallenge = async (req, res) => {
  try {
    // Placeholder implementation
    const challenge = { ...req.body, _id: req.params.id };
    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update exercise challenge" });
  }
};

export const deleteExerciseChallenge = async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: "Exercise challenge deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete exercise challenge" });
  }
};
