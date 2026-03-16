import React from "react";

export default function FeatureCard({ icon, title, description, onStart, iconTone = "bg-pink-100 text-pink-600" }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${iconTone}`}>
        {icon}
      </div>
      <h3 className="text-[20px] font-bold text-slate-900 leading-snug">{title}</h3>
      <p className="mt-2 text-base font-normal text-slate-600 leading-relaxed">{description}</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-2 text-base font-semibold text-white shadow-sm hover:from-pink-600 hover:to-fuchsia-600"
      >
        Start Check
      </button>
    </article>
  );
}
