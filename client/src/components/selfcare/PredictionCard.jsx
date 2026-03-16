import React from "react";

export default function PredictionCard({ title, level, confidence, recommendations = [] }) {
  const tone =
    level === "High"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : level === "Moderate"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone}`}>{level} Risk</span>
        <span className="text-sm text-slate-600">Confidence: {confidence}%</span>
      </div>
      {!!recommendations.length && (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {recommendations.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
