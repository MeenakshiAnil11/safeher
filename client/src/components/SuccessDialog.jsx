import React from "react";
import "./SuccessDialog.css";

export default function SuccessDialog({ message, onClose, show = true, type = "success" }) {
  if (!show) return null;

  const isError = type === "error";
  const iconColor = isError ? "#ef4444" : "#10b981";
  const title = isError ? "Error" : "Success!";

  return (
    <div className="success-dialog-overlay" onClick={onClose}>
      <div className="success-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="success-dialog-icon">
          {isError ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill={iconColor} opacity="0.2"/>
              <path
                d="M12 8v4m0 4h.01"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill={iconColor} opacity="0.2"/>
              <path
                d="M9 12l2 2 4-4"
                stroke={iconColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <h3 className="success-dialog-title">{title}</h3>
        <p className="success-dialog-message">{message}</p>
        <button 
          className={`success-dialog-button ${isError ? "error-button" : ""}`}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
