
import EducationalTopic from "../models/EducationalTopic.js";
import Category from "../models/Category.js";

// -------------------- TOPICS CRUD --------------------

// Get all topics with filtering options
export const getTopics = async (req, res) => {
  try {
    const { category, difficulty, isTip, approvalStatus, search } = req.query;
    let query = {};

    // For public access, only show approved content
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      query.isApproved = true;
    }

    // Apply filters
    if (category && category !== 'All') query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isTip !== undefined) query.isTip = isTip === 'true';
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const topics = await EducationalTopic.find(query)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single topic
export const getTopic = async (req, res) => {
  try {
    const topic = await EducationalTopic.findById(req.params.id)
      .populate('submittedBy', 'name email');

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new topic
export const createTopic = async (req, res) => {
  try {
    const {
      title, category, difficulty, readTime, content, keyPoints, links, icon,
      isTip, isApproved, approvalStatus, submittedBy, rejectionReason
    } = req.body;

    // Validate required fields
    if (!title || !category || !difficulty || !readTime || !content || !icon) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newTopic = new EducationalTopic({
      title,
      category,
      difficulty,
      readTime,
      content,
      keyPoints: keyPoints || [],
      links: links || [],
      icon,
      isTip: isTip || false,
      isApproved: isApproved !== undefined ? isApproved : true,
      approvalStatus: approvalStatus || 'approved',
      submittedBy,
      rejectionReason
    });

    const savedTopic = await newTopic.save();
    const populatedTopic = await EducationalTopic.findById(savedTopic._id)
      .populate('submittedBy', 'name email');

    res.status(201).json(populatedTopic);
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update topic
export const updateTopic = async (req, res) => {
  try {
    const {
      title, category, difficulty, readTime, content, keyPoints, links, icon,
      isTip, isApproved, approvalStatus, rejectionReason
    } = req.body;

    const updatedTopic = await EducationalTopic.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        difficulty,
        readTime,
        content,
        keyPoints: keyPoints || [],
        links: links || [],
        icon,
        isTip,
        isApproved,
        approvalStatus,
        rejectionReason,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name email');

    if (!updatedTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete topic
export const deleteTopic = async (req, res) => {
  try {
    const deletedTopic = await EducationalTopic.findByIdAndDelete(req.params.id);

    if (!deletedTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- TIPS MANAGEMENT --------------------

// Get all tips
export const getTips = async (req, res) => {
  try {
    const tips = await EducationalTopic.find({ isTip: true, isApproved: true })
      .sort({ createdAt: -1 });
    res.json(tips);
  } catch (error) {
    console.error("Error fetching tips:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new tip
export const createTip = async (req, res) => {
  try {
    const { title, content, category, icon } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newTip = new EducationalTopic({
      title,
      category: category || "General",
      difficulty: "Important",
      readTime: "1 min read",
      content,
      keyPoints: [],
      links: [],
      icon: icon || "💡",
      isTip: true,
      isApproved: true,
      approvalStatus: 'approved'
    });

    const savedTip = await newTip.save();
    res.status(201).json(savedTip);
  } catch (error) {
    console.error("Error creating tip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update tip
export const updateTip = async (req, res) => {
  try {
    const { title, content, category, icon } = req.body;

    const updatedTip = await EducationalTopic.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        icon,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedTip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    res.json(updatedTip);
  } catch (error) {
    console.error("Error updating tip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete tip
export const deleteTip = async (req, res) => {
  try {
    const deletedTip = await EducationalTopic.findByIdAndDelete(req.params.id);

    if (!deletedTip) {
      return res.status(404).json({ message: "Tip not found" });
    }

    res.json({ message: "Tip deleted successfully" });
  } catch (error) {
    console.error("Error deleting tip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- ANALYTICS & ENGAGEMENT --------------------

// Track topic view
export const trackTopicView = async (req, res) => {
  try {
    const topic = await EducationalTopic.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json({ message: "View tracked successfully" });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Track topic click
export const trackTopicClick = async (req, res) => {
  try {
    const topic = await EducationalTopic.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json({ message: "Click tracked successfully" });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Track search query
export const trackSearchQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Update search query analytics for all topics (or create a global search log)
    // For now, we'll just acknowledge the search
    res.json({ message: "Search query tracked successfully" });
  } catch (error) {
    console.error("Error tracking search query:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Track link click
export const trackLinkClick = async (req, res) => {
  try {
    const { linkLabel, linkUrl } = req.body;

    const topic = await EducationalTopic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Find or create link click record
    const linkIndex = topic.linkClicks.findIndex(
      link => link.linkLabel === linkLabel && link.linkUrl === linkUrl
    );

    if (linkIndex > -1) {
      topic.linkClicks[linkIndex].clicks += 1;
      topic.linkClicks[linkIndex].lastClicked = new Date();
    } else {
      topic.linkClicks.push({
        linkLabel,
        linkUrl,
        clicks: 1,
        lastClicked: new Date()
      });
    }

    await topic.save();
    res.json({ message: "Link click tracked successfully" });
  } catch (error) {
    console.error("Error tracking link click:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const { type } = req.query;

    let analytics = {};

    switch (type) {
      case 'most-read':
        analytics.mostReadTopics = await EducationalTopic.find({ isApproved: true })
          .sort({ views: -1 })
          .limit(10)
          .select('title category views clicks');
        break;

      case 'category-engagement':
        const categoryStats = await EducationalTopic.aggregate([
          { $match: { isApproved: true } },
          {
            $group: {
              _id: '$category',
              totalViews: { $sum: '$views' },
              totalClicks: { $sum: '$clicks' },
              topicCount: { $sum: 1 }
            }
          },
          { $sort: { totalViews: -1 } }
        ]);
        analytics.categoryEngagement = categoryStats;
        break;

      case 'search-trends':
        // Aggregate search queries across all topics
        const searchTrends = await EducationalTopic.aggregate([
          { $unwind: '$searchQueries' },
          {
            $group: {
              _id: '$searchQueries.query',
              totalSearches: { $sum: '$searchQueries.count' },
              lastSearched: { $max: '$searchQueries.lastSearched' }
            }
          },
          { $sort: { totalSearches: -1 } },
          { $limit: 20 }
        ]);
        analytics.searchTrends = searchTrends;
        break;

      default:
        // Get overall stats
        const totalTopics = await EducationalTopic.countDocuments({ isApproved: true });
        const totalTips = await EducationalTopic.countDocuments({ isTip: true, isApproved: true });
        const totalViews = await EducationalTopic.aggregate([
          { $match: { isApproved: true } },
          { $group: { _id: null, total: { $sum: '$views' } } }
        ]);
        const totalClicks = await EducationalTopic.aggregate([
          { $match: { isApproved: true } },
          { $group: { _id: null, total: { $sum: '$clicks' } } }
        ]);

        analytics.overview = {
          totalTopics,
          totalTips,
          totalViews: totalViews[0]?.total || 0,
          totalClicks: totalClicks[0]?.total || 0
        };
    }

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CONTENT APPROVAL & MODERATION --------------------

// Get pending approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingTopics = await EducationalTopic.find({
      approvalStatus: 'pending'
    }).populate('submittedBy', 'name email').sort({ createdAt: -1 });

    res.json(pendingTopics);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve topic
export const approveTopic = async (req, res) => {
  try {
    const topic = await EducationalTopic.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvalStatus: 'approved',
        rejectionReason: null,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('submittedBy', 'name email');

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(topic);
  } catch (error) {
    console.error("Error approving topic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject topic
export const rejectTopic = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const topic = await EducationalTopic.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        approvalStatus: 'rejected',
        rejectionReason,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('submittedBy', 'name email');

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json(topic);
  } catch (error) {
    console.error("Error rejecting topic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit user content for approval
export const submitUserContent = async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming auth middleware sets req.user
    const {
      title, category, difficulty, readTime, content, keyPoints, links, icon, isTip
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newTopic = new EducationalTopic({
      title,
      category: category || "General",
      difficulty: difficulty || "Beginner",
      readTime: readTime || "5 min read",
      content,
      keyPoints: keyPoints || [],
      links: links || [],
      icon: icon || "📚",
      isTip: isTip || false,
      isApproved: false,
      approvalStatus: 'pending',
      submittedBy: userId
    });

    const savedTopic = await newTopic.save();
    const populatedTopic = await EducationalTopic.findById(savedTopic._id)
      .populate('submittedBy', 'name email');

    res.status(201).json(populatedTopic);
  } catch (error) {
    console.error("Error submitting user content:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CATEGORIES CRUD --------------------

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const newCategory = new Category({
      name,
      description: description || ""
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    // Check if category is being used by any topics
    const topicsUsingCategory = await EducationalTopic.countDocuments({ category: req.params.id });
    if (topicsUsingCategory > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is being used by topics"
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
