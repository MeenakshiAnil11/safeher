import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaFileAlt,
  FaVideo,
  FaQuestionCircle,
  FaBullhorn,
} from "react-icons/fa";
import api from "../../../services/api";
import "./ContentManagement.css";

export default function ContentManagement() {
  const [resources, setResources] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("resources");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "resources") {
        // Fetch educational resources
        const response = await api.get("/educational-content");
        setResources(response.data.content || []);
      } else if (activeTab === "forum") {
        // Fetch forum posts pending moderation
        const response = await api.get("/forum/admin/posts?status=pending");
        setForumPosts(response.data.posts || []);
      } else if (activeTab === "announcements") {
        // Fetch announcements
        const response = await api.get("/admin/announcements").catch(() => ({ data: { announcements: [] } }));
        setAnnouncements(response.data.announcements || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResource = async (id) => {
    try {
      await api.put(`/educational-content/${id}/approve`);
      fetchData();
      alert("Resource approved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve resource");
    }
  };

  const handleRejectResource = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await api.put(`/educational-content/${id}/reject`, { reason });
      fetchData();
      alert("Resource rejected successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject resource");
    }
  };

  const handleApprovePost = async (id) => {
    try {
      await api.put(`/forum/admin/posts/${id}/approve`);
      fetchData();
      alert("Post approved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve post");
    }
  };

  const handleRejectPost = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await api.put(`/forum/admin/posts/${id}/reject`, { reason });
      fetchData();
      alert("Post rejected successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject post");
    }
  };

  const createAnnouncement = async () => {
    const title = window.prompt("Announcement title:");
    const content = window.prompt("Announcement content:");
    if (!title || !content) return;
    try {
      await api.post("/admin/announcements", { title, content });
      fetchData();
      alert("Announcement created successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create announcement");
    }
  };

  return (
    <div className="content-management">
      <div className="page-header">
        <h2>Content & Resource Management</h2>
        <p>Manage educational resources, forum posts, and announcements</p>
      </div>

      {/* Tabs */}
      <div className="content-tabs">
        <button
          className={activeTab === "resources" ? "active" : ""}
          onClick={() => setActiveTab("resources")}
        >
          <FaFileAlt /> Educational Resources
        </button>
        <button
          className={activeTab === "forum" ? "active" : ""}
          onClick={() => setActiveTab("forum")}
        >
          <FaQuestionCircle /> Forum Moderation
        </button>
        <button
          className={activeTab === "announcements" ? "active" : ""}
          onClick={() => setActiveTab("announcements")}
        >
          <FaBullhorn /> Announcements
        </button>
      </div>

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div className="content-section">
          <div className="section-header">
            <h3>Educational Resources</h3>
            <button className="btn-primary" onClick={() => window.location.href = "/admin/resources"}>
              Manage Resources
            </button>
          </div>
          {loading ? (
            <div className="loading-state">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="empty-state">No resources found</div>
          ) : (
            <div className="resources-list">
              {resources.map((resource) => (
                <div key={resource._id} className="resource-card">
                  <div className="resource-header">
                    <h4>{resource.title}</h4>
                    <span className="resource-type">{resource.type}</span>
                  </div>
                  <p className="resource-description">{resource.description}</p>
                  <div className="resource-actions">
                    {resource.status === "pending" && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveResource(resource._id)}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectResource(resource._id)}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Forum Tab */}
      {activeTab === "forum" && (
        <div className="content-section">
          <div className="section-header">
            <h3>Forum Posts Pending Moderation</h3>
          </div>
          {loading ? (
            <div className="loading-state">Loading posts...</div>
          ) : forumPosts.length === 0 ? (
            <div className="empty-state">No posts pending moderation</div>
          ) : (
            <div className="posts-list">
              {forumPosts.map((post) => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <h4>{post.title}</h4>
                    <span className="post-category">{post.category}</span>
                  </div>
                  <p className="post-content">{post.content?.substring(0, 200)}...</p>
                  <div className="post-meta">
                    <span>By: {post.author?.name || "Anonymous"}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="post-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprovePost(post._id)}
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectPost(post._id)}
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="content-section">
          <div className="section-header">
            <h3>Announcements</h3>
            <button className="btn-primary" onClick={createAnnouncement}>
              <FaBullhorn /> Create Announcement
            </button>
          </div>
          {loading ? (
            <div className="loading-state">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">No announcements</div>
          ) : (
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="announcement-card">
                  <div className="announcement-header">
                    <h4>{announcement.title}</h4>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{announcement.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
