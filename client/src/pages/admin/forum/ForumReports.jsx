import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import "./ForumList.css";

const statusOptions = ["pending", "reviewed", "resolved", "dismissed", "all"];

export default function ForumReports() {
  const [filter, setFilter] = useState("pending");
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const statusParam = filter === "all" ? "" : `status=${filter}`;
      const res = await api.get(`/forum/reports?${statusParam}&page=${pagination.page}&limit=10`);
      setReports(res.data.reports || []);
      setPagination((p) => ({ ...p, pages: res.data.pagination?.pages || 1 }));
    } catch (error) {
      console.error("Error fetching reports:", error);
      setDialog({
        show: true,
        message: "Error loading reports",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pagination.page]);

  const handleResolve = async (reportId, status, action) => {
    try {
      await api.put(`/forum/reports/${reportId}/resolve`, { status, action });
      setDialog({
        show: true,
        message: "Report resolved successfully",
        type: "success",
      });
      fetchReports();
    } catch (error) {
      console.error("Error resolving report:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error resolving report",
        type: "error",
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      reviewed: "#2196f3",
      resolved: "#4caf50",
      dismissed: "#999",
    };
    return colors[status] || "#999";
  };

  const getReasonLabel = (reason) => {
    const labels = {
      spam: "Spam",
      harassment: "Harassment",
      "inappropriate-content": "Inappropriate Content",
      misinformation: "Misinformation",
      "off-topic": "Off Topic",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  return (
    <div className="forum-list-page">
      <div className="forum-list-header">
        <div>
          <h2>Reports & Moderation</h2>
          <p>Review and resolve reported posts and comments</p>
        </div>
        <div className="filters-panel compact">
          {statusOptions.map((s) => (
            <button
              key={s}
              className={`btn ${filter === s ? "primary" : ""}`}
              onClick={() => {
                setFilter(s);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading-cell padded">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="table-wrapper">
          <div className="empty-cell padded">No reports found</div>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <div className="report-info">
                  <span
                    className="report-status"
                    style={{ backgroundColor: getStatusColor(report.status) }}
                  >
                    {report.status}
                  </span>
                  <span className="report-reason">{getReasonLabel(report.reason)}</span>
                  <span className="report-date">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="report-actions">
                  {report.post && (
                    <Link
                      to={`/forum/posts/${report.post._id || report.post}`}
                      className="view-post-btn"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Post
                    </Link>
                  )}
                  {report.comment && <span className="comment-report">Comment Report</span>}
                </div>
              </div>

              {report.post && (
                <div className="reported-content">
                  <h4>Reported Post:</h4>
                  <p>{report.post.title || "Post title"}</p>
                </div>
              )}

              {report.comment && (
                <div className="reported-content">
                  <h4>Reported Comment:</h4>
                  <p>{report.comment.content || "Comment content"}</p>
                </div>
              )}

              {report.description && (
                <div className="report-description">
                  <strong>Description:</strong> {report.description}
                </div>
              )}

              <div className="report-footer">
                <div className="reported-by">
                  Reported by: {report.reportedBy?.name || "Unknown"}
                </div>
                {report.status === "pending" && (
                  <div className="report-actions-buttons">
                    <button
                      className="btn-resolve"
                      onClick={() => handleResolve(report._id, "resolved", null)}
                    >
                      Resolve
                    </button>
                    <button
                      className="btn-dismiss"
                      onClick={() => handleResolve(report._id, "dismissed", null)}
                    >
                      Dismiss
                    </button>
                    {report.post && (
                      <>
                        <button
                          className="btn-delete"
                          onClick={() => handleResolve(report._id, "resolved", "delete")}
                        >
                          Delete Post
                        </button>
                        <button
                          className="btn-pin"
                          onClick={async () => {
                            await api.post(`/forum/posts/${report.post._id || report.post}/pin`);
                            fetchReports();
                          }}
                        >
                          Pin Post
                        </button>
                        <button
                          className="btn-lock"
                          onClick={async () => {
                            await api.post(`/forum/posts/${report.post._id || report.post}/lock`);
                            fetchReports();
                          }}
                        >
                          Lock Thread
                        </button>
                      </>
                    )}
                    {report.comment && (
                      <button
                        className="btn-delete"
                        onClick={() => handleResolve(report._id, "resolved", "delete")}
                      >
                        Delete Comment
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page === 1}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="pagination-btn"
            onClick={() =>
              setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))
            }
            disabled={pagination.page === pagination.pages}
          >
            Next →
          </button>
        </div>
      )}

      {dialog.show && (
        <div className={`toast ${dialog.type}`}>
          <span>{dialog.message}</span>
          <button onClick={() => setDialog({ ...dialog, show: false })}>✕</button>
        </div>
      )}
    </div>
  );
}
