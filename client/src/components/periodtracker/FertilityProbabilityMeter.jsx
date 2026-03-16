import React from "react";
import "./FertilityProbabilityMeter.css";

const levelClassMap = {
  High: "fpm-fill-high",
  Medium: "fpm-fill-medium",
  Low: "fpm-fill-low",
};

const textClassMap = {
  High: "fpm-status-high",
  Medium: "fpm-status-medium",
  Low: "fpm-status-low",
};

export default function FertilityProbabilityMeter({ probability }) {
  const safeProbability = probability || { level: "Low", percentage: 20 };
  const fillWidth = `${Math.max(0, Math.min(100, safeProbability.percentage))}%`;
  const level = safeProbability.level || "Low";

  return (
    <section className="fpm-card">
      <h3 className="fpm-title">Fertility Probability</h3>
      <p className="fpm-subtitle">Chance of Conception Today</p>

      <div className="fpm-bar-track" role="progressbar" aria-valuenow={safeProbability.percentage} aria-valuemin={0} aria-valuemax={100}>
        <div className={`fpm-bar-fill ${levelClassMap[level] || levelClassMap.Low}`} style={{ width: fillWidth }} />
      </div>

      <div className="fpm-meta-row">
        <span className={`fpm-status ${textClassMap[level] || textClassMap.Low}`}>Status: {level} Fertility</span>
        <span className="fpm-percentage">{safeProbability.percentage}%</span>
      </div>
    </section>
  );
}
