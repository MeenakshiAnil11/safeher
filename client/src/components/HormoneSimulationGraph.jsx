import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { groupLogsByLastDays } from "../services/perimenopauseService";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function HormoneSimulationGraph({ logs = [] }) {
  const simulation = useMemo(() => {
    const rows = groupLogsByLastDays(logs, 7);
    return rows.map((row) => {
      const hotFlash = Number(row.hotFlashIntensity) || 0;
      const sleep = Number(row.sleepQuality) || 0;
      const mood = Number(row.mood) || 0;
      const estrogen = clamp(85 - hotFlash * 6 - (5 - sleep) * 3, 10, 95);
      const progesterone = clamp(78 - hotFlash * 4 - (5 - sleep) * 4, 10, 90);
      const moodStability = clamp(30 + mood * 14 + sleep * 6 - hotFlash * 4, 5, 98);
      return {
        day: row.day,
        estrogen: Number(estrogen.toFixed(1)),
        progesterone: Number(progesterone.toFixed(1)),
        moodStability: Number(moodStability.toFixed(1)),
      };
    });
  }, [logs]);

  return (
    <section className="bg-white rounded-2xl p-6 shadow-lg border border-lavender-100 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Hormone Simulation Graph</h3>
      <p className="text-sm text-gray-600 mb-4">
        Simulated Estrogen, Progesterone, and Mood Stability based on symptom trends.
      </p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={simulation}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="estrogen" stroke="#ec4899" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="progesterone" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="moodStability" stroke="#14b8a6" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
