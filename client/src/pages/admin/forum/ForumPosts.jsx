import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import "./ForumList.css";

const defaultFilters = {
  search: "",
  category: "",
  author: "",
  isPinned: "",
  isLocked: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

const categoryLabels = {
  "period-cycle-health": "Period & Cycle Health",
  "pregnancy-conception": "Pregnancy & Conception",
  "perimenopause-menopause": "Perimenopause & Menopause",
  "mental-health-wellness": "Mental Health & Wellness",
  "general-health-questions": "General Health Questions",
  "product-reviews-recommendations": "Product Reviews",
  "anonymous-support": "Anonymous Support",
};

export default function ForumPosts() {
  const [filters, setFilters] = useState(defaultFilters);
  const [data, setData] = useState({ posts: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      const res = await api.get(`/forum/admin/posts?${params.toString()}`);
      setData(res.data);
      setSelected(new Set());
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.sortBy, filters.sortOrder]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchPosts();
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
    () => data.posts.length > 0 && data.posts.every((p) => selected.has(p._id)),
    [data.posts, selected]
  );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.posts.map((p) => p._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm("Delete selected posts? This will remove their comments and reports.")) return;
    try {
      setBusy(true);
      await api.post("/forum/admin/posts/bulk-delete", { postIds: Array.from(selected) });
      fetchPosts();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert(error.response?.data?.message || "Failed to delete posts");
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      setBusy(true);
      await api.post(`/forum/posts/${id}/pin`);
      fetchPosts();
    } catch (error) {
      console.error("Pin error:", error);
      alert("Failed to toggle pin");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLock = async (id) => {
    try {
      setBusy(true);
      await api.post(`/forum/posts/${id}/lock`);
      fetchPosts();
    } catch (error) {
      console.error("Lock error:", error);
      alert("Failed to toggle lock");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Delete this post? This will remove comments and reports.")) return;
    try {
      setBusy(true);
      await api.delete(`/forum/posts/${id}`);
      fetchPosts();
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
          <h2>Posts Management</h2>
          <p>View, filter, pin/lock, and delete forum posts</p>
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
          placeholder="Search title or content"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Author ID"
          value={filters.author}
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
        />
        <select
          value={filters.isPinned}
          onChange={(e) => setFilters({ ...filters, isPinned: e.target.value })}
        >
          <option value="">Pinned?</option>
          <option value="true">Pinned</option>
          <option value="false">Not pinned</option>
        </select>
        <select
          value={filters.isLocked}
          onChange={(e) => setFilters({ ...filters, isLocked: e.target.value })}
        >
          <option value="">Locked?</option>
          <option value="true">Locked</option>
          <option value="false">Unlocked</option>
        </select>
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
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Comments</th>
              <th>Reports</th>
              <th>Votes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="loading-cell">
                  Loading...
                </td>
              </tr>
            ) : data.posts.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-cell">
                  No posts found
                </td>
              </tr>
            ) : (
              data.posts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(post._id)}
                      onChange={() => toggleSelect(post._id)}
                    />
                  </td>
                  <td className="title-cell">
                    <Link to={`/forum/posts/${post._id}`} target="_blank" rel="noreferrer">
                      {post.title}
                    </Link>
                    <div className="meta">
                      {new Date(post.createdAt).toLocaleDateString()} • ID: {post._id}
                    </div>
                  </td>
                  <td>{post.author?.name || "Unknown"}</td>
                  <td>{categoryLabels[post.category] || post.category}</td>
                  <td>{post.commentCount || 0}</td>
                  <td>{post.reportCount || 0}</td>
                  <td>
                    <span className="badge neutral">
                      ↑ {post.upvoteCount || 0} / ↓ {post.downvoteCount || 0}
                    </span>
                  </td>
                  <td>
                    {post.isPinned && <span className="badge success">Pinned</span>}
                    {post.isLocked && <span className="badge warning">Locked</span>}
                  </td>
                  <td className="actions-cell">
                    <button className="btn tiny" onClick={() => handleTogglePin(post._id)}>
                      {post.isPinned ? "Unpin" : "Pin"}
                    </button>
                    <button className="btn tiny" onClick={() => handleToggleLock(post._id)}>
                      {post.isLocked ? "Unlock" : "Lock"}
                    </button>
                    <button className="btn tiny danger" onClick={() => handleDeleteSingle(post._id)}>
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
