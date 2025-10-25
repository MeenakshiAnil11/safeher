import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api"; // your axios instance
import "./AdminFeedback.css";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");
  const [search, setSearch] = useState("");
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get("/feedback");
      const data = Array.isArray(res.data) ? res.data : res.data.feedbacks || [];
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    const filtered = feedbacks.filter((fb) =>
      !search ||
      fb._id?.toLowerCase().includes(search.toLowerCase()) ||
      (fb.userId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (fb.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (fb.message || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFeedbacks(filtered);
  }, [feedbacks, search]);

  const handleRespond = async (id) => {
    if (!response.trim()) return alert("Enter a response first");
    try {
      await api.put(`/feedback/${id}/reply`, {
        adminReply: response,
        status: "Reviewed",
      });
      setResponse("");
      setSelected(null);
      fetchFeedback();
      alert("Responded successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to respond");
    }
  };

  const handleEscalate = async (id) => {
    if (!window.confirm("Escalate this feedback?")) return;
    try {
      await api.patch(`/admin/feedback/${id}/escalate`);
      fetchFeedback();
      alert("Feedback escalated");
    } catch (err) {
      console.error(err);
      alert("Failed to escalate");
    }
  };

  const getCategoryDisplay = (category) => {
    switch (category) {
      case "Bug":
        return "Bug Report";
      case "Suggestion":
        return "Feature Request";
      default:
        return category || "Other";
    }
  };

  const getStars = (rating) => {
    const stars = "★".repeat(rating || 0) + "☆".repeat(5 - (rating || 0));
    return <span className="stars">{stars}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout pageTitle="Feedback">
      <div className="admin-feedback-container">
        <h1>Feedback</h1>
        <div className="search-section">
          <input
            type="text"
            className="search-bar"
            placeholder="Search ID, User, Subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : filteredFeedbacks.length === 0 ? (
          <p>No feedback available.</p>
        ) : (
          <div className="feedback-table-container">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Message</th>
                  <th>Rating</th>
                  <th>Screenshot</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((fb) => (
                  <tr key={fb._id}>
                    <td>{fb._id?.slice(-6)}</td>
                    <td>{fb.userId?.name || "Unknown User"}</td>
                    <td>{fb.subject || "N/A"}</td>
                    <td>{getCategoryDisplay(fb.category)}</td>
                    <td>
                      {fb.message && fb.message.length > 50
                        ? fb.message.slice(0, 50) + "..."
                        : fb.message || "N/A"}
                    </td>
                    <td>{getStars(fb.rating)}</td>
                    <td>
                      {fb.screenshotUrl ? (
                        <img
                          src={fb.screenshotUrl}
                          alt="Screenshot"
                          className="screenshot-thumb"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{formatDate(fb.createdAt)}</td>
                    <td>
                      {selected === fb._id ? (
                        <div className="action-form">
                          <textarea
                            placeholder="Type your response..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows="3"
                          />
                          <button onClick={() => handleRespond(fb._id)}>Send</button>
                          <button
                            className="cancel-btn"
                            onClick={() => setSelected(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          {fb.status !== "Escalated" && (
                            <>
                              <button onClick={() => setSelected(fb._id)}>
                                Respond
                              </button>
                              <button onClick={() => handleEscalate(fb._id)}>
                                Escalate
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
