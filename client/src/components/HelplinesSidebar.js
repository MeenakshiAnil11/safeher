// client/src/components/HelplinesSidebar.js
import React, { useState, useEffect } from "react";
import "./helplinesSidebar.css";

export default function HelplinesSidebar({
  onFilterChange,
  onSearch,
  onExport,
  myLocation,
  onMyLocationChange,
  darkMode,
  onDarkModeChange,
  language,
  onLanguageChange,
  onShowFavorites,
  onShowRecent,
  onShowMostCalled
}) {
  const [filters, setFilters] = useState({
    category: "All",
    region: "",
    availability: "",
    language: "en",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Sync with parent props
  useEffect(() => {
    setFilters(prev => ({ ...prev, language }));
  }, [language]);

  // handle filter changes
  const updateFilter = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    onFilterChange(updated); // pass back to parent page
  };

  return (
    <aside className={`helplines-sidebar ${darkMode ? "dark" : ""}`}>
      {/* Emergency / SOS */}
      <div className="sidebar-section emergency">
        <button className="sos-btn" onClick={() => window.location.href="tel:100"}>🚨 Call Police 100</button>
        <ul className="emergency-list">
          <li>🚔 Police: 100</li>
          <li>🚑 Ambulance: 108</li>
          <li>💬 Women Helpline: 181</li>
        </ul>
      </div>

      {/* Search */}
      <div className="sidebar-section search">
        <input
          type="text"
          placeholder="Search helplines..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
        />
        {searchTerm && <button onClick={() => { setSearchTerm(""); onSearch(""); }}>Clear</button>}
      </div>

      {/* Filters */}
      <div className="sidebar-section filters">
        <h4>Categories</h4>
        <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
          <option value="All">All</option>
          <option value="Emergency">Emergency</option>
          <option value="Health">Health</option>
          <option value="Women">Women</option>
          <option value="Legal">Legal</option>
          <option value="Psychological">Psychological</option>
          <option value="NGO">NGO</option>
        </select>

        <h4>Region</h4>
        <input
          type="text"
          placeholder="State / City / District"
          value={filters.region}
          onChange={(e) => updateFilter("region", e.target.value)}
        />

        <h4>Availability</h4>
        <select value={filters.availability} onChange={(e) => updateFilter("availability", e.target.value)}>
          <option value="">Any</option>
          <option value="24/7">24/7</option>
          <option value="10:00–18:00">10:00–18:00</option>
        </select>

        <h4>Language</h4>
        <select value={filters.language} onChange={(e) => {
          updateFilter("language", e.target.value);
          onLanguageChange(e.target.value);
        }}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>
      </div>

      {/* Quick Access */}
      <div className="sidebar-section quick-links">
        <h4>Quick Links</h4>
        <ul>
          <li onClick={onShowFavorites}>⭐ Favorites</li>
          <li onClick={onShowRecent}>🕑 Recently Viewed</li>
          <li onClick={onShowMostCalled}>📞 Most Called</li>
        </ul>
      </div>

      {/* Info / Help */}
      <div className="sidebar-section info">
        <h4>Info & Help</h4>
        <button>📖 User Guide</button>
        <button>⚠️ Report Incorrect Info</button>
        <button>📝 Feedback</button>
      </div>

      {/* Export / Save */}
      <div className="sidebar-section export">
        <h4>Export & Save</h4>
        <button onClick={() => onExport('csv')}>⬇️ Download CSV</button>
        <button onClick={() => onExport('pdf')}>⬇️ Download PDF</button>
        <button>📇 Add to Contacts</button>
      </div>


      {/* Personalization */}
      <div className="sidebar-section personalization">
        <label>
          <input
            type="checkbox"
            checked={myLocation}
            onChange={(e) => onMyLocationChange(!myLocation)}
          />{" "}
          Show Nearby Helplines
        </label>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => onDarkModeChange(!darkMode)}
          />{" "}
          Dark Mode
        </label>
      </div>
    </aside>
  );
}
