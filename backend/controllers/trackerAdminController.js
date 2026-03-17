import TrackerConfig from "../models/TrackerConfig.js";
import Period from "../models/Period.js";
import FertilityLog from "../models/FertilityLog.js";
import PregnancyLog from "../models/PregnancyLog.js";
import PerimenopauseLog from "../models/PerimenopauseLog.js";

const allowedModules = new Set(["period", "conceive", "pregnancy", "perimenopause"]);

const validateParams = (moduleKey, sectionKey) => {
  if (!allowedModules.has(moduleKey)) return "Invalid module key";
  if (!sectionKey || typeof sectionKey !== "string") return "Invalid section key";
  return null;
};

const getModelByModule = (moduleKey) => {
  const map = {
    period: Period,
    conceive: FertilityLog,
    pregnancy: PregnancyLog,
    perimenopause: PerimenopauseLog,
  };
  return map[moduleKey] || null;
};

const detectAnomalies = (moduleKey, logs) => {
  const anomalies = [];
  if (!logs.length) return anomalies;

  if (moduleKey === "period") {
    const invalidDurations = logs.filter((log) => Number(log.duration || 0) > 12 || Number(log.duration || 0) < 1).length;
    if (invalidDurations) {
      anomalies.push({ id: "period-duration", level: "warning", message: `${invalidDurations} cycles have unusual duration values.` });
    }
  }

  if (moduleKey === "conceive") {
    const highStress = logs.filter((log) => Number(log.stress || 0) >= 8).length;
    if (highStress) {
      anomalies.push({ id: "conceive-stress", level: "warning", message: `${highStress} fertility logs show high stress levels.` });
    }
  }

  if (moduleKey === "pregnancy") {
    const highRisk = logs.filter((log) => {
      const systolic = Number(log.systolic ?? log.bloodPressure?.systolic ?? 0);
      const diastolic = Number(log.diastolic ?? log.bloodPressure?.diastolic ?? 0);
      return systolic >= 140 || diastolic >= 90;
    }).length;
    if (highRisk) {
      anomalies.push({ id: "pregnancy-bp", level: "danger", message: `${highRisk} pregnancy logs indicate elevated blood pressure.` });
    }
  }

  if (moduleKey === "perimenopause") {
    const severeSymptoms = logs.filter((log) => log.symptomIntensity === "severe").length;
    if (severeSymptoms) {
      anomalies.push({ id: "peri-severe", level: "warning", message: `${severeSymptoms} logs report severe symptom intensity.` });
    }
  }

  return anomalies;
};

const buildTrend = (logs) => {
  const buckets = {};
  logs.forEach((log) => {
    const d = new Date(log.date || log.startDate || log.createdAt);
    if (Number.isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10);
    buckets[key] = (buckets[key] || 0) + 1;
  });
  return Object.entries(buckets)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .slice(-14)
    .map(([date, count]) => ({ date, count }));
};

export const getTrackerModeOverview = async (req, res) => {
  try {
    const { moduleKey } = req.params;
    const error = validateParams(moduleKey, "overview");
    if (error && error !== "Invalid section key") return res.status(400).json({ message: error });

    const Model = getModelByModule(moduleKey);
    if (!Model) return res.status(400).json({ message: "Invalid module key" });

    const totalLogs = await Model.countDocuments();
    const distinctUsers = await Model.distinct("user");
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const logsLast7Days = await Model.countDocuments({ $or: [{ date: { $gte: weekAgo } }, { startDate: { $gte: weekAgo } }, { createdAt: { $gte: weekAgo } }] });
    const recentLogsRaw = await Model.find({})
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(30)
      .populate("user", "name email");

    const recentLogs = recentLogsRaw.map((log) => ({
      id: log._id,
      userName: log.user?.name || "Unknown",
      userEmail: log.user?.email || "",
      date: log.date || log.startDate || log.createdAt,
      notes: log.notes || "",
      mood: log.mood || "",
      moduleSummary:
        moduleKey === "period"
          ? `${log.intensity || "medium"} flow • ${log.duration || 0} day(s)`
          : moduleKey === "conceive"
            ? `Stress ${log.stress || "-"} • Energy ${log.energy || "-"}`
            : moduleKey === "pregnancy"
              ? `Week ${log.week || "-"} • ${log.trimester || "-"} trimester`
              : `Intensity ${log.symptomIntensity || "-"} • Sleep ${log.sleepQuality || "-"}`,
    }));

    const trend = buildTrend(recentLogsRaw);
    const anomalies = detectAnomalies(moduleKey, recentLogsRaw);
    const riskFlags = anomalies.filter((a) => a.level === "danger").length;

    return res.json({
      moduleKey,
      stats: {
        totalLogs,
        activeUsers: distinctUsers.length,
        logsLast7Days,
        riskFlags,
      },
      anomalies,
      trend,
      recentLogs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load mode overview", error: error.message });
  }
};

export const listTrackerItems = async (req, res) => {
  try {
    const { moduleKey, sectionKey } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const items = await TrackerConfig.find({ moduleKey, sectionKey }).sort({ week: 1, updatedAt: -1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list tracker items", error: error.message });
  }
};

export const createTrackerItem = async (req, res) => {
  try {
    const { moduleKey, sectionKey } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const { title, description = "", week = null, metadata = {} } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const item = await TrackerConfig.create({
      moduleKey,
      sectionKey,
      title: String(title).trim(),
      description: String(description || ""),
      week: week === null || week === "" ? null : Number(week),
      metadata,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create tracker item", error: error.message });
  }
};

export const updateTrackerItem = async (req, res) => {
  try {
    const { moduleKey, sectionKey, id } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const { title, description = "", week = null, metadata = {} } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const item = await TrackerConfig.findOneAndUpdate(
      { _id: id, moduleKey, sectionKey },
      {
        title: String(title).trim(),
        description: String(description || ""),
        week: week === null || week === "" ? null : Number(week),
        metadata,
        updatedBy: req.user?._id || null,
      },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Tracker item not found" });
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update tracker item", error: error.message });
  }
};

export const deleteTrackerItem = async (req, res) => {
  try {
    const { moduleKey, sectionKey, id } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const item = await TrackerConfig.findOneAndDelete({ _id: id, moduleKey, sectionKey });
    if (!item) return res.status(404).json({ message: "Tracker item not found" });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete tracker item", error: error.message });
  }
};
