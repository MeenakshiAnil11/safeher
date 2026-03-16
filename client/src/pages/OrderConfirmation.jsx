import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./OrderConfirmation.css";
import { FaShoppingBag, FaTruck } from "react-icons/fa";
import { getImageUrl } from "../utils/imageUtils";

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate estimated delivery date (5-7 business days)
  const calculateEstimatedDelivery = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 7); // Add 7 days
    return date;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order:", error);
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="order-confirmation-v2 cp2-page">
        <div className="order-confirmation-loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-v2 cp2-page">
        <div className="order-confirmation-loading">
          <div>Order not found</div>
          <Link to="/shop">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const estimatedDelivery = order ? calculateEstimatedDelivery(order.createdAt) : null;
  const trackingUrl = order?.trackingNumber
    ? `https://www.google.com/search?q=track+order+${encodeURIComponent(order.trackingNumber)}`
    : null;

  return (
    <div className="order-confirmation-v2 cp2-page">
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

        <main className="cp2-main order-confirmation-main">
          <section className="oc-head">
            <div className="oc-check">✓</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. We've received your order and will process it soon.</p>
          </section>

          <section className="oc-card">
            <div className="oc-row oc-two-col">
              <div>
                <span className="oc-label">Order Number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="oc-right">
                <span className="oc-label">Order Date</span>
                <strong>{new Date(order.createdAt).toLocaleDateString("en-US")}</strong>
              </div>
            </div>

            <div className="oc-row oc-payment-summary">
              <div className="oc-pay-card">
                <span className="oc-label">Total Amount Paid</span>
                <strong className="oc-amount">₹{Number(order.total || 0).toFixed(2)}</strong>
              </div>
              <div className="oc-pay-card">
                <span className="oc-label">Payment Method</span>
                <strong className="oc-cap">{order.paymentMethod || "razorpay"}</strong>
              </div>
              <div className="oc-pay-card">
                <span className="oc-label">Estimated Delivery</span>
                <strong>
                  {estimatedDelivery?.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>

            <div className="oc-row">
              <span className="oc-title">Shipping Address</span>
              <div className="oc-address">
                <p>{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country || "India"}</p>
              </div>
            </div>

            <div className="oc-row">
              <span className="oc-title">Purchased Items</span>
              <div className="oc-items-grid">
                {(order.items || []).map((item) => (
                  <article key={item._id || `${item.name}-${item.quantity}`} className="oc-item-card">
                    <img
                      src={
                        getImageUrl(item?.product?.images?.[0]?.url || item?.image) ||
                        "/images/placeholder-product.jpg"
                      }
                      alt={item?.name || "Purchased item"}
                    />
                    <div className="oc-item-info">
                      <h4>{item?.name}</h4>
                      <p>Qty: {item?.quantity}</p>
                    </div>
                    <strong className="oc-item-price">
                      ₹{Number((item?.price || 0) * (item?.quantity || 1)).toFixed(2)}
                    </strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="oc-row">
              <span className="oc-title">Order Updates</span>
              {trackingUrl ? (
                <a
                  className="oc-track-link"
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Track your order in a new tab"
                >
                  Track package ({order.trackingNumber})
                </a>
              ) : (
                <p className="oc-note">
                  Tracking will be available once your order is shipped.
                </p>
              )}
            </div>
          </section>

          <div className="oc-actions">
            <Link to="/shop" className="oc-btn primary">
              <FaShoppingBag /> Continue Shopping
            </Link>
            <Link to="/shop/dashboard" className="oc-btn secondary">
              Go to Dashboard
            </Link>
            <Link to={`/shop/orders/${order._id}`} className="oc-btn outline">
              <FaTruck /> View Order Details
            </Link>
          </div>

          <div className="oc-help">
            <p>Need help with your order?</p>
            <Link to="/shop/support">Contact Support</Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderConfirmation;
