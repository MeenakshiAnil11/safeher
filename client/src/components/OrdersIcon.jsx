import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./OrdersIcon.css";

const OrdersIcon = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/orders?limit=1");
        if (response.data?.pagination?.total) {
          setOrderCount(response.data.pagination.total);
        }
      } catch (error) {
        // User not logged in or orders not found
        console.log("Orders not available");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();

    // Refresh order count every 30 seconds
    const interval = setInterval(fetchOrderCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const token = localStorage.getItem("token");

  if (!token) {
    return null; // Don't show orders icon if not logged in
  }

  return (
    <Link to="/shop/orders" className="orders-icon-link" title="My Orders">
      <div className="orders-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {!loading && orderCount > 0 && (
          <span className="orders-badge">{orderCount}</span>
        )}
      </div>
    </Link>
  );
};

export default OrdersIcon;
