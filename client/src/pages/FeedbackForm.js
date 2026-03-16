import React, { useState } from "react";
import api from "../services/api";
import UserHeader from "../components/UserHeader";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import "../styles/FeedbackForm.css";

export default function FeedbackForm() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Bug");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [screenshot, setScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(null);

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

      if (res.data && res.status === 201) {
        setSuccess(true);
        setSubject("");
        setCategory("Bug");
        setMessage("");
        setRating(5);
        setScreenshot(null);
        setErrors({});
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
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

  const handleStarClick = (starValue) => {
    setRating(starValue);
    setErrors({ ...errors, rating: "" });
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(null)}
        onClick={() => handleStarClick(star)}
        style={{ cursor: 'pointer', fontSize: '32px' }}
      >
        ⭐
      </span>
    ));
  };

  return (
    <div className="dashboard-container feedback-page">
      <UserHeader />
      <div className="dashboard-body">
        <UserSidebar />
        <main className="dashboard-main">
          <div className="feedback-form-container">
            <div className="feedback-header">
              <h1 className="feedback-title">💬 Share Your Feedback</h1>
              <p className="feedback-subtitle">We value your input! Help us improve SafeHer by sharing your thoughts, reporting issues, or suggesting new features.</p>
            </div>

            {success && (
              <div className="success-alert">
                <div className="success-icon">✅</div>
                <div>
                  <h3>Feedback Submitted Successfully!</h3>
                  <p>Thank you for your feedback. We'll review it and get back to you soon.</p>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); submitFeedback(); }} className="feedback-form">
              <div className="form-section">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setErrors({ ...errors, subject: "" }); }}
                  className="form-input"
                  placeholder="Brief description of your feedback"
                  disabled={loading}
                />
                {errors.subject && <span className="error-text">{errors.subject}</span>}
              </div>

              <div className="form-section">
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="Bug">🐛 Bug Report</option>
                  <option value="Suggestion">💡 Feature Suggestion</option>
                  <option value="Question">❓ Question</option>
                  <option value="Other">💬 General Feedback</option>
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors({ ...errors, message: "" }); }}
                  rows="6"
                  className="form-textarea"
                  placeholder="Please provide detailed information about your feedback..."
                  disabled={loading}
                />
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>

              <div className="form-section">
                <label className="form-label">Rating: {rating} out of 5</label>
                <div className="star-rating-container" onMouseLeave={() => setHoveredRating(null)}>
                  {renderStars()}
                </div>
                {errors.rating && <span className="error-text">{errors.rating}</span>}
              </div>

              <div className="form-section">
                <label className="form-label">Screenshot (Optional)</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="file-input"
                    id="screenshot-upload"
                  />
                  {screenshot && (
                    <div className="screenshot-preview">
                      <img src={URL.createObjectURL(screenshot)} alt="Preview" />
                      <button type="button" onClick={() => setScreenshot(null)} className="remove-screenshot">
                        ✕ Remove
                      </button>
                    </div>
                  )}
                  {!screenshot && (
                    <label htmlFor="screenshot-upload" className="file-label">
                      <span className="file-icon">📷</span>
                      <span>Click to upload or drag and drop</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className={`submit-button ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Submitting...' : '📤 Submit Feedback'}
                </button>
              </div>
            </form>

            <div className="feedback-tips">
              <h3>💡 Tips for providing helpful feedback:</h3>
              <ul>
                <li>Be specific about what you're experiencing or suggesting</li>
                <li>Include steps to reproduce if reporting a bug</li>
                <li>Add screenshots when possible to help us understand better</li>
                <li>Be constructive and respectful in your feedback</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
