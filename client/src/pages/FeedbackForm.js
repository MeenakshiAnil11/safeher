import React, { useState } from "react";
import api from "../services/api";

export default function FeedbackForm() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Bug");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [screenshot, setScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!message.trim()) newErrors.message = "Message is required";
    if (rating < 1 || rating > 5) newErrors.rating = "Rating must be between 1 and 5";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitFeedback = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("category", category);
    formData.append("message", message);
    formData.append("rating", rating);
    if (screenshot) formData.append("screenshot", screenshot);

    try {
      setLoading(true);
      const res = await api.post("/feedback", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Always treat response as an object with feedback data
      if (res.data && res.status === 201) {
        setSuccess(true);
        setSubject("");
        setCategory("Bug");
        setMessage("");
        setRating(5);
        setScreenshot(null);
        setErrors({});
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Submit Feedback</h2>

      {success && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          Feedback submitted successfully!
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <label>Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
        {errors.subject && <span style={{ color: "red" }}>{errors.subject}</span>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        >
          <option value="Bug">Bug</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="5"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
        {errors.message && <span style={{ color: "red" }}>{errors.message}</span>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Rating (1-5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
        {errors.rating && <span style={{ color: "red" }}>{errors.rating}</span>}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Screenshot (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginTop: "5px" }}
        />
        {screenshot && (
          <img
            src={URL.createObjectURL(screenshot)}
            alt="Screenshot preview"
            style={{ width: "100px", height: "100px", marginTop: "10px" }}
          />
        )}
      </div>

      <button
        onClick={submitFeedback}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
}
