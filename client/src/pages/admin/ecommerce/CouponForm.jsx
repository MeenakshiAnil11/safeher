import React, { useState, useEffect } from "react";
import api from "../../../api";
import SuccessDialog from "../../../components/SuccessDialog";
import "./CouponForm.css";

export default function CouponForm({ coupon, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderValue: "",
    maximumDiscount: "",
    expiryDate: "",
    startDate: "",
    usageLimit: "",
    isActive: true,
    applicableTo: "all",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "percentage",
        discountValue: coupon.discountValue || "",
        minimumOrderValue: coupon.minimumOrderValue || "",
        maximumDiscount: coupon.maximumDiscount || "",
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : "",
        usageLimit: coupon.usageLimit || "",
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        applicableTo: coupon.applicableTo || "all",
      });
    } else {
      // Set default start date to today
      setFormData((prev) => ({
        ...prev,
        startDate: new Date().toISOString().split("T")[0],
      }));
    }
  }, [coupon]);

  useEffect(() => {
    if (formData.applicableTo === "category") {
      fetchCategories();
    } else if (formData.applicableTo === "product") {
      fetchProducts();
    }
  }, [formData.applicableTo]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products?limit=1000");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }

    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (new Date(formData.expiryDate) < new Date()) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    if (formData.startDate && new Date(formData.startDate) > new Date(formData.expiryDate)) {
      newErrors.startDate = "Start date must be before expiry date";
    }

    if (formData.maximumDiscount && formData.discountType === "percentage" && formData.maximumDiscount <= 0) {
      newErrors.maximumDiscount = "Maximum discount must be greater than 0";
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
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderValue: formData.minimumOrderValue ? parseFloat(formData.minimumOrderValue) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiryDate: new Date(formData.expiryDate),
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      };

      if (coupon) {
        await api.put(`/coupons/admin/${coupon._id}`, submitData);
        setSuccessMessage("Coupon updated successfully!");
        setDialogType("success");
      } else {
        await api.post("/coupons/admin", submitData);
        setSuccessMessage("Coupon created successfully!");
        setDialogType("success");
      }

      setShowSuccessDialog(true);
      
      // Close form and refresh after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setShowSuccessDialog(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving coupon:", error);
      setSuccessMessage(error.response?.data?.message || "Failed to save coupon. Please try again.");
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
    <>
      <SuccessDialog
        message={successMessage}
        show={showSuccessDialog}
        type={dialogType}
        onClose={() => setShowSuccessDialog(false)}
      />
      
      <div className="coupon-form-overlay" onClick={onClose}>
        <div className="coupon-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="coupon-form-header">
          <h2>{coupon ? "Edit Coupon" : "Create New Coupon"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="coupon-form">
          <div className="form-row">
            <div className="form-group">
              <label>Coupon Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="SAVE20"
                className={errors.code ? "error" : ""}
                disabled={!!coupon}
              />
              {errors.code && <span className="error-text">{errors.code}</span>}
            </div>

            <div className="form-group">
              <label>Status</label>
              <label className="switch">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span className="slider">{formData.isActive ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Coupon description (optional)"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount Type *</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discount Value *</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === "percentage" ? "20" : "100"}
                min="0"
                max={formData.discountType === "percentage" ? "100" : ""}
                step={formData.discountType === "percentage" ? "0.1" : "1"}
                className={errors.discountValue ? "error" : ""}
              />
              {errors.discountValue && <span className="error-text">{errors.discountValue}</span>}
            </div>
          </div>

          {formData.discountType === "percentage" && (
            <div className="form-group">
              <label>Maximum Discount (₹)</label>
              <input
                type="number"
                name="maximumDiscount"
                value={formData.maximumDiscount}
                onChange={handleChange}
                placeholder="Optional - limit max discount amount"
                min="0"
                step="1"
                className={errors.maximumDiscount ? "error" : ""}
              />
              {errors.maximumDiscount && <span className="error-text">{errors.maximumDiscount}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Minimum Order Value (₹)</label>
            <input
              type="number"
              name="minimumOrderValue"
              value={formData.minimumOrderValue}
              onChange={handleChange}
              placeholder="0 (no minimum)"
              min="0"
              step="1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? "error" : ""}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={errors.expiryDate ? "error" : ""}
              />
              {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              min="1"
              step="1"
            />
            <small>Leave empty for unlimited usage</small>
          </div>

          <div className="form-group">
            <label>Applicable To</label>
            <select name="applicableTo" value={formData.applicableTo} onChange={handleChange}>
              <option value="all">All Products</option>
              <option value="category">Specific Categories</option>
              <option value="product">Specific Products</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
