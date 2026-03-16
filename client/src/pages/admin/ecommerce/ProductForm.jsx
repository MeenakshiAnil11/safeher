import React, { useState, useEffect } from "react";
import api from "../../../api";
import SuccessDialog from "../../../components/SuccessDialog";
import "./ProductForm.css";

export default function ProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    category: "",
    stock: "",
    sku: "",
    brand: "",
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    tags: "",
    features: "",
    healthBenefits: "",
    usageInstructions: "",
    ingredients: "",
    expiryDate: "",
    manufacturer: {
      name: "",
      address: "",
      license: ""
    }
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(!!product);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");

  // Load categories once
  useEffect(() => {
    fetchCategories();
  }, []);

  // Helper to populate form state from a product object
  const hydrateFormFromProduct = (p) => {
    if (!p) return;
    setFormData({
      name: p.name || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      price: p.price || "",
      originalPrice: p.originalPrice || "",
      discount: p.discount || "",
      category: p.category?._id || p.category || "",
      stock: p.stock || "",
      sku: p.sku || "",
      brand: p.brand || "",
      isActive: p.isActive !== undefined ? p.isActive : true,
      isFeatured: p.isFeatured || false,
      isBestSeller: p.isBestSeller || false,
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
      features: Array.isArray(p.features) ? p.features.join("\n") : p.features || "",
      healthBenefits: Array.isArray(p.healthBenefits) ? p.healthBenefits.join("\n") : p.healthBenefits || "",
      usageInstructions: p.usageInstructions || "",
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.join(", ") : p.ingredients || "",
      expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split("T")[0] : "",
      manufacturer: {
        name: p.manufacturer?.name || "",
        address: p.manufacturer?.address || "",
        license: p.manufacturer?.license || ""
      }
    });
    setImages(p.images || []);
  };

  // Load full product details for edit mode so fields are stable and pre-filled
  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!product || !product._id) {
        setFormLoading(false);
        return;
      }

      setFormLoading(true);
      try {
        const res = await api.get(`/products/${product._id}`);
        const fullProduct = res.data?.product || res.data || product;
        if (isMounted) {
          hydrateFormFromProduct(fullProduct);
        }
      } catch (error) {
        console.error("Error loading product details for edit form:", error);
        // Fallback to the product object passed from the list
        if (isMounted) {
          hydrateFormFromProduct(product);
        }
      } finally {
        if (isMounted) {
          setFormLoading(false);
        }
      }
    };

    // In add mode we don't need to fetch anything
    if (!product) {
      setFormLoading(false);
      return undefined;
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [product?._id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { url: reader.result, alt: file.name, isNew: true }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    } else if (formData.name.trim().length > 200) {
      newErrors.name = "Product name must not exceed 200 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = "Valid price is required (must be greater than 0)";
    } else if (price > 1000000) {
      newErrors.price = "Price cannot exceed ₹10,00,000";
    }

    // Original price validation
    if (formData.originalPrice) {
      const originalPrice = parseFloat(formData.originalPrice);
      if (isNaN(originalPrice) || originalPrice < 0) {
        newErrors.originalPrice = "Original price must be a valid positive number";
      } else if (originalPrice < price) {
        newErrors.originalPrice = "Original price must be greater than or equal to current price";
      }
    }

    // Discount validation
    if (formData.discount) {
      const discount = parseFloat(formData.discount);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        newErrors.discount = "Discount must be between 0 and 100";
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Stock validation
    if (formData.stock === "" || formData.stock === null || formData.stock === undefined) {
      newErrors.stock = "Stock quantity is required";
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock quantity must be a valid non-negative integer";
      } else if (stock > 100000) {
        newErrors.stock = "Stock quantity cannot exceed 100,000";
      }
    }

    // SKU validation
    if (formData.sku && formData.sku.trim().length > 50) {
      newErrors.sku = "SKU must not exceed 50 characters";
    }

    // Short description validation
    if (formData.shortDescription && formData.shortDescription.trim().length > 200) {
      newErrors.shortDescription = "Short description must not exceed 200 characters";
    }

    // Images validation
    if (images.length === 0 && imageFiles.length === 0) {
      newErrors.images = "At least one image is required";
    } else if (images.length + imageFiles.length > 10) {
      newErrors.images = "Maximum 10 images allowed per product";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        category: formData.category,
        stock: parseInt(formData.stock),
        sku: formData.sku.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(t => t) : [],
        features: formData.features ? formData.features.split("\n").map((f) => f.trim()).filter((f) => f) : [],
        healthBenefits: formData.healthBenefits ? formData.healthBenefits.split("\n").filter(b => b.trim()) : [],
        usageInstructions: formData.usageInstructions.trim() || undefined,
        ingredients: formData.ingredients ? formData.ingredients.split(",").map(i => i.trim()).filter(i => i) : [],
        expiryDate: formData.expiryDate || undefined,
        manufacturer: formData.manufacturer.name ? formData.manufacturer : undefined
      };

      // Prepare existing images (URLs that are already uploaded)
      const existingImages = images.filter(img => !img.isNew && img.url && !img.url.startsWith('blob:')).map(img => ({
        url: img.url,
        alt: img.alt || "Product image"
      }));

      // If there are new image files to upload, use FormData
      if (imageFiles.length > 0) {
        const formDataToSend = new FormData();
        
        // Add all product data fields
        Object.keys(productData).forEach(key => {
          if (key !== 'images') {
            const value = productData[key];
            if (value !== undefined && value !== null) {
              if (typeof value === 'object' && !Array.isArray(value)) {
                formDataToSend.append(key, JSON.stringify(value));
              } else if (Array.isArray(value)) {
                formDataToSend.append(key, JSON.stringify(value));
              } else {
                formDataToSend.append(key, value);
              }
            }
          }
        });

        // Add existing images as JSON string with a different field name
        if (existingImages.length > 0) {
          formDataToSend.append('existingImages', JSON.stringify(existingImages));
        }

        // Add new image files with field name 'images' for multer
        imageFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });

        // Create or update product with FormData
        // Note: Content-Type will be set automatically by axios interceptor
        if (product?._id) {
          // Update existing product
          await api.put(`/products/${product._id}`, formDataToSend);
          setSuccessMessage("Product updated successfully!");
          setDialogType("success");
        } else {
          // Create new product
          await api.post("/products", formDataToSend);
          setSuccessMessage("Product created successfully!");
          setDialogType("success");
        }
      } else {
        // No new files, just use existing images
        productData.images = existingImages.length > 0 ? existingImages : images.map(img => ({
          url: img.url,
          alt: img.alt || "Product image"
        }));

        // Create or update product with JSON
        if (product?._id) {
          // Update existing product
          await api.put(`/products/${product._id}`, productData);
          setSuccessMessage("Product updated successfully!");
          setDialogType("success");
        } else {
          // Create new product
          await api.post("/products", productData);
          setSuccessMessage("Product created successfully!");
          setDialogType("success");
        }
      }

      setShowSuccessDialog(true);
      
      // Close form and refresh after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setShowSuccessDialog(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving product:", error);
      setSuccessMessage(error.response?.data?.message || "Failed to save product. Please try again.");
      setDialogType("error");
      setShowSuccessDialog(true);
      // For errors, show dialog longer and don't close form
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-overlay" onClick={onClose}>
      <div className="product-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{product ? "Edit Product" : "Add New Product"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {formLoading ? (
          <div className="product-form-loading">Loading product details...</div>
        ) : (
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Product SKU (optional)"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief description (max 200 characters)"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? "error" : ""}
                placeholder="Detailed product description"
                rows={4}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? "error" : ""}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Brand name"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Stock</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? "error" : ""}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={errors.stock ? "error" : ""}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && <span className="error-message">{errors.stock}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product Images *</h3>
            <div className="image-upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="image-upload" className="upload-label">
                + Upload Images
              </label>
              {errors.images && <span className="error-message">{errors.images}</span>}
              
              <div className="image-preview-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img.url} alt={img.alt || `Product ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Health Information</h3>
            
            <div className="form-group">
              <label>Key Features (one per line)</label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleChange}
                placeholder="Organic cotton&#10;Biodegradable plant fiber&#10;Natural absorbent core"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Health Benefits (one per line)</label>
              <textarea
                name="healthBenefits"
                value={formData.healthBenefits}
                onChange={handleChange}
                placeholder="Enter health benefits, one per line"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Usage Instructions</label>
              <textarea
                name="usageInstructions"
                value={formData.usageInstructions}
                onChange={handleChange}
                placeholder="How to use this product"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Ingredients (comma-separated)</label>
              <input
                type="text"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="Ingredient 1, Ingredient 2, ..."
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Manufacturer Information</h3>
            
            <div className="form-group">
              <label>Manufacturer Name</label>
              <input
                type="text"
                name="manufacturer.name"
                value={formData.manufacturer.name}
                onChange={handleChange}
                placeholder="Manufacturer name"
              />
            </div>

            <div className="form-group">
              <label>Manufacturer Address</label>
              <textarea
                name="manufacturer.address"
                value={formData.manufacturer.address}
                onChange={handleChange}
                placeholder="Manufacturer address"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="manufacturer.license"
                value={formData.manufacturer.license}
                onChange={handleChange}
                placeholder="License number"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Settings</h3>
            
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Active (Product is visible to customers)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                <span>Featured Product</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                />
                <span>Best Seller</span>
              </label>
            </div>
          </div>

          <SuccessDialog
            message={successMessage}
            show={showSuccessDialog}
            type={dialogType}
            onClose={() => setShowSuccessDialog(false)}
          />

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
