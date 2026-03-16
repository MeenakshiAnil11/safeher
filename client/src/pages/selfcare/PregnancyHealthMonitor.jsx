import React, { useState } from "react";
const symptomList = ["Nausea/Vomiting", "Headaches", "Swelling", "Back Pain", "Fatigue", "Dizziness"];

export default function PregnancyHealthMonitor() {
  const [form, setForm] = useState({
    bloodPressure: "",
    bloodSugar: "",
    heartRate: "",
    temperature: "",
    weight: "",
    sleepHours: "",
    symptoms: [],
    scan: null,
  });
  const [risks, setRisks] = useState(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleSymptom = (symptom) =>
    setForm((p) => ({
      ...p,
      symptoms: p.symptoms.includes(symptom) ? p.symptoms.filter((s) => s !== symptom) : [...p.symptoms, symptom],
    }));

  const submit = (e) => {
    e.preventDefault();
    setRisks({
      diabetes: Number(form.bloodSugar) > 130 ? "High" : "Low",
      preeclampsia: form.bloodPressure.includes("/") && Number(form.bloodPressure.split("/")[0]) > 135 ? "Moderate" : "Low",
      anemia: Number(form.sleepHours) < 6 || form.symptoms.includes("Fatigue") ? "Moderate" : "Low",
    });
  };

  const badge = (level) =>
    level === "High"
      ? "bg-rose-100 text-rose-700"
      : level === "Moderate"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="space-y-6 p-5 text-left font-['Poppins','Inter',sans-serif] leading-[1.5]">
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-[24px] font-bold text-slate-800">Health Metrics</h2>
          <form onSubmit={submit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[16px] font-medium text-slate-700">Blood Pressure (mmHg)</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700" placeholder="e.g., 120/80" value={form.bloodPressure} onChange={(e) => setField("bloodPressure", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[16px] font-medium text-slate-700">Blood Sugar (mg/dL)</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700" placeholder="e.g., 95" value={form.bloodSugar} onChange={(e) => setField("bloodSugar", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[16px] font-medium text-slate-700">Heart Rate (bpm)</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700" placeholder="e.g., 72" value={form.heartRate} onChange={(e) => setField("heartRate", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[16px] font-medium text-slate-700">Body Temperature (°F)</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700" placeholder="e.g., 98.6" value={form.temperature} onChange={(e) => setField("temperature", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[16px] font-medium text-slate-700">Weight (lbs)</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700" placeholder="e.g., 145" value={form.weight} onChange={(e) => setField("weight", e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[16px] font-medium text-slate-700">Sleep Hours</span>
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700" placeholder="e.g., 7.5" value={form.sleepHours} onChange={(e) => setField("sleepHours", e.target.value)} />
              </label>
            </div>

            <div>
              <p className="mb-2 text-[16px] font-medium text-slate-700">Symptoms Checklist</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {symptomList.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`rounded-2xl border px-4 py-2 text-base ${
                      form.symptoms.includes(s)
                        ? "border-pink-500 bg-pink-50 text-pink-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[16px] font-medium text-slate-700">Upload Ultrasound Scan (Optional)</p>
              <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <span className="mb-2 block text-4xl text-slate-400">⤴</span>
                <span className="block text-base text-slate-600">Drag and drop or click to upload</span>
                <span className="mt-2 inline-flex rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Browse Files</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => setField("scan", e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-3 text-lg font-semibold text-white">
              Analyze Pregnancy Health
            </button>
          </form>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl bg-purple-50 p-5 ring-1 ring-purple-100">
            <h3 className="text-[24px] font-bold text-slate-800">Pregnancy Milestones</h3>
            <ul className="mt-3 space-y-2 text-[16px] font-normal text-slate-700">
              <li><strong className="text-pink-600">1st:</strong> Trimester (Weeks 1-12)</li>
              <li><strong className="text-pink-600">2nd:</strong> Trimester (Weeks 13-26)</li>
              <li><strong className="text-pink-600">3rd:</strong> Trimester (Weeks 27-40)</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-purple-50 p-5 ring-1 ring-purple-100">
            <h3 className="text-[24px] font-bold text-slate-800">Warning Signs</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[16px] font-normal text-slate-700 marker:text-purple-500">
              <li>Severe abdominal pain</li>
              <li>Vaginal bleeding</li>
              <li>Severe headaches</li>
              <li>Vision changes</li>
              <li>Decreased fetal movement</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-cyan-50 p-5 ring-1 ring-cyan-100">
            <h3 className="text-[24px] font-bold text-slate-800">Healthy Habits</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[16px] font-normal text-slate-700 marker:text-cyan-500">
              <li>Regular prenatal visits</li>
              <li>Balanced nutrition</li>
              <li>Gentle exercise</li>
              <li>Stress management</li>
              <li>Adequate sleep (7-9 hrs)</li>
            </ul>
          </article>
        </aside>
      </section>

      {risks ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-900">Pregnancy Risk Predictions</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Gestational Diabetes</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${badge(risks.diabetes)}`}>{risks.diabetes}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Preeclampsia</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${badge(risks.preeclampsia)}`}>{risks.preeclampsia}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Anemia</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${badge(risks.anemia)}`}>{risks.anemia}</span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
