import React from "react";
import HealthChart from "../../components/selfcare/HealthChart";

export default function AIHealthInsights() {
  return (
    <div className="space-y-6 font-['Poppins','Inter',sans-serif] leading-[1.5]">
      <section className="grid gap-4 md:grid-cols-3">
        <HealthChart title="Health Risk Score" data={[45, 52, 48, 41, 36]} color="#EC4899" />
        <HealthChart title="PCOD Probability" data={[60, 58, 50, 42, 39]} color="#8B5CF6" />
        <HealthChart title="Pregnancy Health Score" data={[62, 68, 73, 78, 81]} color="#06B6D4" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <HealthChart title="Weight Trend" data={[58, 58.5, 59, 59.4, 59.8]} color="#06B6D4" />
        <HealthChart title="Blood Pressure Trend" data={[120, 118, 122, 121, 119]} color="#8B5CF6" />
        <HealthChart title="Health Activity Trend" data={[30, 45, 55, 70, 72]} color="#EC4899" />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-[24px] font-bold text-slate-900">AI Recommendation Panel</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base font-normal text-slate-700">
          <li>Keep blood sugar in healthy range with high-fiber meals and regular checkups.</li>
          <li>Your recent trend indicates improved activity; continue 30 minutes daily movement.</li>
          <li>Book follow-up with gynecologist for preventive screening this month.</li>
        </ul>
      </section>
    </div>
  );
}
