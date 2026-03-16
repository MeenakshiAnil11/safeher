import React from "react";

export default function HealthChart({ title, data = [], color = "#8B5CF6" }) {
  const max = Math.max(...data, 1);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <div className="mt-4 flex h-28 items-end gap-2">
        {data.map((value, idx) => (
          <div key={`${title}-${idx}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${(value / max) * 100}%`,
                background: color,
                minHeight: "8px",
              }}
            />
            <span className="text-[11px] text-slate-500">W{idx + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
