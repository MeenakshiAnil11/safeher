import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import SuccessDialog from "../components/SuccessDialog";
import "./ForumHome.css";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState("");
  const [pendingDeletePostId, setPendingDeletePostId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPosts();
  }, [currentPage]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/forum/posts/my-posts?page=${currentPage}&limit=10`);
      setPosts(res.data?.posts || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching my posts:", error);
      setDialog({
        show: true,
        message: "Error loading your posts. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setDeletingPostId(postId);
      await api.delete(`/forum/posts/${postId}`);

      const remainingPosts = posts.filter((post) => post._id !== postId);
      setPosts(remainingPosts);
      setDialog({
        show: true,
        message: "Post deleted successfully.",
        type: "success",
      });

      if (remainingPosts.length === 0 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchMyPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || "Failed to delete post. Please try again.",
        type: "error",
      });
    } finally {
      setDeletingPostId("");
    }
  };

  const openDeleteDialog = (postId) => {
    setPendingDeletePostId(postId);
  };

  const closeDeleteDialog = () => {
    setPendingDeletePostId("");
  };

  const confirmDeletePost = async () => {
    if (!pendingDeletePostId) return;
    await handleDeletePost(pendingDeletePostId);
    setPendingDeletePostId("");
  };

  return (
    <div className="forum-home">
      <div className="forum-container">
        {/* Header */}
        <div className="forum-header my-posts-header">
          <div className="header-title-section">
            <h1 className="forum-title">My Posts</h1>
            <p className="forum-subtitle">View and manage all your forum posts</p>
          </div>
          
          <div className="forum-header-actions">
            <button
              className="btn-create-post"
              onClick={() => navigate("/forum/create")}
            >
              + Create Post
            </button>
            <Link to="/forum" className="btn-back">
              ← Back to Forum
            </Link>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <main className="forum-main my-posts-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Start sharing with the community!</p>
              <button
                className="btn-create-post"
                onClick={() => navigate("/forum/create")}
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <>
              <div className="posts-list">
                {posts.map((post) => (
                  <div key={post._id} className="my-post-item">
                    <div className="my-post-actions">
                      <button
                        type="button"
                        className="btn-delete-post"
                        onClick={() => openDeleteDialog(post._id)}
                        disabled={deletingPostId === post._id}
                      >
                        {deletingPostId === post._id ? "Deleting..." : "Delete Post"}
                      </button>
                    </div>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <SuccessDialog
        show={dialog.show}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, show: false })}
      />

      {pendingDeletePostId ? (
        <div className="confirm-delete-overlay" onClick={closeDeleteDialog}>
          <div className="confirm-delete-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Delete Post</h3>
            <p>Do you really want to delete the post?</p>
            <div className="confirm-delete-actions">
              <button type="button" className="confirm-delete-cancel" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button type="button" className="confirm-delete-ok" onClick={confirmDeletePost}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyPosts;
