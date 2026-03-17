import React, { useEffect, useMemo, useState } from "react";
import UploadBox from "../../components/selfcare/UploadBox";
import "./BreastCancerDetection.css";

export default function BreastCancerDetection() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const confidencePercent = useMemo(() => {
    if (!result?.confidence && result?.confidence !== 0) {
      return null;
    }
    return (result.confidence * 100).toFixed(2);
  }, [result]);

  const badgeTone = result?.prediction === "Malignant" ? "red" : "green";
  const progressWidth = confidencePercent ? Number(confidencePercent) : 0;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAnalyze = async () => {
    if (!file) {
      setUploadError("Please upload an image before analyzing.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setUploadError("");
      setSuccessMessage("");
      setResult(null);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:5001/predict-breast-cancer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Prediction request failed.");
      }

      setResult({
        prediction: data.prediction,
        confidence: Number(data.confidence),
      });
    } catch (analyzeError) {
      setError(analyzeError.message || "API is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) {
      return;
    }

    try {
      setReportLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch("http://localhost:5001/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction: result.prediction,
          confidence: Number(result.confidence),
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate report.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Keep fallback message when response is not JSON.
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = "safeher_breast_cancer_report.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(fileUrl);
      setSuccessMessage("Report downloaded successfully.");
    } catch (reportError) {
      setError(reportError.message || "Unable to download report right now.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl("");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setFile(null);
      setPreviewUrl("");
      setUploadError("Invalid file type. Please upload an image file.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setUploadError("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="bcd-page">
      <div className="bcd-container">
        <section className="bcd-card bcd-upload-card">
          <div className="bcd-header-row">
            <h2 className="bcd-title">Breast Cancer Detection</h2>
            <span className="bcd-pill">
            🩺 AI Screening
            </span>
          </div>
          <p className="bcd-subtitle">Upload mammogram image and detect cancer risk using AI.</p>
          <div className="bcd-upload-inner">
            <h3 className="bcd-section-label">📤 Upload Image</h3>
            <UploadBox
              label="Drag & drop mammogram image"
              file={file}
              onChange={handleFileChange}
            />
            {file ? <p className="bcd-file-name">Selected file: {file.name}</p> : null}
            {previewUrl ? (
              <div className="bcd-preview-wrap">
                <img
                  src={previewUrl}
                  alt="Selected mammogram preview"
                  className="bcd-preview-image"
                />
              </div>
            ) : null}
            {uploadError ? <p className="bcd-inline-error">{uploadError}</p> : null}
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            className="bcd-analyze-btn"
            disabled={!file || loading}
          >
            {loading ? "Analyzing..." : "🔬 Analyze"}
          </button>
        </section>

        {error ? (
          <section className="bcd-card bcd-alert bcd-alert-error">{error}</section>
        ) : null}

        {successMessage ? (
          <section className="bcd-card bcd-alert bcd-alert-success">{successMessage}</section>
        ) : null}

        {loading ? (
          <section className="bcd-card">
            <div className="bcd-loading-row">
              <span className="bcd-spinner" />
              <span>Running AI analysis on uploaded mammogram...</span>
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="bcd-card bcd-result-card">
            <div className="bcd-result-layout">
              <div className="bcd-result-main">
                <h3 className="bcd-result-title">🧠 AI Result Summary</h3>
                <div className="bcd-badge-row">
                <span
                  className={`bcd-status-badge ${
                    badgeTone === "red"
                      ? "bcd-status-badge-danger"
                      : "bcd-status-badge-safe"
                  }`}
                >
                  {badgeTone === "red" ? "🔴 Malignant" : "🟢 Benign"}
                </span>
                </div>

                <div className="bcd-confidence-wrap">
                  <div className="bcd-confidence-head">
                    <span className="font-medium">Confidence</span>
                    <span className="font-semibold">{confidencePercent}%</span>
                  </div>
                  <div className="bcd-progress-track">
                    <div
                      className={`bcd-progress-fill ${
                        badgeTone === "red" ? "bcd-progress-fill-danger" : "bcd-progress-fill-safe"
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>
                <p className="bcd-result-note">
                  {badgeTone === "red" ? "⚠ High-risk signal detected." : "✔ Low-risk signal detected."} Consult a doctor
                  for confirmation.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={!result || reportLoading}
                className="bcd-download-btn"
              >
                {reportLoading ? "Generating..." : "Download Report"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="bcd-tips-grid">
          <article className="bcd-card bcd-tip-card">
            <h3 className="bcd-tip-title">🩻 Early Symptoms</h3>
            <ul className="bcd-tip-list">
              <li>New lump in breast or underarm</li>
              <li>Skin dimpling or texture change</li>
              <li>Nipple discharge or inversion</li>
            </ul>
          </article>
          <article className="bcd-card bcd-tip-card">
            <h3 className="bcd-tip-title">🛡 Prevention Tips</h3>
            <ul className="bcd-tip-list">
              <li>Regular screening by age guidance</li>
              <li>Maintain healthy BMI and activity</li>
              <li>Limit alcohol and avoid smoking</li>
            </ul>
          </article>
          <article className="bcd-card bcd-tip-card">
            <h3 className="bcd-tip-title">👩‍⚕ Doctor Advice</h3>
            <p className="bcd-tip-text">
              If you notice any unusual change, consult a gynecologist or breast specialist without delay.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
