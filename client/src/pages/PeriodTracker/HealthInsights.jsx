import React, { useEffect, useState } from "react";
import "./periodTracker.css";

export default function HealthInsights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/periods/insights", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  if (!insights) return <div>Loading insights...</div>;

  const getHealthStatus = () => {
    if (!insights) return { status: 'loading', color: '#636e72' };
    
    if (insights.isIrregular) {
      return { status: 'Irregular patterns detected', color: '#ff7675' };
    } else if (insights.avgCycleLength >= 21 && insights.avgCycleLength <= 35) {
      return { status: 'Healthy cycle patterns', color: '#00b894' };
    } else {
      return { status: 'Monitor cycle patterns', color: '#fdcb6e' };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="health-insights">
      <div className="insights-header">
        <div className="health-status" style={{ borderColor: healthStatus.color }}>
          <div className="status-indicator" style={{ backgroundColor: healthStatus.color }}></div>
          <span style={{ color: healthStatus.color }}>{healthStatus.status}</span>
        </div>
      </div>

      <div className="pt-insights-grid">
        <div className="pt-card insight-card">
          <div className="insight-icon">📊</div>
          <h4>Average Cycle Length</h4>
          <p>{insights.avgCycleLength || 0} days</p>
          <small>Normal range: 21-35 days</small>
        </div>

        <div className="pt-card insight-card">
          <div className="insight-icon">🩸</div>
          <h4>Average Period Duration</h4>
          <p>{insights.avgDuration || 0} days</p>
          <small>Normal range: 3-7 days</small>
        </div>

        <div className="pt-card insight-card">
          <div className="insight-icon">📅</div>
          <h4>Next Period Prediction</h4>
          <p>
            {insights.nextPeriodStart
              ? new Date(insights.nextPeriodStart).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })
              : "Not enough data"}
          </p>
          <small>
            {insights.nextPeriodStart 
              ? `${Math.ceil((new Date(insights.nextPeriodStart) - new Date()) / (1000 * 60 * 60 * 24))} days from now`
              : "Track more cycles for predictions"
            }
          </small>
        </div>

        <div className="pt-card insight-card">
          <div className="insight-icon">⚡</div>
          <h4>Cycle Regularity</h4>
          <p>{insights.isIrregular ? "Irregular" : "Regular"}</p>
          <small>
            {insights.isIrregular 
              ? "Consider consulting a healthcare provider"
              : "Your cycles show consistent patterns"
            }
          </small>
        </div>
      </div>

      {insights.note && (
        <div className="insights-note">
          <h4>📝 Personalized Insights</h4>
          <p>{insights.note}</p>
        </div>
      )}

      <div className="health-tips">
        <h4>💡 Health Tips Based on Your Data</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <h5>🥗 Nutrition</h5>
            <p>Maintain iron-rich foods during your period to combat fatigue and support healthy blood flow.</p>
          </div>
          <div className="tip-card">
            <h5>💧 Hydration</h5>
            <p>Stay well-hydrated throughout your cycle. Aim for 8-10 glasses of water daily.</p>
          </div>
          <div className="tip-card">
            <h5>🏃‍♀️ Exercise</h5>
            <p>Light exercise during your period can help reduce cramps and improve mood.</p>
          </div>
          <div className="tip-card">
            <h5>😴 Sleep</h5>
            <p>Prioritize 7-9 hours of quality sleep, especially during hormonal fluctuations.</p>
          </div>
        </div>
      </div>

      <div className="data-summary">
        <h4>📈 Your Tracking Summary</h4>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Cycles Tracked:</span>
            <span className="stat-value">{insights.totalCycles || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Days of Data:</span>
            <span className="stat-value">{insights.totalDays || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Most Common Symptoms:</span>
            <span className="stat-value">{insights.commonSymptoms || "None recorded"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
