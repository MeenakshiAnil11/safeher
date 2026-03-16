import React from "react";
import { FaRunning, FaHeartbeat, FaLightbulb, FaSeedling } from "react-icons/fa";

export default function HealthIntelligencePanel({
  healthIntelligence,
  daysUntilOvulation,
  fertileWindowLabel,
}) {
  if (!healthIntelligence) return null;

  return (
    <section className="rounded-2xl p-6 shadow-sm border border-pink-100 bg-gradient-to-r from-pink-100 via-white to-purple-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">SafeHer Health Intelligence</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <article className="bg-white/80 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-2">
            <FaSeedling className="text-pink-500" />
            Current Phase
          </p>
          <p className="text-base font-semibold text-gray-800">{healthIntelligence.phase} Phase</p>
          <p className="text-sm text-gray-600 mt-1">Cycle Day {healthIntelligence.cycleDay}</p>
        </article>

        <article className="bg-white/80 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-2">
            <FaHeartbeat className="text-purple-500" />
            Fertility Status
          </p>
          <p className="text-base font-semibold text-pink-600">{healthIntelligence.fertilityStatus}</p>
          <p className="text-sm text-gray-600 mt-1">Ovulation countdown: {daysUntilOvulation} day(s)</p>
        </article>

        <article className="bg-white/80 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Fertile Window</p>
          <p className="text-base font-semibold text-gray-800">{fertileWindowLabel}</p>
          <p className="text-sm text-gray-600 mt-1">Ovulation day: Cycle Day {healthIntelligence.ovulationDay}</p>
        </article>

        <article className="bg-white/80 rounded-xl p-4 md:col-span-2 xl:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-2">
            <FaRunning className="text-teal-500" />
            Recommended Activities
          </p>
          <div className="flex flex-wrap gap-2">
            {healthIntelligence.exercises.map((item) => (
              <span
                key={item}
                className="text-sm px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100"
              >
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="bg-white/80 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-2">
            <FaLightbulb className="text-amber-500" />
            Health Tip
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{healthIntelligence.healthTip}</p>
        </article>
      </div>
    </section>
  );
}
