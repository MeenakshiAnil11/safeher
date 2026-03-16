import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./PostReactions.css";

const PostReactions = ({ postId, initialReactions = {}, initialUserReaction = null }) => {
  const [reactions, setReactions] = useState(initialReactions);
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get(`/forum/posts/${postId}/reactions`);
      setReactions(res.data.reactions || {});
      setUserReaction(res.data.userReaction || null);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleReaction = async (emoji) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to react");
      return;
    }

    try {
      setLoading(true);
      if (userReaction === emoji) {
        // Remove reaction
        await api.delete(`/forum/posts/${postId}/reactions`);
        setUserReaction(null);
        setReactions((prev) => {
          const newReactions = { ...prev };
          if (newReactions[emoji] > 1) {
            newReactions[emoji] -= 1;
          } else {
            delete newReactions[emoji];
          }
          return newReactions;
        });
      } else {
        // Add/change reaction
        const res = await api.post(`/forum/posts/${postId}/reactions`, { reaction: emoji });
        setUserReaction(emoji);
        setReactions(res.data.reactions || {});
      }
      setShowPicker(false);
    } catch (error) {
      console.error("Error adding reaction:", error);
      alert("Failed to add reaction");
    } finally {
      setLoading(false);
    }
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="post-reactions">
      <button
        className={`reaction-button ${userReaction ? "has-reaction" : ""}`}
        onClick={() => setShowPicker(!showPicker)}
        disabled={loading}
      >
        {userReaction ? userReaction : "👍"} React
      </button>

      {showPicker && (
        <div className="reaction-picker">
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              className={`reaction-emoji-btn ${userReaction === emoji ? "active" : ""}`}
              onClick={() => handleReaction(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {getTotalReactions() > 0 && (
        <div className="reactions-display">
          {reactionEmojis.map((emoji) => {
            const count = reactions[emoji] || 0;
            if (count === 0) return null;
            return (
              <span key={emoji} className="reaction-count">
                {emoji} {count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostReactions;
