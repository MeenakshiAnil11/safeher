import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import Bookmark from "../models/Bookmark.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";
import PostReaction from "../models/PostReaction.js";

// Helper function to extract mentions from text
const extractMentions = (text) => {
  if (!text) return [];
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)]; // Remove duplicates
};

// Helper function to find user IDs from usernames
const findMentionedUsers = async (mentions) => {
  if (!mentions || mentions.length === 0) return [];
  const users = await User.find({ 
    $or: [
      { name: { $in: mentions } },
      { email: { $in: mentions } }
    ]
  }).select("_id");
  return users.map((u) => u._id);
};

// GET /api/forum/posts - Get all posts with filters
export const getPosts = async (req, res) => {
  try {
    const {
      category,
      search,
      tags,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      query.tags = { $in: tagArray };
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === "trending") {
      // Trending: combination of upvotes, comments, and recency
      sortOptions.isPinned = -1; // Pinned posts first
      sortOptions.createdAt = -1;
    } else if (sortBy === "most-upvoted") {
      sortOptions.isPinned = -1;
      sortOptions.upvotes = -1;
    } else if (sortBy === "most-comments") {
      sortOptions.isPinned = -1;
      // We'll sort by comment count after aggregation
    } else {
      // Default: newest first
      sortOptions.isPinned = -1;
      sortOptions.createdAt = -1;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    let posts = await ForumPost.find(query)
      .populate("author", "name email")
      .populate("verifiedAnswer", "content author")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get comment counts for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post,
          commentCount,
          upvoteCount: post.upvotes?.length || 0,
          downvoteCount: post.downvotes?.length || 0,
        };
      })
    );

    // Sort by comment count if needed
    if (sortBy === "most-comments") {
      postsWithCounts.sort((a, b) => b.commentCount - a.commentCount);
    }

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts: postsWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

// GET /api/forum/posts/:id - Get single post with comments
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id)
      .populate("author", "name email role")
      .populate("verifiedAnswer")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    await ForumPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Get all comments with nested replies
    const comments = await Comment.find({ post: id, parentComment: null })
      .populate("author", "name email role")
      .sort({ createdAt: 1 })
      .lean();

    // Get nested replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "name email role")
          .sort({ createdAt: 1 })
          .lean();
        return {
          ...comment,
          replies,
          upvoteCount: comment.upvotes?.length || 0,
          downvoteCount: comment.downvotes?.length || 0,
        };
      })
    );

    // Check if user has bookmarked this post
    let isBookmarked = false;
    if (req.userId) {
      const bookmark = await Bookmark.findOne({ user: req.userId, post: id });
      isBookmarked = !!bookmark;
    }

    // Check if user has upvoted/downvoted
    let userVote = null;
    if (req.userId) {
      if (post.upvotes?.includes(req.userId)) {
        userVote = "upvote";
      } else if (post.downvotes?.includes(req.userId)) {
        userVote = "downvote";
      }
    }

    // Get reactions for the post
    let reactions = {};
    let userReaction = null;
    if (req.userId) {
      const PostReaction = (await import("../models/PostReaction.js")).default;
      const reactionData = await PostReaction.aggregate([
        { $match: { post: id } },
        { $group: { _id: "$reaction", count: { $sum: 1 }, users: { $push: "$user" } } },
      ]);
      
      reactionData.forEach((r) => {
        reactions[r._id] = r.count;
        if (r.users.some((u) => u.toString() === req.userId)) {
          userReaction = r._id;
        }
      });
    } else {
      const PostReaction = (await import("../models/PostReaction.js")).default;
      const reactionData = await PostReaction.aggregate([
        { $match: { post: id } },
        { $group: { _id: "$reaction", count: { $sum: 1 } } },
      ]);
      
      reactionData.forEach((r) => {
        reactions[r._id] = r.count;
      });
    }

    res.json({
      post: {
        ...post,
        upvoteCount: post.upvotes?.length || 0,
        downvoteCount: post.downvotes?.length || 0,
        commentCount: commentsWithReplies.length,
        isBookmarked,
        userVote,
        reactions,
        userReaction,
      },
      comments: commentsWithReplies,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};

// POST /api/forum/posts - Create new post
export const createPost = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Handle both JSON and FormData
    let { title, content, category, tags, isAnonymous, isQuestion, images } = req.body;
    
    // If tags is a string, parse it
    if (typeof tags === 'string') {
      tags = tags.split(",").map((t) => t.trim()).filter((t) => t);
    } else if (Array.isArray(tags)) {
      tags = tags.map((t) => typeof t === 'string' ? t.trim() : t).filter((t) => t);
    } else {
      tags = [];
    }

    // Handle images from file uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (images) {
      // If images are sent as JSON (existing URLs or from frontend)
      if (Array.isArray(images)) {
        imageUrls = images.filter(img => typeof img === 'string');
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) {
            imageUrls = parsed.filter(img => typeof img === 'string');
          }
        } catch (e) {
          // If not JSON, treat as single string
          imageUrls = [images];
        }
      }
    }

    if (!title || !content || !category) {
      return res.status(400).json({ message: "Title, content, and category are required" });
    }

    // Extract mentions from content
    const mentionUsernames = extractMentions(content);
    const mentionedUserIds = await findMentionedUsers(mentionUsernames);

    const post = new ForumPost({
      title: title.trim(),
      content: content.trim(),
      author: req.userId,
      category,
      tags,
      images: imageUrls,
      isAnonymous: isAnonymous === true || isAnonymous === "true" || isAnonymous === "1",
      isQuestion: isQuestion === true || isQuestion === "true" || isQuestion === "1",
      mentions: mentionedUserIds,
    });

    await post.save();
    await post.populate("author", "name email");
    await post.populate("mentions", "name email");

    // Notify mentioned users
    const author = await User.findById(req.userId);
    for (const mentionedUserId of mentionedUserIds) {
      if (mentionedUserId.toString() !== req.userId) {
        await createNotification({
          user: mentionedUserId,
          type: "mention",
          title: "You were mentioned",
          message: `${author.name} mentioned you in a post`,
          link: `/forum/posts/${post._id}`,
          relatedPost: post._id,
          relatedUser: req.userId,
        });
      }
    }

    res.status(201).json({
      message: "Post created successfully",
      post: {
        ...post.toObject(),
        upvoteCount: 0,
        downvoteCount: 0,
        commentCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

// PUT /api/forum/posts/:id - Update post (author only)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, category, tags, images, isSensitive } = req.body;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Handle images from file uploads
    let imageUrls = post.images || []; // Keep existing images by default
    if (req.files && req.files.length > 0) {
      // If new files are uploaded, add them to existing images
      const newImageUrls = req.files.map((file) => `/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
    } else if (images !== undefined) {
      // If images are provided in the request body
      if (Array.isArray(images)) {
        imageUrls = images.filter(img => typeof img === 'string');
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) {
            imageUrls = parsed.filter(img => typeof img === 'string');
          }
        } catch (e) {
          imageUrls = [images];
        }
      }
    }

    // Track edits
    const wasEdited = title !== post.title || content !== post.content;
    if (wasEdited) {
      post.editedAt = new Date();
      post.editCount = (post.editCount || 0) + 1;
    }

    if (title) post.title = title.trim();
    if (content) {
      post.content = content.trim();
      // Extract and update mentions
      const mentionUsernames = extractMentions(content);
      const mentionedUserIds = await findMentionedUsers(mentionUsernames);
      post.mentions = mentionedUserIds;
    }
    if (category) post.category = category;
    if (tags) {
      if (Array.isArray(tags)) {
        post.tags = tags.map((t) => typeof t === 'string' ? t.trim() : t).filter((t) => t);
      } else if (typeof tags === 'string') {
        post.tags = tags.split(",").map((t) => t.trim()).filter((t) => t);
      }
    }
    if (isSensitive !== undefined) post.isSensitive = isSensitive;
    post.images = imageUrls;

    await post.save();
    await post.populate("author", "name email");

    res.json({
      message: "Post updated successfully",
      post: {
        ...post.toObject(),
        upvoteCount: post.upvotes?.length || 0,
        downvoteCount: post.downvotes?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};

// DELETE /api/forum/posts/:id - Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete all comments
    await Comment.deleteMany({ post: id });

    // Delete all bookmarks
    await Bookmark.deleteMany({ post: id });

    // Delete all reports
    await Report.deleteMany({ post: id });

    // Delete post
    await ForumPost.findByIdAndDelete(id);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};

// POST /api/forum/posts/:id/upvote - Upvote post
export const upvotePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.userId;

    // Check if already upvoted
    if (post.upvotes.includes(userId)) {
      // Remove upvote
      post.upvotes = post.upvotes.filter((uid) => uid.toString() !== userId);
    } else {
      // Add upvote and remove downvote if exists
      post.upvotes.push(userId);
      post.downvotes = post.downvotes.filter((uid) => uid.toString() !== userId);
    }

    await post.save();

    res.json({
      message: "Upvote toggled",
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
    });
  } catch (error) {
    console.error("Error upvoting post:", error);
    res.status(500).json({ message: "Error upvoting post", error: error.message });
  }
};

// POST /api/forum/posts/:id/downvote - Downvote post
export const downvotePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.userId;

    // Check if already downvoted
    if (post.downvotes.includes(userId)) {
      // Remove downvote
      post.downvotes = post.downvotes.filter((uid) => uid.toString() !== userId);
    } else {
      // Add downvote and remove upvote if exists
      post.downvotes.push(userId);
      post.upvotes = post.upvotes.filter((uid) => uid.toString() !== userId);
    }

    await post.save();

    res.json({
      message: "Downvote toggled",
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
    });
  } catch (error) {
    console.error("Error downvoting post:", error);
    res.status(500).json({ message: "Error downvoting post", error: error.message });
  }
};

// POST /api/forum/posts/:id/bookmark - Bookmark post
export const bookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingBookmark = await Bookmark.findOne({ user: req.userId, post: id });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      res.json({ message: "Bookmark removed", isBookmarked: false });
    } else {
      // Add bookmark
      const bookmark = new Bookmark({ user: req.userId, post: id });
      await bookmark.save();
      res.json({ message: "Post bookmarked", isBookmarked: true });
    }
  } catch (error) {
    console.error("Error bookmarking post:", error);
    res.status(500).json({ message: "Error bookmarking post", error: error.message });
  }
};

// GET /api/forum/posts/my-posts - Get user's posts
export const getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await ForumPost.find({ author: req.userId })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post,
          commentCount,
          upvoteCount: post.upvotes?.length || 0,
          downvoteCount: post.downvotes?.length || 0,
        };
      })
    );

    const total = await ForumPost.countDocuments({ author: req.userId });

    res.json({
      posts: postsWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Error fetching user posts", error: error.message });
  }
};

// GET /api/forum/posts/bookmarked - Get bookmarked posts
export const getBookmarkedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const bookmarks = await Bookmark.find({ user: req.userId })
      .populate({
        path: "post",
        populate: { path: "author", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const posts = bookmarks
      .filter((b) => b.post)
      .map((b) => b.post)
      .map((post) => ({
        ...post,
        upvoteCount: post.upvotes?.length || 0,
        downvoteCount: post.downvotes?.length || 0,
      }));

    const total = await Bookmark.countDocuments({ user: req.userId });

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    res.status(500).json({ message: "Error fetching bookmarked posts", error: error.message });
  }
};

// GET /api/forum/posts/:postId/comments - Get all comments for post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("author", "name email role")
      .sort({ createdAt: 1 })
      .lean();

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "name email role")
          .sort({ createdAt: 1 })
          .lean();
        return {
          ...comment,
          replies,
          upvoteCount: comment.upvotes?.length || 0,
          downvoteCount: comment.downvotes?.length || 0,
        };
      })
    );

    res.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

// POST /api/forum/posts/:postId/comments - Add comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.isLocked) {
      return res.status(403).json({ message: "This thread is locked" });
    }

    // Check if user is expert
    const user = await User.findById(req.userId);
    const isExpert = user?.role === "admin" || user?.role === "expert";

    // Calculate depth and path for nested comments
    let depth = 0;
    let path = "";
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        depth = (parent.depth || 0) + 1;
        path = parent.path ? `${parent.path}.${parentComment}` : parentComment.toString();
      }
    }

    // Extract mentions
    const mentionUsernames = extractMentions(content);
    const mentionedUserIds = await findMentionedUsers(mentionUsernames);

    const comment = new Comment({
      post: postId,
      author: req.userId,
      content,
      parentComment: parentComment || null,
      isExpert,
      depth,
      path,
      mentions: mentionedUserIds,
    });

    await comment.save();
    await comment.populate("author", "name email role");
    await comment.populate("mentions", "name email");

    // Notify mentioned users
    for (const mentionedUserId of mentionedUserIds) {
      if (mentionedUserId.toString() !== req.userId) {
        await createNotification({
          user: mentionedUserId,
          type: "mention",
          title: "You were mentioned",
          message: `${user.name} mentioned you in a comment`,
          link: `/forum/posts/${postId}`,
          relatedPost: postId,
          relatedComment: comment._id,
          relatedUser: req.userId,
        });
      }
    }

    // Notify post author (if not the same user and not a reply to another comment)
    if (post.author.toString() !== req.userId && !parentComment) {
      await createNotification({
        user: post.author,
        type: "reply",
        title: "New Comment",
        message: `${user.name} commented on your post`,
        link: `/forum/posts/${postId}`,
        relatedPost: postId,
        relatedComment: comment._id,
        relatedUser: req.userId,
      });
    }

    // Notify parent comment author (if replying to a comment)
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent && parent.author.toString() !== req.userId) {
        await createNotification({
          user: parent.author,
          type: "comment_reply",
          title: "Reply to your comment",
          message: `${user.name} replied to your comment`,
          link: `/forum/posts/${postId}`,
          relatedPost: postId,
          relatedComment: comment._id,
          relatedUser: req.userId,
        });
      }
    }

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        ...comment.toObject(),
        upvoteCount: 0,
        downvoteCount: 0,
        replies: [],
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Error creating comment", error: error.message });
  }
};

// PUT /api/forum/comments/:id - Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    if (content) {
      comment.content = content;
      // Track edits
      comment.editedAt = new Date();
      comment.editCount = (comment.editCount || 0) + 1;
      // Update mentions
      const mentionUsernames = extractMentions(content);
      const mentionedUserIds = await findMentionedUsers(mentionUsernames);
      comment.mentions = mentionedUserIds;
    }

    await comment.save();
    await comment.populate("author", "name email role");

    res.json({
      message: "Comment updated successfully",
      comment: {
        ...comment.toObject(),
        upvoteCount: comment.upvotes?.length || 0,
        downvoteCount: comment.downvotes?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment", error: error.message });
  }
};

// DELETE /api/forum/comments/:id - Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.userId && req.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Delete all nested replies
    await Comment.deleteMany({ parentComment: id });

    // Delete comment
    await Comment.findByIdAndDelete(id);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

// POST /api/forum/comments/:id/upvote - Upvote comment
export const upvoteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.userId;

    if (comment.upvotes.includes(userId)) {
      comment.upvotes = comment.upvotes.filter((uid) => uid.toString() !== userId);
    } else {
      comment.upvotes.push(userId);
      comment.downvotes = comment.downvotes.filter((uid) => uid.toString() !== userId);
    }

    await comment.save();

    res.json({
      message: "Upvote toggled",
      upvoteCount: comment.upvotes.length,
      downvoteCount: comment.downvotes.length,
    });
  } catch (error) {
    console.error("Error upvoting comment:", error);
    res.status(500).json({ message: "Error upvoting comment", error: error.message });
  }
};

// POST /api/forum/comments/:id/verify - Mark as verified answer (expert/admin)
export const verifyComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is expert or admin
    const user = await User.findById(req.userId);
    if (user.role !== "admin" && user.role !== "expert") {
      return res.status(403).json({ message: "Only experts and admins can verify answers" });
    }

    const post = await ForumPost.findById(comment.post);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle verification
    if (comment.isVerifiedAnswer) {
      comment.isVerifiedAnswer = false;
      post.verifiedAnswer = null;
    } else {
      comment.isVerifiedAnswer = true;
      post.verifiedAnswer = comment._id;
    }

    await comment.save();
    await post.save();

    res.json({
      message: comment.isVerifiedAnswer ? "Answer verified" : "Verification removed",
      comment: {
        ...comment.toObject(),
        isVerifiedAnswer: comment.isVerifiedAnswer,
      },
    });
  } catch (error) {
    console.error("Error verifying comment:", error);
    res.status(500).json({ message: "Error verifying comment", error: error.message });
  }
};

// POST /api/forum/posts/:id/pin - Pin post (admin)
export const pinPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      message: post.isPinned ? "Post pinned" : "Post unpinned",
      post: {
        ...post.toObject(),
        isPinned: post.isPinned,
      },
    });
  } catch (error) {
    console.error("Error pinning post:", error);
    res.status(500).json({ message: "Error pinning post", error: error.message });
  }
};

// POST /api/forum/posts/:id/lock - Lock thread (admin)
export const lockPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({
      message: post.isLocked ? "Thread locked" : "Thread unlocked",
      post: {
        ...post.toObject(),
        isLocked: post.isLocked,
      },
    });
  } catch (error) {
    console.error("Error locking post:", error);
    res.status(500).json({ message: "Error locking post", error: error.message });
  }
};

// POST /api/forum/report - Report post/comment
export const reportContent = async (req, res) => {
  try {
    const { post, comment, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    if (!post && !comment) {
      return res.status(400).json({ message: "Either post or comment must be provided" });
    }

    const report = new Report({
      reportedBy: req.userId,
      post: post || null,
      comment: comment || null,
      reason,
      description: description || "",
    });

    await report.save();

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Error reporting content:", error);
    res.status(500).json({ message: "Error reporting content", error: error.message });
  }
};

// GET /api/forum/reports - Get all reports (admin)
export const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const skip = (Number(page) - 1) * Number(limit);

    const reports = await Report.find(query)
      .populate("reportedBy", "name email")
      .populate("post", "title")
      .populate("comment", "content")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// PUT /api/forum/reports/:id/resolve - Resolve report (admin)
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status || "resolved";
    report.reviewedBy = req.userId;
    report.reviewedAt = new Date();

    await report.save();

    // Optional: Take action on reported content
    if (action === "delete" && report.post) {
      await ForumPost.findByIdAndDelete(report.post);
    } else if (action === "delete" && report.comment) {
      await Comment.findByIdAndDelete(report.comment);
    }

    res.json({
      message: "Report resolved",
      report,
    });
  } catch (error) {
    console.error("Error resolving report:", error);
    res.status(500).json({ message: "Error resolving report", error: error.message });
  }
};

// GET /api/forum/search?q=keyword - Search posts
export const searchPosts = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      author, 
      tags, 
      startDate, 
      endDate,
      searchInComments,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Author filter
    if (author) {
      const authorUser = await User.findOne({ 
        $or: [
          { name: { $regex: author, $options: "i" } },
          { email: { $regex: author, $options: "i" } }
        ]
      });
      if (authorUser) {
        query.author = authorUser._id;
      } else {
        // Return empty if author not found
        return res.json({
          posts: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        });
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      query.tags = { $in: tagArray };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search in comments if requested
    let postIds = null;
    if (searchInComments === "true" && q) {
      const comments = await Comment.find({ 
        content: { $regex: q, $options: "i" } 
      }).distinct("post");
      postIds = comments;
      if (postIds.length === 0) {
        return res.json({
          posts: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        });
      }
      query._id = { $in: postIds };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let posts = await ForumPost.find(query)
      .populate("author", "name email")
      .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post,
          commentCount,
          upvoteCount: post.upvotes?.length || 0,
          downvoteCount: post.downvotes?.length || 0,
        };
      })
    );

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts: postsWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "Error searching posts", error: error.message });
  }
};

// GET /api/forum/categories - Get all categories with post counts
export const getCategories = async (req, res) => {
  try {
    const categories = [
      "period-cycle-health",
      "pregnancy-conception",
      "perimenopause-menopause",
      "mental-health-wellness",
      "general-health-questions",
      "product-reviews-recommendations",
      "anonymous-support",
    ];

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await ForumPost.countDocuments({ category });
        return {
          category,
          count,
        };
      })
    );

    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// GET /api/forum/trending - Get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get posts from last 7 days, sorted by engagement
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await ForumPost.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate("author", "name email")
      .lean();

    // Calculate trending score: (upvotes * 2) + comments - downvotes
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        const upvoteCount = post.upvotes?.length || 0;
        const downvoteCount = post.downvotes?.length || 0;
        const trendingScore = upvoteCount * 2 + commentCount - downvoteCount;

        return {
          ...post,
          commentCount,
          upvoteCount,
          downvoteCount,
          trendingScore,
        };
      })
    );

    // Sort by trending score
    postsWithScores.sort((a, b) => b.trendingScore - a.trendingScore);

    res.json({
      posts: postsWithScores.slice(0, Number(limit)),
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    res.status(500).json({ message: "Error fetching trending posts", error: error.message });
  }
};

// ========== ADMIN ONLY ROUTES ==========

// GET /api/forum/admin/stats - Get forum statistics (admin)
export const getForumStats = async (req, res) => {
  try {
    const totalPosts = await ForumPost.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    
    // Posts by category
    const postsByCategory = await ForumPost.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentPosts = await ForumPost.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentComments = await Comment.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Top users by posts
    const topUsers = await ForumPost.aggregate([
      {
        $group: {
          _id: "$author",
          postCount: { $sum: 1 }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          postCount: 1
        }
      }
    ]);

    res.json({
      stats: {
        totalPosts,
        totalComments,
        totalReports,
        pendingReports,
        recentPosts,
        recentComments,
        postsByCategory,
        topUsers
      }
    });
  } catch (error) {
    console.error("Error fetching forum stats:", error);
    res.status(500).json({ message: "Error fetching forum stats", error: error.message });
  }
};

// GET /api/forum/admin/posts - Get all posts (admin with filters)
export const getAllPostsAdmin = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      author, 
      isPinned, 
      isLocked,
      page = 1, 
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (author) query.author = author;
    if (isPinned !== undefined) query.isPinned = isPinned === "true";
    if (isLocked !== undefined) query.isLocked = isLocked === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const posts = await ForumPost.find(query)
      .populate("author", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        const reportCount = await Report.countDocuments({ post: post._id, status: "pending" });
        return {
          ...post,
          commentCount,
          reportCount,
          upvoteCount: post.upvotes?.length || 0,
          downvoteCount: post.downvotes?.length || 0,
        };
      })
    );

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts: postsWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

// GET /api/forum/admin/comments - Get all comments (admin with filters)
export const getAllCommentsAdmin = async (req, res) => {
  try {
    const { 
      post, 
      author, 
      search,
      page = 1, 
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query = {};
    
    if (post) query.post = post;
    if (author) query.author = author;
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const comments = await Comment.find(query)
      .populate("author", "name email role")
      .populate("post", "title")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const commentsWithCounts = await Promise.all(
      comments.map(async (comment) => {
        const reportCount = await Report.countDocuments({ comment: comment._id, status: "pending" });
        const replyCount = await Comment.countDocuments({ parentComment: comment._id });
        return {
          ...comment,
          reportCount,
          replyCount,
          upvoteCount: comment.upvotes?.length || 0,
          downvoteCount: comment.downvotes?.length || 0,
        };
      })
    );

    const total = await Comment.countDocuments(query);

    res.json({
      comments: commentsWithCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching admin comments:", error);
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

// POST /api/forum/admin/posts/bulk-delete - Bulk delete posts (admin)
export const bulkDeletePosts = async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ message: "Post IDs array is required" });
    }

    // Delete all comments for these posts
    await Comment.deleteMany({ post: { $in: postIds } });
    
    // Delete all bookmarks
    await Bookmark.deleteMany({ post: { $in: postIds } });
    
    // Delete all reports
    await Report.deleteMany({ post: { $in: postIds } });

    // Delete posts
    const result = await ForumPost.deleteMany({ _id: { $in: postIds } });

    res.json({
      message: `${result.deletedCount} posts deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting posts:", error);
    res.status(500).json({ message: "Error deleting posts", error: error.message });
  }
};

// POST /api/forum/admin/comments/bulk-delete - Bulk delete comments (admin)
export const bulkDeleteComments = async (req, res) => {
  try {
    const { commentIds } = req.body;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ message: "Comment IDs array is required" });
    }

    // Delete all nested replies
    await Comment.deleteMany({ parentComment: { $in: commentIds } });
    
    // Delete all reports
    await Report.deleteMany({ comment: { $in: commentIds } });

    // Delete comments
    const result = await Comment.deleteMany({ _id: { $in: commentIds } });

    res.json({
      message: `${result.deletedCount} comments deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting comments:", error);
    res.status(500).json({ message: "Error deleting comments", error: error.message });
  }
};

// GET /api/forum/admin/users/:userId/activity - Get user forum activity (admin)
export const getUserForumActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const userPosts = await ForumPost.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const userComments = await Comment.find({ author: userId })
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const postCount = await ForumPost.countDocuments({ author: userId });
    const commentCount = await Comment.countDocuments({ author: userId });
    
    const reportsAgainstUser = await Report.countDocuments({
      $or: [
        { post: { $in: userPosts.map(p => p._id) } },
        { comment: { $in: userComments.map(c => c._id) } }
      ]
    });

    res.json({
      user: userId,
      stats: {
        postCount,
        commentCount,
        reportsAgainstUser,
      },
      recentPosts: userPosts,
      recentComments: userComments,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ message: "Error fetching user activity", error: error.message });
  }
};
