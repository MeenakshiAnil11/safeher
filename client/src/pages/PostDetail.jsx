import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Comment from "../components/Comment";
import SuccessDialog from "../components/SuccessDialog";
import PostReactions from "../components/PostReactions";
import ShareButton from "../components/ShareButton";
import RichTextEditor from "../components/RichTextEditor";
import { resolveApiPath } from "../config/apiConfig";
import "./PostDetail.css";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/forum/posts/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments || []);
      setUpvoteCount(res.data.post.upvoteCount || 0);
      setDownvoteCount(res.data.post.downvoteCount || 0);
      setIsBookmarked(res.data.post.isBookmarked || false);
      setUserVote(res.data.post.userVote || null);
      setReactions(res.data.post.reactions || {});
      setUserReaction(res.data.post.userReaction || null);
    } catch (error) {
      console.error("Error fetching post:", error);
      setDialog({
        show: true,
        message: "Error loading post. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
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
      const res = await api.post(`/forum/posts/${id}/upvote`);
      setUpvoteCount(res.data.upvoteCount);
      setDownvoteCount(res.data.downvoteCount);
      setUserVote(userVote === "upvote" ? null : "upvote");
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleDownvote = async () => {
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
      const res = await api.post(`/forum/posts/${id}/downvote`);
      setUpvoteCount(res.data.upvoteCount);
      setDownvoteCount(res.data.downvoteCount);
      setUserVote(userVote === "downvote" ? null : "downvote");
    } catch (error) {
      console.error("Error downvoting:", error);
    }
  };

  const handleBookmark = async () => {
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
      const res = await api.post(`/forum/posts/${id}/bookmark`);
      setIsBookmarked(res.data.isBookmarked);
      setDialog({
        show: true,
        message: res.data.isBookmarked ? "Post bookmarked" : "Bookmark removed",
        type: "success",
      });
    } catch (error) {
      console.error("Error bookmarking:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to comment",
        type: "error",
      });
      return;
    }

    if (!commentContent.trim()) {
      setDialog({
        show: true,
        message: "Comment cannot be empty",
        type: "error",
      });
      return;
    }

    if (post?.isLocked) {
      setDialog({
        show: true,
        message: "This thread is locked",
        type: "error",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await api.post(`/forum/posts/${id}/comments`, {
        content: commentContent,
      });
      
      setComments([...comments, res.data.comment]);
      setCommentContent("");
      setDialog({
        show: true,
        message: "Comment added successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error adding comment",
        type: "error",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/forum/posts/${id}`);
      setDialog({
        show: true,
        message: "Post deleted successfully",
        type: "success",
      });
      setTimeout(() => navigate("/forum"), 1500);
    } catch (error) {
      console.error("Error deleting post:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Error deleting post",
        type: "error",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <h2>Post not found</h2>
        <Link to="/forum">Back to Forum</Link>
      </div>
    );
  }

  const isAuthor = post.author?._id === user._id || post.author === user._id;
  const isAdmin = user.role === "admin";

  return (
    <div className="post-detail">
      <div className="post-detail-container">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate("/forum")}>
          ← Back to Forum
        </button>

        {/* Post Content */}
        <article className="post-detail-content">
          {post.isPinned && <div className="post-pinned-badge">📌 Pinned</div>}
          {post.isLocked && <div className="post-locked-badge">🔒 Locked</div>}

          <div className="post-detail-header">
            <div className="post-category-badge">{post.category}</div>
            {post.isQuestion && <span className="question-badge">❓ Question</span>}
            {post.verifiedAnswer && <span className="verified-badge">✅ Verified Answer</span>}
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            {post.isAnonymous ? (
              <span className="author-info">👤 Anonymous</span>
            ) : (
              <span className="author-info">👤 {post.author?.name || "Unknown"}</span>
            )}
            <span className="post-date">{formatDate(post.createdAt)}</span>
            <span className="post-views">👁️ {post.views || 0} views</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="post-tag">#{tag}</span>
              ))}
            </div>
          )}

          <div className="post-detail-body">
            <div className="post-content">{post.content}</div>

            {post.images && post.images.length > 0 && (
              <div className="post-images">
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={resolveApiPath(img)}
                    alt={`Post image ${idx + 1}`}
                    className="post-image"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="post-detail-actions">
            <div className="vote-actions">
              <button
                className={`vote-btn upvote ${userVote === "upvote" ? "active" : ""}`}
                onClick={handleUpvote}
              >
                👍 {upvoteCount}
              </button>
              <button
                className={`vote-btn downvote ${userVote === "downvote" ? "active" : ""}`}
                onClick={handleDownvote}
              >
                👎 {downvoteCount}
              </button>
            </div>

            <div className="other-actions">
              <PostReactions
                postId={id}
                initialReactions={reactions}
                initialUserReaction={userReaction}
              />
              <ShareButton post={post} />
              <button
                className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
                onClick={handleBookmark}
              >
                {isBookmarked ? "⭐ Bookmarked" : "☆ Bookmark"}
              </button>
              {(isAuthor || isAdmin) && (
                <>
                  <Link to={`/forum/posts/${id}/edit`} className="edit-btn">
                    ✏️ Edit
                  </Link>
                  <button className="delete-btn" onClick={handleDeletePost}>
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2 className="comments-title">
            Comments ({comments.length})
          </h2>

          {!post.isLocked && (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <RichTextEditor
                value={commentContent}
                onChange={setCommentContent}
                placeholder="Write a comment... Use @username to mention others."
                height="200px"
              />
              <button
                type="submit"
                className="submit-comment-btn"
                disabled={submittingComment || !commentContent.trim()}
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>
          )}

          {post.isLocked && (
            <div className="thread-locked-message">
              🔒 This thread is locked. No new comments can be added.
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  postId={id}
                  onUpdate={fetchPost}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <SuccessDialog
        show={dialog.show}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, show: false })}
      />
    </div>
  );
};

export default PostDetail;
