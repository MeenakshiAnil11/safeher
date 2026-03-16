import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./CartIcon.css";

const CartIcon = () => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/cart");
        if (response.data?.cart?.items) {
          const totalItems = response.data.cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          setCartCount(totalItems);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        // User not logged in or cart not found
        console.log("Cart not available");
        setCartCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCartCount();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    // Refresh cart count every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const token = localStorage.getItem("token");

  if (!token) {
    return null; // Don't show cart icon if not logged in
  }

  return (
    <Link to="/shop/cart" className="cart-icon-link">
      <div className="cart-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13M9 19.5C9.8 19.5 10.5 20.2 10.5 21C10.5 21.8 9.8 22.5 9 22.5C8.2 22.5 7.5 21.8 7.5 21C7.5 20.2 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21C21.5 21.8 20.8 22.5 20 22.5C19.2 22.5 18.5 21.8 18.5 21C18.5 20.2 19.2 19.5 20 19.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {!loading && cartCount > 0 && (
          <span className="cart-badge">{cartCount}</span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;
