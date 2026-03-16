import KickLog from "../models/KickLog.js";
import PregnancyMoodLog from "../models/PregnancyMoodLog.js";
import ContractionLog from "../models/ContractionLog.js";
import WeeklyChecklist from "../models/WeeklyChecklist.js";

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getDefaultChecklistItems = (week) => {
  const base = [
    { id: "prenatal-vitamins", label: "Prenatal vitamins", completed: false },
    { id: "water", label: "Drink 2 liters water", completed: false },
    { id: "movement", label: "Prenatal yoga or gentle walk", completed: false },
    { id: "doctor-visit", label: "Schedule doctor visit", completed: false },
  ];

  if (week >= 34) {
    base.push({ id: "labor-readiness", label: "Review labor signs and birth plan", completed: false });
  }
  if (week >= 20) {
    base.push({ id: "kick-awareness", label: "Track baby movement awareness", completed: false });
  }
  return base;
};

export const getTodayKickLog = async (req, res) => {
  try {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const kickLog = await KickLog.findOne({
      user: req.userId,
      date: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    res.json({
      success: true,
      kickLog: kickLog || { count: 0, date: todayStart.toISOString() },
    });
  } catch (error) {
    console.error("Get today kick log error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch kick counter" });
  }
};

export const addKickCount = async (req, res) => {
  try {
    const amount = Number(req.body?.amount) > 0 ? Number(req.body.amount) : 1;
    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    const existing = await KickLog.findOne({
      user: req.userId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    let kickLog = existing;
    if (!kickLog) {
      kickLog = await KickLog.create({
        user: req.userId,
        date: todayStart,
        count: amount,
      });
    } else {
      kickLog.count += amount;
      await kickLog.save();
    }

    res.status(201).json({ success: true, kickLog });
  } catch (error) {
    console.error("Add kick count error:", error);
    res.status(500).json({ success: false, message: "Failed to update kick count" });
  }
};

export const getTodayMoodLog = async (req, res) => {
  try {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const moodLog = await PregnancyMoodLog.findOne({
      user: req.userId,
      date: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    res.json({ success: true, moodLog: moodLog || null });
  } catch (error) {
    console.error("Get mood log error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mood log" });
  }
};

export const upsertTodayMoodLog = async (req, res) => {
  try {
    const mood = String(req.body?.mood || "").toLowerCase();
    if (!["happy", "neutral", "stressed", "tired"].includes(mood)) {
      return res.status(400).json({ success: false, message: "Invalid mood value" });
    }

    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const existing = await PregnancyMoodLog.findOne({
      user: req.userId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    let moodLog = existing;
    if (!moodLog) {
      moodLog = await PregnancyMoodLog.create({
        user: req.userId,
        date: todayStart,
        mood,
      });
    } else {
      moodLog.mood = mood;
      await moodLog.save();
    }

    res.status(201).json({ success: true, moodLog });
  } catch (error) {
    console.error("Upsert mood log error:", error);
    res.status(500).json({ success: false, message: "Failed to save mood log" });
  }
};

export const getWeeklyChecklist = async (req, res) => {
  try {
    const week = Math.min(40, Math.max(1, Number(req.query?.week) || 1));
    let checklist = await WeeklyChecklist.findOne({ user: req.userId, week }).lean();

    if (!checklist) {
      checklist = {
        week,
        items: getDefaultChecklistItems(week),
      };
    }

    res.json({ success: true, checklist });
  } catch (error) {
    console.error("Get weekly checklist error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch weekly checklist" });
  }
};

export const saveWeeklyChecklist = async (req, res) => {
  try {
    const week = Math.min(40, Math.max(1, Number(req.body?.week) || 1));
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    const normalizedItems = items
      .filter((item) => item?.id && item?.label)
      .map((item) => ({
        id: String(item.id),
        label: String(item.label),
        completed: Boolean(item.completed),
      }));

    const checklist = await WeeklyChecklist.findOneAndUpdate(
      { user: req.userId, week },
      { $set: { items: normalizedItems.length ? normalizedItems : getDefaultChecklistItems(week) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, checklist });
  } catch (error) {
    console.error("Save weekly checklist error:", error);
    res.status(500).json({ success: false, message: "Failed to save weekly checklist" });
  }
};

export const getTodayContractions = async (req, res) => {
  try {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const contractions = await ContractionLog.find({
      user: req.userId,
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .sort({ startedAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, contractions });
  } catch (error) {
    console.error("Get contractions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contractions" });
  }
};

export const addContractionLog = async (req, res) => {
  try {
    const startedAt = new Date(req.body?.startedAt);
    const endedAt = new Date(req.body?.endedAt);
    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt <= startedAt) {
      return res.status(400).json({ success: false, message: "Invalid contraction timestamps" });
    }

    const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
    const dayStart = startOfDay(startedAt);
    const prev = await ContractionLog.findOne({
      user: req.userId,
      date: { $gte: dayStart, $lte: endOfDay(startedAt) },
      endedAt: { $lt: startedAt },
    })
      .sort({ endedAt: -1 })
      .lean();

    const intervalSeconds = prev ? Math.round((startedAt.getTime() - new Date(prev.endedAt).getTime()) / 1000) : null;

    const contraction = await ContractionLog.create({
      user: req.userId,
      date: dayStart,
      startedAt,
      endedAt,
      durationSeconds,
      intervalSeconds,
    });

    res.status(201).json({ success: true, contraction });
  } catch (error) {
    console.error("Add contraction error:", error);
    res.status(500).json({ success: false, message: "Failed to save contraction" });
  }
};
