import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaUserPlus, FaUserMinus, FaBan, FaUnlock } from "react-icons/fa";
import "./UserActions.css";

const UserActions = ({ userId, userName }) => {
  const [status, setStatus] = useState({
    isFollowing: false,
    isBlocked: false,
    isBlockedBy: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserStatus();
    }
  }, [userId]);

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get(`/forum/users/${userId}/status`);
      setStatus(res.data);
    } catch (error) {
      console.error("Error fetching user status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleFollow = async () => {
    try {
      setLoading(true);
      if (status.isFollowing) {
        await api.delete(`/forum/follow/${userId}`);
        setStatus({ ...status, isFollowing: false });
      } else {
        await api.post(`/forum/follow/${userId}`);
        setStatus({ ...status, isFollowing: true });
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      alert(error.response?.data?.message || "Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!window.confirm(`Are you sure you want to ${status.isBlocked ? "unblock" : "block"} ${userName}?`)) {
      return;
    }

    try {
      setLoading(true);
      if (status.isBlocked) {
        await api.delete(`/forum/block/${userId}`);
        setStatus({ ...status, isBlocked: false });
      } else {
        await api.post(`/forum/block/${userId}`, { reason: "other" });
        setStatus({ ...status, isBlocked: true, isFollowing: false });
      }
    } catch (error) {
      console.error("Error blocking/unblocking:", error);
      alert(error.response?.data?.message || "Failed to update block status");
    } finally {
      setLoading(false);
    }
  };

  if (loadingStatus) {
    return <div className="user-actions-loading">Loading...</div>;
  }

  if (status.isBlockedBy) {
    return (
      <div className="user-actions-blocked">
        <span>This user has blocked you</span>
      </div>
    );
  }

  return (
    <div className="user-actions">
      <button
        className={`action-btn follow-btn ${status.isFollowing ? "following" : ""}`}
        onClick={handleFollow}
        disabled={loading || status.isBlocked}
        title={status.isFollowing ? "Unfollow" : "Follow"}
      >
        {status.isFollowing ? (
          <>
            <FaUserMinus /> Unfollow
          </>
        ) : (
          <>
            <FaUserPlus /> Follow
          </>
        )}
      </button>
      <button
        className={`action-btn block-btn ${status.isBlocked ? "blocked" : ""}`}
        onClick={handleBlock}
        disabled={loading}
        title={status.isBlocked ? "Unblock" : "Block"}
      >
        {status.isBlocked ? (
          <>
            <FaUnlock /> Unblock
          </>
        ) : (
          <>
            <FaBan /> Block
          </>
        )}
      </button>
    </div>
  );
};

export default UserActions;
