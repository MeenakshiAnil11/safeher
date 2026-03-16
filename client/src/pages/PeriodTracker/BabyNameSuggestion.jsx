import React, { useEffect, useMemo, useState } from "react";
import UserHeader from "../../components/UserHeader";
import { babyNames as babyNamesDataset } from "../../data/babyNames";
import "./BabyNameSuggestion.css";

export default function BabyNameSuggestion() {
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState([]);
  const [bookmarkedNames, setBookmarkedNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [meaningFilter, setMeaningFilter] = useState("all");
  const [selectedName, setSelectedName] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkTab, setBookmarkTab] = useState("saved");
  const [compareNames, setCompareNames] = useState([]);
  const [randomSuggestion, setRandomSuggestion] = useState(null);
  const [parentA, setParentA] = useState("");
  const [parentB, setParentB] = useState("");
  const [preferredCategory, setPreferredCategory] = useState("all");
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Load names and bookmarked names on component mount
  useEffect(() => {
    loadNames();
    loadBookmarkedNames();
  }, []);

  useEffect(() => {
    if (showBookmarks) return;
    setBookmarkTab("saved");
    setCompareNames([]);
  }, [showBookmarks]);

  const loadNames = () => {
    setNames(babyNamesDataset);
    setRandomSuggestion(babyNamesDataset[Math.floor(Math.random() * babyNamesDataset.length)]);
  };

  const loadBookmarkedNames = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedNames") || "[]");
      setBookmarkedNames(Array.isArray(saved) ? saved : []);
    } catch {
      setBookmarkedNames([]);
    }
  };

  const handleBookmark = (name) => {
    const exists = bookmarkedNames.some((bn) => bn.name === name.name && bn.gender === name.gender);
    const next = exists
      ? bookmarkedNames.filter((bn) => !(bn.name === name.name && bn.gender === name.gender))
      : [...bookmarkedNames, name];
    setBookmarkedNames(next);
    localStorage.setItem("savedNames", JSON.stringify(next));
  };

  const toggleCompareName = (name) => {
    const exists = compareNames.some((item) => item.name === name.name && item.gender === name.gender);
    if (exists) {
      setCompareNames((prev) =>
        prev.filter((item) => !(item.name === name.name && item.gender === name.gender))
      );
      return;
    }
    if (compareNames.length >= 3) return;
    setCompareNames((prev) => [...prev, name]);
  };

  const speakName = (name) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const speech = new SpeechSynthesisUtterance(name);
    speech.rate = 0.95;
    speech.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // Filter names based on search and filters
  const filteredNames = useMemo(
    () =>
      names.filter((name) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          name.name.toLowerCase().includes(term) ||
          name.meaning.toLowerCase().includes(term);
        const matchesGender = genderFilter === "all" || name.gender === genderFilter;
        const matchesMeaning = meaningFilter === "all" || name.category === meaningFilter;
        return matchesSearch && matchesGender && matchesMeaning;
      }),
    [names, searchTerm, genderFilter, meaningFilter]
  );

  const trendingNames = useMemo(
    () => [...names].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5),
    [names]
  );

  const isBookmarked = (name) => {
    return bookmarkedNames.some(bn => bn.name === name.name && bn.gender === name.gender);
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case "boy": return "👶";
      case "girl": return "👧";
      default: return "👶";
    }
  };

  const getGenderColor = (gender) => {
    switch (gender) {
      case "boy": return "bg-blue-100 border-blue-200 text-blue-800";
      case "girl": return "bg-pink-100 border-pink-200 text-pink-800";
      default: return "bg-purple-100 border-purple-200 text-purple-800";
    }
  };

  const getPopularityStars = (popularity) => {
    return "⭐".repeat(popularity);
  };

  const meaningCategories = [
    { value: "all", label: "All Meanings" },
    { value: "nature", label: "Nature" },
    { value: "spiritual", label: "Spiritual" },
    { value: "virtue", label: "Virtue" },
    { value: "heroic", label: "Heroic" },
    { value: "modern", label: "Modern" },
  ];

  const handleRandomName = () => {
    if (!names.length) return;
    setRandomSuggestion(names[Math.floor(Math.random() * names.length)]);
  };

  const handleAiNameSuggestion = () => {
    const a = parentA.trim().toLowerCase();
    const b = parentB.trim().toLowerCase();
    if (!a || !b) {
      alert("Please enter both parents' names.");
      return;
    }
    const seedLetters = `${a[0]}${b[0]}${a.slice(-1)}${b.slice(-1)}`;
    const pool = names.filter((n) => preferredCategory === "all" || n.category === preferredCategory);
    const ranked = [...pool].sort((x, y) => {
      const xScore = [...seedLetters].reduce((sum, ch) => sum + (x.name.toLowerCase().includes(ch) ? 1 : 0), 0);
      const yScore = [...seedLetters].reduce((sum, ch) => sum + (y.name.toLowerCase().includes(ch) ? 1 : 0), 0);
      if (yScore !== xScore) return yScore - xScore;
      return (y.popularity || 0) - (x.popularity || 0);
    });
    setAiSuggestion(ranked[0] || null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 baby-explorer-page">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '80px' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
            Baby Name Suggestions
          </h1>
          <p className="text-gray-600 text-lg">
            Explore beautiful names with meanings, origins, and pronunciations
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full text-sm font-semibold">
            ✨ Find the perfect name for your little one
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 explorer-section">
          <div className="filter-toolbar">
            <div className="search-block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Names</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or meaning..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="filter-select-block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="boy">👶 Boys</option>
                <option value="girl">👧 Girls</option>
                <option value="unisex">👶👧 Unisex</option>
              </select>
            </div>

            <div className="filter-select-block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Meaning Category</label>
              <select
                value={meaningFilter}
                onChange={(e) => setMeaningFilter(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {meaningCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bookmark-action-block">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bookmarks</label>
              <button
                onClick={() => setShowBookmarks(true)}
                className="w-full p-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-semibold hover:from-pink-500 hover:to-purple-500 transition-all duration-300"
              >
                📌 View Bookmarked Names ({bookmarkedNames.length})
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-pink-600">{filteredNames.length}</span> names
          </p>
        </div>

        {/* Trending Names */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 explorer-section">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔥 Trending Names</h3>
          <div className="trending-strip">
            {trendingNames.map((name) => (
              <div key={`${name.name}-${name.gender}`} className="trending-chip">
                <div className="trending-chip-top">
                  <span className="trending-badge">Trending</span>
                  <button
                    type="button"
                    className="trending-bookmark-btn"
                    onClick={() => handleBookmark(name)}
                  >
                    {isBookmarked(name) ? "⭐" : "☆"}
                  </button>
                </div>
                <strong>{name.name}</strong>
                <small>{name.meaning}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Random Generator */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-800">✨ Random Baby Name Generator</h3>
            <button
              type="button"
              onClick={handleRandomName}
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300"
            >
              ✨ Generate Baby Name
            </button>
          </div>
          {randomSuggestion ? (
            <div className="random-suggestion-card mt-4">
              <p className="text-sm text-purple-700 font-semibold">Suggested Name</p>
              <h4>{randomSuggestion.name}</h4>
              <p><strong>Meaning:</strong> {randomSuggestion.meaning}</p>
              <p><strong>Origin:</strong> {randomSuggestion.origin}</p>
            </div>
          ) : null}
        </div>

        {/* Bookmarked Names View */}
        {showBookmarks && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Bookmarked Names</h2>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="bookmark-tabs">
                <button
                  type="button"
                  className={bookmarkTab === "saved" ? "active" : ""}
                  onClick={() => setBookmarkTab("saved")}
                >
                  Saved Names
                </button>
                <button
                  type="button"
                  className={bookmarkTab === "compare" ? "active" : ""}
                  onClick={() => setBookmarkTab("compare")}
                >
                  Compare ({compareNames.length})
                </button>
              </div>

              {bookmarkedNames.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📌</div>
                  <p className="text-lg">No bookmarked names yet</p>
                  <p className="text-sm">Start bookmarking your favorite names!</p>
                </div>
              ) : bookmarkTab === "compare" ? (
                <div className="compare-wrap">
                  {compareNames.length < 2 ? (
                    <p className="text-gray-500">
                      Select at least two names from Saved Names tab to compare details.
                    </p>
                  ) : (
                    <div className="compare-grid">
                      {compareNames.map((name) => (
                        <div key={`${name.name}-${name.gender}`} className="compare-card">
                          <h4>{name.name}</h4>
                          <p><strong>Meaning:</strong> {name.meaning}</p>
                          <p><strong>Origin:</strong> {name.origin}</p>
                          <p><strong>Pronunciation:</strong> {name.pronunciation || "--"}</p>
                          <p><strong>Category:</strong> {name.category || "--"}</p>
                          <button type="button" onClick={() => speakName(name.name)}>
                            🔊 Hear Name
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedNames.map((name, idx) => (
                    <div key={idx} className={`p-6 rounded-xl border-2 ${getGenderColor(name.gender)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getGenderIcon(name.gender)}</span>
                          <h3 className="text-xl font-bold">{name.name}</h3>
                        </div>
                        <button
                          onClick={() => handleBookmark(name)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          ⭐
                        </button>
                      </div>
                      <p className="text-sm mb-2"><strong>Meaning:</strong> {name.meaning}</p>
                      <p className="text-sm mb-2"><strong>Origin:</strong> {name.origin}</p>
                      {name.pronunciation && (
                        <p className="text-sm"><strong>Pronunciation:</strong> {name.pronunciation}</p>
                      )}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => speakName(name.name)}
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300"
                        >
                          🔊 Hear Name
                        </button>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm text-gray-600 inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={compareNames.some(
                              (item) => item.name === name.name && item.gender === name.gender
                            )}
                            onChange={() => toggleCompareName(name)}
                          />
                          Add to compare
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Names Grid */}
        <div className="name-grid mb-8">
          {filteredNames.map((name, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-xl border-2 ${getGenderColor(name.gender)} transition-all duration-300 hover:shadow-lg cursor-pointer name-card`}
              onClick={() => setSelectedName(name)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">{getGenderIcon(name.gender)}</span>
                  <h3 className="text-xl font-bold">{name.name}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(name);
                  }}
                  className="text-yellow-500 hover:text-yellow-600 transition-all duration-300"
                >
                  {isBookmarked(name) ? "⭐" : "☆"}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Meaning:</strong> {name.meaning}
                </p>
                <p className="text-sm">
                  <strong>Origin:</strong> {name.origin}
                </p>
                {name.pronunciation && (
                  <p className="text-sm">
                    <strong>Pronunciation:</strong> <span className="italic">{name.pronunciation}</span>
                  </p>
                )}
                <p className="text-sm">
                  <strong>Category:</strong> {name.category}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(name);
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300"
                >
                  {isBookmarked(name) ? "⭐ Bookmarked" : "⭐ Bookmark"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakName(name.name);
                  }}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300"
                >
                  🔊 Hear Name
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNames.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg text-gray-700 mb-2">No names found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Name Detail Modal */}
        {selectedName && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedName.name}</h2>
                <button
                  onClick={() => setSelectedName(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className={`p-6 rounded-xl ${getGenderColor(selectedName.gender)} mb-6`}>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">{getGenderIcon(selectedName.gender)}</span>
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{selectedName.gender}</p>
                    {selectedName.popularity && (
                      <p className="text-sm">{getPopularityStars(selectedName.popularity)}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <strong className="block text-sm mb-1">Meaning</strong>
                    <p>{selectedName.meaning}</p>
                  </div>
                  <div>
                    <strong className="block text-sm mb-1">Origin</strong>
                    <p>{selectedName.origin}</p>
                  </div>
                  {selectedName.pronunciation && (
                    <div>
                      <strong className="block text-sm mb-1">Pronunciation</strong>
                      <p className="italic">{selectedName.pronunciation}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleBookmark(selectedName);
                  }}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                >
                  {isBookmarked(selectedName) ? "⭐ Unbookmark" : "☆ Bookmark"}
                </button>
                <button
                  onClick={() => speakName(selectedName.name)}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                >
                  🔊 Hear Name
                </button>
                <button
                  onClick={() => setSelectedName(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              <span className="text-gray-700">Loading...</span>
            </div>
          </div>
        )}

        {/* AI Baby Name Generator */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⭐ AI Baby Name Generator using parents' names</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={parentA}
                onChange={(e) => setParentA(e.target.value)}
                placeholder="Mother's name"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="text"
                value={parentB}
                onChange={(e) => setParentB(e.target.value)}
                placeholder="Father's name"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {meaningCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleAiNameSuggestion}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300"
              >
                Generate AI Suggestion
              </button>
            </div>
            {aiSuggestion ? (
              <div className="random-suggestion-card mt-4">
                <p className="text-sm text-purple-700 font-semibold">Suggested Name</p>
                <h4>{aiSuggestion.name}</h4>
                <p><strong>Meaning:</strong> {aiSuggestion.meaning}</p>
                <p><strong>Origin:</strong> {aiSuggestion.origin}</p>
                <p><strong>Category:</strong> {aiSuggestion.category}</p>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleRandomName}
                className="bg-gradient-to-r from-fuchsia-400 to-violet-500 hover:from-fuchsia-500 hover:to-violet-600 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300"
              >
                Generate More Names
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
