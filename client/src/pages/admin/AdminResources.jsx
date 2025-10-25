import React, { useEffect, useState } from "react";
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
      loadResources(); // Refresh the list
    } catch (err) {
      console.error("Failed to approve resource:", err);
      alert("Failed to approve resource. Please try again.");
    }
  };

  const handleRejectResource = async (resourceId) => {
    try {
      await api.patch(`/admin/resources/${resourceId}`, { approved: false });
      loadResources(); // Refresh the list
    } catch (err) {
      console.error("Failed to reject resource:", err);
      alert("Failed to reject resource. Please try again.");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/admin/resources/${resourceId}`);
      loadResources(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete resource:", err);
      alert("Failed to delete resource. Please try again.");
    }
  };

  const handleTogglePublish = async (eventId) => {
    try {
      await api.patch(`/admin/events/${eventId}/toggle-publish`);
      loadEvents(); // Refresh the list
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
      alert("Failed to toggle publish status. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/admin/events/${eventId}`);
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
      loadResources();
    } catch (err) { setSubmitError("Failed to submit resource. Please try again."); }
  };

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
    <AdminLayout pageTitle="Manage Resources & Content">
      <div className="admin-resources">
        {/* Main Tabs */}
        <div className="tabs">
          <button className={activeTab === "submit" ? "active" : ""} onClick={() => setActiveTab("submit")}>Submit Resource</button>
          <button className={activeTab === "resources" ? "active" : ""} onClick={() => setActiveTab("resources")}>Resources Management</button>
          <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>Events & Webinars</button>
          <button className={activeTab === "quizzes" ? "active" : ""} onClick={() => setActiveTab("quizzes")}>Quiz & Assessment</button>
          <button className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>Analytics</button>
        </div>

        {/* Submit Resource Form */}
        {activeTab === "submit" && (
          <div className="submit-resource-form">
            <h3>Submit a New Resource</h3>
            <form onSubmit={handleSubmitResource}>
              <label>
                Title<span className="required">*</span>
                <input type="text" value={submitForm.title} onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })} required />
              </label>

              <label>
                Category<span className="required">*</span>
                <select value={submitForm.category} onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label>
                Type<span className="required">*</span>
                <select value={submitForm.type} onChange={e => setSubmitForm({ ...submitForm, type: e.target.value })} required>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <label>
                Description<span className="required">*</span>
                <textarea value={submitForm.description} onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })} required />
              </label>

              <label>
                Resource URL{submitForm.type !== "PDF" || !submitFile ? <span className="required">*</span> : ""}
                <input type="url" value={submitForm.url} onChange={e => setSubmitForm({ ...submitForm, url: e.target.value })} required={submitForm.type !== "PDF" || !submitFile} />
              </label>

              {submitForm.type === "PDF" && (
                <label>
                  Or Upload PDF
                  <input type="file" accept="application/pdf" onChange={handleSubmitFileChange} />
                  {submitFile && <span className="file-name">{submitFile.name}</span>}
                </label>
              )}

              {submitError && <div className="error">{submitError}</div>}
              {submitSuccess && <div className="success">{submitSuccess}</div>}

              <button type="submit" className="btn primary">Submit Resource</button>
            </form>
          </div>
        )}

        {/* Resources Management */}
        {activeTab === "resources" && (
          <div className="resources-management">
            <h3>Resources Management</h3>
            <div className="filters">
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
            </div>
            {loading ? <p>Loading...</p> : (
              <div className="resources-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(resource => (
                      <tr key={resource._id}>
                        <td>{resource.title}</td>
                        <td>{resource.category}</td>
                        <td>{resource.type}</td>
                        <td>{resource.approved ? 'Approved' : 'Pending'}</td>
                        <td className="actions">
                          <button className="approve" onClick={() => handleApproveResource(resource._id)}>Approve</button>
                          <button className="reject" onClick={() => handleRejectResource(resource._id)}>Reject</button>
                          <button className="delete" onClick={() => handleDeleteResource(resource._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                <h3>Manage Events & Webinars</h3>
                <div className="filters">
                  <input type="text" placeholder="Search events..." value={eventFilters.q} onChange={e => setEventFilters({ ...eventFilters, q: e.target.value })} />
                  <select value={eventFilters.published} onChange={e => setEventFilters({ ...eventFilters, published: e.target.value })}>
                    <option value="">All Status</option>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
                {loading ? <p>Loading...</p> : (
                  <div className="events-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(event => (
                          <tr key={event._id}>
                            <td>{event.title}</td>
                            <td>{event.type}</td>
                            <td>{new Date(event.date).toLocaleDateString()}</td>
                            <td>{event.published ? 'Published' : 'Draft'}</td>
                            <td className="actions">
                              <button className="edit">Edit</button>
                              <button className={event.published ? "unpublish" : "publish"} onClick={() => handleTogglePublish(event._id)}>
                                {event.published ? "Unpublish" : "Publish"}
                              </button>
                              <button className="delete" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
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
                <form onSubmit={handleSubmitQuiz}>
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

                  {/* Questions Section */}
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
                  </div>

                  {/* Educational Links Section */}
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
                  </div>

                  {submitQuizError && <div className="error">{submitQuizError}</div>}
                  {submitQuizSuccess && <div className="success">{submitQuizSuccess}</div>}

                  <button type="submit" className="btn primary">Create Quiz/Assessment</button>
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
            <h3>Resources Analytics</h3>
            {analytics ? (
              <div className="stats-grid">
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
              </div>
            ) : (
              <p>Loading analytics...</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
