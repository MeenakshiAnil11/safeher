import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import "./ForumList.css";

export default function ForumUserActivity() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchActivity = async () => {
    if (!userId.trim()) {
      alert("Enter a user ID");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/forum/admin/users/${userId}/activity`);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      alert(error.response?.data?.message || "Failed to load user activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-list-page">
      <div className="forum-list-header">
        <div>
          <h2>User Activity</h2>
          <p>View recent posts, comments, and reports for a user</p>
        </div>
        <div className="filters-panel compact">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button className="btn" onClick={fetchActivity} disabled={loading}>
            {loading ? "Loading..." : "Fetch Activity"}
          </button>
        </div>
      </div>

      {!data ? (
        <div className="table-wrapper">
          <div className="empty-cell padded">Enter a User ID to view activity.</div>
        </div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-pill">
              Posts: <strong>{data.stats?.postCount || 0}</strong>
            </div>
            <div className="stat-pill">
              Comments: <strong>{data.stats?.commentCount || 0}</strong>
            </div>
            <div className="stat-pill warning">
              Reports against user: <strong>{data.stats?.reportsAgainstUser || 0}</strong>
            </div>
          </div>

          <div className="split-panels">
            <div className="panel">
              <h3>Recent Posts</h3>
              {data.recentPosts?.length ? (
                <ul className="list">
                  {data.recentPosts.map((p) => (
                    <li key={p._id}>
                      <Link to={`/forum/posts/${p._id}`} target="_blank" rel="noreferrer">
                        {p.title}
                      </Link>
                      <div className="meta">
                        {new Date(p.createdAt).toLocaleDateString()} • ID: {p._id}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-cell">No recent posts</p>
              )}
            </div>

            <div className="panel">
              <h3>Recent Comments</h3>
              {data.recentComments?.length ? (
                <ul className="list">
                  {data.recentComments.map((c) => (
                    <li key={c._id}>
                      <div className="comment-content">{c.content}</div>
                      <div className="meta">
                        {new Date(c.createdAt).toLocaleDateString()} • Post:{" "}
                        <Link
                          to={`/forum/posts/${c.post?._id || c.post}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {c.post?.title || c.post}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-cell">No recent comments</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
