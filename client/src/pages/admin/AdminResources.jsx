import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";
import "./AdminResources.css";

const CATEGORIES = [
  "Legal Rights & Laws",
  "Health & Wellness",
  "Safety & Security",
  "Education & Skills",
  "Support Networks"
];

const TYPES = ["Article", "Guide", "Video", "PDF", "Checklist", "External Link"];
const EVENT_TYPES = ["Event", "Webinar"];
const QUIZ_CATEGORIES = ["Safety", "Legal", "Health", "Helplines"];
const QUIZ_TYPES = ["Quiz", "Self-Assessment"];
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const RESOURCE_TYPE_ICON = { Video: "🎥", Article: "📝", PDF: "📄", Guide: "📘", Checklist: "✅", "External Link": "🔗" };
const SUGGESTED_TAGS = ["Safety", "Mental Health", "Self Defense", "Health"];

export default function AdminResources() {
  const [activeTab, setActiveTab] = useState("submit");
  const [activeEventTab, setActiveEventTab] = useState("submit-event");
  const [activeQuizTab, setActiveQuizTab] = useState("create-quiz");
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({ approved: "", verified: "", category: "", type: "", q: "" });
  const [eventFilters, setEventFilters] = useState({ published: "", q: "" });
  const [quizFilters, setQuizFilters] = useState({ category: "", type: "", difficulty: "", q: "" });

  const [submitForm, setSubmitForm] = useState({ title: "", description: "", url: "", category: "", type: "Article", sourceName: "", sourceUrl: "", tags: "", lang: "" });
  const [submitFile, setSubmitFile] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [submitEventForm, setSubmitEventForm] = useState({ title: "", description: "", date: "", time: "", location: "", url: "", bannerImage: "", published: false, type: "Event" });
  const [submitEventBannerFile, setSubmitEventBannerFile] = useState(null);
  const [submitEventError, setSubmitEventError] = useState("");
  const [submitEventSuccess, setSubmitEventSuccess] = useState("");

  const [submitQuizForm, setSubmitQuizForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "Quiz",
    difficulty: "Beginner",
    estimatedTime: "",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }],
    educationalLinks: [""]
  });
  const [submitQuizError, setSubmitQuizError] = useState("");
  const [submitQuizSuccess, setSubmitQuizSuccess] = useState("");
  const [resourceSort, setResourceSort] = useState("newest");
  const [selectedResource, setSelectedResource] = useState(null);
  const [eventTimelineTab, setEventTimelineTab] = useState("upcoming");
  const [quizStep, setQuizStep] = useState(1);
  const [resourceMeta, setResourceMeta] = useState({ difficulty: "Beginner", readingTime: "", thumbnail: "" });
  const [viewMode, setViewMode] = useState("list");
  const [publishedMap, setPublishedMap] = useState({});
  const [activityFeed, setActivityFeed] = useState([]);

  // Load data functions
  const loadResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
      const res = await api.get(`/admin/resources?${params}`);
      setResources(res.data.resources);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(eventFilters).forEach(([key, value]) => value && params.append(key, value));
      const res = await api.get(`/admin/events?${params}`);
      setEvents(res.data.events);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(quizFilters).forEach(([key, value]) => value && params.append(key, value));
      const res = await api.get(`/admin/quizzes?${params}`);
      setQuizzes(res.data.quizzes);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/admin/resources/analytics/overview");
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
  };

  // Action handlers for resources
  const handleApproveResource = async (resourceId) => {
    try {
      await api.patch(`/admin/resources/${resourceId}/approve`);
      const resource = resources.find((r) => r._id === resourceId);
      if (resource) pushActivity("✅", `Resource approved: ${resource.title}`);
      loadResources(); // Refresh the list
    } catch (err) {
      console.error("Failed to approve resource:", err);
      alert("Failed to approve resource. Please try again.");
    }
  };

  const handleRejectResource = async (resourceId) => {
    try {
      await api.patch(`/admin/resources/${resourceId}`, { approved: false });
      const resource = resources.find((r) => r._id === resourceId);
      if (resource) pushActivity("⚠", `Resource rejected: ${resource.title}`);
      loadResources(); // Refresh the list
    } catch (err) {
      console.error("Failed to reject resource:", err);
      alert("Failed to reject resource. Please try again.");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const resource = resources.find((r) => r._id === resourceId);
      await api.delete(`/admin/resources/${resourceId}`);
      if (resource) pushActivity("🗑", `Resource deleted: ${resource.title}`);
      loadResources(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete resource:", err);
      alert("Failed to delete resource. Please try again.");
    }
  };

  const handleTogglePublish = async (eventId) => {
    try {
      await api.patch(`/admin/events/${eventId}/toggle-publish`);
      const event = events.find((e) => e._id === eventId);
      if (event) pushActivity("✅", `Event updated: ${event.title}`);
      loadEvents(); // Refresh the list
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
      alert("Failed to toggle publish status. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const event = events.find((e) => e._id === eventId);
      await api.delete(`/admin/events/${eventId}`);
      if (event) pushActivity("🗑", `Event deleted: ${event.title}`);
      loadEvents(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  useEffect(() => {
    if (activeTab === "resources") loadResources();
    if (activeTab === "events") loadEvents();
    if (activeTab === "quizzes") loadQuizzes();
    if (activeTab === "analytics") loadAnalytics();
  }, [activeTab, filters, eventFilters, quizFilters]);

  // Handle file changes
  const handleSubmitFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setSubmitError("Only PDF files are allowed.");
      setSubmitFile(null);
    } else setSubmitFile(file);
  };

  const handleSubmitEventBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setSubmitEventError("Only image files are allowed.");
      setSubmitEventBannerFile(null);
      return;
    }
    setSubmitEventBannerFile(file);
  };

  // Submit handlers
  const handleSubmitResource = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    if (!submitForm.title || !submitForm.description || !submitForm.category || !submitForm.type) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    if (!submitForm.url && (submitForm.type !== "PDF" || !submitFile)) {
      setSubmitError("Please provide a Resource URL or upload PDF.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(submitForm).forEach(([key, value]) => { if (value) formData.append(key, value); });
      if (submitFile) formData.append("resourceFile", submitFile);

      await api.post("/admin/resources", formData, { headers: { "Content-Type": "multipart/form-data" } });

      setSubmitSuccess("Resource submitted successfully!");
      setSubmitForm({ title: "", description: "", url: "", category: "", type: "Article", sourceName: "", sourceUrl: "", tags: "", lang: "" });
      setSubmitFile(null);
      setResourceMeta({ difficulty: "Beginner", readingTime: "", thumbnail: "" });
      loadResources();
    } catch (err) { setSubmitError("Failed to submit resource. Please try again."); }
  };

  const sortedResources = useMemo(() => {
    const list = [...resources];
    if (resourceSort === "oldest") {
      return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    if (resourceSort === "most-viewed") {
      return list.sort((a, b) => Number(b.views || b.viewCount || 0) - Number(a.views || a.viewCount || 0));
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [resources, resourceSort]);

  const timelineEvents = useMemo(() => {
    const now = Date.now();
    return events.filter((event) => {
      const ts = new Date(event.date).getTime();
      if (Number.isNaN(ts)) return eventTimelineTab === "upcoming";
      return eventTimelineTab === "upcoming" ? ts >= now : ts < now;
    });
  }, [events, eventTimelineTab]);

  const analyticsCards = useMemo(() => ({
    totalViews: analytics?.totalViews ?? resources.reduce((sum, r) => sum + Number(r.views || r.viewCount || 0), 0),
    popular: analytics?.mostPopularResource?.title || resources[0]?.title || "N/A",
    distributionCount: analytics?.categoryDistribution?.length || CATEGORIES.length,
  }), [analytics, resources]);

  const categoryChartRows = useMemo(() => {
    const fromAnalytics = analytics?.categoryDistribution;
    if (Array.isArray(fromAnalytics) && fromAnalytics.length) {
      return fromAnalytics.map((row) => ({
        label: row.category || "Other",
        value: Number(row.count || 0),
      }));
    }
    return CATEGORIES.map((category) => ({
      label: category,
      value: resources.filter((r) => r.category === category).length,
    }));
  }, [analytics, resources]);

  const growthChartRows = useMemo(() => {
    const fromAnalytics = analytics?.resourceGrowth;
    if (Array.isArray(fromAnalytics) && fromAnalytics.length) {
      return fromAnalytics.map((row) => ({
        label: row.label || row.month || "Period",
        value: Number(row.value || row.count || 0),
      }));
    }
    const last6 = Array.from({ length: 6 }).map((_, idx) => ({ label: `M${idx + 1}`, value: 0 }));
    resources.forEach((_, idx) => {
      last6[idx % last6.length].value += 1;
    });
    return last6;
  }, [analytics, resources]);

  const clearResourceFilters = () => {
    setFilters({ approved: "", verified: "", category: "", type: "", q: "" });
    setResourceSort("newest");
  };

  const pushActivity = (icon, text) => {
    setActivityFeed((prev) => [
      { id: `${Date.now()}-${Math.random()}`, icon, text, at: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
  };

  const handlePublishResourceUI = (resource) => {
    setPublishedMap((prev) => ({ ...prev, [resource._id]: true }));
    pushActivity("✅", `Resource published: ${resource.title}`);
  };

  const workflowStatus = (resource) => {
    if (publishedMap[resource._id]) return "Published";
    if (resource.approved) return "Approved";
    return "Pending";
  };

  const workflowBadgeClass = (status) => {
    if (status === "Published") return "published";
    if (status === "Approved") return "approved";
    return "pending";
  };

  const recentActivity = useMemo(() => {
    const fromData = [
      ...resources.slice(0, 3).map((r) => ({ id: `r-${r._id}`, icon: "✅", text: `Resource approved: ${r.title}`, at: "recently" })),
      ...events.slice(0, 2).map((e) => ({ id: `e-${e._id}`, icon: "➕", text: `Event created: ${e.title}`, at: "recently" })),
      ...quizzes.slice(0, 2).map((q) => ({ id: `q-${q._id}`, icon: "➕", text: `Quiz added: ${q.title}`, at: "recently" })),
    ];
    return [...activityFeed, ...fromData].slice(0, 10);
  }, [activityFeed, resources, events, quizzes]);

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmitEventError("");
    setSubmitEventSuccess("");
    if (!submitEventForm.title || !submitEventForm.date) {
      setSubmitEventError("Please fill in all required fields (title and date).");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(submitEventForm).forEach(([key, value]) => formData.append(key, value || ""));
      if (submitEventBannerFile) formData.append("bannerImage", submitEventBannerFile);

      await api.post("/admin/events", formData, { headers: { "Content-Type": "multipart/form-data" } });

      setSubmitEventSuccess("Event/Webinar submitted successfully!");
      setSubmitEventForm({ title: "", description: "", date: "", time: "", location: "", url: "", bannerImage: "", published: false, type: "Event" });
      setSubmitEventBannerFile(null);
      loadEvents();
    } catch (err) { setSubmitEventError("Failed to submit event/webinar. Please try again."); }
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setSubmitQuizError("");
    setSubmitQuizSuccess("");
    if (!submitQuizForm.title || !submitQuizForm.category || !submitQuizForm.questions.length) {
      setSubmitQuizError("Please fill in title, category, and at least one question.");
      return;
    }
    for (let i = 0; i < submitQuizForm.questions.length; i++) {
      const q = submitQuizForm.questions[i];
      if (!q.question || q.options.some(opt => !opt)) {
        setSubmitQuizError(`Question ${i + 1} is incomplete.`);
        return;
      }
    }

    try {
      const quizData = {
        ...submitQuizForm,
        questions: submitQuizForm.questions.map(q => ({ ...q, options: q.options.filter(opt => opt.trim() !== "") })),
        educationalLinks: submitQuizForm.educationalLinks.filter(link => link.trim() !== "")
      };

      await api.post("/admin/quizzes", quizData);
      setSubmitQuizSuccess("Quiz/Assessment created successfully!");
      setSubmitQuizForm({
        title: "", description: "", category: "", type: "Quiz", difficulty: "Beginner", estimatedTime: "",
        questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }],
        educationalLinks: [""]
      });
      loadQuizzes();
    } catch (err) { setSubmitQuizError("Failed to create quiz/assessment. Please try again."); }
  };

  return (
    <AdminLayout pageTitle="📂 Manage Resources & Content">
      <div className="admin-resources page-container">
        {/* Main Tabs */}
        <div className="tabs">
          <button className={activeTab === "submit" ? "active" : ""} onClick={() => setActiveTab("submit")}>➕ Submit</button>
          <button className={activeTab === "resources" ? "active" : ""} onClick={() => setActiveTab("resources")}>📂 Manage</button>
          <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>🎤 Events</button>
          <button className={activeTab === "quizzes" ? "active" : ""} onClick={() => setActiveTab("quizzes")}>🧠 Quiz</button>
          <button className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>📊 Analytics</button>
        </div>

        {/* Submit Resource Form */}
        {activeTab === "submit" && (
          <div className="submit-resource-form form-card">
            <h3>➕ Submit a New Resource</h3>
            <form onSubmit={handleSubmitResource}>
              <label>
                Title<span className="required">*</span>
                <input type="text" value={submitForm.title} onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })} required />
                <small>Use a clear and searchable content title.</small>
              </label>

              <label>
                Category<span className="required">*</span>
                <select value={submitForm.category} onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <small>Choose the best matching content category.</small>
              </label>

              <label>
                Type<span className="required">*</span>
                <select value={submitForm.type} onChange={e => setSubmitForm({ ...submitForm, type: e.target.value })} required>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <small>Resource type controls how users consume this content.</small>
              </label>

              <label>
                Description<span className="required">*</span>
                <textarea
                  value={submitForm.description}
                  maxLength={500}
                  onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                  required
                />
                <small>{submitForm.description.length}/500 characters</small>
              </label>

              <label>
                Resource URL{submitForm.type !== "PDF" || !submitFile ? <span className="required">*</span> : ""}
                <input type="url" value={submitForm.url} onChange={e => setSubmitForm({ ...submitForm, url: e.target.value })} required={submitForm.type !== "PDF" || !submitFile} />
              </label>

              {submitForm.type === "PDF" && (
                <label>
                  Or Upload PDF
                  <input type="file" accept="application/pdf" onChange={handleSubmitFileChange} />
                  <div
                    className="dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      if (file.type !== "application/pdf") {
                        setSubmitError("Only PDF files are allowed.");
                        return;
                      }
                      setSubmitFile(file);
                    }}
                  >
                    Drag and drop PDF here (optional)
                  </div>
                  {submitFile && <span className="file-name">{submitFile.name}</span>}
                </label>
              )}

              <label>
                Tags
                <input type="text" value={submitForm.tags} onChange={e => setSubmitForm({ ...submitForm, tags: e.target.value })} placeholder="safety, health" />
                <small>Comma-separated tags improve discoverability.</small>
                <div className="suggestions-row">
                  <span>Suggested tags:</span>
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => {
                        const hasTag = (submitForm.tags || "").toLowerCase().includes(tag.toLowerCase());
                        if (hasTag) return;
                        const merged = submitForm.tags ? `${submitForm.tags}, ${tag}` : tag;
                        setSubmitForm({ ...submitForm, tags: merged });
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                Difficulty Level
                <select value={resourceMeta.difficulty} onChange={(e) => setResourceMeta({ ...resourceMeta, difficulty: e.target.value })}>
                  {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              <label>
                Estimated Reading Time
                <input type="text" value={resourceMeta.readingTime} onChange={(e) => setResourceMeta({ ...resourceMeta, readingTime: e.target.value })} placeholder="e.g., 8 min" />
              </label>

              <label>
                Thumbnail Image (optional)
                <input type="url" value={resourceMeta.thumbnail} onChange={(e) => setResourceMeta({ ...resourceMeta, thumbnail: e.target.value })} placeholder="https://..." />
              </label>

              {submitError && <div className="error">{submitError}</div>}
              {submitSuccess && <div className="success">{submitSuccess}</div>}

              <button type="submit" className="btn primary">Submit Resource</button>
            </form>
            <div className="resource-preview-card">
              <h4>Thumbnail Preview</h4>
              <div className="thumb-preview">
                {resourceMeta.thumbnail ? (
                  <img src={resourceMeta.thumbnail} alt="Resource thumbnail preview" />
                ) : (
                  <div className="thumb-placeholder">📄</div>
                )}
              </div>
              <p className="preview-title">{submitForm.title || "Resource title preview"}</p>
              <p><strong>Category:</strong> {submitForm.category || "Not selected"}</p>
              <p><strong>Type:</strong> {submitForm.type || "Not selected"}</p>
              <p><strong>Difficulty:</strong> {resourceMeta.difficulty}</p>
              <p><strong>Reading Time:</strong> {resourceMeta.readingTime || "N/A"}</p>
              <p className="preview-description">{submitForm.description || "Resource description preview..."}</p>
            </div>
          </div>
        )}

        {/* Resources Management */}
        {activeTab === "resources" && (
          <div className="resources-layout">
            <div className="resources-management">
              <h3>📂 Resources Management</h3>
              <div className="filters filter-card">
                <input type="text" placeholder="Search resources..." value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} />
                <select value={filters.approved} onChange={e => setFilters({ ...filters, approved: e.target.value })}>
                  <option value="">All Approval Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
                <select value={filters.verified} onChange={e => setFilters({ ...filters, verified: e.target.value })}>
                  <option value="">All Verification Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
                <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All Types</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={resourceSort} onChange={(e) => setResourceSort(e.target.value)}>
                  <option value="newest">Sort: newest</option>
                  <option value="oldest">Sort: oldest</option>
                  <option value="most-viewed">Sort: most viewed</option>
                </select>
                <button className="btn secondary" onClick={clearResourceFilters} type="button">Clear Filters</button>
              </div>

              <div className="view-toggle">
                <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List View</button>
                <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid View</button>
              </div>

              {loading ? <p>Loading...</p> : sortedResources.length ? (
                viewMode === "list" ? (
                  <div className="resources-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Workflow</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedResources.map(resource => {
                          const status = workflowStatus(resource);
                          return (
                            <tr key={resource._id}>
                              <td>{resource.title}</td>
                              <td>{resource.category}</td>
                              <td>{RESOURCE_TYPE_ICON[resource.type] || "📦"} {resource.type}</td>
                              <td>
                                <div className="workflow-row">
                                  <span className="workflow-step pending">Pending</span>
                                  <span className="workflow-arrow">→</span>
                                  <span className={`workflow-step ${resource.approved ? "approved" : ""}`}>Approved</span>
                                  <span className="workflow-arrow">→</span>
                                  <span className={`workflow-step ${publishedMap[resource._id] ? "published" : ""}`}>Published</span>
                                </div>
                                <span className={`status-badge ${workflowBadgeClass(status)}`}>{status}</span>
                              </td>
                              <td className="actions">
                                <button className="view" onClick={() => setSelectedResource(resource)}>👁 View</button>
                                <button className="edit">✏ Edit</button>
                                <button className="approve" onClick={() => handleApproveResource(resource._id)}>Approve</button>
                                <button className="publish" onClick={() => handlePublishResourceUI(resource)}>Publish</button>
                                <button className="reject" onClick={() => handleRejectResource(resource._id)}>Reject</button>
                                <button className="delete" onClick={() => handleDeleteResource(resource._id)}>🗑 Delete</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="resources-grid">
                    {sortedResources.map((resource) => {
                      const status = workflowStatus(resource);
                      const thumb = resource.thumbnail || resource.image || resource.coverImage || "";
                      return (
                        <article key={resource._id} className="resource-card">
                          <div className="resource-thumb">
                            {thumb ? <img src={thumb} alt={resource.title} /> : <div className="resource-thumb-placeholder">📄</div>}
                          </div>
                          <h4>{resource.title}</h4>
                          <p className="meta">{resource.category}</p>
                          <p>{RESOURCE_TYPE_ICON[resource.type] || "📦"} {resource.type}</p>
                          <span className={`status-badge ${workflowBadgeClass(status)}`}>{status}</span>
                          <div className="workflow-row compact">
                            <span className="workflow-step pending">Pending</span>
                            <span className={`workflow-step ${resource.approved ? "approved" : ""}`}>Approved</span>
                            <span className={`workflow-step ${publishedMap[resource._id] ? "published" : ""}`}>Published</span>
                          </div>
                          <p className="meta">Difficulty: {resource.difficulty || "Beginner"}</p>
                          <p className="meta">Estimated Time: {resource.estimatedTime || "N/A"}</p>
                          <p className="meta">Tags: {resource.tags || "N/A"}</p>
                          <div className="actions">
                            <button className="view" onClick={() => setSelectedResource(resource)}>👁 View</button>
                            <button className="edit">✏ Edit</button>
                            <button className="approve" onClick={() => handleApproveResource(resource._id)}>Approve</button>
                            <button className="publish" onClick={() => handlePublishResourceUI(resource)}>Publish</button>
                            <button className="reject" onClick={() => handleRejectResource(resource._id)}>Reject</button>
                            <button className="delete" onClick={() => handleDeleteResource(resource._id)}>🗑 Delete</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="empty-state">
                  <p>📭 No resources found</p>
                  <span>Start by adding your first resource</span>
                </div>
              )}
            </div>

            <aside className="activity-panel">
              <h4>Recent Activity</h4>
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div className="activity-item" key={item.id}>
                    <span className="activity-icon">{item.icon}</span>
                    <div>
                      <p>{item.text}</p>
                      <small>{item.at}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No activity yet</p>
                  <span>Actions will appear here</span>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Events & Webinars */}
        {activeTab === "events" && (
          <div className="events-management">
            <div className="event-sub-tabs">
              <button className={activeEventTab === "submit-event" ? "active" : ""} onClick={() => setActiveEventTab("submit-event")}>Submit Event/Webinar</button>
              <button className={activeEventTab === "manage-events" ? "active" : ""} onClick={() => setActiveEventTab("manage-events")}>Manage Events</button>
            </div>

            {activeEventTab === "submit-event" && (
              <div className="submit-event-form">
                <h3>Submit a New Event or Webinar</h3>
                <form onSubmit={handleSubmitEvent}>
                  <label>
                    Title<span className="required">*</span>
                    <input type="text" value={submitEventForm.title} onChange={e => setSubmitEventForm({ ...submitEventForm, title: e.target.value })} required />
                  </label>

                  <label>
                    Type<span className="required">*</span>
                    <select value={submitEventForm.type} onChange={e => setSubmitEventForm({ ...submitEventForm, type: e.target.value })} required>
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>

                  <label>
                    Date<span className="required">*</span>
                    <input type="date" value={submitEventForm.date} onChange={e => setSubmitEventForm({ ...submitEventForm, date: e.target.value })} required />
                  </label>

                  <label>
                    Time
                    <input type="time" value={submitEventForm.time} onChange={e => setSubmitEventForm({ ...submitEventForm, time: e.target.value })} />
                  </label>

                  <label>
                    Location
                    <input type="text" value={submitEventForm.location} onChange={e => setSubmitEventForm({ ...submitEventForm, location: e.target.value })} />
                  </label>

                  <label>
                    URL
                    <input type="url" value={submitEventForm.url} onChange={e => setSubmitEventForm({ ...submitEventForm, url: e.target.value })} />
                  </label>

                  <label>
                    Description
                    <textarea value={submitEventForm.description} onChange={e => setSubmitEventForm({ ...submitEventForm, description: e.target.value })} />
                  </label>

                  <label>
                    Banner Image
                    <input type="file" accept="image/*" onChange={handleSubmitEventBannerFileChange} />
                    {submitEventBannerFile && <span className="file-name">{submitEventBannerFile.name}</span>}
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" checked={submitEventForm.published} onChange={e => setSubmitEventForm({ ...submitEventForm, published: e.target.checked })} />
                    Publish Event/Webinar
                  </label>

                  {submitEventError && <div className="error">{submitEventError}</div>}
                  {submitEventSuccess && <div className="success">{submitEventSuccess}</div>}

                  <button type="submit" className="btn primary">Submit Event/Webinar</button>
                </form>
              </div>
            )}

            {activeEventTab === "manage-events" && (
              <div className="manage-events">
                <h3>🎤 Manage Events & Webinars</h3>
                <div className="filters">
                  <input type="text" placeholder="Search events..." value={eventFilters.q} onChange={e => setEventFilters({ ...eventFilters, q: e.target.value })} />
                  <select value={eventFilters.published} onChange={e => setEventFilters({ ...eventFilters, published: e.target.value })}>
                    <option value="">All Status</option>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
                <div className="timeline-tabs">
                  <button className={eventTimelineTab === "upcoming" ? "active" : ""} onClick={() => setEventTimelineTab("upcoming")}>Upcoming</button>
                  <button className={eventTimelineTab === "past" ? "active" : ""} onClick={() => setEventTimelineTab("past")}>Past</button>
                </div>
                {loading ? <p>Loading...</p> : timelineEvents.length ? (
                  <div className="event-cards-grid">
                    {timelineEvents.map(event => (
                      <article key={event._id} className="event-card">
                        <h4>{event.title}</h4>
                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {event.time || "N/A"}</p>
                        <p><strong>Location:</strong> {event.location || "Online"}</p>
                        <p><strong>Status:</strong> <span className={`status-badge ${event.published ? "approved" : "pending"}`}>{event.published ? "Published" : "Draft"}</span></p>
                        <div className="actions">
                          <button className="edit">✏ Edit</button>
                          <button className={event.published ? "unpublish" : "publish"} onClick={() => handleTogglePublish(event._id)}>
                            {event.published ? "Unpublish" : "Publish"}
                          </button>
                          <button className="delete" onClick={() => handleDeleteEvent(event._id)}>🗑 Delete</button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>📭 No events found</p>
                    <span>Create an event to get started</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quizzes & Assessments */}
        {activeTab === "quizzes" && (
          <div className="quizzes-management">
            <div className="quiz-sub-tabs">
              <button className={activeQuizTab === "create-quiz" ? "active" : ""} onClick={() => setActiveQuizTab("create-quiz")}>Create Quiz/Assessment</button>
              <button className={activeQuizTab === "manage-quizzes" ? "active" : ""} onClick={() => setActiveQuizTab("manage-quizzes")}>Manage Quizzes</button>
            </div>

            {activeQuizTab === "create-quiz" && (
              <div className="submit-quiz-form">
                <h3>Create a New Quiz or Self-Assessment</h3>
                <div className="quiz-stepper">
                  <button type="button" className={quizStep === 1 ? "active" : ""} onClick={() => setQuizStep(1)}>Step 1: Basic info</button>
                  <button type="button" className={quizStep === 2 ? "active" : ""} onClick={() => setQuizStep(2)}>Step 2: Questions</button>
                  <button type="button" className={quizStep === 3 ? "active" : ""} onClick={() => setQuizStep(3)}>Step 3: Review</button>
                </div>
                <form onSubmit={handleSubmitQuiz}>
                  {quizStep === 1 && (
                  <>
                  <label>
                    Title<span className="required">*</span>
                    <input type="text" value={submitQuizForm.title} onChange={e => setSubmitQuizForm({ ...submitQuizForm, title: e.target.value })} required />
                  </label>

                  <label>
                    Category<span className="required">*</span>
                    <select value={submitQuizForm.category} onChange={e => setSubmitQuizForm({ ...submitQuizForm, category: e.target.value })} required>
                      <option value="">Select Category</option>
                      {QUIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>

                  <label>
                    Type<span className="required">*</span>
                    <select value={submitQuizForm.type} onChange={e => setSubmitQuizForm({ ...submitQuizForm, type: e.target.value })}>
                      {QUIZ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>

                  <label>
                    Difficulty
                    <select value={submitQuizForm.difficulty} onChange={e => setSubmitQuizForm({ ...submitQuizForm, difficulty: e.target.value })}>
                      {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>

                  <label>
                    Estimated Time (minutes)
                    <input
                      type="number"
                      value={submitQuizForm.estimatedTime}
                      onChange={e => setSubmitQuizForm({ ...submitQuizForm, estimatedTime: e.target.value })}
                      placeholder="e.g., 15"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={submitQuizForm.description}
                      onChange={e => setSubmitQuizForm({ ...submitQuizForm, description: e.target.value })}
                      placeholder="Brief description of the quiz"
                    />
                  </label>
                  <div className="actions">
                    <button type="button" className="btn secondary" onClick={() => setQuizStep(2)}>Next</button>
                  </div>
                  </>
                  )}

                  {/* Questions Section */}
                  {quizStep === 2 && (
                  <div className="questions-section">
                    <h4>Questions</h4>
                    {submitQuizForm.questions.map((q, index) => (
                      <div key={index} className="question-item">
                        <div className="question-header">
                          <h5>Question {index + 1}</h5>
                          {submitQuizForm.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedQuestions = submitQuizForm.questions.filter((_, i) => i !== index);
                                setSubmitQuizForm({ ...submitQuizForm, questions: updatedQuestions });
                              }}
                              className="remove-btn"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <label>
                          Question Text<span className="required">*</span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={e => {
                              const updatedQuestions = [...submitQuizForm.questions];
                              updatedQuestions[index].question = e.target.value;
                              setSubmitQuizForm({ ...submitQuizForm, questions: updatedQuestions });
                            }}
                            required
                          />
                        </label>

                        <div className="options-section">
                          <h6>Answer Options<span className="required">*</span></h6>
                          {q.options.map((option, optionIndex) => (
                            <label key={optionIndex}>
                              Option {optionIndex + 1}
                              <input
                                type="text"
                                value={option}
                                onChange={e => {
                                  const updatedQuestions = [...submitQuizForm.questions];
                                  updatedQuestions[index].options[optionIndex] = e.target.value;
                                  setSubmitQuizForm({ ...submitQuizForm, questions: updatedQuestions });
                                }}
                                required
                              />
                            </label>
                          ))}
                        </div>

                        <label>
                          Correct Answer<span className="required">*</span>
                          <select
                            value={q.correctAnswer}
                            onChange={e => {
                              const updatedQuestions = [...submitQuizForm.questions];
                              updatedQuestions[index].correctAnswer = parseInt(e.target.value);
                              setSubmitQuizForm({ ...submitQuizForm, questions: updatedQuestions });
                            }}
                            required
                          >
                            {q.options.map((_, optionIndex) => (
                              <option key={optionIndex} value={optionIndex}>
                                Option {optionIndex + 1}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Explanation
                          <textarea
                            value={q.explanation}
                            onChange={e => {
                              const updatedQuestions = [...submitQuizForm.questions];
                              updatedQuestions[index].explanation = e.target.value;
                              setSubmitQuizForm({ ...submitQuizForm, questions: updatedQuestions });
                            }}
                            placeholder="Explanation for the correct answer"
                          />
                        </label>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitQuizForm({
                          ...submitQuizForm,
                          questions: [
                            ...submitQuizForm.questions,
                            { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
                          ]
                        });
                      }}
                      className="btn secondary add-question-btn"
                    >
                      Add Question
                    </button>
                    <div className="actions">
                      <button type="button" className="btn secondary" onClick={() => setQuizStep(1)}>Back</button>
                      <button type="button" className="btn secondary" onClick={() => setQuizStep(3)}>Next</button>
                    </div>
                  </div>
                  )}

                  {/* Educational Links Section */}
                  {quizStep === 3 && (
                  <div className="educational-links-section">
                    <h4>Educational Links</h4>
                    {submitQuizForm.educationalLinks.map((link, index) => (
                      <div key={index} className="link-item">
                        <label>
                          Link {index + 1}
                          <input
                            type="url"
                            value={link}
                            onChange={e => {
                              const updatedLinks = [...submitQuizForm.educationalLinks];
                              updatedLinks[index] = e.target.value;
                              setSubmitQuizForm({ ...submitQuizForm, educationalLinks: updatedLinks });
                            }}
                            placeholder="https://example.com"
                          />
                        </label>
                        {submitQuizForm.educationalLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedLinks = submitQuizForm.educationalLinks.filter((_, i) => i !== index);
                              setSubmitQuizForm({ ...submitQuizForm, educationalLinks: updatedLinks });
                            }}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitQuizForm({
                          ...submitQuizForm,
                          educationalLinks: [...submitQuizForm.educationalLinks, ""]
                        });
                      }}
                      className="btn secondary add-link-btn"
                    >
                      Add Educational Link
                    </button>
                    <div className="quiz-preview">
                      <h4>Quiz Preview</h4>
                      <p><strong>{submitQuizForm.title || "Untitled quiz"}</strong></p>
                      <p>{submitQuizForm.description || "No description added."}</p>
                      <p>Category: {submitQuizForm.category || "N/A"} | Type: {submitQuizForm.type} | Difficulty: {submitQuizForm.difficulty}</p>
                      <p>Total Questions: {submitQuizForm.questions.length}</p>
                    </div>
                  </div>
                  )}

                  {submitQuizError && <div className="error">{submitQuizError}</div>}
                  {submitQuizSuccess && <div className="success">{submitQuizSuccess}</div>}

                  <div className="actions">
                    {quizStep > 1 ? <button type="button" className="btn secondary" onClick={() => setQuizStep((s) => s - 1)}>Previous</button> : null}
                    <button type="submit" className="btn primary">Create Quiz/Assessment</button>
                  </div>
                </form>
          </div>
        )}

            {activeQuizTab === "manage-quizzes" && (
              <div className="manage-quizzes">
                <h3>Manage Quizzes & Assessments</h3>
                <div className="filters">
                  <input type="text" placeholder="Search quizzes..." value={quizFilters.q} onChange={e => setQuizFilters({ ...quizFilters, q: e.target.value })} />
                  <select value={quizFilters.category} onChange={e => setQuizFilters({ ...quizFilters, category: e.target.value })}>
                    <option value="">All Categories</option>
                    {QUIZ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={quizFilters.type} onChange={e => setQuizFilters({ ...quizFilters, type: e.target.value })}>
                    <option value="">All Types</option>
                    {QUIZ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={quizFilters.difficulty} onChange={e => setQuizFilters({ ...quizFilters, difficulty: e.target.value })}>
                    <option value="">All Difficulties</option>
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {loading ? <p>Loading...</p> : (
                  <div className="quizzes-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Difficulty</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.map(quiz => (
                          <tr key={quiz._id}>
                            <td>{quiz.title}</td>
                            <td>{quiz.category}</td>
                            <td>{quiz.type}</td>
                            <td>{quiz.difficulty}</td>
                            <td className="actions">
                              <button className="edit">Edit</button>
                              <button className="delete">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="analytics">
            <h3>📊 Resources Analytics</h3>
            {analytics ? (
              <div className="stats-grid cms-stats-grid">
                <div className="stat-card">
                  <h4>Total Resources</h4>
                  <span>{analytics.totalResources}</span>
                </div>
                <div className="stat-card">
                  <h4>Approved Resources</h4>
                  <span>{analytics.approvedResources}</span>
                </div>
                <div className="stat-card">
                  <h4>Pending Resources</h4>
                  <span>{analytics.pendingResources}</span>
                </div>
                <div className="stat-card">
                  <h4>Verified Resources</h4>
                  <span>{analytics.verifiedResources}</span>
                </div>
                <div className="stat-card">
                  <h4>Total Views</h4>
                  <span>{analyticsCards.totalViews}</span>
                </div>
                <div className="stat-card">
                  <h4>Most Popular Resource</h4>
                  <span className="stat-sub">{analyticsCards.popular}</span>
                </div>
                <div className="stat-card">
                  <h4>Category Distribution</h4>
                  <span>{analyticsCards.distributionCount}</span>
                </div>
              </div>
            ) : (
              <p>Loading analytics...</p>
            )}
            <div className="chart-grid">
              <div className="chart-card">
                <h4>Bar Chart - Category Usage</h4>
                <div className="bar-chart">
                  {categoryChartRows.map((row) => (
                    <div key={row.label} className="bar-item" title={`${row.label}: ${row.value}`}>
                      <div className="bar" style={{ height: `${Math.max(8, row.value * 10)}px` }} />
                      <span>{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-card">
                <h4>Line Chart - Resource Growth</h4>
                <div className="line-chart">
                  {growthChartRows.map((row) => (
                    <div key={row.label} className="line-point" title={`${row.label}: ${row.value}`}>
                      <span className="dot" />
                      <small>{row.label}</small>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedResource ? (
          <div className="resource-modal-backdrop" onClick={() => setSelectedResource(null)}>
            <div className="resource-modal" onClick={(e) => e.stopPropagation()}>
              <h3>📄 Resource Preview</h3>
              <div className="thumb-preview modal-thumb">
                {selectedResource.thumbnail || selectedResource.image ? (
                  <img src={selectedResource.thumbnail || selectedResource.image} alt={selectedResource.title} />
                ) : (
                  <div className="thumb-placeholder">📄</div>
                )}
              </div>
              <p><strong>Title:</strong> {selectedResource.title}</p>
              <p><strong>Category:</strong> {selectedResource.category}</p>
              <p><strong>Type:</strong> {selectedResource.type}</p>
              <p><strong>Description:</strong> {selectedResource.description || "No description available."}</p>
              <p><strong>Link:</strong> {selectedResource.url ? <a href={selectedResource.url} target="_blank" rel="noreferrer">{selectedResource.url}</a> : "N/A"}</p>
              <div className="actions">
                <button className="btn secondary" onClick={() => setSelectedResource(null)}>Close</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
