import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import PostCard from "../components/PostCard";
import SuccessDialog from "../components/SuccessDialog";
import "./ForumHome.css";

const ForumHome = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const categoryLabels = {
    all: "All Posts",
    "period-cycle-health": "Period & Cycle Health",
    "pregnancy-conception": "Pregnancy & Conception",
    "perimenopause-menopause": "Perimenopause & Menopause",
    "mental-health-wellness": "Mental Health & Wellness",
    "general-health-questions": "General Health Questions",
    "product-reviews-recommendations": "Product Reviews",
    "anonymous-support": "Anonymous Support",
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy, searchQuery, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/forum/categories");
      setCategories(res.data?.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `/forum/posts?page=${currentPage}&limit=10&sortBy=${sortBy}`;
      
      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await api.get(url);
      setPosts(res.data?.posts || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setDialog({
        show: true,
        message: "Error loading posts. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setIsSidebarOpen(false);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="forum-home">
      <div className="forum-header">
        <div className="forum-header-left">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            ☰
          </button>
          <div>
            <h1 className="forum-title">Community Forum</h1>
            <p className="forum-subtitle">Connect, share, and get support from our community</p>
          </div>
        </div>

        <form className="forum-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="forum-search-input"
            placeholder="Search posts, comments, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="forum-search-btn">Search</button>
        </form>

        <div className="forum-header-actions">
          <Link to="/dashboard" className="btn-dashboard">Back to Dashboard</Link>
          <button
            className="btn-create-post"
            onClick={() => navigate("/forum/create")}
          >
            + Create New Post
          </button>
        </div>
      </div>

      <div className="forum-content">
        {isSidebarOpen ? (
          <button className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar" />
        ) : null}
          {/* Sidebar - Categories */}
          <aside className={`forum-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <h3>Categories</h3>
            <div className="category-list">
              <button
                className={`category-item ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => handleCategoryChange("all")}
              >
                <span>📋</span>
                <span>All Posts</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  className={`category-item ${selectedCategory === cat.category ? "active" : ""}`}
                  onClick={() => handleCategoryChange(cat.category)}
                >
                  <span>📁</span>
                  <span>{categoryLabels[cat.category] || cat.category}</span>
                  <span className="category-count">({cat.count})</span>
                </button>
              ))}
            </div>

            <div className="sidebar-links">
              <Link to="/dashboard" className="sidebar-link sidebar-link-dashboard">
                ← Back to Dashboard
              </Link>
              <Link to="/forum/my-posts" className="sidebar-link">
                📝 My Posts
              </Link>
              <Link to="/forum/bookmarked" className="sidebar-link">
                ⭐ Bookmarked
              </Link>
              <Link to="/forum/trending" className="sidebar-link">
                🔥 Trending
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="forum-main">
            {/* Sort & Filter Bar */}
            <div className="forum-toolbar">
              <div className="sort-controls">
                <label>Sort by:</label>
                <select value={sortBy} onChange={handleSortChange} className="sort-select">
                  <option value="newest">Newest</option>
                  <option value="most-upvoted">Most Upvoted</option>
                  <option value="most-comments">Most Comments</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
              <div className="posts-count">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </div>
            </div>

            <div className="forum-main-scroll">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No posts found</h3>
                  <p>Be the first to start a discussion!</p>
                  <button
                    className="btn-create-post"
                    onClick={() => navigate("/forum/create")}
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                <>
                  <div className="posts-list">
                    {posts.map((post) => (
                      <div key={post._id} className="forum-post-item">
                        <div className="forum-post-actions">
                          <button
                            type="button"
                            className="btn-reply-post"
                            onClick={() => navigate(`/forum/posts/${post._id}#comments`)}
                          >
                            ↩ Reply to Post
                          </button>
                        </div>
                        <PostCard post={post} />
                      </div>
                    ))}
                  </div>

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
            </div>
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

export default ForumHome;
