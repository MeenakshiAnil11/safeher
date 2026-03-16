import React from "react";
import FeatureCard from "../../components/selfcare/FeatureCard";

const features = [
  {
    id: "breast-cancer",
    icon: "🎗️",
    iconTone: "bg-pink-100 text-pink-600",
    title: "Breast Cancer Detection",
    description: "Upload mammogram image and detect cancer risk using AI.",
  },
  {
    id: "pcod-risk",
    icon: "🧬",
    iconTone: "bg-violet-100 text-violet-600",
    title: "PCOD Risk Prediction",
    description: "Enter symptoms and analyze PCOD risk.",
  },
  {
    id: "pregnancy-monitor",
    icon: "🤰",
    iconTone: "bg-cyan-100 text-cyan-600",
    title: "Pregnancy Health Monitor",
    description: "Track maternal health and pregnancy risks.",
  },
  {
    id: "breast-exam-guide",
    icon: "🩷",
    iconTone: "bg-rose-100 text-rose-600",
    title: "Self Breast Examination Guide",
    description: "Educational guide for self breast exams.",
  },
];

export default function SelfCareDashboard({ onNavigate }) {
  return (
    <div className="space-y-6 font-['Poppins','Inter',sans-serif] leading-[1.5]">
      <section className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 p-6 text-white shadow-sm ring-1 ring-pink-300/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[24px] font-bold">✧ Health Awareness Score</p>
            <p className="mt-1 text-base font-normal opacity-95">Your preventive health overview</p>
          </div>
          <div className="text-right">
            <p className="text-6xl font-bold leading-none">87</p>
            <p className="text-base font-normal opacity-95">out of 100</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-800">↗ Latest AI Insights</h3>
          <p className="mt-2 text-base font-normal text-slate-600">Your health metrics are improving. Keep up the good work!</p>
        </article>
        <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-800">♡ Preventive Health</h3>
          <p className="mt-2 text-base font-normal text-slate-600">Consider scheduling your annual checkup soon.</p>
        </article>
        <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-800">▣ Wellness Tips</h3>
          <p className="mt-2 text-base font-normal text-slate-600">Self breast examination recommended this week.</p>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-[24px] font-bold text-slate-800">Health Tools</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconTone={feature.iconTone}
              onStart={() => onNavigate(feature.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
