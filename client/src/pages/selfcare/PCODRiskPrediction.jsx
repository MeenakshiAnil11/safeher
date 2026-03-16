import React, { useState } from "react";
import RiskMeter from "../../components/selfcare/RiskMeter";
import PredictionCard from "../../components/selfcare/PredictionCard";

const initial = {
  age: "",
  bmi: "",
  irregularPeriods: "",
  weightGain: "",
  acne: "",
  hairGrowth: "",
  lifestyleActivity: "",
};

export default function PCODRiskPrediction() {
  const [form, setForm] = useState(initial);
  const [risk, setRisk] = useState(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    let score = 15;
    if (Number(form.bmi) > 27) score += 20;
    if (["sometimes", "often", "always"].includes(form.irregularPeriods)) score += 20;
    if (["moderate", "significant"].includes(form.weightGain)) score += 15;
    if (["moderate", "severe"].includes(form.acne)) score += 10;
    if (["moderate", "severe"].includes(form.hairGrowth)) score += 15;
    if (["sedentary", "light"].includes(form.lifestyleActivity)) score += 10;
    setRisk(Math.min(100, score));
  };

  const level = risk == null ? "Low" : risk < 35 ? "Low" : risk < 70 ? "Moderate" : "High";

  return (
    <div className="space-y-6 p-5 text-left font-['Poppins','Inter',sans-serif] leading-[1.5]">
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-[24px] font-bold text-slate-800">Health Assessment Form</h2>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">Age</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                placeholder="Enter your age"
                value={form.age}
                onChange={(e) => setField("age", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">BMI</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                placeholder="Body Mass Index"
                value={form.bmi}
                onChange={(e) => setField("bmi", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">Irregular Periods</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                value={form.irregularPeriods}
                onChange={(e) => setField("irregularPeriods", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="sometimes">Sometimes</option>
                <option value="often">Often</option>
                <option value="always">Always</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">Weight Gain</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                value={form.weightGain}
                onChange={(e) => setField("weightGain", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="slight">Slight</option>
                <option value="moderate">Moderate</option>
                <option value="significant">Significant</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">Acne</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                value={form.acne}
                onChange={(e) => setField("acne", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">Excess Hair Growth</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                value={form.hairGrowth}
                onChange={(e) => setField("hairGrowth", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[16px] font-medium text-slate-700">Lifestyle Activity Level</span>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700"
                value={form.lifestyleActivity}
                onChange={(e) => setField("lifestyleActivity", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="high">Very Active</option>
              </select>
            </label>

            <button className="mt-2 w-fit rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-10 py-3 text-lg font-semibold text-white">
              Analyze Risk
            </button>
          </form>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl bg-purple-50 p-5 ring-1 ring-purple-100">
            <h3 className="text-[24px] font-bold text-slate-800">About PCOD</h3>
            <p className="mt-3 text-[16px] font-normal text-slate-700">
              Polycystic Ovary Disease (PCOD) is a hormonal disorder common among women of reproductive age.
            </p>
            <h4 className="mt-4 text-[16px] font-semibold text-slate-800">Common Symptoms:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] font-normal text-slate-700 marker:text-purple-500">
              <li>Irregular menstrual cycles</li>
              <li>Weight gain</li>
              <li>Acne and oily skin</li>
              <li>Excess facial/body hair</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-cyan-50 p-5 ring-1 ring-cyan-100">
            <h3 className="text-[24px] font-bold text-slate-800">Risk Factors</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[16px] font-normal text-slate-700 marker:text-cyan-500">
              <li>Family history of PCOD</li>
              <li>Obesity or being overweight</li>
              <li>Sedentary lifestyle</li>
              <li>Insulin resistance</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <h3 className="text-[24px] font-bold text-slate-800">Prevention Tips</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[16px] font-normal text-slate-700 marker:text-pink-500">
              <li>Regular exercise (30+ min/day)</li>
              <li>Balanced, nutritious diet</li>
              <li>Maintain healthy weight</li>
              <li>Stress management</li>
            </ul>
          </article>
        </aside>
      </section>

      {risk != null ? (
        <div className="grid gap-4 md:grid-cols-2">
          <RiskMeter value={risk} />
          <PredictionCard
            title="PCOD Risk Score"
            level={level}
            confidence={Math.max(75, risk)}
            recommendations={[
              "Follow balanced low-glycemic diet.",
              "Maintain regular exercise schedule.",
              "Consult gynecologist for hormonal panel.",
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
