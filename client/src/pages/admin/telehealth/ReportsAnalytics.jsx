import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaChartBar,
  FaDownload,
  FaUserMd,
  FaRupeeSign,
} from "react-icons/fa";
import api from "../../../services/api";
import "./ReportsAnalytics.css";

export default function ReportsAnalytics() {
  const [consultationReports, setConsultationReports] = useState([]);
  const [revenueReports, setRevenueReports] = useState([]);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    doctor: "",
    groupBy: "day",
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      );

      const [consultationsRes, revenueRes, performanceRes] = await Promise.all([
        api.get(`/telehealth/admin/reports/consultations?${params}`),
        api.get(`/telehealth/admin/reports/revenue?${params}`),
        api.get(`/telehealth/admin/reports/doctor-performance`),
      ]);

      setConsultationReports(consultationsRes.data.consultations || []);
      setRevenueReports(revenueRes.data.revenue || []);
      setDoctorPerformance(performanceRes.data.performance || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="reports-analytics">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p>View detailed analytics and export reports</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="filter-input"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="filter-input"
          placeholder="End Date"
        />
        <select
          value={filters.groupBy}
          onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
          className="filter-select"
        >
          <option value="day">Group by Day</option>
          <option value="month">Group by Month</option>
        </select>
        <button className="btn-export" onClick={() => exportToPDF()}>
          <FaDownload /> Export PDF
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading reports...</div>
      ) : (
        <>
          {/* Consultation Reports */}
          <div className="report-card">
            <div className="report-header">
              <div>
                <FaChartBar className="report-icon" />
                <h3>Consultations per Doctor</h3>
              </div>
              <button
                className="btn-export-small"
                onClick={() => exportToCSV(consultationReports, "consultations")}
              >
                <FaDownload /> CSV
              </button>
            </div>
            <div className="report-content">
              {consultationReports.length === 0 ? (
                <p className="no-data">No data available</p>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Consultations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultationReports.map((report, idx) => (
                      <tr key={idx}>
                        <td>{report.doctorName || "N/A"}</td>
                        <td>{report.specialization || "N/A"}</td>
                        <td>
                          <strong>{report.count}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="report-card">
            <div className="report-header">
              <div>
                <FaChartLine className="report-icon" />
                <h3>Revenue Trends</h3>
              </div>
              <button
                className="btn-export-small"
                onClick={() => exportToCSV(revenueReports, "revenue")}
              >
                <FaDownload /> CSV
              </button>
            </div>
            <div className="report-content">
              {revenueReports.length === 0 ? (
                <p className="no-data">No data available</p>
              ) : (
                <div className="revenue-chart">
                  <RevenueChart data={revenueReports} />
                </div>
              )}
            </div>
          </div>

          {/* Doctor Performance */}
          <div className="report-card">
            <div className="report-header">
              <div>
                <FaUserMd className="report-icon" />
                <h3>Doctor Performance</h3>
              </div>
              <button
                className="btn-export-small"
                onClick={() => exportToCSV(doctorPerformance, "doctor-performance")}
              >
                <FaDownload /> CSV
              </button>
            </div>
            <div className="report-content">
              {doctorPerformance.length === 0 ? (
                <p className="no-data">No data available</p>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Consultations</th>
                      <th>Revenue</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPerformance.map((perf, idx) => (
                      <tr key={idx}>
                        <td>{perf.doctor?.name || "N/A"}</td>
                        <td>{perf.doctor?.specialization || "N/A"}</td>
                        <td>
                          <strong>{perf.consultations}</strong>
                        </td>
                        <td>
                          <strong>₹{perf.revenue.toLocaleString()}</strong>
                        </td>
                        <td>
                          <span className="rating-badge">
                            {perf.rating.toFixed(1)} ⭐
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RevenueChart({ data }) {
  if (!data || data.length === 0) return <p className="no-data">No data available</p>;

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar-wrapper">
            <div
              className="bar revenue-bar"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
            ></div>
          </div>
          <span className="bar-label">₹{item.revenue.toLocaleString()}</span>
          <span className="bar-date">{formatDate(item._id)}</span>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
