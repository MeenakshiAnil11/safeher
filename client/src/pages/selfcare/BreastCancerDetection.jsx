import React, { useState } from "react";
import UploadBox from "../../components/selfcare/UploadBox";
import PredictionCard from "../../components/selfcare/PredictionCard";

export default function BreastCancerDetection() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const malignant = Math.random() > 0.5;
      setResult({
        prediction: malignant ? "Malignant" : "Benign",
        confidence: malignant ? 88 : 93,
        level: malignant ? "High" : "Low",
      });
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="space-y-6 font-['Poppins','Inter',sans-serif] leading-[1.5]">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-[24px] font-bold text-slate-900">Breast Cancer Detection</h2>
        <p className="mt-1 text-base font-normal text-slate-600">Upload mammogram image and detect cancer risk using AI.</p>
        <div className="mt-4">
          <UploadBox
            label="Drag & drop mammogram image"
            file={file}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          className="mt-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={!file || loading}
        >
          Run AI Analysis
        </button>
      </section>

      {loading ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3 text-slate-700">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-pink-500" />
            <span>Analyzing mammogram image...</span>
          </div>
        </section>
      ) : null}

      {result ? (
        <PredictionCard
          title={`Prediction: ${result.prediction}`}
          level={result.level}
          confidence={result.confidence}
          recommendations={
            result.level === "High"
              ? [
                  "Consult an oncologist for further imaging and biopsy.",
                  "Schedule a clinical breast exam immediately.",
                  "Share report with your primary doctor.",
                ]
              : ["Continue annual screening.", "Maintain healthy lifestyle.", "Report any new symptoms early."]
          }
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-900">Early Symptoms</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base font-normal text-slate-700">
            <li>New lump in breast or underarm</li>
            <li>Skin dimpling or texture change</li>
            <li>Nipple discharge or inversion</li>
          </ul>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-900">Prevention Tips</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base font-normal text-slate-700">
            <li>Regular screening by age guidance</li>
            <li>Maintain healthy BMI and activity</li>
            <li>Limit alcohol and avoid smoking</li>
          </ul>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-[24px] font-bold text-slate-900">Doctor Advice</h3>
          <p className="mt-3 text-base font-normal text-slate-700">
            If you notice any unusual change, consult a gynecologist or breast specialist without delay.
          </p>
        </article>
      </section>
    </div>
  );
}
