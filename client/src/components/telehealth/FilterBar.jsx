import React from "react";
import { FaFilter, FaSearch } from "react-icons/fa";

export default function FilterBar({ filters, onFilterChange, filtersOpen, onToggleFilters }) {
  const specializations = [
    "all",
    "Gynecology",
    "Obstetrics",
    "General Medicine",
    "Endocrinology",
    "Nutrition/Dietetics",
    "Mental Health",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Oncology",
    "Urology",
  ];

  return (
    <>
      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="btn-filters"
          onClick={onToggleFilters}
        >
          <FaFilter /> Filters
        </button>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="filter-panel">
          <div className="filter-section">
            <label className="filter-section-label">Specialization</label>
            <div className="specialization-tabs">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  className={`specialization-tab ${filters.specialization === spec ? "active" : ""}`}
                  onClick={() => onFilterChange("specialization", spec === "all" ? "all" : spec)}
                >
                  {spec === "all" ? "All" : spec}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-selects-row">
            <div className="filter-section">
              <label className="filter-section-label">Language</label>
              <select
                className="filter-select"
                value={filters.language}
                onChange={(e) => onFilterChange("language", e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div className="filter-section">
              <label className="filter-section-label">Minimum Rating</label>
              <select
                className="filter-select"
                value={filters.minRating}
                onChange={(e) => onFilterChange("minRating", e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div className="filter-section">
              <label className="filter-section-label">Availability</label>
              <select
                className="filter-select"
                value={filters.availability}
                onChange={(e) => onFilterChange("availability", e.target.value)}
              >
                <option value="">All</option>
                <option value="today">Available Today</option>
                <option value="tomorrow">Available Tomorrow</option>
                <option value="this-week">This Week</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
