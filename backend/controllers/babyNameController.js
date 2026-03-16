// backend/controllers/babyNameController.js
import BabyName from "../models/BabyName.js";
import BookmarkedName from "../models/BookmarkedName.js";

// Get all baby names
export const getBabyNames = async (req, res) => {
  try {
    const { gender, search, limit } = req.query;
    let query = {};
    
    if (gender && gender !== "all") {
      query.gender = gender;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { meaning: { $regex: search, $options: 'i' } }
      ];
    }
    
    let names = BabyName.find(query).sort({ popularity: -1 });
    
    if (limit) {
      names = names.limit(parseInt(limit));
    }
    
    const result = await names.lean();
    
    res.json({ success: true, names: result });
  } catch (error) {
    console.error("Get baby names error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch baby names" });
  }
};

// Create a new baby name (admin function)
export const createBabyName = async (req, res) => {
  try {
    const { name, gender, meaning, origin, pronunciation, popularity } = req.body;

    const babyName = await BabyName.create({
      name,
      gender,
      meaning,
      origin,
      pronunciation,
      popularity
    });

    res.status(201).json({ success: true, name: babyName });
  } catch (error) {
    console.error("Create baby name error:", error);
    res.status(500).json({ success: false, message: "Failed to create baby name" });
  }
};

// Bookmark a baby name
export const bookmarkName = async (req, res) => {
  try {
    const { name, gender, meaning, origin, pronunciation, notes } = req.body;

    // Check if already bookmarked
    const existing = await BookmarkedName.findOne({
      user: req.userId,
      name,
      gender
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Name already bookmarked" 
      });
    }

    const bookmarkedName = await BookmarkedName.create({
      user: req.userId,
      name,
      gender,
      meaning,
      origin,
      pronunciation,
      notes
    });

    res.status(201).json({ success: true, bookmarkedName });
  } catch (error) {
    console.error("Bookmark name error:", error);
    res.status(500).json({ success: false, message: "Failed to bookmark name" });
  }
};

// Get user's bookmarked names
export const getBookmarkedNames = async (req, res) => {
  try {
    const bookmarkedNames = await BookmarkedName.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, bookmarkedNames });
  } catch (error) {
    console.error("Get bookmarked names error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookmarked names" });
  }
};

// Delete a bookmarked name
export const deleteBookmarkedName = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookmarkedName = await BookmarkedName.findOneAndDelete({
      _id: id,
      user: req.userId
    });
    
    if (!bookmarkedName) {
      return res.status(404).json({ 
        success: false, 
        message: "Bookmarked name not found" 
      });
    }
    
    res.json({ success: true, message: "Bookmarked name deleted successfully" });
  } catch (error) {
    console.error("Delete bookmarked name error:", error);
    res.status(500).json({ success: false, message: "Failed to delete bookmarked name" });
  }
};

// Update bookmarked name notes
export const updateBookmarkedName = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const bookmarkedName = await BookmarkedName.findOneAndUpdate(
      { _id: id, user: req.userId },
      { notes, updatedAt: Date.now() },
      { new: true }
    );

    if (!bookmarkedName) {
      return res.status(404).json({ 
        success: false, 
        message: "Bookmarked name not found" 
      });
    }

    res.json({ success: true, bookmarkedName });
  } catch (error) {
    console.error("Update bookmarked name error:", error);
    res.status(500).json({ success: false, message: "Failed to update bookmarked name" });
  }
};
