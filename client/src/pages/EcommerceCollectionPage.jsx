import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ProductCard from "../components/ProductCard";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./EcommerceNavPages.css";

const PAGE_CONFIG = {
  offers: {
    heading: "Offers & Discounts",
    description: "Discover products with the biggest savings.",
  },
  bestSellers: {
    heading: "Best Sellers",
    description: "Most loved products chosen by our customers.",
  },
  newArrivals: {
    heading: "New Arrivals",
    description: "Freshly added products, curated for you.",
  },
};

const EcommerceCollectionPage = ({ type = "offers" }) => {
  const cfg = PAGE_CONFIG[type] || PAGE_CONFIG.offers;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesRes = await api.get("/categories").catch(() => ({ data: { categories: [] } }));
        setCategories(categoriesRes.data?.categories || []);

        let list = [];
        if (type === "bestSellers") {
          const res = await api.get("/products/bestsellers?limit=60").catch(() => ({ data: { products: [] } }));
          list = (res.data?.products || []).map((p) => ({ ...p, isBestSeller: true }));
        } else if (type === "newArrivals") {
          const res = await api.get("/products?sortBy=newest&limit=60").catch(() => ({ data: { products: [] } }));
          list = (res.data?.products || []).map((p) => ({ ...p, isNewArrival: true }));
        } else {
          const res = await api.get("/products?limit=120").catch(() => ({ data: { products: [] } }));
          list = (res.data?.products || [])
            .filter((p) => {
              const discount = p.discount || (p.originalPrice > p.price ? ((p.originalPrice - p.price) / p.originalPrice) * 100 : 0);
              return discount > 0;
            })
            .sort((a, b) => {
              const discountA = a.discount || (a.originalPrice > a.price ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0);
              const discountB = b.discount || (b.originalPrice > b.price ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0);
              return discountB - discountA;
            });
        }

        setProducts(list);
      } catch (error) {
        console.error("Error loading ecommerce listing page:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const sidebarCategories = useMemo(() => {
    if (categories.length > 0) return categories.slice(0, 4);
    return [
      { slug: "menstrual-care", name: "Menstrual Care", icon: "◌" },
      { slug: "pregnancy-care", name: "Pregnancy Care", icon: "◌" },
      { slug: "wellness", name: "Wellness", icon: "◌" },
      { slug: "personal-care", name: "Personal Care", icon: "◌" },
    ];
  }, [categories]);

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
        <ShopModuleSidebar
          categories={sidebarCategories.map((c) => ({
            slug: c.slug || "",
            label: c.name,
            icon: c.icon || "◌",
          }))}
        />

        <main className="cp2-main ecom-content-main">
          <section className="ecom-content-panel">
            <div className="ecom-page-head">
              <h1>{cfg.heading}</h1>
              <p>{cfg.description}</p>
            </div>

            {loading ? (
              <div className="ecom-state-card">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="ecom-state-card">No products available right now.</div>
            ) : (
              <div className="ecom-products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default EcommerceCollectionPage;
