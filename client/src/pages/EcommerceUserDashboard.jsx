import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ProductCard from "../components/ProductCard";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import { logout } from "../services/auth";
import { getImageUrl } from "../utils/imageUtils";
import menstrualHero from "../assets/menstrual-hero2.jpg";
import pregnancyHero from "../assets/pregnancy-hero1.jpg";
import wellnessHero from "../assets/wellness-hero2.jpg";
import "./CategoryProducts.css";
import "./EcommerceNavPages.css";

const HERO_SLIDES = [
  {
    id: "hero-1",
    image: menstrualHero,
    title: "Menstrual Care Essentials",
    subtitle: "Comfort-focused products curated for every cycle phase.",
    ctaLabel: "Shop Offers",
    ctaTo: "/shop/offers",
  },
  {
    id: "hero-2",
    image: pregnancyHero,
    title: "Pregnancy Care Collection",
    subtitle: "Prenatal and postnatal care picks for a safer, healthier journey.",
    ctaLabel: "Explore New Arrivals",
    ctaTo: "/shop/new-arrivals",
  },
  {
    id: "hero-3",
    image: wellnessHero,
    title: "Wellness & Daily Care",
    subtitle: "Top wellness products for better balance, energy, and routine health.",
    ctaLabel: "View Best Sellers",
    ctaTo: "/shop/best-sellers",
  },
];

const getOrderBucket = (status = "") => {
  if (["placed", "confirmed", "packed", "pending"].includes(status)) return "processing";
  if (status === "shipped") return "shipped";
  if (status === "delivered") return "delivered";
  return "processing";
};

const EcommerceUserDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    tracking: 0,
    delivered: 0,
  });
  const [heroIndex, setHeroIndex] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [popularPicks, setPopularPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserName(parsed?.name || "User");
          setUserEmail(parsed?.email || "");
        }

        const [ordersRes, wishlistRes, productsRes] = await Promise.all([
          api.get("/orders?page=1&limit=200").catch(() => ({ data: { orders: [] } })),
          api.get("/wishlist").catch(() => ({ data: { products: [] } })),
          api.get("/products?sortBy=newest&limit=60").catch(() => ({ data: { products: [] } })),
        ]);
        const orderList = ordersRes.data?.orders || [];
        const wishlistList = wishlistRes.data?.products || [];
        const productList = productsRes.data?.products || [];
        const wishlistIds = new Set(wishlistList.map((p) => p._id));

        const popularityByProductId = {};
        for (const order of orderList) {
          for (const item of order.items || []) {
            const pid = String(item.product || "");
            if (!pid) continue;
            popularityByProductId[pid] = (popularityByProductId[pid] || 0) + Number(item.quantity || 1);
          }
        }

        const rankedProducts = [...productList]
          .filter((p) => p?.isActive !== false)
          .sort((a, b) => {
            const aScore =
              (popularityByProductId[String(a._id)] || 0) * 3 +
              (a?.isBestSeller ? 2 : 0) +
              Number(a?.rating?.average || 0);
            const bScore =
              (popularityByProductId[String(b._id)] || 0) * 3 +
              (b?.isBestSeller ? 2 : 0) +
              Number(b?.rating?.average || 0);
            return bScore - aScore;
          });

        setStats({
          orders: orderList.length,
          wishlist: wishlistList.length,
          tracking: orderList.filter((o) => ["placed", "confirmed", "packed", "shipped"].includes(o.orderStatus)).length,
          delivered: orderList.filter((o) => o.orderStatus === "delivered").length,
        });
        setRecentOrders(orderList.slice(0, 5));
        setWishlistItems(wishlistList.slice(0, 6));
        setPopularPicks(rankedProducts.filter((p) => !wishlistIds.has(p._id)).slice(0, 6));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const completionRate = useMemo(() => {
    if (stats.orders === 0) return 0;
    return Math.round((stats.delivered / stats.orders) * 100);
  }, [stats.delivered, stats.orders]);

  const processingOrders = useMemo(
    () => recentOrders.filter((o) => getOrderBucket(o.orderStatus) !== "delivered"),
    [recentOrders]
  );

  const deliveryProgressPercent = useMemo(() => {
    if (processingOrders.length === 0) return 100;
    const first = processingOrders[0];
    const bucket = getOrderBucket(first.orderStatus);
    if (bucket === "processing") return 40;
    if (bucket === "shipped") return 75;
    return 100;
  }, [processingOrders]);

  const rewardPoints = useMemo(() => stats.delivered * 20 + stats.wishlist * 2, [stats.delivered, stats.wishlist]);
  const rewardTier = rewardPoints >= 1000 ? "Gold" : rewardPoints >= 500 ? "Silver" : "Bronze";
  const deliveryEstimate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setHeroIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const onHeroTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX || 0;
  };

  const onHeroTouchEnd = (e) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) nextSlide();
    else prevSlide();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="cp2-page ecom-nav-page">
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
        <ShopModuleSidebar />

        <main className="cp2-main ecom-content-main">
          <section className="ecom-content-section">
            <div className="ecom-page-head">
              <h1>My Dashboard</h1>
              <p>Welcome back, {userName}. Manage orders, wishlist, profile, tracking and more in one place.</p>
            </div>

            <section
              className="eud-hero"
              aria-label="Promotions carousel"
              onTouchStart={onHeroTouchStart}
              onTouchEnd={onHeroTouchEnd}
            >
              {HERO_SLIDES.map((slide, index) => (
                <article
                  key={slide.id}
                  className={`eud-hero-slide ${index === heroIndex ? "active" : ""}`}
                  aria-hidden={index !== heroIndex}
                >
                  <img src={slide.image} alt={slide.title} />
                  <div className="eud-hero-overlay">
                    <h2>{slide.title}</h2>
                    <p>{slide.subtitle}</p>
                    <Link to={slide.ctaTo} className="eud-hero-cta">
                      {slide.ctaLabel}
                    </Link>
                  </div>
                </article>
              ))}
              <button
                type="button"
                className="eud-hero-arrow left"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                className="eud-hero-arrow right"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                ›
              </button>
              <div className="eud-hero-dots" role="tablist" aria-label="Choose slide">
                {HERO_SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`eud-dot ${index === heroIndex ? "active" : ""}`}
                    onClick={() => setHeroIndex(index)}
                    aria-label={`Go to ${slide.title}`}
                    aria-selected={index === heroIndex}
                  />
                ))}
              </div>
            </section>

            <div className="dashboard-stats-grid">
              <Link to="/shop/orders" className="dashboard-stat-card lavender">
                <div className="dash-stat-top"><span>Orders</span><span aria-hidden="true">📦</span></div>
                <strong>{stats.orders}</strong>
                <p>Total orders placed</p>
              </Link>
              <Link to="/wishlist" className="dashboard-stat-card teal">
                <div className="dash-stat-top"><span>Wishlist</span><span aria-hidden="true">♡</span></div>
                <strong>{stats.wishlist}</strong>
                <p>Saved for later</p>
              </Link>
              <Link to="/shop/orders" className="dashboard-stat-card coral">
                <div className="dash-stat-top"><span>Tracking</span><span aria-hidden="true">🚚</span></div>
                <strong>{stats.tracking}</strong>
                <p>Active deliveries</p>
              </Link>
              <Link to="/profile" className="dashboard-stat-card neutral">
                <div className="dash-stat-top"><span>Profile</span><span aria-hidden="true">👤</span></div>
                <strong>{completionRate}%</strong>
                <p>Delivery success rate</p>
              </Link>
            </div>

            <section className="eud-sections-grid">
              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Orders</h2>
                  <Link to="/shop/orders">View all orders</Link>
                </div>
                {loading ? (
                  <div className="ecom-state-card">Loading recent orders...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="ecom-state-card">No orders yet. Start shopping today.</div>
                ) : (
                  <div className="dashboard-order-list">
                    {recentOrders.map((order) => (
                      <Link key={order._id} to={`/shop/orders/${order._id}`} className="dashboard-order-row">
                        <div>
                          <h4>{order.orderNumber}</h4>
                          <p>{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>
                        <div className="dash-order-meta">
                          <strong>Rs. {Number(order.total || 0).toFixed(2)}</strong>
                          <span className={`dash-order-status ${order.orderStatus}`}>{getOrderBucket(order.orderStatus)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Wishlist</h2>
                  <Link to="/wishlist">Open wishlist</Link>
                </div>
                {loading ? (
                  <div className="ecom-state-card">Loading wishlist...</div>
                ) : wishlistItems.length === 0 ? (
                  <div className="ecom-state-card">Wishlist is empty. Save your favorite products.</div>
                ) : (
                  <div className="dashboard-wishlist-list">
                    {wishlistItems.map((item) => (
                      <Link key={item._id} to={`/shop/products/${item._id}`} className="dashboard-wishlist-row">
                        <img
                          src={
                            getImageUrl(item.images?.[0]?.url || item.image) ||
                            "/images/placeholder-product.jpg"
                          }
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/placeholder-product.jpg";
                          }}
                        />
                        <div>
                          <h4>{item.name}</h4>
                          <p>Rs. {Number(item.price || 0).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Profile</h2>
                  <Link to="/profile">Edit profile</Link>
                </div>
                <div className="eud-simple-list">
                  <p><strong>Name:</strong> {userName}</p>
                  <p><strong>Email:</strong> {userEmail || "Not available"}</p>
                  <div className="dashboard-quick-actions">
                    <Link to="/profile" className="dash-action-btn">Edit Info</Link>
                    <Link to="/profile" className="dash-action-btn">Change Password</Link>
                  </div>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Tracking</h2>
                  <Link to="/shop/orders">Track shipment</Link>
                </div>
                <div className="eud-simple-list">
                  <p><strong>Active Shipments:</strong> {stats.tracking}</p>
                  <div className="eud-progress">
                    <span style={{ width: `${deliveryProgressPercent}%` }} />
                  </div>
                  <p><strong>Estimated Delivery:</strong> {deliveryEstimate}</p>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Returns & Refunds</h2>
                  <Link to="/shop/orders">Initiate Return</Link>
                </div>
                <div className="eud-simple-list">
                  <p>Request return from your order details page.</p>
                  <p><strong>Refund Status:</strong> Check latest updates in order timeline.</p>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Payment Methods</h2>
                  <Link to="/profile">Manage billing</Link>
                </div>
                <div className="eud-simple-list">
                  <p>Saved methods: Razorpay, UPI, Wallet</p>
                  <p><strong>Billing Address:</strong> Manage in profile settings.</p>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Support & FAQs</h2>
                  <Link to="/shop/support">Help Center</Link>
                </div>
                <div className="dashboard-quick-actions">
                  <Link to="/shop/support" className="dash-action-btn">Help Articles</Link>
                  <Link to="/shop/support" className="dash-action-btn">Contact Support</Link>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Notifications</h2>
                  <Link to="/shop/orders">View updates</Link>
                </div>
                <div className="eud-simple-list">
                  <p>Order and shipping alerts are shown in your order timeline.</p>
                  <p>Offer notifications appear on banner and offers pages.</p>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Loyalty & Rewards</h2>
                  <Link to="/shop/offers">Redeem perks</Link>
                </div>
                <div className="eud-simple-list">
                  <p><strong>Points:</strong> {rewardPoints}</p>
                  <p><strong>Tier:</strong> {rewardTier}</p>
                </div>
              </article>

              <article className="dashboard-block">
                <div className="dashboard-block-head">
                  <h2>Logout</h2>
                </div>
                <button type="button" className="dash-help-btn eud-logout-btn" onClick={handleLogout}>
                  Secure Sign-out
                </button>
              </article>
            </section>

            <article className="dashboard-block eud-popular-section">
              <div className="dashboard-block-head">
                <h2>Most Ordered Products</h2>
                <Link to="/shop/best-sellers">See all</Link>
              </div>
              {loading ? (
                <div className="ecom-state-card">Loading popular picks...</div>
              ) : popularPicks.length === 0 ? (
                <div className="ecom-state-card">New recommendations will appear here soon.</div>
              ) : (
                <div className="ecom-products-grid">
                  {popularPicks.map((product) => (
                    <ProductCard key={product._id} product={product} variant="modern" />
                  ))}
                </div>
              )}
            </article>

            <div className="dashboard-help-card">
              <div>
                <h3>Need assistance?</h3>
                <p>Get fast support for tracking, returns, and refunds.</p>
              </div>
              <Link to="/shop/support" className="dash-help-btn">Support & FAQs</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EcommerceUserDashboard;
