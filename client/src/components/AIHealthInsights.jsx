import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import detectPatterns from "../ai/symptomPatternDetector";
import { getStoredLogs } from "../services/perimenopauseService";

const severityStyle = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-green-200 bg-green-50 text-green-800",
  info: "border-lavender-200 bg-lavender-50 text-lavender-800",
};

export default function AIHealthInsights({ logs = null, compact = false, maxItems = 4, title = "AI Health Insights" }) {
  const [resolvedLogs, setResolvedLogs] = useState([]);

  useEffect(() => {
    if (Array.isArray(logs)) {
      setResolvedLogs(logs);
      return undefined;
    }

    let mounted = true;
    const load = async () => {
      try {
        const response = await api.get("/perimenopause/symptoms");
        const apiLogs = Array.isArray(response.data?.logs) ? response.data.logs : [];
        if (mounted) setResolvedLogs(apiLogs.length ? apiLogs : getStoredLogs());
      } catch (error) {
        if (mounted) setResolvedLogs(getStoredLogs());
      }
    };

    load();
    const onStorage = () => setResolvedLogs(getStoredLogs());
    const onLogsUpdated = () => setResolvedLogs(getStoredLogs());
    window.addEventListener("storage", onStorage);
    window.addEventListener("perimenopause-logs-updated", onLogsUpdated);
    const interval = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("perimenopause-logs-updated", onLogsUpdated);
      window.clearInterval(interval);
    };
  }, [logs]);

  const insights = useMemo(() => detectPatterns(resolvedLogs).slice(0, maxItems), [resolvedLogs, maxItems]);

  return (
    <section className={`rounded-2xl border border-lavender-100 bg-white ${compact ? "p-3" : "p-5"} shadow-sm`}>
      <h3 className={`${compact ? "text-base" : "text-xl"} font-semibold text-gray-800 mb-3`}>{title}</h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className={`rounded-xl border p-3 ${severityStyle[insight.severity] || severityStyle.info}`}
          >
            <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>{insight.title}</p>
            <p className={`${compact ? "text-xs" : "text-sm"} mt-1`}>{insight.message}</p>
            {insight.prediction && (
              <p className={`${compact ? "text-xs" : "text-sm"} mt-1 font-medium`}>
                Prediction: {insight.prediction}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
