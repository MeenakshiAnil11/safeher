import React, { useEffect, useState } from "react";
import api from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ subject: "", message: "", rating: 5 });
  const [replying, setReplying] = useState(null);
  const [replyData, setReplyData] = useState({ adminReply: "", status: "Reviewed" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = window.location.pathname.startsWith("/admin");

  // Fetch feedbacks from API
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Filter feedbacks whenever filters or search change
  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, categoryFilter, statusFilter, search]);

  const fetchFeedbacks = async () => {
    try {
      const endpoint = isAdmin ? "/feedback" : "/feedback/my";
      const res = await api.get(endpoint);
      const data = isAdmin ? res.data.feedback : res.data;

      // Ensure we always have an array
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
    }
  };

  const filterFeedbacks = () => {
    let filtered = Array.isArray(feedbacks) ? feedbacks : [];
    if (categoryFilter) filtered = filtered.filter(fb => fb.category === categoryFilter);
    if (statusFilter) filtered = filtered.filter(fb => fb.status === statusFilter);
    if (search) {
      filtered = filtered.filter(fb =>
        fb.subject?.toLowerCase().includes(search.toLowerCase()) ||
        fb.message?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredFeedbacks(filtered);
  };

  const handleEdit = (fb) => {
    setEditing(fb._id);
    setEditData({ subject: fb.subject, message: fb.message, rating: fb.rating });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/feedback/${editing}`, editData);
      setEditing(null);
      fetchFeedbacks();
    } catch {
      alert("Error updating feedback");
    }
  };

  const handleUpvote = async (id) => {
    try {
      await api.post(`/feedback/${id}/upvote`);
      fetchFeedbacks();
    } catch {
      alert("Error upvoting");
    }
  };

  const handleReply = (fb) => {
    setReplying(fb._id);
    setReplyData({ adminReply: fb.adminReply || "", status: fb.status });
  };

  const saveReply = async () => {
    try {
      await api.put(`/feedback/${replying}/reply`, replyData);
      setReplying(null);
      fetchFeedbacks();
    } catch {
      alert("Error saving reply");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/feedback/${deletingId}`);
      setShowConfirm(false);
      setDeletingId(null);
      fetchFeedbacks();
    } catch {
      alert("Error deleting feedback");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      New: "#007bff",
      "In Progress": "#ffc107",
      Reviewed: "#17a2b8",
      Resolved: "#28a745",
      Escalated: "#dc3545"
    };
    return { backgroundColor: colors[status] || "#6c757d", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" };
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>{isAdmin ? "All Feedback" : "My Feedback"}</h2>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by subject or message"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: "8px", marginRight: "10px" }}>
          <option value="">All Categories</option>
          <option value="Bug">Bug</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Other">Other</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "8px" }}>
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Resolved">Resolved</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      {/* Feedback List */}
      {filteredFeedbacks.map(fb => (
        <div key={fb._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}>
          {editing === fb._id ? (
            <div>
              <input
                type="text"
                value={editData.subject}
                onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />
              <textarea
                value={editData.message}
                onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                rows="3"
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />
              <input
                type="number"
                min="1"
                max="5"
                value={editData.rating}
                onChange={(e) => setEditData({ ...editData, rating: Number(e.target.value) })}
                style={{ padding: "8px", marginRight: "10px" }}
              />
              <button onClick={saveEdit} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", marginRight: "10px" }}>Save</button>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>Cancel</button>
            </div>
          ) : replying === fb._id ? (
            <div>
              <textarea
                value={replyData.adminReply}
                onChange={(e) => setReplyData({ ...replyData, adminReply: e.target.value })}
                rows="3"
                placeholder="Enter admin reply"
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />
              <select
                value={replyData.status}
                onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                style={{ padding: "8px", marginRight: "10px" }}
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
              <button onClick={saveReply} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", marginRight: "10px" }}>Save Reply</button>
              <button onClick={() => setReplying(null)} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>Cancel</button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3>{fb.subject}</h3>
                <div>
                  <span style={getStatusBadge(fb.status)}>{fb.status}</span>
                  {fb.category === "Suggestion" && !isAdmin && (
                    <button onClick={() => handleUpvote(fb._id)} style={{ marginLeft: "10px", padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
                      👍 {fb.upvotes?.length || 0}
                    </button>
                  )}
                </div>
              </div>
              <p><b>Category:</b> {fb.category}</p>
              <p>{fb.message}</p>
              <p><b>Rating:</b> {fb.rating}/5</p>
              {fb.screenshotUrl && <img src={fb.screenshotUrl} alt="screenshot" style={{ maxWidth: "200px", marginTop: "10px" }} />}
              {fb.adminReply && (
                <div style={{ backgroundColor: "#f8f9fa", padding: "10px", marginTop: "10px", borderRadius: "4px" }}>
                  <b>Admin Reply:</b> {fb.adminReply}
                </div>
              )}
              <div style={{ marginTop: "10px" }}>
                {isAdmin ? (
                  <button onClick={() => handleReply(fb)} style={{ padding: "8px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}>
                    Reply
                  </button>
                ) : (
                  fb.status !== "Resolved" && fb.status !== "Escalated" && (
                    <div>
                      <button onClick={() => handleEdit(fb)} style={{ padding: "8px 16px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px", marginRight: "10px" }}>
                        Edit
                      </button>
                      <button onClick={() => confirmDelete(fb._id)} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>
                        Delete
                      </button>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      ))}
      <ConfirmDialog
        open={showConfirm}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
