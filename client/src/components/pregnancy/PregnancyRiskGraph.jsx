import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { calculatePregnancyRisks } from "../../services/pregnancyRiskService";
import "./PregnancyRiskGraph.css";

const riskColor = (value) => {
  if (value >= 70) return "#ef4444";
  if (value >= 35) return "#f59e0b";
  return "#22c55e";
};

const toHealthInput = (source = {}) => ({
  systolic: Number(source?.systolic ?? source?.bloodPressure?.systolic) || 0,
  diastolic: Number(source?.diastolic ?? source?.bloodPressure?.diastolic) || 0,
  bloodSugar: Number(source?.bloodSugar) || 0,
  hemoglobin: Number(source?.hemoglobin ?? source?.hb) || 0,
  weightGain: Number(source?.weightGain) || 0,
  sleepHours: Number(source?.sleepHours) || 0,
  symptoms: Array.isArray(source?.symptoms) ? source.symptoms : [],
});

const formatInsight = (highestRisk, currentInput) => {
  if (!highestRisk) {
    return "No significant pregnancy risk signals detected from current logs. Continue regular hydration, nutrition, and prenatal follow-ups.";
  }

  if (highestRisk.key === "anemia") {
    return "Anemia risk is elevated. Increase iron-rich foods and discuss hemoglobin testing in your next prenatal visit.";
  }
  if (highestRisk.key === "preeclampsia") {
    return "Preeclampsia risk is elevated due to blood pressure trends. Monitor BP regularly and reduce sodium intake.";
  }
  if (highestRisk.key === "gestationalDiabetes") {
    return "Gestational diabetes risk is elevated. Focus on low glycemic meals and review glucose monitoring with your doctor.";
  }
  if (highestRisk.key === "pretermBirth") {
    return "Preterm birth risk is elevated. Prioritize rest, monitor contractions, and seek care if warning symptoms appear.";
  }

  if ((currentInput.sleepHours || 0) < 6) {
    return "Sleep duration appears low, which may influence risk levels. Aim for 7-9 hours sleep and stress reduction.";
  }

  return "Risk profile is stable. Keep logging vitals and symptoms for better weekly risk prediction.";
};

export default function PregnancyRiskGraph({ currentHealthData = {}, logs = [] }) {
  const currentInput = useMemo(() => toHealthInput(currentHealthData), [currentHealthData]);
  const currentResult = useMemo(() => calculatePregnancyRisks(currentInput), [currentInput]);

  const barData = useMemo(
    () =>
      currentResult.risks.map((risk) => ({
        name: risk.label,
        risk: risk.percentage,
      })),
    [currentResult]
  );

  const trendData = useMemo(() => {
    const weekBuckets = logs.reduce((acc, log) => {
      const weekKey = Number(log?.week) || 0;
      if (!weekKey) return acc;
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: `W${weekKey}`,
          preeclampsia: [],
          gestationalDiabetes: [],
          anemia: [],
          pretermBirth: [],
        };
      }
      const result = calculatePregnancyRisks(toHealthInput(log));
      result.risks.forEach((risk) => {
        acc[weekKey][risk.key].push(risk.percentage);
      });
      return acc;
    }, {});

    const avg = (values) =>
      values.length ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length) : 0;

    return Object.keys(weekBuckets)
      .map((week) => {
        const bucket = weekBuckets[week];
        return {
          week: bucket.week,
          preeclampsia: avg(bucket.preeclampsia),
          gestationalDiabetes: avg(bucket.gestationalDiabetes),
          anemia: avg(bucket.anemia),
          pretermBirth: avg(bucket.pretermBirth),
        };
      })
      .sort((a, b) => Number(a.week.slice(1)) - Number(b.week.slice(1)))
      .slice(-8);
  }, [logs]);

  const highestRisk = useMemo(() => {
    return [...currentResult.risks].sort((a, b) => b.percentage - a.percentage)[0];
  }, [currentResult]);

  const aiInsight = useMemo(() => formatInsight(highestRisk, currentInput), [highestRisk, currentInput]);

  return (
    <article className="preg-risk-graph-card">
      <h3>AI Pregnancy Risk Analysis</h3>
      <div className="preg-risk-graph-grid">
        <div className="preg-risk-chart-block">
          <h4>Current Risk Levels (%)</h4>
          <div className="risk-category-tooltips">
            <span title="Risk of high blood pressure complications during pregnancy">Preeclampsia</span>
            <span title="Risk of elevated glucose levels developing in pregnancy">Gestational Diabetes</span>
            <span title="Risk linked to low hemoglobin or iron levels">Anemia</span>
            <span title="Risk of early labor based on current indicators">Preterm Birth</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Risk"]} />
              <Bar dataKey="risk" radius={[8, 8, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={riskColor(entry.risk)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="preg-risk-chart-block">
          <h4>Weekly Risk Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Risk"]} />
              <Legend />
              <Line type="monotone" dataKey="preeclampsia" stroke="#ef4444" strokeWidth={2.2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="gestationalDiabetes" stroke="#f59e0b" strokeWidth={2.2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="anemia" stroke="#a855f7" strokeWidth={2.2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="pretermBirth" stroke="#06b6d4" strokeWidth={2.2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="preg-risk-ai-insight">
        <h4>AI Risk Insight</h4>
        <p>{aiInsight}</p>
      </div>
    </article>
  );
}
