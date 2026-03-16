import React, { useState, useEffect } from "react";
import api from "../../../api";
import "./EcommercePages.css";

export default function EcommerceReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [showHideModal, setShowHideModal] = useState(null);
  const [hideReason, setHideReason] = useState("");

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filter, ratingFilter, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      if (ratingFilter !== "all") {
        params.rating = ratingFilter;
      }

      const response = await api.get("/reviews/admin/all", { params });
      setReviews(response.data.reviews || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/reviews/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  };

  const handleApprove = async (productId, reviewIndex) => {
    try {
      await api.put(`/reviews/admin/${productId}/${reviewIndex}/approve`);
      alert("Review approved successfully!");
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error("Error approving review:", error);
      alert(error.response?.data?.message || "Failed to approve review");
    }
  };

  const handleHide = async (productId, reviewIndex) => {
    if (!hideReason.trim()) {
      alert("Please provide a reason for hiding this review");
      return;
    }

    try {
      await api.put(`/reviews/admin/${productId}/${reviewIndex}/hide`, {
        reason: hideReason,
      });
      alert("Review hidden successfully!");
      setShowHideModal(null);
      setHideReason("");
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error("Error hiding review:", error);
      alert(error.response?.data?.message || "Failed to hide review");
    }
  };

  const handleDelete = async (productId, reviewIndex) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/reviews/admin/${productId}/${reviewIndex}`);
      alert("Review deleted successfully!");
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.product?.name?.toLowerCase().includes(searchLower) ||
        review.userId?.name?.toLowerCase().includes(searchLower) ||
        review.userId?.email?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (review) => {
    if (review.isHidden) {
      return { label: "Hidden", color: "#6b7280" };
    }
    if (!review.isApproved) {
      return { label: "Pending", color: "#f59e0b" };
    }
    return { label: "Approved", color: "#10b981" };
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star filled" : "star"}>
            ★
          </span>
        ))}
        <span className="rating-value">({rating})</span>
      </div>
    );
  };

  if (loading && reviews.length === 0 && !stats) {
    return <div className="ecommerce-page-loading">Loading reviews...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>Reviews & Ratings</h2>
          <p>Monitor and moderate product reviews and customer ratings</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="review-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Reviews</div>
            <div className="stat-value">{stats.stats.totalReviews}</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats.stats.approvedReviews}</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.stats.pendingReviews}</div>
          </div>
          <div className="stat-card hidden">
            <div className="stat-label">Hidden</div>
            <div className="stat-value">{stats.stats.hiddenReviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Rating</div>
            <div className="stat-value">{stats.stats.averageRating} ⭐</div>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.ratingDistribution && (
        <div className="rating-distribution">
          <h3>Rating Distribution</h3>
          <div className="distribution-bars">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const total = stats.stats.approvedReviews;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={rating} className="distribution-item">
                  <div className="distribution-label">
                    {rating} ⭐ ({count})
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by product, customer, or review text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Approval</option>
          <option value="hidden">Hidden</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      <div className="reviews-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  {loading ? "Loading reviews..." : "No reviews found"}
                </td>
              </tr>
            ) : (
              filteredReviews.map((review, index) => {
                const status = getStatusBadge(review);
                return (
                  <tr key={`${review.product?._id}-${index}`}>
                    <td>
                      <div className="product-info">
                        <img
                          src={review.product?.images?.[0]?.url || "/images/placeholder-product.jpg"}
                          alt={review.product?.name}
                          className="product-thumb"
                        />
                        <div>
                          <div className="product-name">{review.product?.name}</div>
                          <div className="product-rating">
                            Avg: {review.product?.rating?.average || 0} ⭐ (
                            {review.product?.rating?.count || 0} reviews)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">
                          {review.userId?.name || "Anonymous"}
                        </div>
                        <div className="customer-email">
                          {review.userId?.email || ""}
                        </div>
                      </div>
                    </td>
                    <td>{renderStars(review.rating)}</td>
                    <td>
                      <div className="review-comment">
                        {review.comment || <span className="text-muted">No comment</span>}
                        {review.moderationReason && (
                          <div className="moderation-reason">
                            <strong>Reason:</strong> {review.moderationReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-display">
                        {new Date(review.createdAt).toLocaleDateString()}
                        <span className="time">
                          {new Date(review.createdAt).toLocaleTimeString()}
                        </span>
                        {review.moderatedAt && (
                          <span className="moderated-date">
                            Moderated: {new Date(review.moderatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!review.isApproved && (
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(review.product._id, index)}
                            title="Approve review"
                          >
                            Approve
                          </button>
                        )}
                        {!review.isHidden && (
                          <button
                            className="btn-hide"
                            onClick={() => setShowHideModal({ productId: review.product._id, reviewIndex: index })}
                            title="Hide review"
                          >
                            Hide
                          </button>
                        )}
                        {review.isHidden && (
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(review.product._id, index)}
                            title="Show review"
                          >
                            Show
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(review.product._id, index)}
                          title="Delete review"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Hide Review Modal */}
      {showHideModal && (
        <div className="modal-overlay" onClick={() => setShowHideModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hide Review</h3>
              <button className="close-btn" onClick={() => setShowHideModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <label>Reason for hiding this review:</label>
              <textarea
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Enter reason (e.g., Inappropriate content, Spam, etc.)"
                rows="4"
                className="modal-textarea"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowHideModal(null)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={() => handleHide(showHideModal.productId, showHideModal.reviewIndex)}>
                Hide Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
