import React from "react";

export default function RiskMeter({ value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const riskLabel = safeValue < 35 ? "Low" : safeValue < 70 ? "Moderate" : "High";

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Risk Level</span>
        <span className="text-sm font-semibold text-slate-900">{riskLabel}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-600">{safeValue}%</p>
    </div>
  );
}
