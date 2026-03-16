import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import SuccessDialog from "../components/SuccessDialog";
import "./ForumHome.css";

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/forum/trending?limit=50");
      setPosts(res.data?.posts || []);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      setDialog({
        show: true,
        message: "Error loading trending posts. Please try again.",
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
            <h1 className="forum-title">🔥 Trending Posts</h1>
            <p className="forum-subtitle">Most popular posts in the last 7 days</p>
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
              <p>Loading trending posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔥</div>
              <h3>No trending posts</h3>
              <p>Be the first to create a trending post!</p>
              <button
                className="btn-create-post"
                onClick={() => navigate("/forum/create")}
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
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

export default TrendingPosts;
