import React, { useState } from "react";
import "./OrderDetailModal.css";

export default function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

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
      pending: "#f59e0b",
      paid: "#10b981",
      failed: "#ef4444",
      refunded: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const statusFlow = ["placed", "confirmed", "packed", "shipped", "delivered"];
  const currentStatusIndex = statusFlow.indexOf(order.orderStatus);

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <div>
            <h2>Order Details</h2>
            <p className="order-number">#{order.orderNumber}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="order-modal-body">
          {/* Order Status Timeline */}
          <div className="order-status-section">
            <h3>Order Status</h3>
            <div className="status-timeline">
              {statusFlow.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={status} className={`timeline-step ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-label">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                    {index < statusFlow.length - 1 && <div className="timeline-line"></div>}
                  </div>
                );
              })}
            </div>
            {order.orderStatus === "cancelled" && (
              <div className="cancelled-badge">
                <span>❌ Cancelled</span>
                {order.cancelledReason && <p>Reason: {order.cancelledReason}</p>}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="order-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div>
                <label>Name</label>
                <p>{order.user?.name || "N/A"}</p>
              </div>
              <div>
                <label>Email</label>
                <p>{order.user?.email || "N/A"}</p>
              </div>
              <div>
                <label>Phone</label>
                <p>{order.user?.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="order-section">
            <h3>Shipping Address</h3>
            <div className="address-box">
              <p>
                {order.shippingAddress?.name && (
                  <>
                    <strong>{order.shippingAddress.name}</strong><br />
                  </>
                )}
                {order.shippingAddress?.addressLine1 || order.shippingAddress?.address || ""}<br />
                {order.shippingAddress?.addressLine2 && (
                  <>
                    {order.shippingAddress.addressLine2}<br />
                  </>
                )}
                {order.shippingAddress?.city || ""}
                {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
                {order.shippingAddress?.postalCode || order.shippingAddress?.pincode ? ` ${order.shippingAddress.postalCode || order.shippingAddress.pincode}` : ""}
                {order.shippingAddress?.country && (
                  <>
                    <br />
                    {order.shippingAddress.country}
                  </>
                )}
                {order.shippingAddress?.phone && (
                  <>
                    <br />
                    Phone: {order.shippingAddress.phone}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-section">
            <h3>Order Items ({order.items?.length || 0})</h3>
            <div className="order-items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item-row">
                  <img
                    src={item.image || item.product?.images?.[0]?.url || "/images/placeholder-product.jpg"}
                    alt={item.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Order Summary */}
          <div className="order-section">
            <h3>Payment & Order Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Payment Method</label>
                <p>{order.paymentMethod?.toUpperCase() || "N/A"}</p>
              </div>
              <div className="summary-item">
                <label>Payment Status</label>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                >
                  {order.paymentStatus?.toUpperCase() || "PENDING"}
                </span>
              </div>
              <div className="summary-item">
                <label>Order Status</label>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                >
                  {order.orderStatus?.toUpperCase() || "PENDING"}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="summary-item">
                  <label>Tracking Number</label>
                  <p>{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="order-section">
            <h3>Price Breakdown</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>₹{order.shipping?.toFixed(2) || "0.00"}</span>
              </div>
              {order.discount > 0 && (
                <div className="price-row discount">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toFixed(2) || "0.00"}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total</span>
                <span>₹{order.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Order Dates */}
          <div className="order-section">
            <h3>Order Timeline</h3>
            <div className="info-grid">
              <div>
                <label>Order Date</label>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              {order.cancelledAt && (
                <div>
                  <label>Cancelled Date</label>
                  <p>{new Date(order.cancelledAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="order-section">
              <h3>Notes</h3>
              <p className="notes-text">{order.notes}</p>
            </div>
          )}

          {order.returnRequest?.status && order.returnRequest.status !== "none" && (
            <div className="order-section">
              <h3>Return / Refund Request</h3>
              <div className="info-grid">
                <div>
                  <label>Status</label>
                  <p>{order.returnRequest.status}</p>
                </div>
                <div>
                  <label>Refund Status</label>
                  <p>{order.returnRequest.refundStatus || "none"}</p>
                </div>
                <div>
                  <label>Reason</label>
                  <p>{order.returnRequest.reason || "N/A"}</p>
                </div>
                {order.returnRequest.adminNote && (
                  <div>
                    <label>Admin Note</label>
                    <p>{order.returnRequest.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="order-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {onStatusUpdate && (
            <button
              className="btn-primary"
              onClick={() => onStatusUpdate(order)}
            >
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
