import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const itemRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/shop/cart");
      return;
    }
    fetchCart();

    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        navigate("/login?redirect=/shop/cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItem(itemId);
      setUpdating(true);
      await api.put("/cart/update", { itemId, quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
      window.alert(error.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdating(false);
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm("Remove this item from cart?")) return;
    try {
      setUpdatingItem(itemId);
      setUpdating(true);
      await api.delete(`/cart/remove/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      window.alert(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdating(false);
      setUpdatingItem(null);
    }
  };

  const totals = useMemo(() => {
    if (!cart?.items?.length) {
      return { subtotal: 0, shipping: 0, tax: 0, total: 0, freeShippingLeft: 500 };
    }
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 500 ? 0 : 50;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return {
      subtotal,
      shipping,
      tax,
      total,
      freeShippingLeft: Math.max(0, 500 - subtotal),
    };
  }, [cart]);

  const itemCount = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!cart?.items?.length) {
      setSelectedItemId(null);
      return;
    }
    const validIds = new Set(cart.items.map((item) => item._id));
    if (selectedItemId && !validIds.has(selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [cart, selectedItemId]);

  const selectItem = (itemId, itemName) => {
    setSelectedItemId(itemId);
    setSelectionAnnouncement(`${itemName || "Item"} selected`);
  };

  const handleItemKeyDown = (event, itemId, itemName, index) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectItem(itemId, itemName);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = Math.min(index + 1, itemRefs.current.length - 1);
      itemRefs.current[nextIndex]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      itemRefs.current[prevIndex]?.focus();
    }
  };

  const handleCheckoutAll = () => {
    if (!cart?.items?.length) return;
    const selectedIds = cart.items.map((item) => item._id).join(",");
    navigate(`/shop/checkout?selected=${selectedIds}`);
  };

  const handleCheckoutSelected = () => {
    if (!selectedItemId) {
      window.alert("Please select one item to checkout.");
      return;
    }
    navigate(`/shop/checkout?selected=${selectedItemId}`);
  };

  const handleApplyCode = () => {
    if (!couponCode.trim()) return;
    window.alert("Coupon will be validated at checkout.");
  };


  if (loading) {
    return (
      <div className="cp2-page cart-v2-page">
        <div className="cart-v2-loading">Loading your cart...</div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cp2-page cart-v2-page">
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
          <main className="cp2-main">
            <div className="cart-v2-empty">
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <Link to="/shop" className="btn-shop">Continue Shopping</Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="cp2-page cart-v2-page">
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

        <main className="cp2-main cart-v2-main">
          <div className="cart-v2-container">
            <h1 className="cart-v2-title">Shopping Cart</h1>
            <div className="cart-v2-sr-only" aria-live="polite">{selectionAnnouncement}</div>

            <div className="cart-v2-content">
              <section className="cart-v2-items-col">
                <div className="cart-v2-items-list">
                  {cart.items.map((item, index) => {
                    const isUpdating = updatingItem === item._id;
                    const isSelected = selectedItemId === item._id;
                    return (
                      <article
                        key={item._id}
                        className={`cart-v2-item ${isUpdating ? "is-updating" : ""} ${isSelected ? "is-selected" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.product?.name || "Cart item"}. ${isSelected ? "Selected" : "Not selected"}. Press Enter to select.`}
                        aria-pressed={isSelected}
                        onClick={() => selectItem(item._id, item.product?.name)}
                        onKeyDown={(event) => handleItemKeyDown(event, item._id, item.product?.name, index)}
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                      >
                        <div className="cart-v2-item-left">
                          <div className="cart-v2-item-image" aria-hidden="true">
                            <img
                              src={item.product?.images?.[0]?.url || "/images/placeholder-product.jpg"}
                              alt={item.product?.name || "Product"}
                            />
                          </div>

                          <div className="cart-v2-item-info">
                            <h3>{item.product?.name}</h3>
                            <p>{item.product?.category?.name || item.product?.brand || "Wellness"}</p>
                            <div className="cart-v2-qty-controls">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item._id, item.quantity - 1);
                                }}
                                disabled={updating || isUpdating || item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item._id, item.quantity + 1);
                                }}
                                disabled={updating || isUpdating || item.product?.stock <= item.quantity}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="cart-v2-item-right">
                          <button
                            type="button"
                            className="cart-v2-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item._id);
                            }}
                            disabled={updating || isUpdating}
                            aria-label="Remove item"
                          >
                            🗑
                          </button>
                          <div className="cart-v2-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                          <div className="cart-v2-each">₹{item.price.toFixed(2)} each</div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <aside className="cart-v2-summary-col">
                <section className="cart-v2-summary-card">
                  <h2>Order Summary</h2>
                  <div className="cart-v2-summary-row">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-v2-summary-row">
                    <span>Shipping</span>
                    <span>₹{totals.shipping.toFixed(2)}</span>
                  </div>
                  {totals.shipping > 0 && (
                    <p className="cart-v2-free-note">Add ₹{totals.freeShippingLeft.toFixed(2)} more for free shipping!</p>
                  )}
                  <div className="cart-v2-summary-row">
                    <span>Tax</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="cart-v2-summary-row total">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                  <div className="cart-v2-summary-row">
                    <span>Selected Item</span>
                    <span>{selectedItemId ? 1 : 0}</span>
                  </div>

                  <div className="cart-v2-coupon-row">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo code"
                      aria-label="Enter promo code"
                    />
                    <button type="button" onClick={handleApplyCode}>Apply Code</button>
                  </div>

                  <button
                    type="button"
                    className="cart-v2-checkout-btn selected"
                    onClick={handleCheckoutSelected}
                    disabled={!selectedItemId}
                  >
                    Checkout Selected Item
                  </button>
                  <button type="button" className="cart-v2-checkout-btn all" onClick={handleCheckoutAll} disabled={!itemCount}>
                    Checkout All Items
                  </button>
                  <Link to="/shop" className="cart-v2-continue-link">Continue Shopping</Link>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Cart;
