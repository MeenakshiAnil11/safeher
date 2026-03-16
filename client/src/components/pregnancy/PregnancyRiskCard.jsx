import React, { useMemo } from "react";
import { calculatePregnancyRisks } from "../../services/pregnancyRiskService";
import "./PregnancyRiskCard.css";

const levelClass = (level) => {
  if (level === "High") return "high";
  if (level === "Medium") return "medium";
  return "low";
};

export default function PregnancyRiskCard({ healthData }) {
  const result = useMemo(() => calculatePregnancyRisks(healthData || {}), [healthData]);

  return (
    <article className="preg-card pregnancy-risk-card">
      <h3>🧠 AI Pregnancy Risk Predictor</h3>
      <div className="pregnancy-risk-list">
        {result.risks.map((risk) => (
          <div className="pregnancy-risk-row" key={risk.key}>
            <span>{risk.label}</span>
            <strong className={`risk-pill ${levelClass(risk.level)}`}>{risk.level}</strong>
          </div>
        ))}
      </div>

      {result.highRisk ? (
        <div className="pregnancy-risk-alert">
          ⚠ Medical Attention Recommended
        </div>
      ) : null}
    </article>
  );
}
