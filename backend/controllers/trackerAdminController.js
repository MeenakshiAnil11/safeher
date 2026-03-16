import TrackerConfig from "../models/TrackerConfig.js";

const allowedModules = new Set(["period", "conceive", "pregnancy", "perimenopause"]);

const validateParams = (moduleKey, sectionKey) => {
  if (!allowedModules.has(moduleKey)) return "Invalid module key";
  if (!sectionKey || typeof sectionKey !== "string") return "Invalid section key";
  return null;
};

export const listTrackerItems = async (req, res) => {
  try {
    const { moduleKey, sectionKey } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const items = await TrackerConfig.find({ moduleKey, sectionKey }).sort({ week: 1, updatedAt: -1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list tracker items", error: error.message });
  }
};

export const createTrackerItem = async (req, res) => {
  try {
    const { moduleKey, sectionKey } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const { title, description = "", week = null, metadata = {} } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const item = await TrackerConfig.create({
      moduleKey,
      sectionKey,
      title: String(title).trim(),
      description: String(description || ""),
      week: week === null || week === "" ? null : Number(week),
      metadata,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create tracker item", error: error.message });
  }
};

export const updateTrackerItem = async (req, res) => {
  try {
    const { moduleKey, sectionKey, id } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const { title, description = "", week = null, metadata = {} } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const item = await TrackerConfig.findOneAndUpdate(
      { _id: id, moduleKey, sectionKey },
      {
        title: String(title).trim(),
        description: String(description || ""),
        week: week === null || week === "" ? null : Number(week),
        metadata,
        updatedBy: req.user?._id || null,
      },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: "Tracker item not found" });
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update tracker item", error: error.message });
  }
};

export const deleteTrackerItem = async (req, res) => {
  try {
    const { moduleKey, sectionKey, id } = req.params;
    const error = validateParams(moduleKey, sectionKey);
    if (error) return res.status(400).json({ message: error });

    const item = await TrackerConfig.findOneAndDelete({ _id: id, moduleKey, sectionKey });
    if (!item) return res.status(404).json({ message: "Tracker item not found" });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete tracker item", error: error.message });
  }
};
