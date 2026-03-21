import React, { useState, useEffect } from "react";
import api from "../../../api";
import OrderDetailModal from "./OrderDetailModal";
import OrderStatusModal from "./OrderStatusModal";
import { showErrorAlert, showSuccessAlert, showWarningAlert } from "../../../utils/adminAlerts";
import "./EcommercePages.css";

export default function EcommerceOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [refundFilter, setRefundFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [showRefundDecisionModal, setShowRefundDecisionModal] = useState(false);
  const [refundDecisionState, setRefundDecisionState] = useState({ orderId: "", decision: "" });
  const [processingRefundDecision, setProcessingRefundDecision] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  useEffect(() => {
    fetchOrders();
  }, [filter, paymentFilter, refundFilter, pagination.page]);

  useEffect(() => {
    // Keep admin list up to date with newly placed user orders
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [filter, paymentFilter, refundFilter, pagination.page, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      if (paymentFilter !== "all") {
        params.paymentStatus = paymentFilter;
      }
      if (refundFilter !== "all") {
        params.refundStatus = refundFilter;
      }

      if (searchTerm) {
        params.orderNumber = searchTerm;
      }

      const response = await api.get("/orders/admin/all", { params });
      setOrders(response.data.orders || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 403) {
        await showWarningAlert("Access denied. Admin privileges required.", { timer: undefined });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, updateData) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, updateData);
      await showSuccessAlert("Order status updated successfully!");
      fetchOrders();
      setStatusModalOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      await showErrorAlert(error.response?.data?.message || "Failed to update order status", { timer: undefined });
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/payment-status`, { paymentStatus });
      await showSuccessAlert("Payment status updated successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
      await showErrorAlert(error.response?.data?.message || "Failed to update payment status", { timer: undefined });
    }
  };

  const handleReturnDecision = async (orderId, decision) => {
    const note = window.prompt(
      decision === "approve"
        ? "Optional note for customer (approve):"
        : "Optional note for customer (reject):",
      ""
    );
    if (note === null) return;
    try {
      await api.put(`/orders/admin/${orderId}/return-decision`, {
        decision,
        adminNote: note,
      });
      await showSuccessAlert(`Return request ${decision}d successfully.`);
      fetchOrders();
    } catch (error) {
      console.error("Error deciding return request:", error);
      await showErrorAlert(error.response?.data?.message || "Failed to process return request", { timer: undefined });
    }
  };

  const openRefundDecisionModal = (orderId, decision) => {
    setRefundDecisionState({ orderId, decision });
    setShowRefundDecisionModal(true);
  };

  const closeRefundDecisionModal = () => {
    if (processingRefundDecision) return;
    setShowRefundDecisionModal(false);
    setRefundDecisionState({ orderId: "", decision: "" });
  };

  const handleRefundDecision = async () => {
    try {
      const { orderId, decision } = refundDecisionState;
      if (!orderId || !decision) return;
      setProcessingRefundDecision(true);
      const response = await api.post(`/orders/admin/${orderId}/refund`, { decision });
      await showSuccessAlert(response?.data?.message || "Refund status updated successfully.");
      closeRefundDecisionModal();
      fetchOrders();
    } catch (error) {
      console.error("Error processing refund request:", error);
      await showErrorAlert(error.response?.data?.message || "Refund action failed", { timer: undefined });
    } finally {
      setProcessingRefundDecision(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: "#f59e0b",
      confirmed: "#3b82f6",
      packed: "#8b5cf6",
      shipped: "#06b6d4",
      delivered: "#10b981",
      cancelled: "#ef4444",
      returned: "#6b7280",
      completed: "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      paid: "#10b981",
      failed: "#ef4444",
      refunded: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const filteredOrders = orders.filter((order) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && orders.length === 0) {
    return <div className="ecommerce-page-loading">Loading orders...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>Order Management</h2>
          <p>Track and manage all customer orders</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{pagination.total}</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by order number, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              fetchOrders();
            }
          }}
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Order Status</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={refundFilter}
          onChange={(e) => {
            setRefundFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Refund Status</option>
          <option value="None">None</option>
          <option value="Requested">Requested</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="button" className="btn-view" onClick={fetchOrders} title="Refresh orders list">
          Refresh
        </button>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  {loading ? "Loading orders..." : "No orders found"}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div className="order-id-cell">
                      <strong>{order.orderNumber}</strong>
                      {order.trackingNumber && (
                        <span className="tracking-badge">📦 {order.trackingNumber}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-name">{order.user?.name || "N/A"}</div>
                      <div className="customer-email">{order.user?.email || ""}</div>
                    </div>
                  </td>
                  <td>
                    <div className="items-cell">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                    </div>
                  </td>
                  <td>
                    <div className="amount-cell">
                      <strong>₹{order.total?.toFixed(2) || "0.00"}</strong>
                      {order.paymentMethod && (
                        <span className="payment-method">({order.paymentMethod.toUpperCase()})</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      {order.paymentStatus?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                  <td>
                    {(() => {
                      const displayStatus =
                        order.orderStatus === "placed" || order.orderStatus === "confirmed" || order.orderStatus === "packed"
                          ? "processing"
                          : order.orderStatus || "pending";
                      return (
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {displayStatus.toUpperCase()}
                    </span>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="date-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <span className="time">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => setSelectedOrder(order)}
                        title="View order details"
                      >
                        View
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => setStatusModalOrder(order)}
                        title="Update order status"
                      >
                        Update
                      </button>
                      {order.returnRequest?.status === "requested" && (
                        <>
                          <button
                            className="btn-view"
                            onClick={() => handleReturnDecision(order._id, "approve")}
                            title="Approve return request"
                          >
                            Approve Return
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleReturnDecision(order._id, "reject")}
                            title="Reject return request"
                          >
                            Reject Return
                          </button>
                        </>
                      )}
                      {order.refundStatus === "Requested" && (
                        <>
                          <button
                            className="btn-view"
                            onClick={() => openRefundDecisionModal(order._id, "approve")}
                            title="Approve and process refund"
                          >
                            Approve Refund
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => openRefundDecisionModal(order._id, "reject")}
                            title="Reject refund request"
                          >
                            Reject Refund
                          </button>
                        </>
                      )}
                    </div>
                    {order.returnRequest?.status && order.returnRequest.status !== "none" && (
                      <div className="return-request-chip">
                        Return: {order.returnRequest.status}
                      </div>
                    )}
                    {order.refundStatus && order.refundStatus !== "None" && (
                      <div className="refund-request-chip">
                        Refund: {order.refundStatus}
                      </div>
                    )}
                  </td>
                </tr>
              ))
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

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={(order) => {
            setSelectedOrder(null);
            setStatusModalOrder(order);
          }}
        />
      )}

      {statusModalOrder && (
        <OrderStatusModal
          order={statusModalOrder}
          onClose={() => setStatusModalOrder(null)}
          onUpdate={handleStatusUpdate}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
        />
      )}

      {showRefundDecisionModal && (
        <div className="refund-decision-modal-overlay" onClick={closeRefundDecisionModal}>
          <div className="refund-decision-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {refundDecisionState.decision === "approve"
                ? "Approve and process refund for this order?"
                : "Reject this refund request?"}
            </h3>
            <div className="refund-decision-modal-actions">
              <button
                type="button"
                className="refund-decision-btn cancel"
                onClick={closeRefundDecisionModal}
                disabled={processingRefundDecision}
              >
                Cancel
              </button>
              <button
                type="button"
                className="refund-decision-btn ok"
                onClick={handleRefundDecision}
                disabled={processingRefundDecision}
              >
                {processingRefundDecision ? "Processing..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
