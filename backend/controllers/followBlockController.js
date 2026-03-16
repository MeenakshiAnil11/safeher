import UserFollow from "../models/UserFollow.js";
import UserBlock from "../models/UserBlock.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// POST /api/forum/follow/:userId - Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    if (userId === followerId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    const existingFollow = await UserFollow.findOne({ follower: followerId, following: userId });
    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    const follow = new UserFollow({
      follower: followerId,
      following: userId,
    });
    await follow.save();

    // Notify the user being followed
    await createNotification({
      user: userId,
      type: "new_follower",
      title: "New Follower",
      message: "Someone started following you",
      link: `/forum/users/${followerId}`,
      relatedUser: followerId,
    });

    res.json({ message: "User followed successfully", following: true });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Error following user", error: error.message });
  }
};

// DELETE /api/forum/follow/:userId - Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.userId;

    const follow = await UserFollow.findOneAndDelete({ follower: followerId, following: userId });
    if (!follow) {
      return res.status(404).json({ message: "Not following this user" });
    }

    res.json({ message: "User unfollowed successfully", following: false });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Error unfollowing user", error: error.message });
  }
};

// GET /api/forum/following - Get users I'm following
export const getFollowing = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const follows = await UserFollow.find({ follower: userId })
      .populate("following", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await UserFollow.countDocuments({ follower: userId });

    res.json({
      following: follows.map((f) => f.following),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Error fetching following", error: error.message });
  }
};

// GET /api/forum/followers - Get my followers
export const getFollowers = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const follows = await UserFollow.find({ following: userId })
      .populate("follower", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await UserFollow.countDocuments({ following: userId });

    res.json({
      followers: follows.map((f) => f.follower),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Error fetching followers", error: error.message });
  }
};

// POST /api/forum/block/:userId - Block a user
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.userId;
    const { reason = "other" } = req.body;

    if (userId === blockerId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    // Check if already blocked
    const existingBlock = await UserBlock.findOne({ blocker: blockerId, blocked: userId });
    if (existingBlock) {
      return res.status(400).json({ message: "User already blocked" });
    }

    // Unfollow if following
    await UserFollow.findOneAndDelete({ follower: blockerId, following: userId });

    const block = new UserBlock({
      blocker: blockerId,
      blocked: userId,
      reason,
    });
    await block.save();

    res.json({ message: "User blocked successfully", blocked: true });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: "Error blocking user", error: error.message });
  }
};

// DELETE /api/forum/block/:userId - Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.userId;

    const block = await UserBlock.findOneAndDelete({ blocker: blockerId, blocked: userId });
    if (!block) {
      return res.status(404).json({ message: "User not blocked" });
    }

    res.json({ message: "User unblocked successfully", blocked: false });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ message: "Error unblocking user", error: error.message });
  }
};

// GET /api/forum/blocked - Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const blocks = await UserBlock.find({ blocker: userId })
      .populate("blocked", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      blocked: blocks.map((b) => ({
        user: b.blocked,
        reason: b.reason,
        blockedAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    res.status(500).json({ message: "Error fetching blocked users", error: error.message });
  }
};

// GET /api/forum/users/:userId/status - Get follow/block status
export const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const isFollowing = await UserFollow.findOne({ follower: currentUserId, following: userId });
    const isBlocked = await UserBlock.findOne({ blocker: currentUserId, blocked: userId });
    const isBlockedBy = await UserBlock.findOne({ blocker: userId, blocked: currentUserId });

    res.json({
      isFollowing: !!isFollowing,
      isBlocked: !!isBlocked,
      isBlockedBy: !!isBlockedBy,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({ message: "Error fetching user status", error: error.message });
  }
};
