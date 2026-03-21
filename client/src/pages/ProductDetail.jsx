import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ProductCard from "../components/ProductCard";
import SuccessDialog from "../components/SuccessDialog";
import SearchBar from "../components/SearchBar";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import { getImageUrl } from "../utils/imageUtils";
import { FaWhatsapp } from "react-icons/fa";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [imageZoom, setImageZoom] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDialog, setReviewDialog] = useState({ show: false, message: "", type: "success" });
  const [userReview, setUserReview] = useState(null);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [qaList, setQaList] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const productDescriptionRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
        if (response.data.product.images?.length > 0) {
          setSelectedImage(0);
        }

        // Fetch related products
        if (response.data.product.category?._id) {
          try {
            const relatedRes = await api.get(
              `/products?category=${response.data.product.category._id}&limit=4`
            );
            setRelatedProducts(
              relatedRes.data.products.filter((p) => p._id !== id)
            );
          } catch (err) {
            console.error("Error fetching related products:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchProduct();

    const fetchCategories = async () => {
      try {
        const categoriesRes = await api.get("/categories");
        setAllCategories(categoriesRes.data?.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setAllCategories([]);
      }
    };

    fetchCategories();
  }, [id, navigate]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!user) return;
      try {
        const res = await api.get("/wishlist");
        const list = res.data?.products || [];
        const found = list.some((p) => p._id === id);
        setInWishlist(found);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlistStatus();
  }, [user, id]);

  // Check if user has already reviewed this product
  useEffect(() => {
    if (product && user && product.reviews) {
      const existingReview = product.reviews.find((review) => {
        const reviewUserId = review.userId?._id || review.userId;
        const currentUserId = user._id;
        return reviewUserId && currentUserId && reviewUserId.toString() === currentUserId.toString();
      });
      if (existingReview) {
        setUserReview(existingReview);
        setReviewRating(existingReview.rating);
        setReviewComment(existingReview.comment || "");
      } else {
        // Reset form if user doesn't have a review
        setUserReview(null);
        setReviewRating(0);
        setReviewComment("");
      }
    }
  }, [product, user]);

  useEffect(() => {
    if (!product) return;
    const rawQuestions = product.qna || product.questions || [];
    const normalized = rawQuestions
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            id: `qa-${index}`,
            question: item,
            answer: "",
            askedBy: "Customer",
            answeredBy: "",
            createdAt: new Date().toISOString(),
          };
        }
        return {
          id: item._id || item.id || `qa-${index}`,
          question: item.question || item.query || "",
          answer: item.answer || item.response || "",
          askedBy: item.askedBy || item.userName || "Customer",
          answeredBy: item.answeredBy || item.expertName || "",
          createdAt: item.createdAt || new Date().toISOString(),
        };
      })
      .filter((item) => item.question);
    setQaList(normalized);
  }, [product]);

  useEffect(() => {
    setActiveTab("reviews");
    setSelectedImage(0);
    window.requestAnimationFrame(() => {
      if (productDescriptionRef.current) {
        productDescriptionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, [id]);

  const handleTabToggle = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey !== "reviews") {
      setWriteReviewOpen(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login?redirect=/shop/products/" + id);
      return;
    }

    try {
      setAddingToCart(true);
      await api.post("/cart/add", {
        productId: product._id,
        quantity: quantity,
      });
      setReviewDialog({
        show: true,
        message: "Product added to cart successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setReviewDialog({
        show: true,
        message: error.response?.data?.message || "Failed to add product to cart",
        type: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login?redirect=/shop/products/" + id);
      return;
    }

    // Add to cart and navigate to checkout
    try {
      setAddingToCart(true);
      await api.post("/cart/add", {
        productId: product._id,
        quantity: quantity,
      });
      navigate("/shop/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.message || "Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate("/login?redirect=/shop/products/" + id);
      return;
    }
    try {
      setWishlistLoading(true);
      const res = await api.post(`/wishlist/toggle/${id}`);
      const wasInWishlist = inWishlist;
      setInWishlist(res.data?.inWishlist);
      
      // Show success message
      setReviewDialog({
        show: true,
        message: res.data?.inWishlist 
          ? "Product added to wishlist!" 
          : "Product removed from wishlist",
        type: "success",
      });
      
      // Trigger custom event to refresh wishlist icon in header
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      setReviewDialog({
        show: true,
        message: error.response?.data?.message || "Failed to update wishlist",
        type: "error",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  // Share functionality
  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    const price = product?.price ? `₹${product.price.toFixed(2)}` : '';
    return `Check out ${product?.name || 'this product'} ${price ? `at ${price}` : ''} on Women's Health Store!`;
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login?redirect=/shop/products/" + id);
      return;
    }

    if (reviewRating === 0) {
      setReviewDialog({
        show: true,
        message: "Please select a rating",
        type: "error",
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      // Refresh product data to show updated reviews
      const productRes = await api.get(`/products/${id}`);
      setProduct(productRes.data.product);

      // Update user review state
      if (productRes.data.product.reviews) {
        const updatedReview = productRes.data.product.reviews.find((review) => {
          const reviewUserId = review.userId?._id || review.userId;
          const currentUserId = user._id;
          return reviewUserId && currentUserId && reviewUserId.toString() === currentUserId.toString();
        });
        if (updatedReview) {
          setUserReview(updatedReview);
        }
      }

      setReviewDialog({
        show: true,
        message: userReview ? "Review updated successfully!" : "Review submitted successfully!",
        type: "success",
      });

      // Immediately reflect submitted review in UI.
      const optimisticReview = {
        _id: `local-review-${Date.now()}`,
        userId: { name: user?.name || "You" },
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
        isApproved: true,
        isHidden: false,
      };
      setLocalReviews((prev) => {
        const filtered = prev.filter(
          (item) => (item.userId?.name || "").toLowerCase() !== (optimisticReview.userId?.name || "").toLowerCase()
        );
        return [optimisticReview, ...filtered];
      });

      setReviewRating(0);
      setReviewComment("");
      setWriteReviewOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewDialog({
        show: true,
        message: error.response?.data?.message || "Failed to submit review. Please try again.",
        type: "error",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    const text = questionText.trim();
    if (!text) return;
    const askedBy = user?.name || "Customer";
    const newQuestion = {
      id: `local-${Date.now()}`,
      question: text,
      answer: "Thanks for your question. Our team will respond soon.",
      askedBy,
      answeredBy: "Support Team",
      createdAt: new Date().toISOString(),
    };
    setQaList((prev) => [newQuestion, ...prev]);
    setQuestionText("");
  };

  const renderShopShell = (content) => {
    const currentCategorySlug = product?.category?.slug || "";
    const categoryPool = (allCategories.length > 0 ? allCategories : (product?.category ? [product.category] : [])).slice(0, 8);

    return (
      <div className="pd-with-shop-shell">
        <header className="cp2-topbar">
          <div className="cp2-topbar-left">
            <Link to="/shop" className="cp2-brand">
              <span className="cp2-brand-icon">🛍️</span>
              WellnessHub
            </Link>
          </div>
          <div className="cp2-topbar-center">
            <SearchBar placeholder="Search products..." />
          </div>
          <div className="cp2-topbar-right">
            <OrdersIcon />
            <WishlistIcon />
            <CartIcon />
            <Link to="/profile" className="cp2-profile-link" aria-label="Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor" />
                <path d="M12 14C7.58172 14 4 15.7909 4 18V22H20V18C20 15.7909 16.4183 14 12 14Z" fill="currentColor" />
              </svg>
            </Link>
          </div>
        </header>

        <div className="cp2-layout">
          <ShopModuleSidebar
            categories={categoryPool.map((c) => ({
              slug: c?.slug || "",
              label: c?.name,
              icon: c?.icon || "◌",
            }))}
          />

          <main className="cp2-main">{content}</main>
        </div>
      </div>
    );
  };

  if (loading) {
    return renderShopShell(<div className="product-detail-loading"><p>Loading product...</p></div>);
  }

  if (!product) {
    return renderShopShell(
      <div className="product-detail-error">
        <p>Product not found</p>
        <Link to="/shop">Back to Shop</Link>
      </div>
    );
  }

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  // Use utility function for image URL resolution

  const images = Array.isArray(product.images) ? product.images : [];
  const normalizedImages = images
    .map((img) => {
      if (typeof img === "string") return { url: img };
      if (img && typeof img === "object") return { url: img.url || img.path || img.image };
      return null;
    })
    .filter((img) => img?.url);
  const mainImage =
    getImageUrl(normalizedImages[selectedImage]?.url) ||
    getImageUrl(product.image) ||
    "/images/placeholder-product.jpg";
  const approvedReviews = (product.reviews || []).filter(
    (review) => review.isApproved && !review.isHidden
  );
  const allVisibleReviews = [...localReviews, ...approvedReviews];
  const uniqueVisibleReviews = allVisibleReviews.filter((review, index, arr) => {
    const reviewerName = (review.userId?.name || "anonymous").trim().toLowerCase();
    const comment = (review.comment || "").trim().toLowerCase();
    const reviewDay = review.createdAt ? new Date(review.createdAt).toDateString() : "";
    return index === arr.findIndex((item) => {
      const itemReviewer = (item.userId?.name || "anonymous").trim().toLowerCase();
      const itemComment = (item.comment || "").trim().toLowerCase();
      const itemDay = item.createdAt ? new Date(item.createdAt).toDateString() : "";
      return itemReviewer === reviewerName && itemComment === comment && itemDay === reviewDay;
    });
  });
  const fallbackReviews = [
    {
      _id: "dummy-review-1",
      userId: { name: "Sarah M." },
      rating: 5,
      comment: "These are the best organic pads I've tried! So comfortable and gentle on sensitive skin.",
      createdAt: "2026-02-15T09:30:00.000Z",
      isApproved: true,
      isHidden: false,
    },
    {
      _id: "dummy-review-2",
      userId: { name: "Emily R." },
      rating: 5,
      comment: "Love that they are biodegradable. Great quality and very absorbent.",
      createdAt: "2026-02-10T11:15:00.000Z",
      isApproved: true,
      isHidden: false,
    },
    {
      _id: "dummy-review-3",
      userId: { name: "Jessica L." },
      rating: 4,
      comment: "Good product, wish they came in larger packs.",
      createdAt: "2026-01-28T14:45:00.000Z",
      isApproved: true,
      isHidden: false,
    },
  ];
  const displayReviews =
    uniqueVisibleReviews.length >= 3
      ? uniqueVisibleReviews
      : [...uniqueVisibleReviews, ...fallbackReviews.slice(0, 3 - uniqueVisibleReviews.length)];
  const tabItems = [
    { key: "reviews", label: `Reviews (${displayReviews.length})` },
    { key: "qna", label: "Q&A" },
    { key: "usage", label: "Usage Instructions" },
    { key: "ingredients", label: "Ingredients" },
  ];

  const normalizeFeatureList = (value) => {
    if (Array.isArray(value)) {
      const flattened = value.flatMap((item) => {
        const text = String(item || "").trim();
        if (!text) return [];
        // Handle previously stored JSON-stringified arrays.
        if (text.startsWith("[") && text.endsWith("]")) {
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              return parsed.map((entry) => String(entry || "").trim()).filter(Boolean);
            }
          } catch (_err) {
            // Fall through to delimiter split.
          }
        }
        return text.split(/\r?\n|,/).map((entry) => entry.trim()).filter(Boolean);
      });
      return flattened.filter(Boolean);
    }
    if (typeof value === "string") {
      return value.split(/\r?\n|,/).map((entry) => entry.trim()).filter(Boolean);
    }
    return [];
  };

  const normalizedFeatures = normalizeFeatureList(product.features);
  const normalizedIngredients = normalizeFeatureList(product.ingredients);
  const normalizedHealthBenefits = normalizeFeatureList(product.healthBenefits);

  const keyFeaturesRaw =
    normalizedFeatures.length > 0
      ? normalizedFeatures
      : normalizedIngredients.length > 0
      ? normalizedIngredients
      : normalizedHealthBenefits.length > 0
      ? normalizedHealthBenefits
      : Object.values(product.specifications || {}).map((item) => String(item || "").trim()).filter(Boolean);
  const keyFeatures = keyFeaturesRaw.slice(0, 4);

  const renderTabBody = (tabKey) => {
    if (tabKey === "reviews") {
      return (
        <div className="tab-panel">
          <div className="content-section">
            <div className="reviews-list-section">
              <div className="reviews-section-head">
                <h4>Customer Reviews</h4>
                <button
                  type="button"
                  className={`btn-write-review ${writeReviewOpen ? "active" : ""}`}
                  onClick={() => setWriteReviewOpen((prev) => !prev)}
                  aria-expanded={writeReviewOpen}
                  aria-controls="write-review-form"
                >
                  {writeReviewOpen ? "Close Review Form" : "Write a Review"}
                </button>
              </div>

              {writeReviewOpen && (
                <form id="write-review-form" className="review-form-section" onSubmit={handleSubmitReview}>
                  <h5>{userReview ? "Update your review" : "Write a review"}</h5>
                  <div className="review-form">
                    <div className="form-group">
                      <label htmlFor="review-rating-stars">Your rating</label>
                      <div
                        id="review-rating-stars"
                        className="star-rating-input"
                        role="radiogroup"
                        aria-label="Choose a rating from 1 to 5 stars"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${reviewRating >= star ? "active" : ""}`}
                            onClick={() => setReviewRating(star)}
                            aria-label={`${star} star${star > 1 ? "s" : ""}`}
                            aria-checked={reviewRating === star}
                            role="radio"
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="review-comment">Your review</label>
                      <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value.slice(0, 1000))}
                        maxLength={1000}
                        rows={4}
                        placeholder="Share your experience with this product..."
                        aria-label="Write your review"
                      />
                      <div className="review-char-count" aria-live="polite">
                        {reviewComment.length}/1000
                      </div>
                    </div>

                    <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}

              {displayReviews.length > 0 ? (
                <div className="reviews-list">
                  {displayReviews.map((review, index) => (
                    <div key={review._id || index} className="review-item">
                      <div className="review-header">
                        <div className="review-head-row">
                          <div className="reviewer-line">
                            <strong className="reviewer-name">{review.userId?.name || "Anonymous"}</strong>
                            <span className="verified-badge">Verified Buyer</span>
                          </div>
                          <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                      {review.comment && <p className="review-comment">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (tabKey === "qna") {
      return (
        <div className="tab-panel">
          <div className="content-section">
            <h3>Questions & Answers</h3>
            <form className="qa-form" onSubmit={handleSubmitQuestion}>
              <label htmlFor="qa-input">Ask a question</label>
              <div className="qa-input-row">
                <input
                  id="qa-input"
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question about this product..."
                  maxLength={250}
                />
                <button type="submit" className="btn-submit-question">Submit</button>
              </div>
            </form>

            <div className="qa-list">
              {qaList.length > 0 ? (
                qaList.map((item) => (
                  <article key={item.id} className="qa-item">
                    <p className="qa-question"><strong>Q:</strong> {item.question}</p>
                    {item.answer ? <p className="qa-answer"><strong>A:</strong> {item.answer}</p> : <p className="qa-pending">Awaiting answer</p>}
                    <div className="qa-meta">
                      <span>Asked by {item.askedBy}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="no-info">No questions yet. Ask the first one.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (tabKey === "usage") {
      return (
        <div className="tab-panel">
          <div className="content-section">
            <h3>Usage Instructions</h3>
            <div className="tab-content">
              {product.usageInstructions?.trim()
                ? product.usageInstructions
                : "No usage instructions available."}
            </div>
          </div>
        </div>
      );
    }

    if (tabKey === "ingredients") {
      const ingredientsList = normalizeFeatureList(product.ingredients);
      return (
        <div className="tab-panel">
          <div className="content-section">
            <h3>Ingredients</h3>
            <div className="tab-content">
              {ingredientsList.length > 0 ? (
                <ul className="ingredients-list">
                  {ingredientsList.map((ingredient, index) => (
                    <li key={`${ingredient}-${index}`}>{ingredient}</li>
                  ))}
                </ul>
              ) : (
                "No ingredients available."
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return renderShopShell(
    <div className="product-detail pd-exact-layout">
      <div className="product-detail-container">
        <div className="product-detail-content" ref={productDescriptionRef}>
          {/* Image Gallery */}
          <div className="product-images">
            <div className="main-image-wrapper">
              <div
                className="main-image image-container"
                onClick={() => normalizedImages.length > 0 && setImageZoom(true)}
              >
                {(product.isBestSeller || product.isFeatured) && (
                  <span className="pd-image-badge" aria-label={product.isBestSeller ? "Best Seller" : "New"}>
                    {product.isBestSeller ? "Best Seller" : "New"}
                  </span>
                )}
                <button
                  className={`pd-image-wishlist ${inWishlist ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist();
                  }}
                  disabled={wishlistLoading}
                  aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
                >
                  {inWishlist ? "♥" : "♡"}
                </button>
                <img
                  className="product-image"
                  src={mainImage}
                  alt={product.name}
                />
                {discountPercentage > 0 && (
                  <span className="discount-badge">-{discountPercentage}%</span>
                )}
                {product.stock === 0 && (
                  <div className="out-of-stock-overlay">Out of Stock</div>
                )}
              </div>
              {normalizedImages.length > 1 && (
                <div className="image-thumbnails">
                  {normalizedImages.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${selectedImage === index ? "active" : ""}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={getImageUrl(img.url) || "/images/placeholder-product.jpg"}
                        alt={`${product.name} ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-breadcrumb">
              <Link to="/shop">Shop</Link>
              <span> / </span>
              <Link to={`/shop/category/${product.category?.slug || ""}`}>
                {product.category?.name || "Category"}
              </Link>
            </div>

            <div className="pd-title-row">
              {(product.isBestSeller || product.isFeatured) && (
                <span className="pd-top-badge">{product.isBestSeller ? "Best Seller" : "New"}</span>
              )}
              <h1 className="product-title">{product.name}</h1>
            </div>

            {product.brand && (
              <div className="product-brand">Brand: {product.brand}</div>
            )}

            <div className="product-rating-section">
              <div className="stars">
                {"★".repeat(Math.floor(product.rating?.average || 0))}
                {"☆".repeat(5 - Math.floor(product.rating?.average || 0))}
              </div>
              <span className="rating-value">
                {product.rating?.average || 0} ({product.rating?.count || 0} reviews)
              </span>
            </div>

            <div className="product-price-section">
              <span className="current-price">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                  <span className="discount-text">Save ₹{(product.originalPrice - product.price).toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <div className="stock-available">
                  <span className="stock-icon">✓</span>
                  <span>{product.stock} in stock</span>
                </div>
              ) : (
                <div className="stock-unavailable">
                  <span className="stock-icon">✗</span>
                  <span>Out of stock</span>
                </div>
              )}
            </div>

            {product.description && <p className="pd-short-description">{product.description}</p>}

            {keyFeatures.length > 0 && (
              <div className="quick-info">
                <strong>Key Features:</strong>
                <ul className="pd-key-features">
                  {keyFeatures.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="product-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    aria-label="Product quantity"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-add-to-cart pd-btn-add"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  aria-label="Add product to cart"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  className="btn-buy-now pd-btn-buy"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  aria-label="Buy product now"
                >
                  Buy Now
                </button>
                <button className="btn-icon-action" onClick={handleShareWhatsApp} aria-label="Share product on WhatsApp">
                  <FaWhatsapp />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <span className="trust-icon">🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="trust-badge">
                <span className="trust-icon">🚚</span>
                <span>Free Delivery</span>
              </div>
              <div className="trust-badge">
                <span className="trust-icon">↩️</span>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs tabs-header">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => handleTabToggle(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-label={tab.label}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tabs-content">{activeTab ? renderTabBody(activeTab) : null}</div>

          <div className="tabs-accordion-mobile" aria-label="Product information sections">
            {tabItems.map((tab) => (
              <details key={tab.key} className="mobile-tab-item">
                <summary>{tab.label}</summary>
                <div className="mobile-tab-panel">{renderTabBody(tab.key)}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} variant="modern" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div className="image-zoom-modal" onClick={() => setImageZoom(false)}>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-zoom" onClick={() => setImageZoom(false)}>×</button>
            <img src={mainImage} alt={product.name} />
            {normalizedImages.length > 1 && (
              <div className="zoom-thumbnails">
                {normalizedImages.map((img, index) => (
                  <button
                    key={index}
                    className={`zoom-thumbnail ${selectedImage === index ? "active" : ""}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={getImageUrl(img.url) || "/images/placeholder-product.jpg"}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Success/Error Dialog */}
      <SuccessDialog
        show={reviewDialog.show}
        message={reviewDialog.message}
        type={reviewDialog.type}
        onClose={() => setReviewDialog({ ...reviewDialog, show: false })}
      />
    </div>
  );
};

export default ProductDetail;
