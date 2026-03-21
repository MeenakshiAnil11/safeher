import React, { useState } from "react";
import { showErrorAlert, showWarningAlert } from "../../../utils/adminAlerts";
import "./OrderStatusModal.css";

export default function OrderStatusModal({ order, onClose, onUpdate, onPaymentStatusUpdate }) {
  const normalizedCurrentStatus = order?.orderStatus === "placed" ? "processing" : order?.orderStatus || "processing";
  const [orderStatus, setOrderStatus] = useState(normalizedCurrentStatus);
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "pending");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [notes, setNotes] = useState(order?.notes || "");
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate tracking number for shipped status
    if (orderStatus === "shipped" && !trackingNumber.trim()) {
      await showWarningAlert("Tracking number is required when order status is 'Shipped'", {
        timer: undefined,
      });
      return;
    }

    setUpdating(true);

    try {
      // Update order status, tracking number, or notes if any changed
      const orderStatusChanged = orderStatus !== normalizedCurrentStatus;
      const trackingChanged = trackingNumber !== (order.trackingNumber || "");
      const notesChanged = notes !== (order.notes || "");
      
      if (orderStatusChanged || trackingChanged || notesChanged) {
        await onUpdate(order._id, {
          orderStatus,
          trackingNumber: trackingNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      // Update payment status if changed (separate API call)
      if (paymentStatus !== order.paymentStatus && onPaymentStatusUpdate) {
        await onPaymentStatusUpdate(order._id, paymentStatus);
      }

      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      await showErrorAlert("Failed to update order. Please try again.", { timer: undefined });
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "returned", label: "Returned" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div className="status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="status-modal-header">
          <h2>Update Order Status</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="status-form">
          <div className="form-group">
            <label>Order Number</label>
            <input type="text" value={order?.orderNumber || ""} disabled className="disabled-input" />
          </div>

          <div className="form-group">
            <label>Order Status *</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              required
              className="status-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="form-help">
              Status flow: Processing → Shipped → Delivered
            </p>
          </div>

          <div className="form-group">
            <label>Payment Status *</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              required
              className="status-select"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tracking Number {orderStatus === "shipped" && <span className="required">*</span>}</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="status-input"
              required={orderStatus === "shipped"}
            />
            <p className="form-help">
              {orderStatus === "shipped" 
                ? "Required when status is 'Shipped'" 
                : "Optional - Add tracking number when order is shipped"}
            </p>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this order (optional)"
              rows="4"
              className="status-textarea"
            />
          </div>

          {orderStatus === "cancelled" && (
            <div className="warning-box">
              <span>⚠️</span>
              <p>
                Cancelling this order will restore product stock. This action cannot be undone.
              </p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-update" disabled={updating}>
              {updating ? "Updating..." : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
