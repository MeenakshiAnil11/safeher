import React, { useState } from "react";
import { FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import "./AdvancedSearch.css";

const AdvancedSearch = ({ onSearch, categories = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    author: "",
    tags: "",
    startDate: "",
    endDate: "",
    searchInComments: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      q: searchQuery,
      ...filters,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      category: "",
      author: "",
      tags: "",
      startDate: "",
      endDate: "",
      searchInComments: false,
    });
    onSearch({ q: "", ...filters });
  };

  return (
    <div className="advanced-search">
      <form onSubmit={handleSubmit} className="search-form-main">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search posts, comments, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-main"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery("");
                onSearch({ q: "", ...filters });
              }}
            >
              <FaTimes />
            </button>
          )}
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Advanced filters"
          >
            <FaFilter />
          </button>
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </div>
      </form>

      {isExpanded && (
        <div className="advanced-filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.label || cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Author</label>
              <input
                type="text"
                placeholder="Search by author name..."
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="Comma-separated tags"
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="filter-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.searchInComments}
                  onChange={(e) =>
                    setFilters({ ...filters, searchInComments: e.target.checked })
                  }
                />
                Search in comments
              </label>
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
            <button type="button" className="apply-filters-btn" onClick={handleSubmit}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
