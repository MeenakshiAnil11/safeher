import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import CategoryGrid from "../components/CategoryGrid";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import EcommerceSidebar from "../components/EcommerceSidebar";
import "./ShopHome.css";

const ShopHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch featured products
        const featuredRes = await api.get("/products/featured?limit=8");
        setFeaturedProducts(featuredRes.data?.products || []);

        // Fetch best sellers
        const bestSellersRes = await api.get("/products/bestsellers?limit=8");
        setBestSellers(bestSellersRes.data?.products || []);

        // Fetch categories
        const categoriesRes = await api.get("/categories");
        setCategories(categoriesRes.data?.categories || []);

        // Check if user is logged in
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <EcommerceSidebar />
      <div className="ecom-main-with-sidebar shop-home">
      {/* Header */}
      <header className="shop-header">
        <div className="shop-header-container">
          <Link to="/shop" className="shop-logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">Women's Health Store</span>
          </Link>

          <div className="shop-header-center">
            <SearchBar placeholder="Search for menstrual care, pregnancy products, wellness..." />
          </div>

          <div className="shop-header-right">
            {user ? (
              <>
                <Link to="/dashboard" className="header-link">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 4C3 3.44772 3.44772 3 4 3H6C6.55228 3 7 3.44772 7 4V6C7 6.55228 6.55228 7 6 7H4C3.44772 7 3 6.55228 3 6V4Z"
                      fill="currentColor"
                    />
                    <path
                      d="M3 10C3 9.44772 3.44772 9 4 9H6C6.55228 9 7 9.44772 7 10V16C7 16.5523 6.55228 17 6 17H4C3.44772 17 3 16.5523 3 16V10Z"
                      fill="currentColor"
                    />
                    <path
                      d="M9 4C9 3.44772 9.44772 3 10 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H10C9.44772 7 9 6.55228 9 6V4Z"
                      fill="currentColor"
                    />
                    <path
                      d="M9 10C9 9.44772 9.44772 9 10 9H16C16.5523 9 17 9.44772 17 10V16C17 16.5523 16.5523 17 16 17H10C9.44772 17 9 16.5523 9 16V10Z"
                      fill="currentColor"
                    />
                  </svg>
                  Dashboard
                </Link>
                <Link to="/profile" className="header-link">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                      fill="currentColor"
                    />
                    <path
                      d="M10 12C5.58172 12 2 13.7909 2 16V20H18V16C18 13.7909 14.4183 12 10 12Z"
                      fill="currentColor"
                    />
                  </svg>
                  {user.name?.split(" ")[0] || "Account"}
                </Link>
                <div className="header-icons">
                  <OrdersIcon />
                  <WishlistIcon />
                  <CartIcon />
                </div>
              </>
            ) : (
              <div className="header-auth">
                <Link to="/login" className="btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn-register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="shop-hero">
        <div className="shop-hero-content">
          <div className="shop-hero-text">
            <h1 className="shop-hero-title">
              Trusted Products for Women's Health & Wellness
            </h1>
            <p className="shop-hero-subtitle">
              Discover premium menstrual care, pregnancy essentials, and wellness
              products designed with your health in mind.
            </p>
            <div className="shop-hero-actions">
              <button 
                onClick={() => {
                  const categorySection = document.getElementById('categories-section');
                  if (categorySection) {
                    categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="btn-primary"
              >
                Browse Products
              </button>
            </div>
          </div>
          <div className="shop-hero-image">
            <div className="hero-image-placeholder">
              <span className="hero-emoji">💜</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="shop-main">
        <div className="shop-container">
          {/* Categories Section */}
          <section id="categories-section" className="shop-section">
            <h2 className="section-title">Shop by Category</h2>
            <CategoryGrid categories={categories} />
          </section>

          {/* Featured Products */}
          <section className="shop-section">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
              <Link to="/shop?featured=true" className="section-link">
                View All →
              </Link>
            </div>
            {loading ? (
              <div className="products-loading">Loading products...</div>
            ) : featuredProducts.length > 0 ? (
              <div className="products-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="products-empty">
                <p>No featured products available at the moment.</p>
              </div>
            )}
          </section>

          {/* Best Sellers */}
          <section className="shop-section">
            <div className="section-header">
              <h2 className="section-title">Best Sellers</h2>
              <Link to="/shop/best-sellers" className="section-link">
                View All →
              </Link>
            </div>
            {loading ? (
              <div className="products-loading">Loading products...</div>
            ) : bestSellers.length > 0 ? (
              <div className="products-grid">
                {bestSellers.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="products-empty">
                <p>No best sellers available at the moment.</p>
              </div>
            )}
          </section>

          {/* Trust Banner */}
          <section className="shop-trust">
            <div className="trust-content">
              <h3>Why Shop With Us?</h3>
              <div className="trust-features">
                <div className="trust-feature">
                  <span className="trust-icon">✓</span>
                  <div>
                    <strong>Trusted Products</strong>
                    <p>Curated selection of women's health essentials</p>
                  </div>
                </div>
                <div className="trust-feature">
                  <span className="trust-icon">🚚</span>
                  <div>
                    <strong>Free Shipping</strong>
                    <p>On orders above ₹500</p>
                  </div>
                </div>
                <div className="trust-feature">
                  <span className="trust-icon">🔒</span>
                  <div>
                    <strong>Secure Checkout</strong>
                    <p>Safe and encrypted payment processing</p>
                  </div>
                </div>
                <div className="trust-feature">
                  <span className="trust-icon">↩️</span>
                  <div>
                    <strong>Easy Returns</strong>
                    <p>Hassle-free return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="shop-footer">
        <div className="shop-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/shop">Shop</Link>
            </div>
            <div className="footer-section">
              <h4>Customer Service</h4>
              <Link to="/shop/support">Help Center</Link>
              <Link to="/shop/shipping">Shipping Info</Link>
              <Link to="/shop/returns">Returns</Link>
            </div>
            <div className="footer-section">
              <h4>Account</h4>
              {user ? (
                <>
                  <Link to="/profile">My Account</Link>
                  <Link to="/shop/orders">My Orders</Link>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Women's Health Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default ShopHome;
