import Product from "../models/Product.js";
import EcommerceCategory from "../models/EcommerceCategory.js";

const parseStringArrayField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return [];

  // Handle JSON-encoded arrays from multipart/form-data.
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch (_err) {
      // Fall through to delimiter parsing.
    }
  }

  return trimmed
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeProductArrayFields = (data) => {
  if (!data || typeof data !== "object") return data;
  const normalized = { ...data };

  ["tags", "healthBenefits", "ingredients", "features"].forEach((field) => {
    if (normalized[field] !== undefined) {
      normalized[field] = parseStringArrayField(normalized[field]);
    }
  });

  return normalized;
};

// GET /api/products - Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      featured,
      bestSeller,
      sortBy = "newest",
      sortOrder = "desc",
      page = 1,
      limit = 20,
      includeInactive, // Admin can see inactive products
    } = req.query;

    // Admin can see all products, regular users only see active ones
    // For now, if includeInactive is true, show all products (admin feature)
    const query = includeInactive === "true" 
      ? {} 
      : { isActive: true };

    // Category filter - optimized with select to only get _id
    if (category) {
      const categoryDoc = await EcommerceCategory.findOne({
        $or: [{ _id: category }, { slug: category }],
      }).select("_id").lean(); // Only select _id for faster query
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query["rating.average"] = { $gte: Number(minRating) };
    }

    // Stock filter
    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (featured === "true") {
      query.isFeatured = true;
    }

    // Best seller filter
    if (bestSeller === "true") {
      query.isBestSeller = true;
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === "price-asc" || (sortBy === "price" && sortOrder === "asc")) {
      sortOptions.price = 1;
    } else if (sortBy === "price-desc" || (sortBy === "price" && sortOrder === "desc")) {
      sortOptions.price = -1;
    } else if (sortBy === "rating") {
      sortOptions["rating.average"] = -1;
      sortOptions["rating.count"] = -1; // Secondary sort by review count
    } else if (sortBy === "name") {
      sortOptions.name = 1;
    } else {
      // Default: newest first
      sortOptions.createdAt = -1;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Optimize query - select only needed fields for listing
    const products = await Product.find(query)
      .select(
        "name shortDescription price originalPrice images image category stock rating isActive isFeatured isBestSeller discount features healthBenefits ingredients"
      )
      .populate("category", "name slug icon")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/products/:id - Get single product
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    // Admin can see inactive products
    const query = req.user?.isAdmin ? { _id: id } : { _id: id, isActive: true };
    const product = await Product.findOne(query)
      .populate("category", "name slug icon")
      .populate("reviews.userId", "name")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Filter reviews to show only approved and visible ones for public
    // Admins can see all reviews in admin panel, but public product pages show only approved
    if (product && product.reviews) {
      product.reviews = product.reviews.filter(
        (review) => review.isApproved && !review.isHidden
      );
    }

    res.json({ product });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/products/featured - Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ products });
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/products/bestsellers - Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isBestSeller: true, isActive: true })
      .populate("category", "name slug icon")
      .sort({ "rating.average": -1, "rating.count": -1 })
      .limit(limit)
      .lean();

    res.json({ products });
  } catch (error) {
    console.error("getBestSellers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/products/:id/reviews - Add review (protected)
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === userId.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
      existingReview.createdAt = new Date();
    } else {
      // Add new review
      product.reviews.push({
        userId,
        rating,
        comment,
      });
    }

    // New reviews are auto-approved by default, but can be moderated later
    // Update rating average (only counts approved, visible reviews)
    product.updateRating();
    await product.save();

    const updatedProduct = await Product.findById(id)
      .populate("reviews.userId", "name")
      .lean();

    res.json({
      message: "Review added successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("addReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/products/search - Search products
export const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ products: [] });
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true,
    })
      .populate("category", "name slug")
      .limit(Number(limit))
      .lean();

    res.json({ products });
  } catch (error) {
    console.error("searchProducts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/products - Create new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    // Parse productData if it's a string (from FormData)
    let productData = req.body;
    if (typeof productData === 'string') {
      try {
        productData = JSON.parse(productData);
      } catch (e) {
        // If parsing fails, use as is
      }
    }

    productData = normalizeProductArrayFields(productData);

    // Handle existing images from FormData (if editing)
    let existingImages = [];
    if (productData.existingImages) {
      try {
        existingImages = typeof productData.existingImages === 'string' 
          ? JSON.parse(productData.existingImages) 
          : productData.existingImages;
      } catch (e) {
        existingImages = Array.isArray(productData.existingImages) ? productData.existingImages : [];
      }
      delete productData.existingImages; // Remove from productData
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: file.originalname || "Product image"
      }));
      
      // Merge existing images with new uploaded images
      productData.images = [...existingImages, ...imageUrls];
    } else if (existingImages.length > 0) {
      // Only existing images, no new uploads
      productData.images = existingImages;
    } else if (productData.images) {
      // If images are provided as string (from FormData), parse them
      if (typeof productData.images === 'string') {
        try {
          productData.images = JSON.parse(productData.images);
        } catch (e) {
          productData.images = [];
        }
      }
    }

    // Comprehensive validation
    const errors = [];

    // Required fields validation
    if (!productData.name || !productData.name.trim()) {
      errors.push("Product name is required");
    } else if (productData.name.trim().length < 3) {
      errors.push("Product name must be at least 3 characters");
    } else if (productData.name.trim().length > 200) {
      errors.push("Product name must not exceed 200 characters");
    }

    if (!productData.description || !productData.description.trim()) {
      errors.push("Product description is required");
    } else if (productData.description.trim().length < 10) {
      errors.push("Product description must be at least 10 characters");
    }

    if (!productData.price) {
      errors.push("Product price is required");
    } else {
      const price = parseFloat(productData.price);
      if (isNaN(price) || price < 0) {
        errors.push("Price must be a valid positive number");
      } else if (price > 1000000) {
        errors.push("Price cannot exceed ₹10,00,000");
      }
    }

    if (!productData.category) {
      errors.push("Product category is required");
    }

    // Validate originalPrice if provided
    if (productData.originalPrice) {
      const originalPrice = parseFloat(productData.originalPrice);
      if (isNaN(originalPrice) || originalPrice < 0) {
        errors.push("Original price must be a valid positive number");
      } else if (originalPrice < parseFloat(productData.price)) {
        errors.push("Original price must be greater than or equal to current price");
      }
    }

    // Validate discount if provided
    if (productData.discount !== undefined && productData.discount !== null) {
      const discount = parseFloat(productData.discount);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        errors.push("Discount must be between 0 and 100");
      }
    }

    // Validate stock
    if (productData.stock !== undefined && productData.stock !== null) {
      const stock = parseInt(productData.stock);
      if (isNaN(stock) || stock < 0) {
        errors.push("Stock quantity must be a valid non-negative integer");
      } else if (stock > 100000) {
        errors.push("Stock quantity cannot exceed 100,000");
      }
    } else {
      productData.stock = 0; // Default to 0 if not provided
    }

    // Validate SKU if provided
    if (productData.sku && productData.sku.trim().length > 50) {
      errors.push("SKU must not exceed 50 characters");
    }

    // Validate short description if provided
    if (productData.shortDescription && productData.shortDescription.trim().length > 200) {
      errors.push("Short description must not exceed 200 characters");
    }

    // Validate images
    if (!productData.images || productData.images.length === 0) {
      errors.push("At least one product image is required");
    } else if (productData.images.length > 10) {
      errors.push("Maximum 10 images allowed per product");
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    // Check if category exists
    const category = await EcommerceCategory.findById(productData.category);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Sanitize string fields
    productData.name = productData.name.trim();
    productData.description = productData.description.trim();
    if (productData.shortDescription) {
      productData.shortDescription = productData.shortDescription.trim();
    }
    if (productData.brand) {
      productData.brand = productData.brand.trim();
    }
    if (productData.sku) {
      productData.sku = productData.sku.trim().toUpperCase();
    }

    // Ensure isActive defaults to true if not provided (so products are visible to users)
    if (productData.isActive === undefined) {
      productData.isActive = true;
    }

    const product = await Product.create(productData);

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name slug icon")
      .lean();

    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/products/:id - Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;

    // Parse updateData if it's a string (from FormData)
    if (typeof updateData === 'string') {
      try {
        updateData = JSON.parse(updateData);
      } catch (e) {
        // If parsing fails, use as is
      }
    }

    updateData = normalizeProductArrayFields(updateData);

    // Handle existing images from FormData (if editing)
    let existingImages = [];
    if (updateData.existingImages) {
      try {
        existingImages = typeof updateData.existingImages === 'string' 
          ? JSON.parse(updateData.existingImages) 
          : updateData.existingImages;
      } catch (e) {
        existingImages = Array.isArray(updateData.existingImages) ? updateData.existingImages : [];
      }
      delete updateData.existingImages; // Remove from updateData
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: file.originalname || "Product image"
      }));
      
      // Merge existing images with new uploaded images
      if (existingImages.length > 0) {
        updateData.images = [...existingImages, ...imageUrls];
      } else {
        // Get existing product to preserve current images if no existingImages provided
        const existingProduct = await Product.findById(id);
        if (existingProduct && existingProduct.images) {
          updateData.images = [...existingProduct.images, ...imageUrls];
        } else {
          updateData.images = imageUrls;
        }
      }
    } else if (existingImages.length > 0) {
      // Only existing images, no new uploads
      updateData.images = existingImages;
    } else if (updateData.images) {
      // If images are provided as string (from FormData), parse them
      if (typeof updateData.images === 'string') {
        try {
          updateData.images = JSON.parse(updateData.images);
        } catch (e) {
          // Keep existing images if parsing fails
          const existingProduct = await Product.findById(id);
          if (existingProduct && existingProduct.images) {
            updateData.images = existingProduct.images;
          } else {
            updateData.images = [];
          }
        }
      }
    }

    // Comprehensive validation for updates
    const errors = [];

    // Validate name if provided
    if (updateData.name !== undefined) {
      if (!updateData.name || !updateData.name.trim()) {
        errors.push("Product name cannot be empty");
      } else if (updateData.name.trim().length < 3) {
        errors.push("Product name must be at least 3 characters");
      } else if (updateData.name.trim().length > 200) {
        errors.push("Product name must not exceed 200 characters");
      }
    }

    // Validate description if provided
    if (updateData.description !== undefined) {
      if (!updateData.description || !updateData.description.trim()) {
        errors.push("Product description cannot be empty");
      } else if (updateData.description.trim().length < 10) {
        errors.push("Product description must be at least 10 characters");
      }
    }

    // Validate price if provided
    if (updateData.price !== undefined) {
      const price = parseFloat(updateData.price);
      if (isNaN(price) || price < 0) {
        errors.push("Price must be a valid positive number");
      } else if (price > 1000000) {
        errors.push("Price cannot exceed ₹10,00,000");
      }
    }

    // Validate originalPrice if provided
    if (updateData.originalPrice !== undefined && updateData.originalPrice !== null) {
      const originalPrice = parseFloat(updateData.originalPrice);
      if (isNaN(originalPrice) || originalPrice < 0) {
        errors.push("Original price must be a valid positive number");
      } else if (updateData.price && originalPrice < parseFloat(updateData.price)) {
        errors.push("Original price must be greater than or equal to current price");
      }
    }

    // Validate discount if provided
    if (updateData.discount !== undefined && updateData.discount !== null) {
      const discount = parseFloat(updateData.discount);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        errors.push("Discount must be between 0 and 100");
      }
    }

    // Validate stock if provided
    if (updateData.stock !== undefined && updateData.stock !== null) {
      const stock = parseInt(updateData.stock);
      if (isNaN(stock) || stock < 0) {
        errors.push("Stock quantity must be a valid non-negative integer");
      } else if (stock > 100000) {
        errors.push("Stock quantity cannot exceed 100,000");
      }
    }

    // Validate SKU if provided
    if (updateData.sku !== undefined && updateData.sku && updateData.sku.trim().length > 50) {
      errors.push("SKU must not exceed 50 characters");
    }

    // Validate short description if provided
    if (updateData.shortDescription !== undefined && updateData.shortDescription && updateData.shortDescription.trim().length > 200) {
      errors.push("Short description must not exceed 200 characters");
    }

    // Validate images if provided
    if (updateData.images !== undefined) {
      if (!Array.isArray(updateData.images) || updateData.images.length === 0) {
        errors.push("At least one product image is required");
      } else if (updateData.images.length > 10) {
        errors.push("Maximum 10 images allowed per product");
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    // If category is being updated, validate it
    if (updateData.category) {
      const category = await EcommerceCategory.findById(updateData.category);
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    // Sanitize string fields if provided
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.shortDescription) updateData.shortDescription = updateData.shortDescription.trim();
    if (updateData.brand) updateData.brand = updateData.brand.trim();
    if (updateData.sku) updateData.sku = updateData.sku.trim().toUpperCase();

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("category", "name slug icon")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/products/:id - Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
