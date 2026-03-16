// backend/controllers/weeklyMessageController.js
import WeeklyMessage from "../models/WeeklyMessage.js";

// Get current pregnancy week for user
export const getCurrentWeek = async (req, res) => {
  try {
    // In a real app, this would calculate based on user's pregnancy data
    // For demo purposes, we'll return a default week
    const currentWeek = 20; // This would be calculated from user's pregnancy start date
    
    res.json({ success: true, currentWeek });
  } catch (error) {
    console.error("Get current week error:", error);
    res.status(500).json({ success: false, message: "Failed to get current week" });
  }
};

// Get weekly message by week
export const getWeeklyMessage = async (req, res) => {
  try {
    const { week } = req.query;
    
    if (!week || isNaN(week) || week < 1 || week > 40) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid week number (1-40) is required" 
      });
    }

    let message = await WeeklyMessage.findOne({ 
      week: parseInt(week), 
      isActive: true 
    });

    if (!message) {
      // Generate default message if not found in database
      message = generateDefaultMessage(parseInt(week));
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error("Get weekly message error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch weekly message" });
  }
};

// Create or update weekly message (admin function)
export const createWeeklyMessage = async (req, res) => {
  try {
    const { week, trimester, title, message, emoji, tip, color } = req.body;

    const weeklyMessage = await WeeklyMessage.findOneAndUpdate(
      { week },
      {
        week,
        trimester,
        title,
        message,
        emoji,
        tip,
        color,
        isActive: true
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: weeklyMessage });
  } catch (error) {
    console.error("Create weekly message error:", error);
    res.status(500).json({ success: false, message: "Failed to create weekly message" });
  }
};

// Get all weekly messages
export const getAllWeeklyMessages = async (req, res) => {
  try {
    const messages = await WeeklyMessage.find({ isActive: true })
      .sort({ week: 1 })
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Get all weekly messages error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch weekly messages" });
  }
};

// Generate default message for a given week
function generateDefaultMessage(week) {
  const messages = {
    1: {
      week: 1,
      trimester: "first",
      title: "Welcome to Your Journey!",
      message: "Congratulations on beginning this beautiful journey! Your body is already working miracles to nurture new life. Take time to rest and listen to what your body needs.",
      emoji: "🌟",
      color: "from-pink-400 to-rose-400",
      tip: "Start taking prenatal vitamins and schedule your first prenatal appointment."
    },
    2: {
      week: 2,
      trimester: "first",
      title: "Early Changes",
      message: "You might start noticing subtle changes in your body. Trust the process and be gentle with yourself during this incredible transformation.",
      emoji: "🌱",
      color: "from-green-400 to-emerald-400",
      tip: "Stay hydrated and eat small, frequent meals to help with any nausea."
    },
    3: {
      week: 3,
      trimester: "first",
      title: "Growing Strong",
      message: "Your baby's major organs are forming rapidly. This is a critical time for development, so prioritize your health and well-being.",
      emoji: "💪",
      color: "from-blue-400 to-cyan-400",
      tip: "Avoid alcohol, smoking, and limit caffeine to support healthy development."
    },
    12: {
      week: 12,
      trimester: "first",
      title: "End of First Trimester",
      message: "You've reached a major milestone! The risk of miscarriage significantly decreases, and you might start feeling more energetic soon.",
      emoji: "🎉",
      color: "from-purple-400 to-indigo-400",
      tip: "Consider sharing your news with family and friends if you haven't already."
    },
    20: {
      week: 20,
      trimester: "second",
      title: "Halfway There!",
      message: "You're halfway through your pregnancy! Your baby is growing stronger every day, and you might start feeling those precious first kicks.",
      emoji: "👶",
      color: "from-yellow-400 to-orange-400",
      tip: "Start thinking about baby names and begin planning your nursery."
    },
    28: {
      week: 28,
      trimester: "third",
      title: "Third Trimester Begins",
      message: "Welcome to the final stretch! Your baby is getting bigger and stronger. Take time to rest and prepare for the exciting arrival ahead.",
      emoji: "🤰",
      color: "from-pink-400 to-purple-400",
      tip: "Pack your hospital bag and finalize your birth plan."
    },
    36: {
      week: 36,
      trimester: "third",
      title: "Almost Ready",
      message: "Your baby is nearly ready to meet the world! These final weeks are about preparation and anticipation. Trust your body and your instincts.",
      emoji: "✨",
      color: "from-indigo-400 to-purple-400",
      tip: "Have your hospital bag ready and keep your healthcare provider's number handy."
    }
  };

  return messages[week] || {
    week: week,
    trimester: week <= 12 ? "first" : week <= 26 ? "second" : "third",
    title: `Week ${week} Support`,
    message: "You're doing an amazing job nurturing your little one. Every week brings new developments and milestones. Trust yourself and your body's incredible ability to grow life.",
    emoji: "💕",
    color: "from-pink-400 to-purple-400",
    tip: "Stay connected with your healthcare provider and trust your instincts."
  };
}
