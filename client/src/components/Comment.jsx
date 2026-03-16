import React, { useState } from "react";
import api from "../services/api";
import SuccessDialog from "./SuccessDialog";
import RichTextEditor from "./RichTextEditor";
import "./Comment.css";

const Comment = ({ comment, postId, onUpdate, depth = 0 }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount || 0);
  const [downvoteCount, setDownvoteCount] = useState(comment.downvoteCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthor = comment.author?._id === user._id || comment.author === user._id;
  const isAdmin = user.role === "admin";
  const isExpert = comment.isExpert || comment.author?.role === "admin";

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

  const handleUpvote = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to upvote comments",
        type: "error",
      });
      return;
    }

    try {
      const res = await api.post(`/forum/comments/${comment._id}/upvote`);
      setUpvoteCount(res.data.upvoteCount);
      setDownvoteCount(res.data.downvoteCount);
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      setDialog({
        show: true,
        message: "Reply cannot be empty",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to reply",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/forum/posts/${postId}/comments`, {
        content: replyContent,
        parentComment: comment._id,
      });

      setReplyContent("");
      setShowReply(false);
      if (onUpdate) onUpdate();
      
      setDialog({
        show: true,
        message: "Reply added successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error replying:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error adding reply",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      setDialog({
        show: true,
        message: "Comment cannot be empty",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await api.put(`/forum/comments/${comment._id}`, {
        content: editContent,
      });

      setIsEditing(false);
      if (onUpdate) onUpdate();
      
      setDialog({
        show: true,
        message: "Comment updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error updating comment",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api.delete(`/forum/comments/${comment._id}`);
      if (onUpdate) onUpdate();
      
      setDialog({
        show: true,
        message: "Comment deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error deleting comment",
        type: "error",
      });
    }
  };

  const handleVerify = async () => {
    try {
      await api.post(`/forum/comments/${comment._id}/verify`);
      if (onUpdate) onUpdate();
      
      setDialog({
        show: true,
        message: "Answer verified",
        type: "success",
      });
    } catch (error) {
      console.error("Error verifying:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error verifying answer",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className={`comment ${depth > 0 ? "comment-reply" : ""}`}>
        <div className="comment-header">
          <div className="comment-author">
            <span className="author-name">
              {comment.author?.name || "Unknown"}
            </span>
            {isExpert && <span className="expert-badge">👨‍⚕️ Expert</span>}
            {comment.isVerifiedAnswer && (
              <span className="verified-badge">✅ Verified Answer</span>
            )}
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        <div className="comment-body">
          {isEditing ? (
            <div className="comment-edit">
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="Edit your comment..."
                height="200px"
              />
              <div className="comment-edit-actions">
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                <button onClick={handleEdit} disabled={loading}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className="comment-content"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          )}
        </div>

        <div className="comment-actions">
          <button className="vote-btn" onClick={handleUpvote}>
            👍 {upvoteCount}
          </button>
          {depth < 2 && (
            <button
              className="reply-btn"
              onClick={() => setShowReply(!showReply)}
            >
              💬 Reply
            </button>
          )}
          {isAuthor && !isEditing && (
            <>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                🗑️ Delete
              </button>
            </>
          )}
          {(isAdmin || isExpert) && !comment.isVerifiedAnswer && (
            <button className="verify-btn" onClick={handleVerify}>
              ✅ Verify Answer
            </button>
          )}
        </div>

        {showReply && (
          <form onSubmit={handleReply} className="reply-form">
            <RichTextEditor
              value={replyContent}
              onChange={setReplyContent}
              placeholder="Write a reply... Use @username to mention others."
              height="150px"
            />
            <div className="reply-actions">
              <button
                type="button"
                onClick={() => {
                  setShowReply(false);
                  setReplyContent("");
                }}
              >
                Cancel
              </button>
              <button type="submit" disabled={loading || !replyContent.trim()}>
                {loading ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                postId={postId}
                onUpdate={onUpdate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      <SuccessDialog
        show={dialog.show}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, show: false })}
      />
    </>
  );
};

export default Comment;
