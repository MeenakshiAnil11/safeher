import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./periodTracker.css";

// Convert Date -> yyyy-mm-dd string for comparisons
const ymd = (d) => new Date(d).toISOString().slice(0, 10);
const MS_DAY = 24 * 60 * 60 * 1000;

// Expand a date range into an array of yyyy-mm-dd strings
function expandRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const arr = [];
  for (let d = new Date(s); d <= e; d = new Date(d.getTime() + MS_DAY)) {
    arr.push(ymd(d));
  }
  return arr;
}

export default function CalendarView() {
  const [periodDaysSet, setPeriodDaysSet] = useState(new Set());
  const [predictedDaysSet, setPredictedDaysSet] = useState(new Set());
  const [fertileDaysSet, setFertileDaysSet] = useState(new Set());
  const [ovulationDay, setOvulationDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const [histRes, predRes] = await Promise.all([
          fetch("/api/periods/history", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/periods/prediction", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const hist = await histRes.json();
        const pred = await predRes.json();

        // Process historical cycles
        const days = new Set();
        (hist.cycles || []).forEach(c => {
          expandRange(c.startDate, c.endDate).forEach(d => days.add(d));
        });
        setPeriodDaysSet(days);

        // Extend predictions for the next 8 cycles (≈ 8 months)
        const avgCycleLength = pred.avgCycleLength || 28;
        const avgDuration = pred.avgDuration || 5;
        const baseNextStart = pred.nextPeriodStart ? new Date(pred.nextPeriodStart) : null;

        const extendedPredicted = new Set();
        const extendedFertile = new Set();
        let firstOvulation = null;

        if (baseNextStart) {
          for (let i = 0; i < 8; i++) {
            const cycleStart = new Date(baseNextStart.getTime() + i * avgCycleLength * MS_DAY);
            // Predicted bleeding days for this cycle
            for (let d = 0; d < avgDuration; d++) {
              extendedPredicted.add(ymd(new Date(cycleStart.getTime() + d * MS_DAY)));
            }
            // Ovulation and fertile window around mid-cycle
            const ovu = new Date(cycleStart.getTime() + Math.round(avgCycleLength / 2) * MS_DAY);
            if (!firstOvulation) firstOvulation = ymd(ovu);
            const fertileStart = new Date(ovu.getTime() - 5 * MS_DAY);
            const fertileEnd = new Date(ovu.getTime() + 1 * MS_DAY);
            expandRange(fertileStart, fertileEnd).forEach(d => extendedFertile.add(d));
          }
        }

        setPredictedDaysSet(extendedPredicted);
        setFertileDaysSet(extendedFertile);
        setOvulationDay(firstOvulation);

        setLoading(false);
      } catch (err) {
        console.error("Calendar load error", err);
        setLoading(false);
      }
    }
    load();
  }, []);

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const key = ymd(date);
    if (periodDaysSet.has(key)) return "pt-period-day";
    if (ovulationDay === key) return "pt-ovulation-day";
    if (fertileDaysSet.has(key)) return "pt-fertile-day";
    if (predictedDaysSet.has(key)) return "pt-predicted-day";
    return null;
  };

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="pt-calendar-wrap">

      <Calendar tileClassName={tileClassName} />
      <div className="pt-legend">
        <span><i className="dot period"></i> Period day</span>
        <span><i className="dot predicted"></i> Predicted day</span>
        <span><i className="dot fertile"></i> Fertile window</span>
        <span><i className="dot ovulation"></i> Ovulation</span>
      </div>
    </div>
  );
}
  