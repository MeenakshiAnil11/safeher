import React, { useState } from "react";
import { showErrorAlert, showWarningAlert } from "../../../utils/adminAlerts";
import "./StockUpdateModal.css";

export default function StockUpdateModal({ product, onClose, onUpdate }) {
  const [stockValue, setStockValue] = useState(product?.stock || 0);
  const [updateType, setUpdateType] = useState("set"); // set, increase, decrease
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newStock = stockValue;

      if (updateType === "increase") {
        newStock = product.stock + adjustmentAmount;
      } else if (updateType === "decrease") {
        newStock = Math.max(0, product.stock - adjustmentAmount);
      }

      if (newStock < 0) {
        await showWarningAlert("Stock cannot be negative", { timer: undefined });
        setLoading(false);
        return;
      }

      await onUpdate(product._id, newStock);
      onClose();
    } catch (error) {
      console.error("Error updating stock:", error);
      await showErrorAlert("Failed to update stock. Please try again.", { timer: undefined });
    } finally {
      setLoading(false);
    }
  };

  const getNewStockPreview = () => {
    if (updateType === "set") return stockValue;
    if (updateType === "increase") return product.stock + adjustmentAmount;
    if (updateType === "decrease") return Math.max(0, product.stock - adjustmentAmount);
    return product.stock;
  };

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stock-modal-header">
          <h2>Update Stock</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="stock-modal-body">
          <div className="product-info-section">
            <img
              src={product?.images?.[0]?.url || "/images/placeholder-product.jpg"}
              alt={product?.name}
              className="product-image"
            />
            <div>
              <h3>{product?.name}</h3>
              <p className="current-stock">Current Stock: <strong>{product?.stock}</strong> units</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="stock-form">
            <div className="form-group">
              <label>Update Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="updateType"
                    value="set"
                    checked={updateType === "set"}
                    onChange={(e) => setUpdateType(e.target.value)}
                  />
                  <span>Set Stock Quantity</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="updateType"
                    value="increase"
                    checked={updateType === "increase"}
                    onChange={(e) => setUpdateType(e.target.value)}
                  />
                  <span>Increase Stock</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="updateType"
                    value="decrease"
                    checked={updateType === "decrease"}
                    onChange={(e) => setUpdateType(e.target.value)}
                  />
                  <span>Decrease Stock</span>
                </label>
              </div>
            </div>

            {updateType === "set" ? (
              <div className="form-group">
                <label>New Stock Quantity *</label>
                <input
                  type="number"
                  value={stockValue}
                  onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  required
                  className="stock-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Amount to {updateType === "increase" ? "Add" : "Subtract"} *</label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  required
                  className="stock-input"
                />
              </div>
            )}

            <div className="stock-preview">
              <div className="preview-label">New Stock Will Be:</div>
              <div className="preview-value">{getNewStockPreview()} units</div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-update" disabled={loading}>
                {loading ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
