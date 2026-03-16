import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { getProductImage, getImageUrl } from "../utils/imageUtils";
import "./ProductCard.css";

const ProductCard = ({
  product,
  viewMode = "grid",
  inWishlist: initialInWishlist = false,
  onWishlistChange,
  variant = "default",
}) => {
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discount || 0;

  // Get all product images - properly resolve URLs
  const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => {
        const imageUrl = typeof img === 'string' ? img : (img?.url || null);
        if (!imageUrl) return getProductImage(product);
        // Resolve the URL using the utility function to prepend backend URL
        const resolvedUrl = getImageUrl(imageUrl);
        // If getImageUrl returns null, manually construct the URL
        if (!resolvedUrl) {
          const backendUrl = "http://localhost:5000";
          if (imageUrl.startsWith("/uploads/")) {
            return `${backendUrl}${imageUrl}`;
          } else if (imageUrl.startsWith("/")) {
            return `${backendUrl}${imageUrl}`;
          } else {
            return `${backendUrl}/uploads/${imageUrl}`;
          }
        }
        return resolvedUrl;
      })
    : [getProductImage(product)];

  const directImage = typeof product.image === "string" && product.image.trim() ? product.image.trim() : "";
  const mainImage = directImage || productImages[selectedImageIndex] || getProductImage(product);
  const thumbnails = productImages.slice(0, 5); // Show max 5 thumbnails
  const remainingThumbnails = productImages.length > 5 ? productImages.length - 5 : 0;

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/shop");
      return;
    }
    try {
      setWishlistLoading(true);
      const res = await api.post(`/wishlist/toggle/${product._id}`);
      setInWishlist(res.data?.inWishlist);
      if (onWishlistChange) onWishlistChange(product._id, res.data?.inWishlist);
      
      // Trigger custom event to refresh wishlist icon in header
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/shop");
      return;
    }
    try {
      setAddingToCart(true);
      await api.post("/cart/add", { productId: product._id, quantity: 1 });
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.response?.data?.message || "Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const avgRating = Number(product.rating?.average || 0);
  const ratingCount = Number(product.rating?.count || 0);
  const parseFeatureList = (value) => {
    if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
    if (typeof value !== "string") return [];
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  };
  const featureList = parseFeatureList(product.features);

  return (
    <div className={`product-card ${viewMode === "list" ? "list-view" : ""} ${variant === "modern" ? "product-card-modern" : ""}`}>
      <Link to={`/shop/products/${product._id}`} className="product-card-link">
        {product.isBestSeller && (
          <span className="product-badge bestseller">Bestseller</span>
        )}
        {product.isNewArrival && (
          <span className="product-badge new">New</span>
        )}
        {product.isFeatured && (
          <span className="product-badge featured">Featured</span>
        )}

        <div className="product-image-section">
        <div className="product-image-wrapper">
            {discountPercentage > 0 && (
              <span className="discount-badge">-{discountPercentage}%</span>
            )}
          <button
            className={`wishlist-btn ${inWishlist ? "active" : ""}`}
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishlistLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <img
            src={mainImage}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
                e.target.onerror = null;
              e.target.src = getProductImage(product);
            }}
          />
          </div>
          {thumbnails.length > 1 && (
            <div className="product-thumbnails">
              {thumbnails.slice(0, 3).map((thumb, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                >
                  <img
                    src={thumb}
                    alt={`${product.name} variant ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23f3f4f6' width='60' height='60'/%3E%3C/svg%3E";
                    }}
                  />
                </button>
              ))}
              {remainingThumbnails > 0 && (
                <div className="thumbnail-more">+{remainingThumbnails}</div>
              )}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-category">
            {product.category?.icon} {product.category?.name || "Uncategorized"}
          </div>
          <h3 className="product-name">{product.name}</h3>
          {product.shortDescription && (
            <p className="product-description">{product.shortDescription}</p>
          )}
          {featureList.length > 0 && (
            <ul className="product-key-features">
              {featureList.slice(0, 3).map((feature, index) => (
                <li key={`${product._id}-feature-${index}`}>{feature}</li>
              ))}
            </ul>
          )}

          <div className="product-rating">
            {variant === "modern" ? (
              <>
                <span className="stars">★</span>
                <span className="rating-modern-text">{avgRating.toFixed(1)} ({ratingCount})</span>
              </>
            ) : (
              <>
                <span className="stars">
                  {"★".repeat(Math.floor(avgRating))}
                  {"☆".repeat(5 - Math.floor(avgRating))}
                </span>
                <span className="rating-text">({ratingCount})</span>
              </>
            )}
          </div>

          <div className="product-price">
            <span className="current-price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {product.stock === 0 && (
            <div className="out-of-stock">Out of Stock</div>
          )}
        </div>
      </Link>

      {variant === "modern" && (
        <div className="product-card-modern-actions">
          <button className="product-add-cart-btn" type="button" onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 5h2l2 11h10l2-8H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.5" fill="currentColor" />
              <circle cx="17" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {product.stock === 0 ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
