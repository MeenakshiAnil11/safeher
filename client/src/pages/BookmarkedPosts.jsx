import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import SuccessDialog from "../components/SuccessDialog";
import "./ForumHome.css";

const BookmarkedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [currentPage]);

  const fetchBookmarkedPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/forum/posts/bookmarked?page=${currentPage}&limit=10`);
      setPosts(res.data?.posts || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
      setDialog({
        show: true,
        message: "Error loading bookmarked posts. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-home">
      <div className="forum-container">
        {/* Header */}
        <div className="forum-header my-posts-header">
          <div className="header-title-section">
            <h1 className="forum-title">⭐ Bookmarked Posts</h1>
            <p className="forum-subtitle">Your saved posts for easy access</p>
          </div>
          
          <div className="forum-header-actions">
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
              <p>Loading bookmarked posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>No bookmarked posts</h3>
              <p>Start bookmarking posts you find interesting!</p>
              <Link to="/forum" className="btn-create-post">
                Browse Forum
              </Link>
            </div>
          ) : (
            <>
              <div className="posts-list">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
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
    </div>
  );
};

export default BookmarkedPosts;
