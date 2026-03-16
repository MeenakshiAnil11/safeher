import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import UserActions from "../components/UserActions";
import { FaUser, FaEdit, FaTrophy, FaComment, FaThumbsUp, FaBookmark } from "react-icons/fa";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwnProfile = !userId || userId === currentUser._id;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    upvotes: 0,
    reputation: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || currentUser._id;
      
      // Fetch user info
      const userRes = await api.get(`/users/${targetUserId}`);
      setUser(userRes.data.user);

      // Fetch forum stats
      try {
        const statsRes = await api.get(`/forum/admin/users/${targetUserId}/activity`);
        setStats({
          posts: statsRes.data.stats.postCount || 0,
          comments: statsRes.data.stats.commentCount || 0,
          upvotes: 0, // Calculate from posts
          reputation: (statsRes.data.stats.postCount || 0) * 10 + (statsRes.data.stats.commentCount || 0) * 5,
        });
        setRecentPosts(statsRes.data.recentPosts || []);
      } catch (error) {
        console.error("Error fetching forum stats:", error);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadges = () => {
    const badges = [];
    if (stats.posts >= 10) badges.push({ name: "Contributor", icon: "🌟" });
    if (stats.posts >= 50) badges.push({ name: "Expert", icon: "⭐" });
    if (stats.comments >= 100) badges.push({ name: "Helper", icon: "💬" });
    if (stats.reputation >= 500) badges.push({ name: "Influencer", icon: "🏆" });
    return badges;
  };

  if (loading) {
    return <div className="user-profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="user-profile-error">User not found</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.name || "User"}</h1>
            <p className="profile-email">{user.email}</p>
            {!isOwnProfile && (
              <UserActions userId={user._id} userName={user.name} />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <FaEdit className="stat-icon" />
            <div className="stat-value">{stats.posts}</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat-card">
            <FaComment className="stat-icon" />
            <div className="stat-value">{stats.comments}</div>
            <div className="stat-label">Comments</div>
          </div>
          <div className="stat-card">
            <FaThumbsUp className="stat-icon" />
            <div className="stat-value">{stats.upvotes}</div>
            <div className="stat-label">Upvotes</div>
          </div>
          <div className="stat-card">
            <FaTrophy className="stat-icon" />
            <div className="stat-value">{stats.reputation}</div>
            <div className="stat-label">Reputation</div>
          </div>
        </div>

        {/* Badges */}
        {getBadges().length > 0 && (
          <div className="profile-badges">
            <h3>Achievements</h3>
            <div className="badges-list">
              {getBadges().map((badge, idx) => (
                <div key={idx} className="badge-item">
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-name">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="profile-posts">
            <h3>Recent Posts</h3>
            <div className="posts-list">
              {recentPosts.map((post) => (
                <Link key={post._id} to={`/forum/posts/${post._id}`} className="post-item">
                  <h4>{post.title}</h4>
                  <p className="post-meta">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.category}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
