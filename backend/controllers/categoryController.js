import EcommerceCategory from "../models/EcommerceCategory.js";

// GET /api/categories - Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await EcommerceCategory.find({ isActive: true })
      .populate("parentCategory", "name slug")
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    res.json({ categories });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/categories/:slug - Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await EcommerceCategory.findOne({ slug, isActive: true })
      .populate("parentCategory", "name slug")
      .lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category });
  } catch (error) {
    console.error("getCategoryBySlug error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== ADMIN ONLY ROUTES ==========

// GET /api/categories/admin/all - Get all categories (including inactive) - Admin only
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, parentCategory, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (parentCategory) {
      if (parentCategory === "null" || parentCategory === "none") {
        query.parentCategory = null;
      } else {
        query.parentCategory = parentCategory;
      }
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const categories = await EcommerceCategory.find(query)
      .populate("parentCategory", "name slug")
      .sort({ displayOrder: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    
    const total = await EcommerceCategory.countDocuments(query);
    
    res.json({
      categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllCategoriesAdmin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/categories/admin/:id - Get single category by ID - Admin only
export const getCategoryByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await EcommerceCategory.findById(id)
      .populate("parentCategory", "name slug")
      .lean();
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json({ category });
  } catch (error) {
    console.error("getCategoryByIdAdmin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/categories/admin - Create new category - Admin only
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, parentCategory, isActive, displayOrder, meta } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    // Check if slug already exists
    const existingCategory = await EcommerceCategory.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }
    
    // Validate parent category if provided
    if (parentCategory) {
      const parent = await EcommerceCategory.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: "Parent category not found" });
      }
    }
    
    const category = new EcommerceCategory({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image: image || {},
      icon: icon || "",
      parentCategory: parentCategory || null,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      meta: meta || {},
    });
    
    await category.save();
    
    const populatedCategory = await EcommerceCategory.findById(category._id)
      .populate("parentCategory", "name slug")
      .lean();
    
    res.status(201).json({
      message: "Category created successfully",
      category: populatedCategory,
    });
  } catch (error) {
    console.error("createCategory error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name or slug already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/categories/admin/:id - Update category - Admin only
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, icon, parentCategory, isActive, displayOrder, meta } = req.body;
    
    const category = await EcommerceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Update fields
    if (name !== undefined && name.trim() !== category.name) {
      // Generate new slug if name changed
      const newSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      // Check if new slug already exists (excluding current category)
      const existingCategory = await EcommerceCategory.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
      
      category.name = name.trim();
      category.slug = newSlug;
    }
    
    if (description !== undefined) {
      category.description = description.trim();
    }
    
    if (image !== undefined) {
      category.image = image;
    }
    
    if (icon !== undefined) {
      category.icon = icon;
    }
    
    if (parentCategory !== undefined) {
      if (parentCategory === null || parentCategory === "") {
        category.parentCategory = null;
      } else {
        // Validate parent category
        const parent = await EcommerceCategory.findById(parentCategory);
        if (!parent) {
          return res.status(400).json({ message: "Parent category not found" });
        }
        // Prevent setting itself as parent
        if (parentCategory === id) {
          return res.status(400).json({ message: "Category cannot be its own parent" });
        }
        category.parentCategory = parentCategory;
      }
    }
    
    if (isActive !== undefined) {
      category.isActive = isActive;
    }
    
    if (displayOrder !== undefined) {
      category.displayOrder = Number(displayOrder);
    }
    
    if (meta !== undefined) {
      category.meta = meta;
    }
    
    await category.save();
    
    const populatedCategory = await EcommerceCategory.findById(category._id)
      .populate("parentCategory", "name slug")
      .lean();
    
    res.json({
      message: "Category updated successfully",
      category: populatedCategory,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name or slug already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/categories/admin/:id - Delete category - Admin only
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await EcommerceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Check if category has subcategories
    const subcategories = await EcommerceCategory.countDocuments({ parentCategory: id });
    if (subcategories > 0) {
      return res.status(400).json({ 
        message: "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
        subcategoriesCount: subcategories
      });
    }
    
    // Check if category has products (you might want to add this check if you have a Product model)
    // For now, we'll just delete it
    
    await EcommerceCategory.findByIdAndDelete(id);
    
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};