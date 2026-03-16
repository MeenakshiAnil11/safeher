import React, { useState, useEffect } from "react";
import api from "../../services/api";
import perimenopauseTips from "../../data/perimenopauseTips";
import { getStoredLogs } from "../../services/perimenopauseService";

export default function LifestyleTips() {
  const [tips, setTips] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTip, setExpandedTip] = useState(null);
  
  const itemsPerPage = 12;

  // Categories
  const categories = [
    { id: "all", name: "All Tips", icon: "🌿" },
    { id: "nutrition", name: "Nutrition", icon: "🥗" },
    { id: "exercise", name: "Exercise", icon: "💪" },
    { id: "mental-health", name: "Mental Health", icon: "🧘" },
    { id: "sleep", name: "Sleep", icon: "😴" }
  ];

  const [symptomProfile, setSymptomProfile] = useState([]);

  // Fetch tips from API
  const fetchTips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/perimenopause/tips');
      const baseTips = response.data.tips || perimenopauseTips;
      setTips(
        baseTips.map((tip, index) => ({
          id: tip.id || index + 1,
          summary: tip.summary || tip.description,
          fullContent: tip.fullContent || tip.description,
          icon: tip.icon || "💡",
          date: tip.date || new Date().toISOString(),
          ...tip,
        }))
      );
    } catch (error) {
      console.error('Error fetching tips:', error);
      setTips(
        perimenopauseTips.map((tip, index) => ({
          id: index + 1,
          summary: tip.description,
          fullContent: tip.description,
          icon: "💡",
          date: new Date().toISOString(),
          ...tip,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTips();
  }, []);

  useEffect(() => {
    const logs = getStoredLogs().slice(-7);
    const profile = [];
    const avgHot = logs.length ? logs.reduce((s, l) => s + (Number(l.hotFlashIntensity) || 0), 0) / logs.length : 0;
    const avgSleep = logs.length ? logs.reduce((s, l) => s + (Number(l.sleepQuality) || 0), 0) / logs.length : 0;
    const stressMood = logs.filter((l) => ["anxious", "irritable", "sad"].includes(String(l.mood).toLowerCase())).length;
    if (avgHot >= 6) profile.push("hot flashes");
    if (avgSleep <= 2.5) profile.push("sleep");
    if (stressMood >= 3) profile.push("stress");
    setSymptomProfile(profile);
    if (stressMood >= 3) setSelectedCategory("mental-health");
  }, []);

  // Filter and search tips
  useEffect(() => {
    let filtered = tips;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tip => tip.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (symptomProfile.length) {
      filtered = filtered.sort((a, b) => {
        const aMatch = (a.symptoms || []).some((sym) => symptomProfile.includes(sym));
        const bMatch = (b.symptoms || []).some((sym) => symptomProfile.includes(sym));
        return Number(bMatch) - Number(aMatch);
      });
    }
    setFilteredTips(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, tips, symptomProfile]);

  // Pagination
  const totalPages = Math.ceil(filteredTips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTips = filteredTips.slice(startIndex, startIndex + itemsPerPage);

  // Toggle expanded tip
  const toggleExpand = (tipId) => {
    setExpandedTip(expandedTip === tipId ? null : tipId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-lavender-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
            Lifestyle Tips
          </h1>
          <p className="text-lg text-gray-600">
            AI-curated wellness tips for your perimenopause journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? "bg-lavender-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tips...</p>
          </div>
        )}

        {/* Tips Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedTips.length > 0 ? (
                paginatedTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg hover:border-lavender-300 transition-all duration-300 cursor-pointer"
                    onClick={() => toggleExpand(tip.id)}
                  >
                    {/* Icon */}
                    <div className="text-4xl mb-4">{tip.icon}</div>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-lavender-100 text-lavender-700 text-xs font-semibold rounded-full">
                        {tip.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {tip.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-gray-600 text-sm mb-4">
                      {tip.summary}
                    </p>

                    {/* Full Content (when expanded) */}
                    {expandedTip === tip.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {tip.fullContent}
                        </p>
                      </div>
                    )}

                    {/* Read More Toggle */}
                    <button className="text-lavender-600 hover:text-lavender-700 font-semibold text-sm mt-4 flex items-center">
                      {expandedTip === tip.id ? "Show Less" : "Read More"}
                      <svg
                        className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                          expandedTip === tip.id ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Date */}
                    <div className="mt-4 text-xs text-gray-400">
                      {new Date(tip.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No tips found matching your filters.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                
                <div className="px-4 py-2 bg-lavender-500 text-white rounded-lg font-semibold">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center text-gray-600">
              Showing {paginatedTips.length} of {filteredTips.length} tips
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
