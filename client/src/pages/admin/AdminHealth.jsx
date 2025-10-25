import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import AdminHeader from "../../components/AdminHeader";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./AdminDashboard.css"; // keep your table & dashboard styles

export default function AdminHealth() {
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("vitals");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  // Mood & Symptoms section
  const [moodSymptoms, setMoodSymptoms] = useState([]);
  const [moodAnalytics, setMoodAnalytics] = useState({ pieData: [], lineData: [] });
  const [moodFilter, setMoodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [keyword, setKeyword] = useState("");
  const [moodPage, setMoodPage] = useState(1);
  const [moodLimit, setMoodLimit] = useState(25);
  const [moodTotal, setMoodTotal] = useState(0);

  const tabs = [
    { key: "vitals", label: "Vitals" },
    { key: "symptoms", label: "Symptoms" },
    { key: "periods", label: "Periods" },
    { key: "vaccinations", label: "Vaccinations" },
    { key: "records", label: "Records" },
    { key: "sleep", label: "Sleep" },
    { key: "nutrition", label: "Nutrition" },
    { key: "moodlogs", label: "Mood Logs" },
    { key: "mood-symptoms", label: "Mood & Symptoms" },
  ];

  const load = async () => {
    if (activeTab === "mood-symptoms") {
      await loadMoodSymptoms();
    } else {
      const res = await api.get(`/admin/health?q=${encodeURIComponent(q)}&type=${activeTab}&page=${page}&limit=${limit}`);
      setRecords(res.data.records);
      setTotal(res.data.total);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab, page, limit]);

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this health record?")) return;
    await api.delete(`/admin/health/${id}`);
    load();
  };

  // Mood & Symptoms functions
  const loadMoodSymptoms = async () => {
    const params = new URLSearchParams();
    if (moodFilter) params.append('mood', moodFilter);
    if (dateFrom) params.append('from', dateFrom);
    if (dateTo) params.append('to', dateTo);
    if (keyword) params.append('q', keyword);
    params.append('page', moodPage);
    params.append('limit', moodLimit);
    const res = await api.get(`/admin/health/mood-symptoms?${params.toString()}`);
    setMoodSymptoms(res.data.records);
    setMoodTotal(res.data.total);
  };

  const loadMoodAnalytics = async () => {
    const res = await api.get('/admin/health/mood-analytics');
    setMoodAnalytics(res.data);
  };

  useEffect(() => {
    if (activeTab === "mood-symptoms") {
      loadMoodSymptoms();
      loadMoodAnalytics();
    }
  }, [moodPage, moodLimit, activeTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1); // reset page when switching tabs
    if (tabKey === "mood-symptoms") {
      setMoodPage(1);
    }
  };

  const renderDataCell = (r) => {
    switch (r.type) {
      case "vitals":
        return `BP: ${r.systolic}/${r.diastolic}, Weight: ${r.weight}kg, Height: ${r.height}cm`;
      case "symptoms":
        return r.symptoms?.join(", ") || "";
      case "periods":
        return `Start: ${new Date(r.startDate).toLocaleDateString()}, End: ${r.endDate ? new Date(r.endDate).toLocaleDateString() : "Ongoing"}`;
      case "vaccinations":
        return `Name: ${r.name}, Date: ${new Date(r.date).toLocaleDateString()}`;
      case "records":
        return `Title: ${r.title}, Category: ${r.category}`;
      case "sleep":
        return `Hours: ${r.sleepHours}, Quality: ${r.quality}`;
      case "nutrition":
        return `Meal: ${r.meal}, Calories: ${r.calories}`;
      case "moodlogs":
        return `Mood: ${r.mood}`;
      default:
        return JSON.stringify(r);
    }
  };

  return (
    <AdminLayout pageTitle="Health Tracking">
      <div className="admin-dashboard">
        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: "10px 15px",
                backgroundColor: activeTab === tab.key ? "#007bff" : "#f8f9fa",
                color: activeTab === tab.key ? "white" : "black",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Pagination */}
        {activeTab !== "mood-symptoms" && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px", alignItems: "center" }}>
            <input
              placeholder="Search user name/email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button onClick={load}>Search</button>
            <span>Page {page} of {Math.ceil(total / limit)} ({total} total)</span>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
            <button onClick={() => setPage(Math.min(Math.ceil(total / limit), page + 1))} disabled={page >= Math.ceil(total / limit)}>Next</button>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        )}

        {/* Mood & Symptoms Filters and Pagination */}
        {activeTab === "mood-symptoms" && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
              <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)}>
                <option value="">All Moods</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="anxious">Anxious</option>
                <option value="calm">Calm</option>
                <option value="angry">Angry</option>
                <option value="excited">Excited</option>
              </select>
              <input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <input
                placeholder="Keyword search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button onClick={loadMoodSymptoms}>Search</button>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", alignItems: "center" }}>
              <span>Page {moodPage} of {Math.ceil(moodTotal / moodLimit)} ({moodTotal} total)</span>
              <button onClick={() => setMoodPage(Math.max(1, moodPage - 1))} disabled={moodPage === 1}>Prev</button>
              <button onClick={() => setMoodPage(Math.min(Math.ceil(moodTotal / moodLimit), moodPage + 1))} disabled={moodPage >= Math.ceil(moodTotal / moodLimit)}>Next</button>
              <select value={moodLimit} onChange={(e) => { setMoodLimit(Number(e.target.value)); setMoodPage(1); }}>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </>
        )}

        {/* Table */}
        {activeTab !== "mood-symptoms" && (
          <table border="1" cellPadding="5" style={{ width: "100%", marginTop: 10 }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Data</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.name || r.user?.email}</td>
                  <td>{renderDataCell(r)}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => deleteRecord(r._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mood & Symptoms Table */}
        {activeTab === "mood-symptoms" && (
          <>
            <table border="1" cellPadding="5" style={{ width: "100%", marginTop: 10 }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Mood/Symptoms</th>
                  <th>Severity</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {moodSymptoms.map((r) => (
                  <tr key={r._id}>
                    <td>{r.user?.name || r.user?.email}</td>
                    <td>{r.type}</td>
                    <td>
                      {r.type === "mood" && <span>{r.mood}</span>}
                      {r.type === "symptoms" && <span>{r.symptoms && r.symptoms.length > 0 ? r.symptoms.join(", ") : "No symptoms recorded"}</span>}
                    </td>
                    <td>
                      {r.type === "mood" && <span>{r.intensity}/10</span>}
                      {r.type === "symptoms" && <span>{r.severity}/5</span>}
                    </td>
                    <td>{r.notes || ""}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Charts */}
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              <div style={{ flex: 1 }}>
                <h3>Mood Frequency</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodAnalytics.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodAnalytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1 }}>
                <h3>Mood Trend Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodAnalytics.lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="happy" stroke="#8884d8" />
                    <Line type="monotone" dataKey="sad" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="anxious" stroke="#ffc658" />
                    <Line type="monotone" dataKey="calm" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
