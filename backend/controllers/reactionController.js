import PostReaction from "../models/PostReaction.js";
import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import { createNotification } from "./notificationController.js";

// POST /api/forum/posts/:id/reactions - Add/update reaction
export const addPostReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const userId = req.userId;

    if (!reaction || !["👍", "❤️", "😂", "😮", "😢", "🙏"].includes(reaction)) {
      return res.status(400).json({ message: "Invalid reaction" });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove existing reaction from this user
    await PostReaction.findOneAndDelete({ post: id, user: userId });

    // Add new reaction
    const postReaction = new PostReaction({
      post: id,
      user: userId,
      reaction,
    });
    await postReaction.save();

    // Update post reactions count
    const reactions = await PostReaction.aggregate([
      { $match: { post: id } },
      { $group: { _id: "$reaction", count: { $sum: 1 } } },
    ]);

    const reactionMap = {};
    reactions.forEach((r) => {
      reactionMap[r._id] = r.count;
    });

    post.reactions = reactionMap;
    await post.save();

    // Notify post author (if not the same user)
    if (post.author.toString() !== userId) {
      await createNotification({
        user: post.author,
        type: "upvote",
        title: "New Reaction",
        message: `Someone reacted ${reaction} to your post`,
        link: `/forum/posts/${id}`,
        relatedPost: id,
        relatedUser: userId,
      });
    }

    res.json({
      message: "Reaction added",
      reactions: reactionMap,
      userReaction: reaction,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Error adding reaction", error: error.message });
  }
};

// DELETE /api/forum/posts/:id/reactions - Remove reaction
export const removePostReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await PostReaction.findOneAndDelete({ post: id, user: userId });

    // Update post reactions count
    const post = await ForumPost.findById(id);
    const reactions = await PostReaction.aggregate([
      { $match: { post: id } },
      { $group: { _id: "$reaction", count: { $sum: 1 } } },
    ]);

    const reactionMap = {};
    reactions.forEach((r) => {
      reactionMap[r._id] = r.count;
    });

    post.reactions = reactionMap;
    await post.save();

    res.json({
      message: "Reaction removed",
      reactions: reactionMap,
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({ message: "Error removing reaction", error: error.message });
  }
};

// GET /api/forum/posts/:id/reactions - Get reactions for a post
export const getPostReactions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reactions = await PostReaction.aggregate([
      { $match: { post: id } },
      { $group: { _id: "$reaction", count: { $sum: 1 }, users: { $push: "$user" } } },
    ]);

    const reactionMap = {};
    let userReaction = null;

    reactions.forEach((r) => {
      reactionMap[r._id] = r.count;
      if (userId && r.users.some((u) => u.toString() === userId)) {
        userReaction = r._id;
      }
    });

    res.json({
      reactions: reactionMap,
      userReaction,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    res.status(500).json({ message: "Error fetching reactions", error: error.message });
  }
};
