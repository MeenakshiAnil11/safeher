import React, { useState, useEffect } from "react";
import api from "../../../api";
import "./EcommercePages.css";

export default function EcommercePayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [razorpayDetails, setRazorpayDetails] = useState(null);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [showResolveModal, setShowResolveModal] = useState(null);
  const [resolveStatus, setResolveStatus] = useState("paid");
  const [resolveNotes, setResolveNotes] = useState("");

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filter, methodFilter, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      if (methodFilter !== "all") {
        params.paymentMethod = methodFilter;
      }

      const response = await api.get("/payment/admin/all", { params });
      setPayments(response.data.payments || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching payments:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/payment/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    }
  };

  const handleViewRazorpayDetails = async (paymentId) => {
    if (!paymentId) {
      alert("No Razorpay payment ID available");
      return;
    }

    try {
      setLoadingRazorpay(true);
      const response = await api.get(`/payment/admin/razorpay/${paymentId}`);
      setRazorpayDetails(response.data);
      setSelectedPayment(paymentId);
    } catch (error) {
      console.error("Error fetching Razorpay details:", error);
      alert(error.response?.data?.message || "Failed to fetch Razorpay payment details");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!resolveStatus) {
      alert("Please select a resolution status");
      return;
    }

    try {
      await api.put(`/payment/admin/${showResolveModal.orderId}/mark-resolved`, {
        paymentStatus: resolveStatus,
        notes: resolveNotes,
      });
      alert("Payment marked as resolved successfully!");
      setShowResolveModal(null);
      setResolveStatus("paid");
      setResolveNotes("");
      fetchPayments();
      fetchStats();
    } catch (error) {
      console.error("Error marking payment as resolved:", error);
      alert(error.response?.data?.message || "Failed to mark payment as resolved");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.orderId?.toLowerCase().includes(searchLower) ||
        payment.paymentId?.toLowerCase().includes(searchLower) ||
        payment.userName?.toLowerCase().includes(searchLower) ||
        payment.userEmail?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      paid: "#10b981",
      failed: "#ef4444",
      pending: "#f59e0b",
      refunded: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getMethodBadge = (method) => {
    const badges = {
      razorpay: { label: "Razorpay", color: "#8b5cf6" },
      cod: { label: "COD", color: "#3b82f6" },
      wallet: { label: "Wallet", color: "#f59e0b" },
    };
    return badges[method] || { label: method?.toUpperCase(), color: "#6b7280" };
  };

  if (loading && payments.length === 0 && !stats) {
    return <div className="ecommerce-page-loading">Loading payments...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>Payments & Transactions</h2>
          <p>Monitor payment flow and transaction details</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setFilter("failed");
            setPagination({ ...pagination, page: 1 });
            fetchPayments();
          }}
        >
          View Failed Payments
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="payment-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{stats.stats.totalTransactions}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{parseFloat(stats.stats.totalRevenue).toLocaleString()}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Successful</div>
            <div className="stat-value">{stats.stats.successfulPayments}</div>
          </div>
          <div className="stat-card failed">
            <div className="stat-label">Failed</div>
            <div className="stat-value">{stats.stats.failedPayments}</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.stats.pendingPayments}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">{stats.stats.successRate}%</div>
          </div>
        </div>
      )}

      {/* Payment Method Statistics */}
      {stats && stats.methodStats && (
        <div className="method-stats">
          <h3>Payment Method Statistics</h3>
          <div className="method-stats-grid">
            {Object.entries(stats.methodStats).map(([method, data]) => {
              if (data.total === 0) return null;
              const methodBadge = getMethodBadge(method);
              return (
                <div key={method} className="method-stat-card">
                  <div className="method-stat-header">
                    <span
                      className="method-badge"
                      style={{ backgroundColor: methodBadge.color }}
                    >
                      {methodBadge.label}
                    </span>
                  </div>
                  <div className="method-stat-body">
                    <div className="method-stat-item">
                      <span>Total:</span>
                      <strong>{data.total}</strong>
                    </div>
                    <div className="method-stat-item">
                      <span>Success:</span>
                      <strong style={{ color: "#10b981" }}>{data.success}</strong>
                    </div>
                    <div className="method-stat-item">
                      <span>Failed:</span>
                      <strong style={{ color: "#ef4444" }}>{data.failed}</strong>
                    </div>
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
          placeholder="Search by order ID, payment ID, customer..."
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
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Methods</option>
          <option value="razorpay">Razorpay</option>
          <option value="cod">COD</option>
          <option value="wallet">Wallet</option>
        </select>
      </div>

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  {loading ? "Loading payments..." : "No payments found"}
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const statusColor = getStatusColor(payment.paymentStatus);
                const methodBadge = getMethodBadge(payment.paymentMethod);
                const isFailed = payment.paymentStatus === "failed";
                
                return (
                  <tr key={payment._id} className={isFailed ? "row-failed" : ""}>
                    <td>
                      <div className="payment-id-cell">
                        {payment.paymentId ? (
                          <>
                            <strong>{payment.paymentId}</strong>
                            {payment.paymentMethod === "razorpay" && (
                              <button
                                className="btn-view-details"
                                onClick={() => handleViewRazorpayDetails(payment.paymentId)}
                                disabled={loadingRazorpay}
                              >
                                View Details
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="order-id">{payment.orderId}</strong>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{payment.userName || "N/A"}</div>
                        <div className="customer-email">{payment.userEmail || ""}</div>
                      </div>
                    </td>
                    <td>
                      <div className="amount-display">
                        <strong>₹{payment.amount?.toFixed(2) || "0.00"}</strong>
                        {payment.discount > 0 && (
                          <span className="discount-badge">-₹{payment.discount.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="method-badge"
                        style={{ backgroundColor: methodBadge.color }}
                      >
                        {methodBadge.label}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColor }}
                      >
                        {payment.paymentStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td>
                      <div className="date-display">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <span className="time">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {isFailed && (
                          <button
                            className="btn-resolve"
                            onClick={() =>
                              setShowResolveModal({
                                orderId: payment.orderId,
                                paymentId: payment.paymentId,
                              })
                            }
                            title="Mark as resolved"
                          >
                            Resolve
                          </button>
                        )}
                        {payment.paymentMethod === "razorpay" && payment.paymentId && (
                          <button
                            className="btn-view-details"
                            onClick={() => handleViewRazorpayDetails(payment.paymentId)}
                            disabled={loadingRazorpay}
                            title="View Razorpay details"
                          >
                            Razorpay
                          </button>
                        )}
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

      {/* Razorpay Details Modal */}
      {selectedPayment && razorpayDetails && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Razorpay Payment Details</h3>
              <button className="close-btn" onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            <div className="modal-body">
              {razorpayDetails.mock ? (
                <div className="alert alert-warning">
                  Razorpay is in mock mode. Real payment details not available.
                </div>
              ) : (
                <div className="razorpay-details">
                  <div className="detail-row">
                    <label>Payment ID:</label>
                    <span>{razorpayDetails.payment?.id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    <span className="status-badge" style={{ backgroundColor: razorpayDetails.payment?.status === "captured" ? "#10b981" : "#f59e0b" }}>
                      {razorpayDetails.payment?.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Amount:</label>
                    <span>₹{(razorpayDetails.payment?.amount / 100).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Currency:</label>
                    <span>{razorpayDetails.payment?.currency}</span>
                  </div>
                  <div className="detail-row">
                    <label>Method:</label>
                    <span>{razorpayDetails.payment?.method?.toUpperCase() || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <label>Created At:</label>
                    <span>{new Date(razorpayDetails.payment?.created_at * 1000).toLocaleString()}</span>
                  </div>
                  {razorpayDetails.payment?.description && (
                    <div className="detail-row">
                      <label>Description:</label>
                      <span>{razorpayDetails.payment.description}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedPayment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Payment Modal */}
      {showResolveModal && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mark Payment as Resolved</h3>
              <button className="close-btn" onClick={() => setShowResolveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Order ID</label>
                <input type="text" value={showResolveModal.orderId} disabled className="disabled-input" />
              </div>
              <div className="form-group">
                <label>Resolution Status *</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="paid">Mark as Paid</option>
                  <option value="refunded">Mark as Refunded</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Add notes about manual resolution..."
                  rows="4"
                  className="modal-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowResolveModal(null)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleMarkResolved}>
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
