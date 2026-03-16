import Period from "../models/Period.js";
import PDFDocument from "pdfkit";
import XLSX from "xlsx";

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
 * GET /api/periods/export.pdf
 * Returns PDF of user's cycles
 */
export const exportPdf = async (req, res) => {
  let doc = null;
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: -1 }).lean();

    // Validate we have PDFDocument available
    if (!PDFDocument) {
      throw new Error("PDFDocument is not available");
    }

    // Set response headers BEFORE creating PDF document
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cycles.pdf");

    // Create PDF document
    doc = new PDFDocument({ margin: 50 });
    
    // Handle PDF generation errors
    doc.on('error', (err) => {
      console.error("PDF generation stream error:", err);
      // Don't try to send response here as it may already be sent
    });

    // Handle response errors
    res.on('error', (err) => {
      console.error("Response stream error:", err);
      if (doc) {
        doc.destroy();
      }
    });

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text("Cycle History", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    const itemHeight = 25;
    const pageWidth = doc.page.width - 100;
    const colWidths = {
      start: pageWidth * 0.25,
      end: pageWidth * 0.25,
      duration: pageWidth * 0.15,
      intensity: pageWidth * 0.15,
      notes: pageWidth * 0.2
    };

    // Header row
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Start Date", 50, tableTop);
    doc.text("End Date", 50 + colWidths.start, tableTop);
    doc.text("Duration", 50 + colWidths.start + colWidths.end, tableTop);
    doc.text("Intensity", 50 + colWidths.start + colWidths.end + colWidths.duration, tableTop);
    doc.text("Notes", 50 + colWidths.start + colWidths.end + colWidths.duration + colWidths.intensity, tableTop);
    
    // Draw header line
    doc.moveTo(50, tableTop + 15).lineTo(pageWidth + 50, tableTop + 15).stroke();
    doc.moveDown();

    // Data rows
    doc.font("Helvetica").fontSize(9);
    let yPos = tableTop + itemHeight;
    
    if (cycles.length === 0) {
      doc.text("No cycles logged yet.", 50, yPos);
    } else {
      cycles.forEach((cycle, index) => {
        // Check if we need a new page
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        }

        const startDate = new Date(cycle.startDate).toLocaleDateString();
        const endDate = new Date(cycle.endDate).toLocaleDateString();
        const duration = cycle.duration || "";
        const intensity = cycle.intensity || "";
        const notes = (cycle.notes || "").substring(0, 30) + (cycle.notes && cycle.notes.length > 30 ? "..." : "");

        doc.text(startDate, 50, yPos);
        doc.text(endDate, 50 + colWidths.start, yPos);
        doc.text(String(duration), 50 + colWidths.start + colWidths.end, yPos);
        doc.text(intensity, 50 + colWidths.start + colWidths.end + colWidths.duration, yPos);
        doc.text(notes, 50 + colWidths.start + colWidths.end + colWidths.duration + colWidths.intensity, yPos);
        
        yPos += itemHeight;
      });
    }

    // Footer
    doc.fontSize(8).text(
      `Total cycles: ${cycles.length}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("exportPdf error", err);
    // Only send error if response hasn't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error: " + err.message });
    } else {
      // If headers already sent, log the error
      console.error("PDF generation failed after headers sent:", err);
    }
  }
};

/**
 * GET /api/periods/export.xlsx
 * Returns Excel file (.xlsx) of user's cycles
 */
export const exportExcel = async (req, res) => {
  try {
    const userId = req.userId;
    const cycles = await Period.find({ user: userId }).sort({ startDate: -1 }).lean();

    // Prepare data for Excel
    const worksheetData = cycles.map((cycle, index) => ({
      "#": index + 1,
      "Start Date": new Date(cycle.startDate).toISOString().slice(0, 10),
      "End Date": new Date(cycle.endDate).toISOString().slice(0, 10),
      "Duration (days)": cycle.duration || "",
      "Intensity": cycle.intensity || "",
      "Mood": cycle.mood || "",
      "Symptoms": Array.isArray(cycle.symptoms) ? cycle.symptoms.join(", ") : "",
      "Notes": cycle.notes || "",
      "Basal Body Temperature (°C)": cycle.basalBodyTemperatureC || "",
      "Resting Heart Rate (BPM)": cycle.restingHeartRateBpm || "",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 12 },  // Start Date
      { wch: 12 },  // End Date
      { wch: 15 },  // Duration
      { wch: 12 },  // Intensity
      { wch: 12 },  // Mood
      { wch: 25 },  // Symptoms
      { wch: 30 },  // Notes
      { wch: 25 },  // BBT
      { wch: 22 },  // Heart Rate
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cycle History");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "buffer", 
      bookType: "xlsx",
      compression: true 
    });

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=cycles.xlsx");
    res.send(excelBuffer);
  } catch (err) {
    console.error("exportExcel error", err);
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

    // Ovulation (≈14 days before next period)
    // For a 28‑day cycle this is day 14; for variable cycles we use (cycleLength - 14)
    const ovulationDay = Math.max(1, avgCycleLength - 14);
    const ovulation = new Date(lastStart.getTime() + ovulationDay * msDay);

    // Fertile window: 5 days before ovulation to 1 day after
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
      return res.json({ 
        avgCycleLength: null, 
        avgDuration: null, 
        isIrregular: false, 
        note: "Log cycles to get insights.",
        totalCycles: 0,
        totalDays: 0,
        commonSymptoms: "None recorded"
      });
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

    // Calculate total cycles tracked
    const totalCycles = cycles.length;

    // Calculate total days of data (sum of all period durations)
    const totalDays = durations.reduce((sum, dur) => sum + dur, 0);

    // Calculate most common symptoms
    const symptomCounts = {};
    cycles.forEach(cycle => {
      if (Array.isArray(cycle.symptoms) && cycle.symptoms.length > 0) {
        cycle.symptoms.forEach(symptom => {
          const symptomKey = symptom.toLowerCase().trim();
          symptomCounts[symptomKey] = (symptomCounts[symptomKey] || 0) + 1;
        });
      }
    });

    // Find most common symptom(s)
    let commonSymptoms = "None recorded";
    if (Object.keys(symptomCounts).length > 0) {
      const sortedSymptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Top 3 most common
      
      commonSymptoms = sortedSymptoms
        .map(([symptom, count]) => `${symptom.charAt(0).toUpperCase() + symptom.slice(1)} (${count}x)`)
        .join(", ");
    }

    res.json({
      avgCycleLength: avgCycleLength || 28,
      avgDuration: avgDuration || 5,
      isIrregular,
      nextPeriodStart: nextStart.toISOString().slice(0,10),
      note: isIrregular ? "Your cycles seem irregular — consider consulting a doctor if concerned." : "Your cycles look regular based on logged data.",
      totalCycles,
      totalDays,
      commonSymptoms
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

    // Determine phase based on day in cycle
    let phase;
    let note;

    const dayInCycle = daysSinceLastPeriod + 1;

    // Estimate ovulation day (14 days before next period)
    const ovulationDay = Math.max(1, avgCycleLength - 14);
    const fertileStartDay = Math.max(1, ovulationDay - 5);
    const fertileEndDay = Math.min(avgCycleLength, ovulationDay + 1);

    if (dayInCycle >= 1 && dayInCycle <= 5) {
      // Menstrual Phase (Days 1–5)
      phase = "menstrual";
      note = `Day ${dayInCycle} of your menstrual phase.`;
    } else if (dayInCycle > 5 && dayInCycle < fertileStartDay) {
      // Follicular Phase (after bleeding ends, before fertile window)
      phase = "follicular";
      note = `Day ${dayInCycle} of your follicular phase.`;
    } else if (dayInCycle >= fertileStartDay && dayInCycle <= fertileEndDay) {
      // Ovulation & Fertile Window (5 days before ovulation to 1 day after)
      phase = "ovulation";
      if (dayInCycle === ovulationDay) {
        note = `Day ${dayInCycle} of your cycle – estimated ovulation day (peak fertility).`;
      } else {
        note = `Day ${dayInCycle} of your cycle – within your fertile window.`;
      }
    } else if (dayInCycle > fertileEndDay && dayInCycle <= avgCycleLength) {
      // Luteal Phase (post‑ovulation until next period)
      phase = "luteal";
      note = `Day ${dayInCycle} of your luteal phase.`;
    } else {
      // Beyond average cycle length – likely new cycle beginning
      phase = "menstrual";
      note = "Potential start of a new menstrual phase based on your average cycle.";
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
