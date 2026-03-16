import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import SuccessDialog from "./SuccessDialog";
import "./PostCard.css";

const PostCard = ({ post }) => {
  const [upvoteCount, setUpvoteCount] = useState(post.upvoteCount || 0);
  const [downvoteCount, setDownvoteCount] = useState(post.downvoteCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [userVote, setUserVote] = useState(post.userVote || null);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });

  const categoryLabels = {
    "period-cycle-health": "Period & Cycle",
    "pregnancy-conception": "Pregnancy",
    "perimenopause-menopause": "Perimenopause",
    "mental-health-wellness": "Mental Health",
    "general-health-questions": "General",
    "product-reviews-recommendations": "Products",
    "anonymous-support": "Anonymous",
  };

  const getCategoryColor = (category) => {
    const colors = {
      "period-cycle-health": "#e91e63",
      "pregnancy-conception": "#9c27b0",
      "perimenopause-menopause": "#673ab7",
      "mental-health-wellness": "#3f51b5",
      "general-health-questions": "#2196f3",
      "product-reviews-recommendations": "#00bcd4",
      "anonymous-support": "#009688",
    };
    return colors[category] || "#757575";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to upvote posts",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/forum/posts/${post._id}/upvote`);
      setUpvoteCount(res.data.upvoteCount);
      setDownvoteCount(res.data.downvoteCount);
      setUserVote(userVote === "upvote" ? null : "upvote");
    } catch (error) {
      console.error("Error upvoting:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error upvoting post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to downvote posts",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/forum/posts/${post._id}/downvote`);
      setUpvoteCount(res.data.upvoteCount);
      setDownvoteCount(res.data.downvoteCount);
      setUserVote(userVote === "downvote" ? null : "downvote");
    } catch (error) {
      console.error("Error downvoting:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error downvoting post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to bookmark posts",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/forum/posts/${post._id}/bookmark`);
      setIsBookmarked(res.data.isBookmarked);
      setDialog({
        show: true,
        message: res.data.isBookmarked ? "Post bookmarked" : "Bookmark removed",
        type: "success",
      });
    } catch (error) {
      console.error("Error bookmarking:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error bookmarking post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const contentPreview = post.content.length > 200
    ? post.content.substring(0, 200) + "..."
    : post.content;

  return (
    <>
      <Link to={`/forum/posts/${post._id}`} className="post-card">
        {post.isPinned && (
          <div className="post-pinned-badge">📌 Pinned</div>
        )}
        
        <div className="post-header">
          <div className="post-category" style={{ backgroundColor: getCategoryColor(post.category) }}>
            {categoryLabels[post.category] || post.category}
          </div>
          {post.isQuestion && <span className="post-question-badge">❓ Question</span>}
          {post.verifiedAnswer && <span className="post-verified-badge">✅ Verified</span>}
        </div>

        <h3 className="post-title">{post.title}</h3>

        <div className="post-content-preview">{contentPreview}</div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="post-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="post-footer">
          <div className="post-author">
            {post.isAnonymous ? (
              <span className="anonymous-author">👤 Anonymous</span>
            ) : (
              <span>👤 {post.author?.name || "Unknown"}</span>
            )}
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>

          <div className="post-stats">
            <button
              className={`vote-btn upvote ${userVote === "upvote" ? "active" : ""}`}
              onClick={handleUpvote}
              disabled={loading}
              title="Upvote"
            >
              👍 {upvoteCount}
            </button>
            <button
              className={`vote-btn downvote ${userVote === "downvote" ? "active" : ""}`}
              onClick={handleDownvote}
              disabled={loading}
              title="Downvote"
            >
              👎 {downvoteCount}
            </button>
            <span className="post-stat">
              💬 {post.commentCount || 0}
            </span>
            <span className="post-stat">
              👁️ {post.views || 0}
            </span>
            <button
              className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
              onClick={handleBookmark}
              disabled={loading}
              title="Bookmark"
            >
              {isBookmarked ? "⭐" : "☆"}
            </button>
          </div>
        </div>
      </Link>

      <SuccessDialog
        show={dialog.show}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, show: false })}
      />
    </>
  );
};

export default PostCard;
