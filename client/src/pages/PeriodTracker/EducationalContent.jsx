import React, { useState, useEffect } from "react";
import { FaHeartbeat, FaLeaf, FaBookMedical, FaBrain, FaUserMd, FaSearch, FaExternalLinkAlt, FaLightbulb, FaGraduationCap, FaEye, FaMousePointer } from "react-icons/fa";
import api from "../../services/api";

// Icon mapping for database storage
const iconMap = {
  FaHeartbeat: FaHeartbeat,
  FaLeaf: FaLeaf,
  FaBookMedical: FaBookMedical,
  FaBrain: FaBrain,
  FaUserMd: FaUserMd
};

const categories = ["All", "Basics", "Wellness", "Advanced", "Mental Health", "Health"];

export default function EducationalContent() {
  const [topics, setTopics] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadTopics();
    loadTips();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await api.get("/educational-content/topics?isTip=false");
      setTopics(response.data);
    } catch (error) {
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTips = async () => {
    try {
      const response = await api.get("/educational-content/tips");
      setTips(response.data);
    } catch (error) {
      console.error("Error loading tips:", error);
    }
  };

  // Track topic view when expanded
  const trackTopicView = async (topicId) => {
    try {
      await api.post(`/educational-content/topics/${topicId}/track-view`);
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  // Track topic click when link is clicked
  const trackTopicClick = async (topicId) => {
    try {
      await api.post(`/educational-content/topics/${topicId}/track-click`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  // Track search query
  const trackSearchQuery = async (query) => {
    if (query.trim()) {
      try {
        await api.post("/educational-content/topics/track-search", { query });
      } catch (error) {
        console.error("Error tracking search:", error);
      }
    }
  };

  // Track link click
  const trackLinkClick = async (topicId, linkLabel, linkUrl) => {
    try {
      await api.post(`/educational-content/topics/${topicId}/track-link-click`, {
        linkLabel,
        linkUrl
      });
    } catch (error) {
      console.error("Error tracking link click:", error);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(search.toLowerCase()) ||
                         topic.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExpand = (index, topicId) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);

    // Track view when topic is expanded
    if (newExpandedIndex !== null && topicId) {
      trackTopicView(topicId);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    trackSearchQuery(query);
  };

  const handleLinkClick = (topicId, linkLabel, linkUrl) => {
    trackLinkClick(topicId, linkLabel, linkUrl);
    trackTopicClick(topicId);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "#4CAF50";
      case "Intermediate": return "#FF9800";
      case "Important": return "#F44336";
      default: return "#2196F3";
    }
  };

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : <FaBookMedical />;
  };

  if (loading) {
    return (
      <div className="educational-content">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading educational content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="educational-content">
      <div className="education-header">
        <h2><FaGraduationCap /> Learn About Menstrual Health</h2>
        <p>Explore evidence-based information to better understand your cycle and reproductive health.</p>
      </div>

      {/* Search and Filters */}
      <div className="education-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search topics, content, or keywords..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>Showing {filteredTopics.length} of {topics.length} topics</span>
        {search && <span className="search-term">for "{search}"</span>}
      </div>

      {/* Topics Grid */}
      <div className="topics-grid">
        {filteredTopics.map((topic, index) => (
          <div key={topic._id} className="topic-card">
            <div className="topic-header">
              <div className="topic-icon-wrapper">
                {renderIcon(topic.icon)}
              </div>
              <div className="topic-meta">
                <h3>{topic.title}</h3>
                <div className="topic-badges">
                  <span className="category-badge">{topic.category}</span>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(topic.difficulty) }}
                  >
                    {topic.difficulty}
                  </span>
                  <span className="read-time">{topic.readTime}</span>
                  {topic.views > 0 && (
                    <span className="view-count">
                      <FaEye /> {topic.views}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="topic-preview">
              <p>{topic.content.substring(0, 120)}...</p>
            </div>

            <button
              className={`expand-btn ${expandedIndex === index ? "active" : ""}`}
              onClick={() => handleExpand(index, topic._id)}
            >
              {expandedIndex === index ? "Show Less" : "Read More"}
            </button>

            {expandedIndex === index && (
              <div className="topic-expanded">
                <div className="topic-full-content">
                  <p>{topic.content}</p>

                  {topic.keyPoints && topic.keyPoints.length > 0 && (
                    <div className="key-points">
                      <h4>Key Points:</h4>
                      <ul>
                        {topic.keyPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.links && topic.links.length > 0 && (
                    <div className="external-links">
                      <h4>Learn More:</h4>
                      <div className="links-grid">
                        {topic.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                            onClick={() => handleLinkClick(topic._id, link.label, link.url)}
                          >
                            <span>{link.label}</span>
                            <FaExternalLinkAlt />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="no-results">
          <FaSearch size={48} />
          <h3>No topics found</h3>
          <p>Try adjusting your search terms or category filter.</p>
        </div>
      )}

      {/* Did You Know Section */}
      <div className="tips-section">
        <h3><FaLightbulb /> Did You Know?</h3>
        <div className="tips-grid">
          {tips.map((tip, i) => (
            <div key={tip._id} className="tip-card">
              <span className="tip-icon">{tip.icon}</span>
              <p>{tip.content || tip.text}</p>
            </div>
          ))}
        </div>

        {tips.length === 0 && (
          <div className="no-tips">
            <p>No tips available at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {/* Quick Resources */}
      <div className="quick-resources">
        <h3>Trusted Medical Resources</h3>
        <div className="resources-grid">
          <a
            href="https://www.plannedparenthood.org/learn/health-and-wellness/menstruation"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <h4>Planned Parenthood</h4>
            <p>Comprehensive menstrual health information</p>
            <FaExternalLinkAlt />
          </a>
          <a
            href="https://www.mayoclinic.org/healthy-lifestyle/womens-health/in-depth/menstrual-cycle/art-20047186"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <h4>Mayo Clinic</h4>
            <p>Medical insights on menstrual cycles</p>
            <FaExternalLinkAlt />
          </a>
          <a
            href="https://www.acog.org/womens-health/faqs/the-menstrual-cycle"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <h4>ACOG</h4>
            <p>Professional gynecological guidance</p>
            <FaExternalLinkAlt />
          </a>
        </div>
      </div>
    </div>
  );
}
