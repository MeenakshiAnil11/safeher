import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [showRefundConfirmModal, setShowRefundConfirmModal] = useState(false);
  const [showRefundSuccessToast, setShowRefundSuccessToast] = useState(false);
  const [refundSuccessMessage, setRefundSuccessMessage] = useState("");
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnReasonError, setReturnReasonError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      if (error.response?.status === 401) {
        navigate("/login?redirect=/shop/orders/" + id);
      } else if (error.response?.status === 404) {
        navigate("/shop/orders");
      }
    } finally {
      setLoading(false);
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
    };
    return colors[status] || "#6b7280";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: "#10b981",
      pending: "#f59e0b",
      failed: "#ef4444",
      refunded: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusSteps = () => {
    const steps = [
      { key: "placed", label: "Order Placed" },
      { key: "confirmed", label: "Confirmed" },
      { key: "packed", label: "Packed" },
      { key: "shipped", label: "Shipped" },
      { key: "delivered", label: "Delivered" },
    ];

    const statusOrder = ["placed", "confirmed", "packed", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.orderStatus);

    return steps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.key);
      const isActive = stepIndex <= currentIndex;
      const isCurrent = stepIndex === currentIndex;

      return (
        <div key={step.key} className={`status-step ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
          <div className="step-indicator">
            {isActive ? "✓" : index + 1}
          </div>
          <div className="step-label">{step.label}</div>
        </div>
      );
    });
  };

  const openCancelConfirmModal = () => {
    if (cancellingOrder) return;
    setShowCancelConfirmModal(true);
  };

  const closeCancelConfirmModal = () => {
    if (cancellingOrder) return;
    setShowCancelConfirmModal(false);
  };

  const handleCancelOrder = async () => {
    try {
      setCancellingOrder(true);
      await api.put(`/orders/${id}/cancel`, {
        reason: "Cancelled by user",
      });
      closeCancelConfirmModal();
      fetchOrder();
      alert("Order cancelled successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(false);
    }
  };

  const openReturnModal = () => {
    setReturnReason("");
    setReturnReasonError("");
    setShowReturnModal(true);
  };

  const closeReturnModal = () => {
    if (requestingReturn) return;
    setShowReturnModal(false);
    setReturnReason("");
    setReturnReasonError("");
  };

  const handleRequestReturn = async () => {
    const reason = returnReason.trim();
    if (!reason) {
      setReturnReasonError("Please enter a reason.");
      return;
    }

    try {
      setRequestingReturn(true);
      await api.put(`/orders/${id}/return-request`, { reason });
      await fetchOrder();
      closeReturnModal();
      window.alert("Return/refund request submitted successfully.");
    } catch (error) {
      window.alert(error.response?.data?.message || "Failed to submit return request.");
    } finally {
      setRequestingReturn(false);
    }
  };

  const openRefundConfirmModal = () => {
    if (requestingRefund) return;
    setShowRefundConfirmModal(true);
  };

  const closeRefundConfirmModal = () => {
    if (requestingRefund) return;
    setShowRefundConfirmModal(false);
  };

  const closeRefundSuccessToast = () => {
    setShowRefundSuccessToast(false);
    setRefundSuccessMessage("");
  };

  const handleRefund = async (orderId) => {
    try {
      setRequestingRefund(true);
      const res = await api.post(`/orders/request-refund/${orderId}`);
      setRefundSuccessMessage(res.data?.message || "Refund requested successfully");
      setShowRefundSuccessToast(true);
      closeRefundConfirmModal();
      await fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to request refund");
    } finally {
      setRequestingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="error-state">
            <h2>Order not found</h2>
            <Link to="/shop/orders">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="page-header">
          <Link to="/shop/orders" className="back-link">
            ← Back to Orders
          </Link>
          <h1>Order Details</h1>
        </div>

        {/* Order Status Tracking */}
        <div className="order-status-section">
          <h2>Order Status</h2>
          <div className="status-timeline">
            {getStatusSteps()}
          </div>
          {order.trackingNumber && (
            <div className="tracking-info">
              <span className="tracking-label">Tracking Number:</span>
              <span className="tracking-number">{order.trackingNumber}</span>
            </div>
          )}
          {order.returnRequest?.status && order.returnRequest.status !== "none" && (
            <div className="return-status-box" aria-live="polite">
              <span className="tracking-label">Return/Refund:</span>
              <strong className={`return-status-pill ${order.returnRequest.status}`}>
                {order.returnRequest.status.toUpperCase()}
              </strong>
              {order.returnRequest?.adminNote && (
                <p className="return-note">{order.returnRequest.adminNote}</p>
              )}
            </div>
          )}
          {order.refundStatus === "Requested" && (
            <div className="return-status-box" aria-live="polite">
              <span className="badge info">Refund Requested</span>
            </div>
          )}
          {order.refundStatus === "Processing" && (
            <div className="return-status-box" aria-live="polite">
              <span className="badge warning">Refund Processing</span>
            </div>
          )}
          {order.refundStatus === "Completed" && (
            <div className="return-status-box" aria-live="polite">
              <span className="badge success">Refund Completed</span>
            </div>
          )}
          {order.refundStatus === "Rejected" && (
            <div className="return-status-box" aria-live="polite">
              <span className="badge error">Refund Rejected</span>
            </div>
          )}
        </div>

        {/* Order Info Cards */}
        <div className="info-cards-grid">
          <div className="info-card">
            <h3>Order Information</h3>
            <div className="info-item">
              <span className="info-label">Order Number</span>
              <span className="info-value">{order.orderNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Order Date</span>
              <span className="info-value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Order Status</span>
              <span
                className="info-value status-badge"
                style={{ backgroundColor: getStatusColor(order.orderStatus) }}
              >
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>
          </div>

          <div className="info-card">
            <h3>Payment Information</h3>
            <div className="info-item">
              <span className="info-label">Payment Method</span>
              <span className="info-value">
                {order.paymentMethod === "razorpay"
                  ? "Credit/Debit Card, UPI"
                  : order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Status</span>
              <span
                className="info-value status-badge"
                style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
              >
                {order.paymentStatus === "paid"
                  ? "Paid"
                  : order.paymentStatus === "pending"
                  ? "Payment Pending"
                  : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
            {order.paymentId && (
              <div className="info-item">
                <span className="info-label">Payment ID</span>
                <span className="info-value payment-id">{order.paymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="shipping-section">
          <h2>Shipping Address</h2>
          <div className="address-card">
            <p>
              <strong>{order.shippingAddress.name}</strong>
            </p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-section">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item-card">
                <img
                  src={item.image || "/images/placeholder-product.jpg"}
                  alt={item.name}
                />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">₹{item.price.toFixed(2)} per unit</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="summary-card">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : `₹${order.shipping.toFixed(2)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            {order.coupon && (
              <div className="summary-row coupon">
                <span>Coupon Applied</span>
                <span>{order.coupon.code}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions-section">
          <Link to="/shop" className="btn-continue-shopping">
            Continue Shopping
          </Link>
          {["placed", "confirmed", "packed"].includes(order.orderStatus) && (
            <button className="btn-cancel-order" onClick={openCancelConfirmModal}>
              Cancel Order
            </button>
          )}
          {order.orderStatus === "cancelled" &&
            order.paymentMethod === "upi" &&
            order.paymentStatus === "paid" &&
            (order.refundStatus || "None") === "None" && (
              <button
                className="refund-btn"
                onClick={openRefundConfirmModal}
                disabled={requestingRefund}
              >
                {requestingRefund ? "Requesting..." : "Request Refund"}
              </button>
            )}
          {order.orderStatus === "delivered" && (
            <>
              <button className="btn-reorder">Reorder</button>
              {order.returnRequest?.status !== "requested" &&
                order.returnRequest?.status !== "approved" &&
                order.returnRequest?.status !== "completed" && (
                  <button
                    type="button"
                    className="btn-return-request"
                    onClick={openReturnModal}
                    disabled={requestingReturn}
                  >
                    {requestingReturn ? "Submitting..." : "Request Return / Refund"}
                  </button>
                )}
            </>
          )}
        </div>
      </div>

      {showReturnModal && (
        <div className="return-modal-overlay" onClick={closeReturnModal}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Please provide a reason for return/refund request:</h3>
            <textarea
              value={returnReason}
              onChange={(e) => {
                setReturnReason(e.target.value);
                if (returnReasonError) setReturnReasonError("");
              }}
              placeholder="Enter reason..."
              rows={4}
              className="return-reason-input"
              disabled={requestingReturn}
            />
            {returnReasonError && <p className="return-reason-error">{returnReasonError}</p>}
            <div className="return-modal-actions">
              <button
                type="button"
                className="btn-return-cancel"
                onClick={closeReturnModal}
                disabled={requestingReturn}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-return-ok"
                onClick={handleRequestReturn}
                disabled={requestingReturn}
              >
                {requestingReturn ? "Submitting..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefundConfirmModal && (
        <div className="refund-modal-overlay" onClick={closeRefundConfirmModal}>
          <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure request refund?</h3>
            <div className="refund-modal-actions">
              <button
                type="button"
                className="btn-refund-cancel"
                onClick={closeRefundConfirmModal}
                disabled={requestingRefund}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-refund-ok"
                onClick={() => handleRefund(order._id)}
                disabled={requestingRefund}
              >
                {requestingRefund ? "Processing..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRefundSuccessToast && (
        <div className="refund-success-toast" role="status" aria-live="polite">
          <span>{refundSuccessMessage || "Refund requested successfully"}</span>
          <button type="button" onClick={closeRefundSuccessToast}>
            Cancel
          </button>
        </div>
      )}

      {showCancelConfirmModal && (
        <div className="cancel-modal-overlay" onClick={closeCancelConfirmModal}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel this order?</h3>
            <div className="cancel-modal-actions">
              <button
                type="button"
                className="btn-cancel-modal-cancel"
                onClick={closeCancelConfirmModal}
                disabled={cancellingOrder}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-cancel-modal-ok"
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
              >
                {cancellingOrder ? "Cancelling..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
