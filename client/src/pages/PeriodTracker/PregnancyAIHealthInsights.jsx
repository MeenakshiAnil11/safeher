import React from "react";
import "./PregnancyAIHealthInsights.css";

const scoreBreakdown = [
  { label: "Vitals", value: 90 },
  { label: "Nutrition", value: 85 },
  { label: "Activity", value: 75 },
  { label: "Sleep", value: 80 },
  { label: "Mental", value: 88 },
  { label: "Symptoms", value: 92 },
];

const risks = [
  {
    title: "Gestational Diabetes",
    risk: "Low Risk",
    value: 15,
    tone: "low",
    note: "Your blood sugar levels are within normal range. Continue monitoring and maintain a balanced diet.",
  },
  {
    title: "Preeclampsia",
    risk: "Low Risk",
    value: 20,
    tone: "low",
    note: "Your blood pressure is stable. Continue regular monitoring and reduce sodium intake.",
  },
  {
    title: "Anemia Risk",
    risk: "Moderate Risk",
    value: 35,
    tone: "moderate",
    note: "Your iron levels are slightly low. Increase iron-rich foods and consider supplements.",
  },
  {
    title: "Preterm Birth Risk",
    risk: "Low Risk",
    value: 10,
    tone: "low",
    note: "All indicators are favorable. Continue prenatal care and maintain healthy habits.",
  },
];

const recommendations = [
  { icon: "♡", title: "Monitor Blood Pressure Weekly", priority: "High Priority", text: "Continue regular blood pressure monitoring to catch any changes early." },
  { icon: "〽", title: "Increase Iron-Rich Foods", priority: "Medium Priority", text: "Your iron levels are slightly low. Include more spinach, lentils, and lean meats." },
  { icon: "↗", title: "Maintain Current Weight Gain", priority: "Low Priority", text: "Your weight gain is on track. Continue with balanced nutrition." },
  { icon: "◉", title: "Increase Hydration", priority: "Medium Priority", text: "Aim for 10-12 glasses of water daily to support increased blood volume." },
];

export default function PregnancyAIHealthInsights() {
  return (
    <section className="preg-ai-page">
      <header className="preg-ai-head">
        <h1>AI Health Insights</h1>
        <p>AI-powered analysis of your pregnancy health</p>
      </header>

      <article className="preg-ai-score-card">
        <div className="score-left">
          <p className="label">Overall Pregnancy Health Score</p>
          <h2>
            87 <small>/100</small>
          </h2>
          <span className="badge">Excellent Health</span>

          <h3>Health Score Breakdown</h3>
          <div className="score-bars">
            {scoreBreakdown.map((item) => (
              <div className="bar-row" key={item.label}>
                <span>{item.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${item.value}%` }} />
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="score-right">
          <svg viewBox="0 0 220 220" className="radar" aria-label="Health radar chart">
            <polygon points="110,30 175,65 175,155 110,190 45,155 45,65" className="grid" />
            <polygon points="110,52 160,78 156,142 110,168 62,145 62,80" className="fill" />
            <line x1="110" y1="110" x2="110" y2="30" />
            <line x1="110" y1="110" x2="175" y2="65" />
            <line x1="110" y1="110" x2="175" y2="155" />
            <line x1="110" y1="110" x2="110" y2="190" />
            <line x1="110" y1="110" x2="45" y2="155" />
            <line x1="110" y1="110" x2="45" y2="65" />
          </svg>
          <div className="radar-labels">
            <span className="top">Vitals</span>
            <span className="top-right">Nutrition</span>
            <span className="right">Activity</span>
            <span className="bottom">Sleep</span>
            <span className="left">Mental</span>
            <span className="top-left">Symptoms</span>
          </div>
        </div>
      </article>

      <section className="risk-section">
        <h3>Risk Predictions</h3>
        <div className="risk-grid">
          {risks.map((risk) => (
            <article key={risk.title} className="risk-card">
              <div className="risk-top">
                <h4>{risk.title}</h4>
                <span className={`risk-badge ${risk.tone}`}>{risk.risk}</span>
              </div>
              <p className="risk-label">Risk Level</p>
              <div className="risk-progress">
                <div className={`risk-progress-fill ${risk.tone}`} style={{ width: `${risk.value}%` }} />
              </div>
              <p className="risk-value">{risk.value}%</p>
              <p className="risk-note">{risk.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="recommend-section">
        <h3>◌ AI Recommendations</h3>
        <div className="recommend-list">
          {recommendations.map((item) => (
            <article key={item.title} className="recommend-item">
              <div className="icon">{item.icon}</div>
              <div>
                <div className="rec-top">
                  <strong>{item.title}</strong>
                  <span>{item.priority}</span>
                </div>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="confidence-card">
        <strong>♻ AI Analysis Confidence: 92%</strong>
        <p>
          Our AI model has analyzed your health data based on patterns from thousands of pregnancies.
          This analysis is based on your recent logs and health metrics.
        </p>
        <small>
          Medical Disclaimer: These insights are for informational purposes only and should not replace
          professional medical advice. Always consult your healthcare provider for medical decisions.
        </small>
      </footer>
    </section>
  );
}
