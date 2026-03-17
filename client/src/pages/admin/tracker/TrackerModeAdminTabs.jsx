import React, { useEffect, useMemo, useState } from "react";
import TrackerCrudSection from "./TrackerCrudSection";
import api from "../../../services/api";

const BASE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "governance", label: "Content Governance" },
  { id: "moderation", label: "Community Moderation" },
  { id: "quality", label: "Data Quality" },
  { id: "alerts", label: "Alerts & Risk" },
  { id: "reminders", label: "Reminder Templates" },
  { id: "analytics", label: "Analytics" },
];

export default function TrackerModeAdminTabs({
  moduleKey,
  moduleTitle,
  moduleDescription,
  governanceSections,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/admin/tracker/${moduleKey}/overview`);
      setOverview(res.data);
    } catch (err) {
      setError("Unable to load live user-log overview for this mode.");
      setOverview({
        stats: { totalLogs: 0, activeUsers: 0, logsLast7Days: 0, riskFlags: 0 },
        anomalies: [],
        trend: [],
        recentLogs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [moduleKey]);

  const trendMax = useMemo(() => {
    const counts = overview?.trend?.map((row) => Number(row.count || 0)) || [];
    return Math.max(1, ...counts);
  }, [overview]);

  return (
    <div className="tracker-admin-page">
      <section className="tracker-admin-header">
        <h2>{moduleTitle}</h2>
        <p>{moduleDescription}</p>
      </section>

      <div className="tracker-tabs">
        {BASE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tracker-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <section className="tracker-tab-panel">
          {loading ? <p className="tracker-muted">Loading mode overview...</p> : null}
          {error ? <p className="tracker-error">{error}</p> : null}

          <div className="tracker-summary-grid">
            <article className="tracker-summary-card">
              <h4>Total Logs</h4>
              <strong>{overview?.stats?.totalLogs ?? 0}</strong>
            </article>
            <article className="tracker-summary-card">
              <h4>Active Users</h4>
              <strong>{overview?.stats?.activeUsers ?? 0}</strong>
            </article>
            <article className="tracker-summary-card">
              <h4>Logs (7 days)</h4>
              <strong>{overview?.stats?.logsLast7Days ?? 0}</strong>
            </article>
            <article className="tracker-summary-card warning">
              <h4>Risk Flags</h4>
              <strong>{overview?.stats?.riskFlags ?? 0}</strong>
            </article>
          </div>

          <div className="tracker-two-col">
            <article className="tracker-panel">
              <h3>Anomalies & Warnings</h3>
              {overview?.anomalies?.length ? (
                <div className="tracker-alert-list">
                  {overview.anomalies.map((item) => (
                    <div key={item.id} className={`tracker-alert ${item.level}`}>
                      {item.message}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="tracker-empty">No anomaly warnings for this mode.</p>
              )}
            </article>

            <article className="tracker-panel">
              <h3>Recent Activity Trend</h3>
              {overview?.trend?.length ? (
                <div className="tracker-mini-chart">
                  {overview.trend.map((row) => (
                    <div key={row.date} className="tracker-mini-col">
                      <div
                        className="tracker-mini-bar"
                        style={{ height: `${Math.max(10, (Number(row.count || 0) / trendMax) * 110)}px` }}
                        title={`${row.date}: ${row.count}`}
                      />
                      <small>{row.date.slice(5)}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="tracker-empty">No trend data available.</p>
              )}
            </article>
          </div>
        </section>
      ) : null}

      {activeTab === "governance" ? (
        <section className="tracker-tab-panel">
          <div className="tracker-crud-grid">
            {governanceSections.map((section) => (
              <TrackerCrudSection key={section.sectionKey} {...section} moduleKey={moduleKey} />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "moderation" ? (
        <section className="tracker-tab-panel">
          <div className="tracker-crud-grid">
            <TrackerCrudSection
              title="Community Reports Queue"
              storageKey={`admin_${moduleKey}_community_reports`}
              moduleKey={moduleKey}
              sectionKey="community-reports-queue"
            />
            <TrackerCrudSection
              title="Moderation Policies"
              storageKey={`admin_${moduleKey}_moderation_policies`}
              moduleKey={moduleKey}
              sectionKey="moderation-policies"
            />
          </div>
        </section>
      ) : null}

      {activeTab === "quality" ? (
        <section className="tracker-tab-panel">
          <article className="tracker-panel">
            <h3>User Log Quality Review</h3>
            <div className="tracker-crud-table-wrap">
              <table className="tracker-crud-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Date</th>
                    <th>Mood</th>
                    <th>Summary</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.recentLogs?.length ? (
                    overview.recentLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <strong>{log.userName}</strong>
                          <div>{log.userEmail}</div>
                        </td>
                        <td>{log.date ? new Date(log.date).toLocaleDateString() : "-"}</td>
                        <td>{log.mood || "-"}</td>
                        <td>{log.moduleSummary || "-"}</td>
                        <td>{log.notes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No recent user logs to review.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "alerts" ? (
        <section className="tracker-tab-panel">
          <div className="tracker-crud-grid">
            <TrackerCrudSection
              title="Risk Threshold Settings"
              storageKey={`admin_${moduleKey}_risk_thresholds`}
              moduleKey={moduleKey}
              sectionKey="risk-threshold-settings"
            />
            <TrackerCrudSection
              title="Alert Escalation Rules"
              storageKey={`admin_${moduleKey}_alert_escalation`}
              moduleKey={moduleKey}
              sectionKey="alert-escalation-rules"
            />
          </div>
        </section>
      ) : null}

      {activeTab === "reminders" ? (
        <section className="tracker-tab-panel">
          <div className="tracker-crud-grid">
            <TrackerCrudSection
              title="Reminder Templates"
              storageKey={`admin_${moduleKey}_reminder_templates`}
              moduleKey={moduleKey}
              sectionKey="reminder-templates"
            />
            <TrackerCrudSection
              title="Notification Policy"
              storageKey={`admin_${moduleKey}_notification_policy`}
              moduleKey={moduleKey}
              sectionKey="notification-policy"
            />
          </div>
        </section>
      ) : null}

      {activeTab === "analytics" ? (
        <section className="tracker-tab-panel">
          <div className="tracker-summary-grid">
            <article className="tracker-summary-card">
              <h4>Adoption</h4>
              <strong>{overview?.stats?.activeUsers ?? 0}</strong>
              <p>Users with recorded logs</p>
            </article>
            <article className="tracker-summary-card">
              <h4>Engagement</h4>
              <strong>{overview?.stats?.logsLast7Days ?? 0}</strong>
              <p>Logs in the last 7 days</p>
            </article>
            <article className="tracker-summary-card">
              <h4>Retention Proxy</h4>
              <strong>{overview?.stats?.totalLogs ?? 0}</strong>
              <p>Total historical logs</p>
            </article>
            <article className="tracker-summary-card warning">
              <h4>Drop-off Risk</h4>
              <strong>{overview?.anomalies?.length ?? 0}</strong>
              <p>Anomaly signals to review</p>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}

