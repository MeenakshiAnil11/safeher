import Draft from "../models/Draft.js";

// GET /api/forum/drafts - Get user's drafts
export const getDrafts = async (req, res) => {
  try {
    const userId = req.userId;
    const drafts = await Draft.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ drafts });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ message: "Error fetching drafts", error: error.message });
  }
};

// GET /api/forum/drafts/:id - Get single draft
export const getDraftById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const draft = await Draft.findOne({ _id: id, user: userId });
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res.json({ draft });
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ message: "Error fetching draft", error: error.message });
  }
};

// POST /api/forum/drafts - Create or update draft
export const saveDraft = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, content, category, tags, images, isAnonymous, isQuestion, postId } = req.body;

    // Find existing draft for this post or create new
    let draft = await Draft.findOne({ user: userId, postId: postId || null });
    
    if (draft) {
      // Update existing draft
      if (title !== undefined) draft.title = title;
      if (content !== undefined) draft.content = content;
      if (category !== undefined) draft.category = category;
      if (tags !== undefined) draft.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean);
      if (images !== undefined) draft.images = images;
      if (isAnonymous !== undefined) draft.isAnonymous = isAnonymous;
      if (isQuestion !== undefined) draft.isQuestion = isQuestion;
    } else {
      // Create new draft
      draft = new Draft({
        user: userId,
        title: title || "",
        content: content || "",
        category: category || "",
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean)) : [],
        images: images || [],
        isAnonymous: isAnonymous || false,
        isQuestion: isQuestion || false,
        postId: postId || null,
      });
    }

    await draft.save();
    res.json({ message: "Draft saved", draft });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ message: "Error saving draft", error: error.message });
  }
};

// DELETE /api/forum/drafts/:id - Delete draft
export const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const draft = await Draft.findOneAndDelete({ _id: id, user: userId });
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res.json({ message: "Draft deleted" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ message: "Error deleting draft", error: error.message });
  }
};
