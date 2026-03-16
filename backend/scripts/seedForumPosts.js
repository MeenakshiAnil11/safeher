import mongoose from "mongoose";
import dotenv from "dotenv";
import ForumPost from "../models/ForumPost.js";
import User from "../models/User.js";

dotenv.config();

const samplePosts = [
  {
    title: "Best menstrual cup recommendations?",
    content: "Hi everyone! I'm looking to switch to a menstrual cup and would love some recommendations. I'm 25 years old and have a moderate flow. What brands have worked well for you? Any tips for first-time users?",
    category: "product-reviews-recommendations",
    tags: ["menstrual cup", "period products", "eco-friendly"],
    isAnonymous: false,
    isQuestion: true,
    views: 45,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Pregnancy symptoms at 6 weeks",
    content: "I'm 6 weeks pregnant and experiencing morning sickness and fatigue. Is this normal? When should I expect these symptoms to peak? Any tips for managing them?",
    category: "pregnancy-conception",
    tags: ["pregnancy", "first trimester", "morning sickness"],
    isAnonymous: true,
    isQuestion: true,
    views: 78,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Hot flashes and night sweats - perimenopause?",
    content: "I'm 48 years old and have been experiencing hot flashes and night sweats for the past few months. My periods are also becoming irregular. Could this be perimenopause? Should I see a doctor?",
    category: "perimenopause-menopause",
    tags: ["perimenopause", "hot flashes", "menopause symptoms"],
    isAnonymous: false,
    isQuestion: true,
    views: 92,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Anxiety during PMS - how do you cope?",
    content: "I've noticed that my anxiety levels spike significantly during the week before my period. Does anyone else experience this? What coping strategies have helped you? I'm considering talking to my doctor about it.",
    category: "mental-health-wellness",
    tags: ["PMS", "anxiety", "mental health", "self-care"],
    isAnonymous: false,
    isQuestion: true,
    views: 134,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Review: Organic cotton pads vs regular pads",
    content: "I recently switched to organic cotton pads and wanted to share my experience. The comfort level is significantly better, and I've noticed less irritation. However, they are more expensive. Has anyone else tried them? What are your thoughts?",
    category: "product-reviews-recommendations",
    tags: ["organic pads", "period products", "product review"],
    isAnonymous: false,
    isQuestion: false,
    views: 67,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Heavy bleeding - when to worry?",
    content: "I've been experiencing heavier than usual bleeding for the past two cycles. I'm going through a pad every 2 hours on heavy days. Is this something I should be concerned about? When should I see a doctor?",
    category: "general-health-questions",
    tags: ["heavy bleeding", "menstrual health", "medical advice"],
    isAnonymous: true,
    isQuestion: true,
    views: 156,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Trying to conceive - tracking ovulation",
    content: "My partner and I have been trying to conceive for 6 months. I've been tracking my ovulation using an app, but I'm not sure if I'm doing it correctly. Any advice on the best methods for tracking ovulation?",
    category: "pregnancy-conception",
    tags: ["trying to conceive", "ovulation", "fertility"],
    isAnonymous: false,
    isQuestion: true,
    views: 203,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Menopause and weight gain - struggling",
    content: "I'm 52 and have been in menopause for about 2 years. I've gained 15 pounds despite not changing my diet or exercise routine. Is this normal? How have others managed weight during menopause?",
    category: "perimenopause-menopause",
    tags: ["menopause", "weight gain", "health"],
    isAnonymous: false,
    isQuestion: true,
    views: 189,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Self-care tips for period week",
    content: "I wanted to share some self-care practices that have really helped me during my period. Taking warm baths, using a heating pad, staying hydrated, and gentle yoga have made a huge difference. What works for you?",
    category: "mental-health-wellness",
    tags: ["self-care", "period", "wellness", "tips"],
    isAnonymous: false,
    isQuestion: false,
    views: 112,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Irregular periods after stopping birth control",
    content: "I stopped taking birth control pills 3 months ago and my periods have been very irregular since then. Is this normal? How long does it typically take for cycles to regulate?",
    category: "period-cycle-health",
    tags: ["irregular periods", "birth control", "cycle health"],
    isAnonymous: true,
    isQuestion: true,
    views: 145,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Best pregnancy-safe skincare products?",
    content: "I'm 12 weeks pregnant and want to update my skincare routine to ensure all products are pregnancy-safe. Any recommendations for cleansers, moisturizers, and sunscreens?",
    category: "pregnancy-conception",
    tags: ["pregnancy", "skincare", "product recommendations"],
    isAnonymous: false,
    isQuestion: true,
    views: 98,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Support group for perimenopause",
    content: "Is anyone else going through perimenopause and feeling isolated? I'd love to connect with others who understand what I'm going through. This journey can be challenging, and it helps to know we're not alone.",
    category: "anonymous-support",
    tags: ["perimenopause", "support", "community"],
    isAnonymous: true,
    isQuestion: false,
    views: 76,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Period tracking apps - which one is best?",
    content: "I'm looking for a good period tracking app. I want one that tracks symptoms, predicts my cycle, and is user-friendly. What apps have you tried and which would you recommend?",
    category: "product-reviews-recommendations",
    tags: ["period tracking", "apps", "technology"],
    isAnonymous: false,
    isQuestion: true,
    views: 167,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Severe cramps - what helps?",
    content: "I've been experiencing severe menstrual cramps that are affecting my daily activities. Over-the-counter pain relievers help a bit, but I'm looking for other solutions. Has anyone found relief through diet changes, exercise, or other methods?",
    category: "period-cycle-health",
    tags: ["cramps", "pain relief", "menstrual health"],
    isAnonymous: false,
    isQuestion: true,
    views: 234,
    upvotes: [],
    downvotes: [],
  },
  {
    title: "Postpartum recovery - what to expect",
    content: "I'm 2 weeks postpartum and wondering what's normal for recovery. I'm still experiencing some bleeding and discomfort. How long does postpartum recovery typically take? When should I be concerned?",
    category: "pregnancy-conception",
    tags: ["postpartum", "recovery", "new mom"],
    isAnonymous: true,
    isQuestion: true,
    views: 178,
    upvotes: [],
    downvotes: [],
  },
];

const seedForumPosts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/womenshealth");
    console.log("Connected to MongoDB");

    // Get all users (we'll assign posts to different users)
    const users = await User.find({ role: { $ne: "admin" } }).select("_id");
    
    if (users.length === 0) {
      console.log("No users found. Please create some users first.");
      process.exit(1);
    }

    console.log(`Found ${users.length} users`);

    // Clear existing posts (optional - comment out if you want to keep existing posts)
    // await ForumPost.deleteMany({});
    // console.log("Cleared existing forum posts");

    // Create posts with different authors
    const posts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const author = users[i % users.length]; // Distribute posts among users
      
      // Add some upvotes from other users
      const upvoteCount = Math.floor(Math.random() * 8); // 0-7 upvotes
      const upvoters = [];
      for (let j = 0; j < upvoteCount && j < users.length - 1; j++) {
        const upvoter = users[(i + j + 1) % users.length];
        if (upvoter._id.toString() !== author._id.toString()) {
          upvoters.push(upvoter._id);
        }
      }

      // Set createdAt to different times (some older, some newer)
      const daysAgo = Math.floor(Math.random() * 30); // Posts from last 30 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const post = new ForumPost({
        ...postData,
        author: author._id,
        upvotes: upvoters,
        createdAt,
        updatedAt: createdAt,
      });

      await post.save();
      posts.push(post);
      console.log(`Created post: "${post.title}" by user ${author._id}`);
    }

    console.log(`\n✅ Successfully created ${posts.length} forum posts!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding forum posts:", error);
    process.exit(1);
  }
};

seedForumPosts();
