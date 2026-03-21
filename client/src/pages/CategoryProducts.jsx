import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";

const PRICE_BUCKETS = [
  { key: "0-100", label: "$0 - $100", min: "0", max: "100" },
  { key: "100-500", label: "$100 - $500", min: "100", max: "500" },
  { key: "500-1000", label: "$500 - $1000", min: "500", max: "1000" },
];

const CategoryProducts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  // Filters
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const filterPanelRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Memoized fetchProducts function to avoid recreating on every render
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Always use slug from URL if available, or category slug/ID
      const categoryParam = category?._id || category?.slug || slug;
      if (categoryParam) {
        params.append("category", categoryParam);
      }
      
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (minRating) params.append("minRating", minRating);
      if (inStock) params.append("inStock", "true");
      params.append("sortBy", sortBy);
      params.append("page", page);
      params.append("limit", "12");

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalProducts(response.data.pagination?.total || 0);

      // Update URL params
      const newParams = new URLSearchParams();
      if (minPrice) newParams.set("minPrice", minPrice);
      if (maxPrice) newParams.set("maxPrice", maxPrice);
      if (minRating) newParams.set("minRating", minRating);
      if (inStock) newParams.set("inStock", "true");
      newParams.set("sortBy", sortBy);
      if (page > 1) newParams.set("page", page);
      setSearchParams(newParams);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [category, slug, minPrice, maxPrice, minRating, inStock, sortBy, page, setSearchParams]);

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch category and products in parallel when slug changes
  useEffect(() => {
    setIsInitialLoad(true);
    // Reset filters when category changes
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setInStock(false);
    setPage(1);
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch category and products in parallel for faster loading
        const params = new URLSearchParams();
        params.append("category", slug);
        params.append("sortBy", "newest"); // Use default sort for initial load
        params.append("page", "1");
        params.append("limit", "12");

        const [categoryRes, productsRes, categoriesRes] = await Promise.allSettled([
          api.get(`/categories/${slug}`).catch(() => ({ data: null })), // Don't fail if category not found
          api.get(`/products?${params.toString()}`), // Fetch products immediately using slug
          api.get("/categories"),
        ]);

        // Set category if found
        if (categoryRes.status === 'fulfilled' && categoryRes.value?.data?.category) {
          setCategory(categoryRes.value.data.category);
        } else {
          // Fallback category
          setCategory({
            name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            slug: slug,
            _id: null
          });
        }

        // Set products if fetch succeeded
        if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
          setProducts(productsRes.value.data.products || []);
          setTotalPages(productsRes.value.data.pagination?.pages || 1);
          setTotalProducts(productsRes.value.data.pagination?.total || 0);
        }

        if (categoriesRes.status === "fulfilled" && categoriesRes.value?.data?.categories) {
          setAllCategories(categoriesRes.value.data.categories);
        } else {
          setAllCategories([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, [slug, sortBy]); // Only re-run when slug or sortBy changes

  // Debounced effect for filter changes (not initial load)
  useEffect(() => {
    // Skip if this is the initial load
    if (isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms debounce for filter changes

    return () => clearTimeout(timeoutId);
  }, [minPrice, maxPrice, minRating, inStock, sortBy, page, isInitialLoad, fetchProducts]);

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
    fetchProducts();
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setInStock(false);
    setSortBy("newest");
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!filtersExpanded) return;
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setFiltersExpanded(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setFiltersExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [filtersExpanded]);

  if (!category) {
    return (
      <div className="category-products-loading">
        <p>Loading category...</p>
      </div>
    );
  }

  const hasActiveFilters = minPrice || maxPrice || minRating || inStock || sortBy !== "newest";

  const selectedPriceBucket = PRICE_BUCKETS.find(
    (bucket) => bucket.min === String(minPrice || "") && bucket.max === String(maxPrice || "")
  )?.key || "";

  const applyPriceBucket = (bucketKey) => {
    const bucket = PRICE_BUCKETS.find((item) => item.key === bucketKey);
    if (!bucket) return;
    setMinPrice(bucket.min);
    setMaxPrice(bucket.max);
    setPage(1);
  };

  const renderFiltersPanel = (extraClass = "") => (
    <div
      ref={filterPanelRef}
      className={`filter-container cp2-sort-filter ${filtersExpanded ? "is-open" : "is-collapsed"} ${extraClass}`.trim()}
    >
      <div
        className="filter-header cp2-sort-filter-head"
        onClick={() => setFiltersExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFiltersExpanded((prev) => !prev);
          }
        }}
        aria-expanded={filtersExpanded}
        aria-controls={`cp2-filter-panel-${extraClass || "desktop"}`}
      >
        <h3 className="cp2-filter-title">Sort &amp; Filter</h3>
        <span className={`arrow cp2-filter-chevron ${filtersExpanded ? "open" : ""}`} aria-hidden="true">⌄</span>
      </div>

      {filtersExpanded && (
        <div
          className="filter-content cp2-filter-body"
          id={`cp2-filter-panel-${extraClass || "desktop"}`}
        >
          <div className="cp2-sort-head-actions">
            <button
              className="clear-filters"
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className="cp2-filter-panels">
            <section className="cp2-filter-group">
              <h4>Sort By</h4>
              <div className="cp2-filter-content cp2-option-stack">
                <label className="cp2-option-item filter-option">
                  <input
                    type="radio"
                    name={`sort-${extraClass || "desktop"}`}
                    value="newest"
                    checked={sortBy === "newest"}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sort by newest"
                  />
                  <span>Newest</span>
                </label>
                <label className="cp2-option-item filter-option">
                  <input
                    type="radio"
                    name={`sort-${extraClass || "desktop"}`}
                    value="price-asc"
                    checked={sortBy === "price-asc"}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sort by price low to high"
                  />
                  <span>Price: Low to High</span>
                </label>
                <label className="cp2-option-item filter-option">
                  <input
                    type="radio"
                    name={`sort-${extraClass || "desktop"}`}
                    value="price-desc"
                    checked={sortBy === "price-desc"}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sort by price high to low"
                  />
                  <span>Price: High to Low</span>
                </label>
                <label className="cp2-option-item filter-option">
                  <input
                    type="radio"
                    name={`sort-${extraClass || "desktop"}`}
                    value="rating"
                    checked={sortBy === "rating"}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sort by rating"
                  />
                  <span>Rating</span>
                </label>
              </div>
            </section>

            <section className="cp2-filter-group">
              <h4>Price Range</h4>
              <div className="cp2-filter-content cp2-option-stack">
                {PRICE_BUCKETS.map((bucket) => (
                  <label key={bucket.key} className="cp2-option-item filter-option">
                    <input
                      type="radio"
                      name={`price-range-${extraClass || "desktop"}`}
                      value={bucket.key}
                      checked={selectedPriceBucket === bucket.key}
                      onChange={(e) => {
                        applyPriceBucket(e.target.value);
                        handleFilterChange();
                      }}
                      aria-label={`Price range ${bucket.label}`}
                    />
                    <span>{bucket.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="cp2-filter-group">
              <h4>Rating</h4>
              <div className="cp2-filter-content cp2-option-stack">
                {[5, 4, 3].map((rating) => (
                  <label key={rating} className="cp2-option-item filter-option">
                    <input
                      type="radio"
                      name={`minRating-${extraClass || "desktop"}`}
                      value={rating}
                      checked={minRating === rating.toString()}
                      onChange={(e) => {
                        setMinRating(e.target.value);
                        handleFilterChange();
                      }}
                      aria-label={`${rating} stars and up`}
                    />
                    <span className="rating-stars">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
                    <span className="rating-text">& up</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="cp2-filter-group">
              <h4>Availability</h4>
              <div className="cp2-filter-content cp2-option-stack">
                <label className="cp2-option-item filter-option">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => {
                      setInStock(e.target.checked);
                      handleFilterChange();
                    }}
                    aria-label="In stock only"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="category-products cp2-page">
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
          categories={(allCategories.length > 0 ? allCategories : [category]).slice(0, 8).map((c) => ({
            slug: c.slug || slug,
            label: c.name,
            icon: c.icon || "◌",
          }))}
        />

        <main className="cp2-main">
          <div className="cp2-title-row">
            <h1>{category.name}</h1>
            <p>{loading ? "Loading..." : `${totalProducts} products available`}</p>
          </div>

          <div className="cp2-content-grid">
            <section className="products-section cp2-products-section">
              {renderFiltersPanel("desktop")}

              {loading ? (
                <div className="products-loading">Loading products...</div>
              ) : products.length > 0 ? (
                <>
                  <div className="products-grid">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} viewMode="grid" variant="modern" />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                      <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((num) => num === 1 || num === totalPages || (num >= page - 1 && num <= page + 1))
                          .map((num, index, array) => {
                            const prev = array[index - 1];
                            if (prev && num - prev > 1) {
                              return (
                                <React.Fragment key={num}>
                                  <span className="pagination-ellipsis">...</span>
                                  <button
                                    className={`pagination-number ${num === page ? "active" : ""}`}
                                    onClick={() => handlePageChange(num)}
                                  >
                                    {num}
                                  </button>
                                </React.Fragment>
                              );
                            }
                            return (
                              <button
                                key={num}
                                className={`pagination-number ${num === page ? "active" : ""}`}
                                onClick={() => handlePageChange(num)}
                              >
                                {num}
                              </button>
                            );
                          })}
                      </div>
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="products-empty">
                  <p>No products found matching your filters.</p>
                  {hasActiveFilters && (
                    <button className="btn-clear-filters" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryProducts;
