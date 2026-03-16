import React from "react";
import { FaThermometerHalf } from "react-icons/fa";

export default function TemperatureInsightCard({ title, explanation, detail, value }) {
  return (
    <article className="bg-sky-50 rounded-2xl p-5 shadow-sm border border-sky-100">
      <div className="flex items-start gap-3">
        <span className="text-sky-500 mt-1">
          <FaThermometerHalf />
        </span>
        <div>
          <h4 className="text-base font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{explanation}</p>
          {value !== null && value !== undefined ? (
            <p className="text-xs text-sky-700 mt-2">Today's basal body temperature: {value}°C</p>
          ) : null}
          {detail ? <p className="text-xs text-sky-700 mt-1">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}
