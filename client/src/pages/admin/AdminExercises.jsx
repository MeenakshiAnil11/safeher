import React, { useState, useEffect } from "react";
import axios from "axios";
import "./admin.css";

export default function AdminExercises() {
  const [activeTab, setActiveTab] = useState("exerciseManagement");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phase: "",
    category: "",
    difficulty: "",
    approved: false,
    videoLink: "",
  });

  // User Logs state
  const [userLogs, setUserLogs] = useState([]);
  const [userLogsLoading, setUserLogsLoading] = useState(false);
  const [userLogsSearch, setUserLogsSearch] = useState("");
  const [userLogsFromDate, setUserLogsFromDate] = useState("");
  const [userLogsToDate, setUserLogsToDate] = useState("");

  // Analytics state
  const [analytics, setAnalytics] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  // Challenges state
  const [challenges, setChallenges] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeFormData, setChallengeFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    targetParticipants: 0,
    reward: "",
    active: true,
  });

  useEffect(() => {
    if (activeTab === "exerciseManagement") {
      fetchExercises();
    } else if (activeTab === "userLogs") {
      fetchUserLogs();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    } else if (activeTab === "reminders") {
      fetchReminders();
    } else if (activeTab === "challenges") {
      fetchChallenges();
    }
  }, [activeTab, page, searchQuery, userLogsSearch, userLogsFromDate, userLogsToDate]);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };
      if (searchQuery) params.q = searchQuery;
      const res = await axios.get("/api/admin/exercises", { params });
      setExercises(res.data.exercises);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to fetch exercises");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name || "",
      phase: exercise.phase || "",
      category: exercise.category || "",
      difficulty: exercise.difficulty || "",
      approved: exercise.approved || false,
      videoLink: exercise.videoLink || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
    setFormData({
      name: "",
      phase: "",
      category: "",
      difficulty: "",
      approved: false,
      videoLink: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExercise) {
        await axios.patch(`/api/admin/exercises/${editingExercise._id}`, formData);
      } else {
        await axios.post("/api/admin/exercises", formData);
      }
      fetchExercises();
      handleCancelEdit();
    } catch (err) {
      setError("Failed to save exercise");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) return;
    try {
      await axios.delete(`/api/admin/exercises/${id}`);
      fetchExercises();
    } catch (err) {
      setError("Failed to delete exercise");
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/api/admin/exercises/${id}/approve`);
      fetchExercises();
    } catch (err) {
      setError("Failed to approve exercise");
    }
  };

  // User Logs functions
  const fetchUserLogs = async () => {
    setUserLogsLoading(true);
    try {
      const params = { page, limit };
      if (userLogsSearch) params.q = userLogsSearch;
      if (userLogsFromDate) params.fromDate = userLogsFromDate;
      if (userLogsToDate) params.toDate = userLogsToDate;
      const res = await axios.get("/api/admin/exercise-logs", { params });
      setUserLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to fetch user logs:", err);
      setUserLogs([]);
    } finally {
      setUserLogsLoading(false);
    }
  };

  // Analytics functions
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get("/api/admin/exercise-analytics");
      setAnalytics(res.data || {});
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setAnalytics({});
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Reminders functions
  const fetchReminders = async () => {
    setRemindersLoading(true);
    try {
      const res = await axios.get("/api/admin/exercise-reminders");
      setReminders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
      setReminders([]);
    } finally {
      setRemindersLoading(false);
    }
  };

  // Challenges functions
  const fetchChallenges = async () => {
    setChallengesLoading(true);
    try {
      const res = await axios.get("/api/admin/exercise-challenges");
      setChallenges(res.data || []);
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
      setChallenges([]);
    } finally {
      setChallengesLoading(false);
    }
  };

  const handleChallengeInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChallengeFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setChallengeFormData({
      title: challenge.title || "",
      description: challenge.description || "",
      startDate: challenge.startDate ? challenge.startDate.split('T')[0] : "",
      endDate: challenge.endDate ? challenge.endDate.split('T')[0] : "",
      targetParticipants: challenge.targetParticipants || 0,
      reward: challenge.reward || "",
      active: challenge.active || true,
    });
  };

  const handleCancelChallengeEdit = () => {
    setEditingChallenge(null);
    setChallengeFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      targetParticipants: 0,
      reward: "",
      active: true,
    });
  };

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChallenge) {
        await axios.patch(`/api/admin/exercise-challenges/${editingChallenge._id}`, challengeFormData);
      } else {
        await axios.post("/api/admin/exercise-challenges", challengeFormData);
      }
      fetchChallenges();
      handleCancelChallengeEdit();
    } catch (err) {
      setError("Failed to save challenge");
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await axios.delete(`/api/admin/exercise-challenges/${id}`);
      fetchChallenges();
    } catch (err) {
      setError("Failed to delete challenge");
    }
  };

  return (
    <div className="admin-exercises">
      <div className="sub-tabs" style={{ marginBottom: "15px" }}>
        <button
          className={activeTab === "exerciseManagement" ? "active" : ""}
          onClick={() => setActiveTab("exerciseManagement")}
        >
          Exercise Management
        </button>
        <button
          className={activeTab === "userLogs" ? "active" : ""}
          onClick={() => setActiveTab("userLogs")}
        >
          User Logs
        </button>
        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={activeTab === "reminders" ? "active" : ""}
          onClick={() => setActiveTab("reminders")}
        >
          Reminders
        </button>
        <button
          className={activeTab === "challenges" ? "active" : ""}
          onClick={() => setActiveTab("challenges")}
        >
          Challenges / Community
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "exerciseManagement" && (
          <div>
            <h3>Exercise Management</h3>
            <div>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phase</th>
                      <th>Category</th>
                      <th>Difficulty</th>
                      <th>Approved</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.map((ex) => (
                      <tr key={ex._id}>
                        <td>{ex.name}</td>
                        <td>{ex.phase}</td>
                        <td>{ex.category}</td>
                        <td>{ex.difficulty}</td>
                        <td>{ex.approved ? "Yes" : "No"}</td>
                        <td>
                          <button onClick={() => handleEdit(ex)}>Edit</button>{" "}
                          <button onClick={() => handleDelete(ex._id)}>Delete</button>{" "}
                          {!ex.approved && (
                            <button onClick={() => handleApprove(ex._id)}>Approve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <span style={{ margin: "0 10px" }}>
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
                    disabled={page * limit >= total}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            <hr />

            <h4>{editingExercise ? "Edit Exercise" : "Add New Exercise"}</h4>
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Phase:
                <input
                  type="text"
                  name="phase"
                  value={formData.phase}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Category:
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Difficulty:
                <input
                  type="text"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                YouTube Video Link:
                <input
                  type="url"
                  name="videoLink"
                  value={formData.videoLink}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              <label>
                Approved:
                <input
                  type="checkbox"
                  name="approved"
                  checked={formData.approved}
                  onChange={handleInputChange}
                />
              </label>
              <div>
                <button type="submit">{editingExercise ? "Update" : "Create"}</button>
                {editingExercise && (
                  <button type="button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {activeTab === "userLogs" && (
          <div>
            <h3>User Logs</h3>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Search by user or exercise..."
                value={userLogsSearch}
                onChange={(e) => setUserLogsSearch(e.target.value)}
                style={{ marginRight: "10px" }}
              />
              <label>
                From:{" "}
                <input
                  type="date"
                  value={userLogsFromDate}
                  onChange={(e) => setUserLogsFromDate(e.target.value)}
                />
              </label>
              <label style={{ marginLeft: "10px" }}>
                To:{" "}
                <input
                  type="date"
                  value={userLogsToDate}
                  onChange={(e) => setUserLogsToDate(e.target.value)}
                />
              </label>
              <button onClick={fetchUserLogs} style={{ marginLeft: "10px" }}>
                Search
              </button>
            </div>
            {userLogsLoading ? (
              <p>Loading user logs...</p>
            ) : userLogs.length === 0 ? (
              <p>No user logs found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Exercise</th>
                    <th>Date</th>
                    <th>Phase</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {userLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{log.user?.name || "Unknown"}</td>
                      <td>{log.exercise?.name || "Unknown"}</td>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.phase}</td>
                      <td>{log.category}</td>
                      <td>{log.completionStatus}</td>
                      <td>{log.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === "analytics" && (
          <div>
            <h3>Analytics</h3>
            {analyticsLoading ? (
              <p>Loading analytics...</p>
            ) : (
              <div>
                <p>Total Exercises Completed: {analytics.totalCompleted || 0}</p>
                <p>Average Completion Rate: {analytics.avgCompletionRate ? (analytics.avgCompletionRate * 100).toFixed(2) + "%" : "N/A"}</p>
                <p>Most Popular Exercise: {analytics.mostPopularExercise || "N/A"}</p>
                <p>Active Users: {analytics.activeUsers || 0}</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "reminders" && (
          <div>
            <h3>Reminders</h3>
            {remindersLoading ? (
              <p>Loading reminders...</p>
            ) : reminders.length === 0 ? (
              <p>No reminders found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Time</th>
                    <th>Days</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder) => (
                    <tr key={reminder._id}>
                      <td>{reminder.title}</td>
                      <td>{reminder.time}</td>
                      <td>{reminder.days.join(", ")}</td>
                      <td>{reminder.active ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === "challenges" && (
          <div>
            <h3>Challenges / Community</h3>
            {challengesLoading ? (
              <p>Loading challenges...</p>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Target Participants</th>
                      <th>Reward</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((challenge) => (
                      <tr key={challenge._id}>
                        <td>{challenge.title}</td>
                        <td>{challenge.description}</td>
                        <td>{challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : "-"}</td>
                        <td>{challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : "-"}</td>
                        <td>{challenge.targetParticipants}</td>
                        <td>{challenge.reward}</td>
                        <td>{challenge.active ? "Yes" : "No"}</td>
                        <td>
                          <button onClick={() => handleEditChallenge(challenge)}>Edit</button>{" "}
                          <button onClick={() => handleDeleteChallenge(challenge._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <hr />
                <h4>{editingChallenge ? "Edit Challenge" : "Add New Challenge"}</h4>
                <form onSubmit={handleChallengeSubmit} className="admin-form">
                  <label>
                    Title:
                    <input
                      type="text"
                      name="title"
                      value={challengeFormData.title}
                      onChange={handleChallengeInputChange}
                      required
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={challengeFormData.description}
                      onChange={handleChallengeInputChange}
                      required
                    />
                  </label>
                  <label>
                    Start Date:
                    <input
                      type="date"
                      name="startDate"
                      value={challengeFormData.startDate}
                      onChange={handleChallengeInputChange}
                      required
                    />
                  </label>
                  <label>
                    End Date:
                    <input
                      type="date"
                      name="endDate"
                      value={challengeFormData.endDate}
                      onChange={handleChallengeInputChange}
                      required
                    />
                  </label>
                  <label>
                    Target Participants:
                    <input
                      type="number"
                      name="targetParticipants"
                      value={challengeFormData.targetParticipants}
                      onChange={handleChallengeInputChange}
                      min="0"
                      required
                    />
                  </label>
                  <label>
                    Reward:
                    <input
                      type="text"
                      name="reward"
                      value={challengeFormData.reward}
                      onChange={handleChallengeInputChange}
                    />
                  </label>
                  <label>
                    Active:
                    <input
                      type="checkbox"
                      name="active"
                      checked={challengeFormData.active}
                      onChange={handleChallengeInputChange}
                    />
                  </label>
                  <div>
                    <button type="submit">{editingChallenge ? "Update" : "Create"}</button>
                    {editingChallenge && (
                      <button type="button" onClick={handleCancelChallengeEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
