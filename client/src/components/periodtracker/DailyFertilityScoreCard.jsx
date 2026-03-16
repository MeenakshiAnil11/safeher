import React from "react";
import { FaHeartbeat, FaLeaf } from "react-icons/fa";
import "./DailyFertilityScoreCard.css";

const scoreClassMap = {
  high: "dfsc-fill-high",
  moderate: "dfsc-fill-moderate",
  low: "dfsc-fill-low",
};

const statusClassMap = {
  high: "dfsc-status-high",
  moderate: "dfsc-status-moderate",
  low: "dfsc-status-low",
};

const resolveLevel = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("moderate")) return "moderate";
  return "low";
};

export default function DailyFertilityScoreCard({ data }) {
  const safeData = data || {
    fertilityScore: 0,
    fertilityStatus: "Low Fertility",
    recommendation: "Low fertility today. Focus on wellness and cycle tracking.",
  };
  const level = resolveLevel(safeData.fertilityStatus);

  return (
    <section className="dfsc-card">
      <div className="dfsc-header">
        <h3 className="dfsc-title">
          <FaHeartbeat className="dfsc-title-icon" />
          Daily Fertility Score
        </h3>
        <p className="dfsc-score-value">{safeData.fertilityScore} / 100</p>
      </div>

      <div className="dfsc-bar-track" role="progressbar" aria-valuenow={safeData.fertilityScore} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`dfsc-bar-fill ${scoreClassMap[level]}`}
          style={{ width: `${Math.max(0, Math.min(100, safeData.fertilityScore))}%` }}
        />
      </div>

      <p className={`dfsc-status ${statusClassMap[level]}`}>{safeData.fertilityStatus}</p>

      <p className="dfsc-recommendation">
        <FaLeaf className="dfsc-recommendation-icon" />
        {safeData.recommendation}
      </p>
    </section>
  );
}
