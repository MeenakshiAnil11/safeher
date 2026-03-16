import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRedo, FaTruck } from "react-icons/fa";
import api from "../services/api";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import { getImageUrl } from "../utils/imageUtils";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./OrderHistory.css";

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const categoryStatus = (orderStatus = "") => {
  if (["placed", "confirmed", "packed", "pending"].includes(orderStatus)) return "pending";
  if (orderStatus === "shipped") return "shipped";
  if (orderStatus === "delivered") return "delivered";
  if (orderStatus === "cancelled") return "cancelled";
  return "pending";
};

const statusUI = (status) => {
  switch (status) {
    case "pending":
      return { label: "Processing", badge: "#f0b90b", progress: "#d4af1e", percent: 34 };
    case "shipped":
      return { label: "Shipped", badge: "#2ab8c0", progress: "#2ab8c0", percent: 66 };
    case "delivered":
      return { label: "Delivered", badge: "#22c55e", progress: "#22c55e", percent: 100 };
    case "cancelled":
      return { label: "Cancelled", badge: "#e11d48", progress: "#e11d48", percent: 0 };
    default:
      return { label: "Pending", badge: "#f0b90b", progress: "#d4af1e", percent: 34 };
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const shortDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/orders?page=1&limit=100");
        const list = response.data?.orders || [];
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(list);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 401) {
          navigate("/login?redirect=/shop/orders");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const counts = useMemo(() => {
    const map = { all: orders.length, pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      const bucket = categoryStatus(o.orderStatus);
      map[bucket] += 1;
    });
    return map;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const bucket = categoryStatus(order.orderStatus);
      const tabMatches = activeTab === "all" || bucket === activeTab;
      if (!tabMatches) return false;
      if (!q) return true;
      const idMatch = order.orderNumber?.toLowerCase().includes(q);
      const itemMatch = (order.items || []).some((item) => item.name?.toLowerCase().includes(q));
      return idMatch || itemMatch;
    });
  }, [orders, activeTab, query]);

  const handleReorder = async (order) => {
    try {
      for (const item of order.items || []) {
        await api.post("/cart/add", { productId: item.product, quantity: item.quantity });
      }
      navigate("/shop/cart");
    } catch (error) {
      console.error("Error reordering:", error);
      window.alert("Failed to reorder.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason: "Cancelled by user" });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: "cancelled", updatedAt: new Date().toISOString() }
            : o
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      window.alert(error.response?.data?.message || "Failed to cancel order.");
    }
  };

  return (
    <div className="orders-page-v2 cp2-page">
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

        <main className="cp2-main orders-main">
          <div className="orders-hero">
            <h1>My Orders</h1>
            <p>Track and manage your orders</p>
          </div>

          <div className="orders-tabs">
            {STATUS_TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={`orders-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="orders-tab-count">{counts[tab.key]}</span>
              </button>
            ))}
          </div>

          <div className="orders-search-wrap">
            <input
              type="text"
              placeholder="Search by order ID or product"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search orders"
            />
          </div>

          {loading ? (
            <div className="orders-loading">Loading your orders...</div>
          ) : visibleOrders.length === 0 ? (
            <div className="orders-empty">
              <p>No orders found.</p>
              <Link to="/shop/dashboard" className="btn-shop-now">Start Shopping</Link>
            </div>
          ) : (
            <div className="orders-list-v2">
              {visibleOrders.map((order) => {
                const bucket = categoryStatus(order.orderStatus);
                const ui = statusUI(bucket);
                const canCancel = bucket === "pending";
                const canTrack = bucket === "pending" || bucket === "shipped";
                const canReorder = bucket === "delivered";
                const expectedDate = shortDate(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 7));
                const deliveredDate = shortDate(order.updatedAt || order.createdAt);
                const trackingUrl = order?.trackingNumber
                  ? `https://www.google.com/search?q=track+order+${encodeURIComponent(order.trackingNumber)}`
                  : null;
                return (
                  <article className="order-card-v2" key={order._id}>
                    <div className="order-card-top">
                      <div>
                        <div className="order-id">{order.orderNumber}</div>
                        <div className="order-date">Placed on {formatDate(order.createdAt)}</div>
                      </div>
                      <span className="order-status-pill" style={{ background: ui.badge }}>{ui.label}</span>
                    </div>

                    <div className="order-meta-row">
                      <div>
                        <span className="meta-label">Order Total</span>
                        <strong>₹{Number(order.total || 0).toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="meta-label">Payment Method</span>
                        <strong className="order-cap">{(order.paymentMethod || "razorpay").toUpperCase()}</strong>
                      </div>
                      <div>
                        <span className="meta-label">
                          {bucket === "delivered" ? "Delivered on" : "Expected delivery"}
                        </span>
                        <strong>{bucket === "delivered" ? deliveredDate : expectedDate}</strong>
                      </div>
                    </div>

                    <div className="order-items-preview" aria-label={`Items in order ${order.orderNumber}`}>
                      {(order.items || []).map((item, index) => (
                        <div
                          className="order-item-preview-row"
                          key={item._id || `${item.name}-${index}-${item.quantity}`}
                          tabIndex={0}
                        >
                          <img
                            src={
                              getImageUrl(item?.product?.images?.[0]?.url || item?.image) ||
                              "/images/placeholder-product.jpg"
                            }
                            alt={item?.name || "Ordered product"}
                          />
                          <div className="order-item-preview-info">
                            <h4>{item?.name}</h4>
                            <p>Qty: {item?.quantity}</p>
                          </div>
                          <strong>₹{Number(item?.price || 0).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>

                    {trackingUrl ? (
                      <a
                        href={trackingUrl}
                        className="order-tracking-link"
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Track order ${order.orderNumber}`}
                      >
                        Tracking: {order.trackingNumber}
                      </a>
                    ) : (
                      <div className="order-tracking-link muted">Tracking will be available after shipment.</div>
                    )}

                    {order.returnRequest?.status && order.returnRequest.status !== "none" && (
                      <div className={`order-return-chip ${order.returnRequest.status}`}>
                        Return/Refund: {order.returnRequest.status}
                      </div>
                    )}

                    <div className="order-progress-track">
                      <span className="order-progress-value" style={{ width: `${ui.percent}%`, background: ui.progress }} />
                    </div>

                    <div className="order-actions-v2">
                      <Link to={`/shop/orders/${order._id}`} className="btn-view-details">View Details</Link>
                      {canCancel && (
                        <button type="button" className="btn-cancel-order" onClick={() => handleCancelOrder(order._id)}>
                          Cancel Order
                        </button>
                      )}
                      {canTrack && (
                        <Link to={`/shop/orders/${order._id}`} className="btn-track-order">
                          <FaTruck /> Track Order
                        </Link>
                      )}
                      {canReorder && (
                        <button type="button" className="btn-reorder" onClick={() => handleReorder(order)}>
                          <FaRedo /> Reorder
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderHistory;
