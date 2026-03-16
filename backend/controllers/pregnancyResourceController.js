// backend/controllers/pregnancyResourceController.js
import PregnancyResource from "../models/PregnancyResource.js";

// Get pregnancy resources by trimester
export const getPregnancyResources = async (req, res) => {
  try {
    const { trimester, type, search, limit, premium } = req.query;
    let query = {};
    
    if (trimester && trimester !== "all") {
      query.trimester = trimester;
    }
    
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by premium status if specified
    if (premium === "true") {
      query.isPaid = true;
    } else if (premium === "false") {
      query.isPaid = false;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { snippet: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    let resources = PregnancyResource.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      resources = resources.limit(parseInt(limit));
    }
    
    const result = await resources.lean();
    
    res.json({ success: true, content: result });
  } catch (error) {
    console.error("Get pregnancy resources error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pregnancy resources" });
  }
};

// Create a new pregnancy resource (admin function)
export const createPregnancyResource = async (req, res) => {
  try {
    const {
      title,
      type,
      trimester,
      isPaid,
      thumbnail,
      snippet,
      content,
      readTime,
      duration,
      questions,
      tags
    } = req.body;

    const resource = await PregnancyResource.create({
      title,
      type,
      trimester,
      isPaid,
      thumbnail,
      snippet,
      content,
      readTime,
      duration,
      questions,
      tags
    });

    res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error("Create pregnancy resource error:", error);
    res.status(500).json({ success: false, message: "Failed to create pregnancy resource" });
  }
};

// Get a specific resource by ID
export const getPregnancyResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await PregnancyResource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: "Resource not found" 
      });
    }
    
    res.json({ success: true, resource });
  } catch (error) {
    console.error("Get pregnancy resource by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch resource" });
  }
};

// Update a pregnancy resource (admin function)
export const updatePregnancyResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const resource = await PregnancyResource.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: "Resource not found" 
      });
    }

    res.json({ success: true, resource });
  } catch (error) {
    console.error("Update pregnancy resource error:", error);
    res.status(500).json({ success: false, message: "Failed to update resource" });
  }
};

// Delete a pregnancy resource (admin function)
export const deletePregnancyResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await PregnancyResource.findByIdAndDelete(id);
    
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: "Resource not found" 
      });
    }
    
    res.json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete pregnancy resource error:", error);
    res.status(500).json({ success: false, message: "Failed to delete resource" });
  }
};

// Get resource statistics
export const getResourceStats = async (req, res) => {
  try {
    const stats = await PregnancyResource.aggregate([
      {
        $group: {
          _id: { trimester: "$trimester", type: "$type" },
          count: { $sum: 1 },
          paidCount: { $sum: { $cond: ["$isPaid", 1, 0] } }
        }
      },
      {
        $group: {
          _id: "$_id.trimester",
          types: {
            $push: {
              type: "$_id.type",
              count: "$count",
              paidCount: "$paidCount"
            }
          },
          totalCount: { $sum: "$count" },
          totalPaidCount: { $sum: "$paidCount" }
        }
      }
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Get resource stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch resource statistics" });
  }
};
