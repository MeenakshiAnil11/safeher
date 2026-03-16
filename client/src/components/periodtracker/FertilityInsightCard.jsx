import React from "react";
import { FaSeedling } from "react-icons/fa";

export default function FertilityInsightCard({ title, explanation, meta }) {
  return (
    <article className="bg-pink-50 rounded-2xl p-5 shadow-sm border border-pink-100">
      <div className="flex items-start gap-3">
        <span className="text-pink-500 mt-1">
          <FaSeedling />
        </span>
        <div>
          <h4 className="text-base font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{explanation}</p>
          {meta ? <p className="text-xs text-pink-700 mt-2">{meta}</p> : null}
        </div>
      </div>
    </article>
  );
}
