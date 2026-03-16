import React from "react";
import { FaChartLine } from "react-icons/fa";

export default function FertilityScoreCard({ title, explanation, score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <article className="bg-orange-50 rounded-2xl p-5 shadow-sm border border-orange-100">
      <div className="flex items-start gap-3">
        <span className="text-orange-500 mt-1">
          <FaChartLine />
        </span>
        <div className="w-full">
          <h4 className="text-base font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{explanation}</p>
          <div className="mt-3 h-2.5 rounded-full bg-orange-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
              style={{ width: `${safeScore}%` }}
            />
          </div>
          <p className="text-xs text-orange-700 mt-2 font-semibold">{safeScore}% score</p>
        </div>
      </div>
    </article>
  );
}
