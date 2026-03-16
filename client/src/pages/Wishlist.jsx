import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const [wishlistRes, categoriesRes] = await Promise.all([
        api.get("/wishlist"),
        api.get("/categories").catch(() => ({ data: { categories: [] } })),
      ]);
      const wishlistProducts = wishlistRes.data?.products || [];
      setProducts(wishlistProducts);
      setAllCategories(categoriesRes.data?.categories || []);

      if (wishlistProducts.length > 0) {
        const suggestionsRes = await api.get("/products?sortBy=newest&limit=6").catch(() => ({ data: { products: [] } }));
        const wishlistIds = new Set(wishlistProducts.map((p) => p._id));
        const suggestionPool = (suggestionsRes.data?.products || []).filter((p) => !wishlistIds.has(p._id));
        setSuggestions(suggestionPool.slice(0, 4));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/wishlist");
      return;
    }
    fetchWishlist();

    // Listen for wishlist update events
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [fetchWishlist, navigate]);

  const handleWishlistChange = (productId, inWishlist) => {
    if (!inWishlist) {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  const handleShareWishlist = async () => {
    const shareData = {
      title: "My WellnessHub Wishlist",
      text: "Check out products from my WellnessHub wishlist.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      window.alert("Wishlist link copied!");
    } catch (error) {
      console.error("Failed to share wishlist:", error);
    }
  };

  const sidebarCategories = allCategories.length > 0
    ? allCategories.slice(0, 4)
    : [
        { name: "Menstrual Care", icon: "◌", slug: "menstrual-care" },
        { name: "Pregnancy Care", icon: "◌", slug: "pregnancy-care" },
        { name: "Wellness", icon: "◌", slug: "wellness" },
        { name: "Personal Care", icon: "◌", slug: "personal-care" },
      ];

  if (loading) {
    return (
      <div className="wishlist-page cp2-page">
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
            categories={sidebarCategories.map((c) => ({
              slug: c.slug || "",
              label: c.name,
              icon: c.icon || "◌",
            }))}
          />
          <main className="cp2-main wishlist-main">
            <div className="wishlist-header-row">
              <div>
                <h1>My Wishlist</h1>
                <p>Loading your saved products...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page cp2-page">
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
          categories={sidebarCategories.map((c) => ({
            slug: c.slug || "",
            label: c.name,
            icon: c.icon || "◌",
          }))}
        />

        <main className="cp2-main wishlist-main">
          <div className="wishlist-header-row">
            <div>
              <h1>My Wishlist</h1>
              <p>{products.length} items saved</p>
            </div>
            <button type="button" className="wishlist-share-btn" onClick={handleShareWishlist}>
              ⤴ Share Wishlist
            </button>
          </div>

          {products.length === 0 ? (
            <div className="wishlist-empty">
              <p>Your wishlist is empty.</p>
              <Link to="/shop" className="btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  viewMode="grid"
                  inWishlist={true}
                  onWishlistChange={handleWishlistChange}
                  variant="modern"
                />
              ))}
            </div>
          )}

          <section className="wishlist-suggestions">
            <h2>You might also like</h2>
            <p>Based on your wishlist, we think you'll love these products too.</p>
            {suggestions.length > 0 && (
              <div className="wishlist-suggestions-grid">
                {suggestions.map((product) => (
                  <ProductCard key={product._id} product={product} viewMode="grid" variant="modern" />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Wishlist;
