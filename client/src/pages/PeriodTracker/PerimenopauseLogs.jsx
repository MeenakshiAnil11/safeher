import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { detectPatterns, filterLogsByDate, getStoredLogs } from "../../services/perimenopauseService";

export default function PerimenopauseLogs() {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await api.get("/perimenopause/symptoms");
        const apiLogs = Array.isArray(response.data?.logs) ? response.data.logs : [];
        setLogs(apiLogs.length ? apiLogs : getStoredLogs());
      } catch (error) {
        setLogs(getStoredLogs());
      }
    };
    loadLogs();
  }, []);

  const filtered = useMemo(() => filterLogsByDate(logs, startDate, endDate), [logs, startDate, endDate]);
  const warnings = useMemo(() => detectPatterns(filtered), [filtered]);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-lavender-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Historical Symptom Logs</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="font-semibold text-amber-800">Pattern Warnings</p>
          {warnings.map((warning) => (
            <p key={warning} className="text-sm text-amber-700">- {warning}</p>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Date</th>
              <th>Mood</th>
              <th>Hot Flash</th>
              <th>Sleep</th>
              <th>Cycle</th>
              <th>Weight</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={`${log.date}-${log.notes || "log"}`} className="border-b border-gray-100">
                <td className="py-2">{new Date(log.date).toLocaleDateString()}</td>
                <td className="capitalize">{log.mood}</td>
                <td>{log.hotFlashIntensity}/10</td>
                <td>{log.sleepQuality}/5</td>
                <td className="capitalize">{log.cycleStatus}</td>
                <td>{log.weight || "-"}</td>
                <td className="max-w-xs truncate">{log.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!filtered.length && <p className="text-gray-500 py-4 text-center">No logs in selected date range.</p>}
    </section>
  );
}
