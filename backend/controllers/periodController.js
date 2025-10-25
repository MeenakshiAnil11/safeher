import Period from "../models/Period.js";

/**
 * Helper: convert Date -> 'YYYY-MM-DD' string
 */
const ymd = (d) => new Date(d).toISOString().slice(0, 10);

const msDay = 24 * 60 * 60 * 1000;

/**
 * POST /api/periods/log
 * body: { startDate, endDate } (ISO date strings)
 */
export const logPeriod = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, intensity, notes, mood, symptoms, basalBodyTemperatureC, restingHeartRateBpm } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ message: "startDate and endDate required" });

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (s > e) return res.status(400).json({ message: "startDate must be before or equal to endDate" });

    const period = new Period({
      user: userId,
      startDate: s,
      endDate: e,
      intensity,
      notes,
      mood,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      basalBodyTemperatureC,
      restingHeartRateBpm,
    });
    await period.save();
    res.status(201).json({ message: "Cycle logged", period });
  } catch (err) {
    console.error("logPeriod error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/periods/:id
 * Update an existing cycle
 */
export const updatePeriod = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.symptoms && !Array.isArray(updates.symptoms)) updates.symptoms = [updates.symptoms];

    const period = await Period.findOneAndUpdate({ _id: id, user: userId }, updates, { new: true });
    if (!period) return res.status(404).json({ message: "Cycle not found" });
    res.json({ message: "Cycle updated", period });
  } catch (err) {
    console.error("updatePeriod error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/periods/:id
 */
export const deletePeriod = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const result = await Period.findOneAndDelete({ _id: id, user: userId });
    if (!result) return res.status(404).json({ message: "Cycle not found" });
    res.json({ message: "Cycle deleted" });
  } catch (err) {
    console.error("deletePeriod error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/periods/history
 * returns user's cycles ordered desc (most recent first)
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: -1 }).limit(50).lean();
    res.json({ cycles });
  } catch (err) {
    console.error("getHistory error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/periods/export.csv
 * Returns CSV of user's cycles
 */
export const exportCsv = async (req, res) => {
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: -1 }).lean();
    const headers = [
      "startDate",
      "endDate",
      "duration",
      "intensity",
      "mood",
      "symptoms",
      "notes",
      "basalBodyTemperatureC",
      "restingHeartRateBpm",
    ];
    const rows = cycles.map(c => [
      new Date(c.startDate).toISOString().slice(0,10),
      new Date(c.endDate).toISOString().slice(0,10),
      c.duration ?? "",
      c.intensity ?? "",
      c.mood ?? "",
      Array.isArray(c.symptoms) ? c.symptoms.join("|") : "",
      (c.notes || "").replace(/\n/g, " ").replace(/"/g, '""'),
      c.basalBodyTemperatureC ?? "",
      c.restingHeartRateBpm ?? "",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.map(v => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=cycles.csv");
    res.send(csv);
  } catch (err) {
    console.error("exportCsv error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/periods/prediction
 * returns predictions (predictedDays array of ISO strings), ovulation, fertileWindow
 */
export const getPrediction = async (req, res) => {
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: 1 }).lean(); // ascending
    if (!cycles || cycles.length === 0) {
      // no data: return defaults
      return res.json({
        predictedDays: [],
        nextPeriodStart: null,
        note: "Not enough data. Log at least 2 cycles for predictions."
      });
    }

    // compute cycle lengths between start dates
    const starts = cycles.map(c => new Date(c.startDate));
    const durations = cycles.map(c => c.duration || Math.round((new Date(c.endDate) - new Date(c.startDate)) / msDay) + 1);

    let cycleDiffs = [];
    for (let i = 0; i < starts.length - 1; i++) {
      const diff = Math.round((starts[i + 1] - starts[i]) / msDay);
      if (diff > 10) cycleDiffs.push(diff); // filter nonsense
    }

    const avgCycleLength = cycleDiffs.length ? Math.round(cycleDiffs.reduce((a, b) => a + b, 0) / cycleDiffs.length) : 28;
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 5;

    // last known start:
    const lastStart = starts[starts.length - 1];

    // next predicted start:
    const nextStart = new Date(lastStart.getTime() + avgCycleLength * msDay);

    // predicted period days:
    let predictedDays = [];
    for (let i = 0; i < avgDuration; i++) {
      const d = new Date(nextStart.getTime() + i * msDay);
      predictedDays.push(ymd(d));
    }

    // ovulation (approx halfway of cycle after last start)
    const ovulation = new Date(lastStart.getTime() + Math.round(avgCycleLength / 2) * msDay);
    const fertileStart = new Date(ovulation.getTime() - 5 * msDay);
    const fertileEnd = new Date(ovulation.getTime() + 1 * msDay);

    res.json({
      avgCycleLength,
      avgDuration,
      nextPeriodStart: ymd(nextStart),
      predictedDays,
      ovulation: ymd(ovulation),
      fertileWindow: [ymd(fertileStart), ymd(fertileEnd)]
    });
  } catch (err) {
    console.error("getPrediction error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/periods/insights
 * average values, irregular flag, notes
 */
export const getInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: 1 }).lean();
    if (!cycles || cycles.length < 1) {
      return res.json({ avgCycleLength: null, avgDuration: null, isIrregular: false, note: "Log cycles to get insights." });
    }

    const starts = cycles.map(c => new Date(c.startDate));
    const durations = cycles.map(c => c.duration || Math.round((new Date(c.endDate) - new Date(c.startDate)) / msDay) + 1);
    // diffs
    const diffs = [];
    for (let i = 0; i < starts.length - 1; i++) {
      const diff = Math.round((starts[i + 1] - starts[i]) / msDay);
      if (diff > 10) diffs.push(diff);
    }
    const avgCycleLength = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

    // irregular = avg cycle length outside 21-35 OR wide variance
    let isIrregular = false;
    if (avgCycleLength && (avgCycleLength < 21 || avgCycleLength > 35)) isIrregular = true;
    // variance check (std-like): if diffs spread > 7 days
    if (diffs.length >= 2) {
      const min = Math.min(...diffs), max = Math.max(...diffs);
      if (max - min > 7) isIrregular = true;
    }

    // next prediction reuse controller logic quickly
    const lastStart = starts[starts.length - 1];
    const finalAvgCycle = avgCycleLength || 28;
    const nextStart = new Date(lastStart.getTime() + finalAvgCycle * msDay);

    res.json({
      avgCycleLength: avgCycleLength || 28,
      avgDuration: avgDuration || 5,
      isIrregular,
      nextPeriodStart: nextStart.toISOString().slice(0,10),
      note: isIrregular ? "Your cycles seem irregular — consider consulting a doctor if concerned." : "Your cycles look regular based on logged data."
    });
  } catch (err) {
    console.error("getInsights error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/periods/current-phase
 * returns current cycle phase based on last period
 */
export const getCurrentPhase = async (req, res) => {
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: -1 }).limit(1).lean();

    if (!cycles || cycles.length === 0) {
      return res.json({ phase: "menstrual", note: "No cycle data available. Defaulting to menstrual phase." });
    }

    const lastPeriod = cycles[0];
    const lastStartDate = new Date(lastPeriod.startDate);
    const now = new Date();
    const daysSinceLastPeriod = Math.floor((now - lastStartDate) / msDay);

    // Get average cycle length for prediction
    const allCycles = await Period.find({ user: userId }).sort({ startDate: 1 }).lean();
    let avgCycleLength = 28; // default

    if (allCycles.length > 1) {
      const starts = allCycles.map(c => new Date(c.startDate));
      const diffs = [];
      for (let i = 0; i < starts.length - 1; i++) {
        const diff = Math.round((starts[i + 1] - starts[i]) / msDay);
        if (diff > 10) diffs.push(diff);
      }
      if (diffs.length) {
        avgCycleLength = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }
    }

    // Determine phase based on days since last period
    let phase;
    let note;

    if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) {
      // During period (menstrual phase)
      phase = "menstrual";
      note = `Day ${daysSinceLastPeriod + 1} of your menstrual phase.`;
    } else if (daysSinceLastPeriod <= 13) {
      // Follicular phase (after period, before ovulation)
      phase = "follicular";
      note = `Day ${daysSinceLastPeriod + 1} of your follicular phase.`;
    } else if (daysSinceLastPeriod >= 14 && daysSinceLastPeriod <= 16) {
      // Ovulation phase (around day 14)
      phase = "ovulation";
      note = `Day ${daysSinceLastPeriod + 1} of your cycle - ovulation phase.`;
    } else if (daysSinceLastPeriod <= avgCycleLength) {
      // Luteal phase (after ovulation until next period)
      phase = "luteal";
      note = `Day ${daysSinceLastPeriod + 1} of your luteal phase.`;
    } else {
      // Beyond average cycle length - might be late period or new cycle starting
      phase = "menstrual";
      note = "Potential start of new menstrual phase.";
    }

    res.json({
      phase,
      daysSinceLastPeriod,
      avgCycleLength,
      note,
      lastPeriodStart: lastPeriod.startDate
    });
  } catch (err) {
    console.error("getCurrentPhase error", err);
    res.status(500).json({ message: "Server error" });
  }
};
