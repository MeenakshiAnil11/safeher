import React from "react";
import { FaNotesMedical } from "react-icons/fa";

export default function SymptomInsightCard({ title, explanation, recentSymptoms = [], interpretation = "" }) {
  return (
    <article className="bg-purple-50 rounded-2xl p-5 shadow-sm border border-purple-100">
      <div className="flex items-start gap-3">
        <span className="text-purple-500 mt-1">
          <FaNotesMedical />
        </span>
        <div>
          <h4 className="text-base font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{explanation}</p>
          {recentSymptoms.length ? (
            <div className="mt-2">
              <p className="text-xs font-semibold text-purple-800">Recent symptoms:</p>
              <ul className="text-xs text-purple-700 mt-1 space-y-1">
                {recentSymptoms.slice(0, 3).map((symptom) => (
                  <li key={symptom}>• {symptom}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {interpretation ? (
            <p className="text-xs text-purple-700 mt-2">
              Interpretation: {interpretation}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
