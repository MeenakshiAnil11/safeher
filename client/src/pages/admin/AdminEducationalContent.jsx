import React, { useState, useEffect } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch,
  FaLightbulb, FaLink, FaChartBar, FaCheckCircle, FaTimesCircle,
  FaEye, FaMousePointer, FaExternalLinkAlt, FaUserCheck
} from "react-icons/fa";
import api from "../../services/api";
import "./AdminEducationalContent.css";

export default function AdminEducationalContent() {
  const [activeTab, setActiveTab] = useState("topics");

  // Topics state
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  // Tips state
  const [tips, setTips] = useState([]);
  const [showTipModal, setShowTipModal] = useState(false);
  const [editingTip, setEditingTip] = useState(null);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    overview: { totalTopics: 0, totalTips: 0, totalViews: 0, totalClicks: 0 },
    mostReadTopics: [],
    categoryEngagement: [],
    searchTrends: []
  });

  // Approval state
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    difficulty: "Beginner",
    readTime: "",
    keyPoints: [],
    links: [],
    isTip: false,
    icon: "📚"
  });

  useEffect(() => {
    loadTopics();
    loadCategories();
    loadTips();
    loadAnalytics();
    loadPendingApprovals();
  }, []);

  // Load functions
  const loadTopics = async () => {
    try {
      const res = await api.get("/educational-content/topics?isTip=false");
      setTopics(res.data);
    } catch (error) {
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/educational-content/categories");
      console.log("Loaded categories:", res.data);
      setCategories(res.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadTips = async () => {
    try {
      const res = await api.get("/educational-content/tips");
      setTips(res.data);
    } catch (error) {
      console.error("Error loading tips:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const overviewRes = await api.get("/educational-content/analytics");
      const mostReadRes = await api.get("/educational-content/analytics?type=most-read");
      const categoryRes = await api.get("/educational-content/analytics?type=category-engagement");
      const searchRes = await api.get("/educational-content/analytics?type=search-trends");

      setAnalytics({
        overview: overviewRes.data.overview || { totalTopics: 0, totalTips: 0, totalViews: 0, totalClicks: 0 },
        mostReadTopics: mostReadRes.data.mostReadTopics || [],
        categoryEngagement: categoryRes.data.categoryEngagement || [],
        searchTrends: searchRes.data.searchTrends || []
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const res = await api.get("/educational-content/approvals/pending");
      setPendingApprovals(res.data);
    } catch (error) {
      console.error("Error loading pending approvals:", error);
    }
  };

  // Filtered topics
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(search.toLowerCase()) ||
                         topic.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Topic CRUD functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        keyPoints: formData.keyPoints.filter(point => point.trim() !== ""),
        links: formData.links.filter(link => link.label.trim() !== "" && link.url.trim() !== "")
      };

      if (editingTopic) {
        await api.put(`/educational-content/topics/${editingTopic._id}`, data);
      } else {
        await api.post("/educational-content/topics", data);
      }

      loadTopics();
      closeModal();
    } catch (error) {
      console.error("Error saving topic:", error);
      alert("Error saving topic. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;

    try {
      await api.delete(`/educational-content/topics/${id}`);
      loadTopics();
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Error deleting topic. Please try again.");
    }
  };

  // Tip CRUD functions
  const handleTipSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        icon: formData.icon
      };

      if (editingTip) {
        await api.put(`/educational-content/tips/${editingTip._id}`, data);
      } else {
        await api.post("/educational-content/tips", data);
      }

      loadTips();
      closeTipModal();
    } catch (error) {
      console.error("Error saving tip:", error);
      alert("Error saving tip. Please try again.");
    }
  };

  const handleDeleteTip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tip?")) return;

    try {
      await api.delete(`/educational-content/tips/${id}`);
      loadTips();
    } catch (error) {
      console.error("Error deleting tip:", error);
      alert("Error deleting tip. Please try again.");
    }
  };

  // Approval functions
  const handleApprove = async (id) => {
    try {
      await api.post(`/educational-content/approvals/${id}/approve`);
      loadPendingApprovals();
      loadTopics();
      alert("Content approved successfully!");
    } catch (error) {
      console.error("Error approving content:", error);
      alert("Error approving content. Please try again.");
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      await api.post(`/educational-content/approvals/${id}/reject`, { rejectionReason });
      loadPendingApprovals();
      setShowApprovalModal(false);
      setRejectionReason("");
      alert("Content rejected successfully!");
    } catch (error) {
      console.error("Error rejecting content:", error);
      alert("Error rejecting content. Please try again.");
    }
  };

  // Modal functions
  const openModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      // Ensure category is set as category name string
      let categoryName = "";
      if (topic.category) {
        if (typeof topic.category === "string") {
          categoryName = topic.category;
        } else if (typeof topic.category === "object" && topic.category.name) {
          categoryName = topic.category.name;
        }
      }
      console.log("Opening modal with topic category:", categoryName);
      setFormData({
        title: topic.title || "",
        content: topic.content || "",
        category: categoryName,
        difficulty: topic.difficulty || "Beginner",
        readTime: topic.readTime || "",
        keyPoints: topic.keyPoints || [],
        links: topic.links || [],
        isTip: topic.isTip || false,
        icon: topic.icon || "📚"
      });
    } else {
      setEditingTopic(null);
      setFormData({
        title: "",
        content: "",
        category: "",
        difficulty: "Beginner",
        readTime: "",
        keyPoints: [],
        links: [],
        isTip: false,
        icon: "📚"
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    setFormData({
      title: "",
      content: "",
      category: "",
      difficulty: "Beginner",
      readTime: "",
      keyPoints: [],
      links: [],
      isTip: false,
      icon: "📚"
    });
  };

  const openTipModal = (tip = null) => {
    if (tip) {
      setEditingTip(tip);
      setFormData({
        title: tip.title || "",
        content: tip.content || "",
        category: tip.category || "",
        icon: tip.icon || "💡"
      });
    } else {
      setEditingTip(null);
      setFormData({
        title: "",
        content: "",
        category: "General",
        icon: "💡"
      });
    }
    setShowTipModal(true);
  };

  const closeTipModal = () => {
    setShowTipModal(false);
    setEditingTip(null);
    setFormData({
      title: "",
      content: "",
      category: "",
      icon: "💡"
    });
  };

  // Helper functions
  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, ""]
    }));
  };

  const updateKeyPoint = (index, value) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.map((point, i) => i === index ? value : point)
    }));
  };

  const removeKeyPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { label: "", url: "" }]
    }));
  };

  const updateLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="loading">Loading educational content...</div>;
  }

  return (
    <div className="admin-educational-content">
      <div className="content-header">
        <h2>Educational Content Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          📚 Topics
        </button>
        <button
          className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          💡 Tips
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          ✅ Approvals ({pendingApprovals.length})
        </button>
      </div>

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <>
          <div className="content-header">
            <h3>Manage Educational Topics</h3>
            <button className="btn-primary" onClick={() => openModal()}>
              <FaPlus /> Add New Topic
            </button>
          </div>

          {/* Search and Filters */}
          <div className="content-controls">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-filters">
              <button
                className={`category-btn ${selectedCategory === "All" ? 'active' : ''}`}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.name}
                  className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Table */}
          <div className="topics-table-container">
            <table className="topics-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Read Time</th>
                  <th>Views</th>
                  <th>Clicks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => (
                  <tr key={topic._id}>
                    <td>{topic.title}</td>
                    <td>{topic.category}</td>
                    <td>{topic.difficulty}</td>
                    <td>{topic.readTime}</td>
                    <td>{topic.views || 0}</td>
                    <td>{topic.clicks || 0}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openModal(topic)}>
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(topic._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTopics.length === 0 && (
              <div className="no-results">
                <p>No topics found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <>
          <div className="content-header">
            <h3>Manage Quick Tips</h3>
            <button className="btn-primary" onClick={() => openTipModal()}>
              <FaPlus /> Add New Tip
            </button>
          </div>

          <div className="tips-grid">
            {tips.map((tip) => (
              <div key={tip._id} className="tip-card">
                <div className="tip-header">
                  <span className="tip-icon">{tip.icon}</span>
                  <div className="tip-actions">
                    <button className="btn-edit" onClick={() => openTipModal(tip)}>
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteTip(tip._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <h4>{tip.title}</h4>
                <p>{tip.content}</p>
                <span className="tip-category">{tip.category}</span>
              </div>
            ))}

            {tips.length === 0 && (
              <div className="no-results">
                <p>No tips available. Create your first tip!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h3>Content Analytics & Engagement</h3>

          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <FaEye className="stat-icon" />
              <div className="stat-content">
                <h4>{analytics.overview.totalViews}</h4>
                <p>Total Views</p>
              </div>
            </div>
            <div className="stat-card">
              <FaMousePointer className="stat-icon" />
              <div className="stat-content">
                <h4>{analytics.overview.totalClicks}</h4>
                <p>Total Clicks</p>
              </div>
            </div>
            <div className="stat-card">
              <FaLightbulb className="stat-icon" />
              <div className="stat-content">
                <h4>{analytics.overview.totalTips}</h4>
                <p>Active Tips</p>
              </div>
            </div>
            <div className="stat-card">
              <FaLink className="stat-icon" />
              <div className="stat-content">
                <h4>{analytics.overview.totalTopics}</h4>
                <p>Total Topics</p>
              </div>
            </div>
          </div>

          {/* Most Read Topics */}
          <div className="analytics-section">
            <h4>Most Read Topics</h4>
            <div className="analytics-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Views</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.mostReadTopics.map((topic, index) => (
                    <tr key={index}>
                      <td>{topic.title}</td>
                      <td>{topic.category}</td>
                      <td>{topic.views}</td>
                      <td>{topic.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Engagement */}
          <div className="analytics-section">
            <h4>Category Engagement</h4>
            <div className="analytics-table">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Views</th>
                    <th>Total Clicks</th>
                    <th>Topics Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.categoryEngagement.map((category, index) => (
                    <tr key={index}>
                      <td>{category._id}</td>
                      <td>{category.totalViews}</td>
                      <td>{category.totalClicks}</td>
                      <td>{category.topicCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <>
          <div className="content-header">
            <h3>Content Approval & Moderation</h3>
          </div>

          <div className="approvals-list">
            {pendingApprovals.map((item) => (
              <div key={item._id} className="approval-card">
                <div className="approval-header">
                  <h4>{item.title}</h4>
                  <span className="approval-status pending">Pending</span>
                </div>
                <p className="approval-content">{item.content.substring(0, 200)}...</p>
                <div className="approval-meta">
                  <span>Submitted by: {item.submittedBy?.name || 'Unknown'}</span>
                  <span>Category: {item.category}</span>
                  <span>Type: {item.isTip ? 'Tip' : 'Topic'}</span>
                </div>
                <div className="approval-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(item._id)}
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      setSelectedApproval(item);
                      setShowApprovalModal(true);
                    }}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              </div>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="no-results">
                <p>No pending approvals at this time.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Topic Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTopic ? "Edit Topic" : "Add New Topic"}</h3>
              <button className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="topic-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Read Time *</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                    placeholder="e.g., 5 min read"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(category => (
                    <option key={category._id || category.name} value={category.name || category}>
                      {category.name || category}
                    </option>
                  ))}
                </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Important">Important</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              {/* Key Points */}
              <div className="form-group">
                <label>Key Points</label>
                {formData.keyPoints.map((point, index) => (
                  <div key={index} className="key-point-input">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateKeyPoint(index, e.target.value)}
                      placeholder="Enter key point"
                    />
                    <button type="button" onClick={() => removeKeyPoint(index)}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addKeyPoint}>
                  <FaPlus /> Add Key Point
                </button>
              </div>

              {/* Links */}
              <div className="form-group">
                <label>External Links</label>
                {formData.links.map((link, index) => (
                  <div key={index} className="link-input">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(index, 'label', e.target.value)}
                      placeholder="Link label"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      placeholder="URL"
                    />
                    <button type="button" onClick={() => removeLink(index)}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addLink}>
                  <FaPlus /> Add Link
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <FaSave /> {editingTopic ? "Update" : "Create"} Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTip ? "Edit Tip" : "Add New Tip"}</h3>
              <button className="close-btn" onClick={closeTipModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleTipSubmit} className="topic-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., General, Health, Wellness"
                  />
                </div>
                <div className="form-group">
                  <label>Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="💡"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeTipModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <FaSave /> {editingTip ? "Update" : "Create"} Tip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reject Content</h3>
              <button className="close-btn" onClick={() => setShowApprovalModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="topic-form">
              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => handleReject(selectedApproval._id)}
                >
                  <FaTimesCircle /> Reject Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
