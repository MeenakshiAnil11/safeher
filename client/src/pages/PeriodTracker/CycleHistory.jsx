import React, { useEffect, useMemo, useRef, useState } from "react";
import "./periodTracker.css";

export default function CycleHistory() {
  const [cycles, setCycles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [timelineTooltip, setTimelineTooltip] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);
  const pageSize = 8;

  const monthOptions = [
    { value: "all", label: "All Months" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  async function load() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/periods/history", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCycles(data.cycles || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        cycles
          .map((cycle) => new Date(cycle.startDate))
          .filter((date) => !Number.isNaN(date.getTime()))
          .map((date) => date.getFullYear())
      )
    ).sort((a, b) => b - a);
    return ["all", ...years];
  }, [cycles]);

  const filteredSortedCycles = useMemo(() => {
    let list = [...cycles];

    if (yearFilter !== "all") {
      list = list.filter((cycle) => new Date(cycle.startDate).getFullYear() === Number(yearFilter));
    }
    if (monthFilter !== "all") {
      list = list.filter((cycle) => new Date(cycle.startDate).getMonth() === Number(monthFilter));
    }

    list.sort((a, b) => {
      const aStart = new Date(a.startDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      const aDuration = Number(a.duration) || 0;
      const bDuration = Number(b.duration) || 0;
      if (sortOption === "oldest") return aStart - bStart;
      if (sortOption === "duration-asc") return aDuration - bDuration;
      if (sortOption === "duration-desc") return bDuration - aDuration;
      return bStart - aStart;
    });

    return list;
  }, [cycles, yearFilter, monthFilter, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [yearFilter, monthFilter, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedCycles.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCycles = filteredSortedCycles.slice(startIndex, startIndex + pageSize);

  const avgDuration = filteredSortedCycles.length
    ? (filteredSortedCycles.reduce((sum, cycle) => sum + (Number(cycle.duration) || 0), 0) / filteredSortedCycles.length).toFixed(1)
    : "0.0";
  const longestDuration = Math.max(...filteredSortedCycles.map((cycle) => Number(cycle.duration) || 0), 0);
  const maxDuration = Math.max(...filteredSortedCycles.map((cycle) => Number(cycle.duration) || 0), 1);

  const getDurationType = (duration) => {
    if (duration > 6) return "long";
    if (duration < 3) return "short";
    return "normal";
  };

  const getTimelineColorClass = (duration) => {
    const type = getDurationType(duration);
    if (type === "long") return "timeline-coral";
    if (type === "short") return "timeline-lavender";
    return "timeline-teal";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this cycle?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/periods/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete");
      }
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowFormatDropdown(false);
    try {
      const token = localStorage.getItem("token");
      let res;
      let filename;

      if (format === "csv") {
        res = await fetch("/api/periods/export.csv", { headers: { Authorization: `Bearer ${token}` } });
        filename = "cycles.csv";
      } else if (format === "pdf") {
        res = await fetch("/api/periods/export.pdf", { headers: { Authorization: `Bearer ${token}` } });
        filename = "cycles.pdf";
      } else {
        res = await fetch("/api/periods/export.xlsx", { headers: { Authorization: `Bearer ${token}` } });
        filename = "cycles.xlsx";
      }

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Export failed";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      if (blob.size === 0) throw new Error("Export file is empty. Please try again.");

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Export error:", err);
      alert(`Export Error: ${err.message || "Failed to export. Please try again."}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="cycle-history-modern">
      {showToast && (
        <div className="export-toast">
          <span className="export-toast-icon">✅</span>
          <span className="export-toast-message">Your cycle history has been exported successfully!</span>
        </div>
      )}

      <div className="history-toolbar">
        <div className="history-filters">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year === "all" ? "All Years" : year}</option>
            ))}
          </select>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="duration-desc">Duration: High to Low</option>
            <option value="duration-asc">Duration: Low to High</option>
          </select>
        </div>

        <div className="export-button-container" ref={dropdownRef}>
          <button className="btn-primary export-btn" onClick={() => setShowFormatDropdown(!showFormatDropdown)} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
            <span className="export-arrow">▼</span>
          </button>
          {showFormatDropdown && (
            <div className="export-dropdown">
              <div className="export-dropdown-header">
                <p className="export-dropdown-title">Choose your preferred format:</p>
                <p className="export-dropdown-microcopy">All formats include your filtered cycle dates and durations.</p>
              </div>
              <div className="export-dropdown-options">
                <button className="export-option" onClick={() => handleExport("csv")} disabled={isExporting}>
                  <span className="export-option-icon">📄</span><span>CSV</span>
                </button>
                <button className="export-option" onClick={() => handleExport("pdf")} disabled={isExporting}>
                  <span className="export-option-icon">📑</span><span>PDF</span>
                </button>
                <button className="export-option" onClick={() => handleExport("excel")} disabled={isExporting}>
                  <span className="export-option-icon">📊</span><span>Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-table-wrap">
        <div className="history-summary-grid">
          <div className="history-summary-item summary-teal">
            <span>📅 Total Cycles</span>
            <strong>{filteredSortedCycles.length}</strong>
          </div>
          <div className="history-summary-item summary-lavender">
            <span>🕒 Average Duration</span>
            <strong>{avgDuration} days</strong>
          </div>
          <div className="history-summary-item summary-coral">
            <span>📈 Longest Duration</span>
            <strong>{longestDuration} days</strong>
          </div>
        </div>

        <div className="history-bars">
          {filteredSortedCycles.slice(0, 8).map((cycle, index) => {
            const duration = Number(cycle.duration) || 0;
            const width = `${Math.max(10, (duration / maxDuration) * 100)}%`;
            const start = new Date(cycle.startDate).toLocaleDateString();
            const end = new Date(cycle.endDate).toLocaleDateString();
            return (
              <div key={cycle._id || index} className="history-bar-row" onMouseLeave={() => setTimelineTooltip(null)}>
                <span>{start}</span>
                <div
                  className="history-bar-track"
                  onMouseMove={(event) =>
                    setTimelineTooltip({
                      x: event.clientX,
                      y: event.clientY,
                      content: `Start: ${start} | End: ${end} | Duration: ${duration} days`,
                    })
                  }
                >
                  <div className={`history-bar-fill ${getTimelineColorClass(duration)}`} style={{ width }} />
                </div>
                <strong>{duration}d</strong>
              </div>
            );
          })}
        </div>

        {timelineTooltip && (
          <div className="history-tooltip" style={{ left: timelineTooltip.x + 12, top: timelineTooltip.y - 20 }}>
            {timelineTooltip.content}
          </div>
        )}

        <table className="pt-table history-table-modern">
          <thead>
            <tr><th>#</th><th>Start</th><th>End</th><th>Duration (days)</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {paginatedCycles.length === 0 && <tr><td colSpan="5">No cycles logged yet.</td></tr>}
            {paginatedCycles.map((c, idx) => (
              <tr key={c._id}>
                <td>{startIndex + idx + 1}</td>
                <td>{new Date(c.startDate).toLocaleDateString()}</td>
                <td>{new Date(c.endDate).toLocaleDateString()}</td>
                <td>
                  <span className={`duration-chip ${getDurationType(Number(c.duration) || 0)}`}>{c.duration}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn-danger icon-btn" disabled={deletingId === c._id} onClick={() => handleDelete(c._id)}>
                    {deletingId === c._id ? "Deleting..." : "🗑 Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="history-pagination">
            <button className="btn-primary" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="btn-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
