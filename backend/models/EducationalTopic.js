import mongoose from "mongoose";

const educationalTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced", "Important"]
  },
  readTime: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String,
    trim: true
  }],
  links: [{
    label: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  icon: {
    type: String,
    required: true,
    trim: true
  },
  // New fields for enhanced functionality
  isTip: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true // Default true for admin-created content
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Analytics fields
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  searchQueries: [{
    query: String,
    count: { type: Number, default: 1 },
    lastSearched: { type: Date, default: Date.now }
  }],
  linkClicks: [{
    linkLabel: String,
    linkUrl: String,
    clicks: { type: Number, default: 0 },
    lastClicked: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
educationalTopicSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for analytics queries
educationalTopicSchema.index({ views: -1 });
educationalTopicSchema.index({ clicks: -1 });
educationalTopicSchema.index({ category: 1, views: -1 });

const EducationalTopic = mongoose.model("EducationalTopic", educationalTopicSchema);

export default EducationalTopic;
