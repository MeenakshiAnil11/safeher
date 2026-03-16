import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import "./ForumList.css";

const defaultFilters = {
  search: "",
  post: "",
  author: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

export default function ForumComments() {
  const [filters, setFilters] = useState(defaultFilters);
  const [data, setData] = useState({ comments: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      const res = await api.get(`/forum/admin/comments?${params.toString()}`);
      setData(res.data);
      setSelected(new Set());
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.sortBy, filters.sortOrder]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchComments();
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = useMemo(
    () => data.comments.length > 0 && data.comments.every((c) => selected.has(c._id)),
    [data.comments, selected]
  );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.comments.map((c) => c._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm("Delete selected comments? This will remove their replies and reports.")) return;
    try {
      setBusy(true);
      await api.post("/forum/admin/comments/bulk-delete", { commentIds: Array.from(selected) });
      fetchComments();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert(error.response?.data?.message || "Failed to delete comments");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setBusy(true);
      await api.delete(`/forum/comments/${id}`);
      fetchComments();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="forum-list-page">
      <div className="forum-list-header">
        <div>
          <h2>Comments Management</h2>
          <p>View, filter, and delete comments</p>
        </div>
        <div className="actions-row">
          <button
            className="btn danger"
            onClick={handleBulkDelete}
            disabled={busy || selected.size === 0}
          >
            Delete Selected ({selected.size})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <input
          type="text"
          placeholder="Search comment"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="text"
          placeholder="Post ID"
          value={filters.post}
          onChange={(e) => setFilters({ ...filters, post: e.target.value })}
        />
        <input
          type="text"
          placeholder="Author ID"
          value={filters.author}
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
        />
        <button className="btn" onClick={handleApplyFilters} disabled={loading}>
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="forum-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
              </th>
              <th>Comment</th>
              <th>Author</th>
              <th>Post</th>
              <th>Replies</th>
              <th>Reports</th>
              <th>Votes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-cell">
                  Loading...
                </td>
              </tr>
            ) : data.comments.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No comments found
                </td>
              </tr>
            ) : (
              data.comments.map((comment) => (
                <tr key={comment._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(comment._id)}
                      onChange={() => toggleSelect(comment._id)}
                    />
                  </td>
                  <td className="title-cell">
                    <div className="comment-content">{comment.content}</div>
                    <div className="meta">
                      {new Date(comment.createdAt).toLocaleDateString()} • ID: {comment._id}
                    </div>
                  </td>
                  <td>{comment.author?.name || "Unknown"}</td>
                  <td>
                    {comment.post ? (
                      <Link to={`/forum/posts/${comment.post?._id || comment.post}`} target="_blank" rel="noreferrer">
                        {comment.post?.title || "View Post"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{comment.replyCount || 0}</td>
                  <td>{comment.reportCount || 0}</td>
                  <td>
                    <span className="badge neutral">
                      ↑ {comment.upvoteCount || 0} / ↓ {comment.downvoteCount || 0}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn tiny danger" onClick={() => handleDeleteSingle(comment._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={filters.page === 1}
            onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
          >
            ← Prev
          </button>
          <span className="pagination-info">
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <button
            className="pagination-btn"
            disabled={filters.page === data.pagination.pages}
            onClick={() =>
              setFilters((p) => ({ ...p, page: Math.min(data.pagination.pages, p.page + 1) }))
            }
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
