import React from "react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop">
      <div className="confirm-dialog">
        <h3>{title || "Confirm"}</h3>
        <p>{message || "Are you sure?"}</p>
        <div className="confirm-dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
