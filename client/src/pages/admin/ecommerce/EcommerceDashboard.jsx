import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../../api";
import "./EcommercePages.css";

const PENDING_STATUSES = ["placed", "confirmed", "packed", "shipped"];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

const toDateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const parseDateInput = (value, endOfDay = false) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
};

const buildDailyTrend = (orders, startDate, endDate) => {
  const cursor = new Date(startDate);
  const byDay = {};
  while (cursor <= endDate) {
    const key = toDateKey(cursor);
    byDay[key] = {
      day: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      orders: 0,
      revenue: 0,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    if (createdAt < startDate || createdAt > endDate) return;
    const key = toDateKey(createdAt);
    if (!byDay[key]) return;
    byDay[key].orders += 1;
    if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") {
      byDay[key].revenue += Number(order.total || 0);
    }
  });

  return Object.values(byDay);
};

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    failedPayments: 0,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRange, setFilterRange] = useState("7d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const rangeDates = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    if (filterRange === "custom") {
      const start = parseDateInput(customStartDate, false);
      const end = parseDateInput(customEndDate, true);
      if (!start || !end || start > end) return null;
      return { start, end };
    }

    const start = new Date(now);
    const days = filterRange === "30d" ? 29 : 6;
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }, [filterRange, customEndDate, customStartDate]);

  const chartData = useMemo(() => {
    if (!rangeDates) return [];
    return buildDailyTrend(allOrders, rangeDates.start, rangeDates.end);
  }, [allOrders, rangeDates]);

  const ordersChartData = chartData.map((row) => ({ day: row.day, orders: row.orders }));
  const revenueChartData = chartData.map((row) => ({ day: row.day, revenue: Math.round(row.revenue) }));

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (rangeDates) {
        params.startDate = rangeDates.start.toISOString();
        params.endDate = rangeDates.end.toISOString();
      }

      const [ordersRes, productsRes, paymentStatsRes, bestSellingRes, customerActivityRes] =
        await Promise.allSettled([
          api.get("/orders/admin/all", { params: { page: 1, limit: 1000 } }),
          api.get("/products", { params: { page: 1, limit: 1000, includeInactive: "true" } }),
          api.get("/payment/admin/stats"),
          api.get("/analytics/admin/best-selling", { params: { ...params, limit: 5 } }),
          api.get("/analytics/admin/customer-activity", { params: { ...params, limit: 5 } }),
        ]);

      const getData = (result, path, fallback) => {
        if (result.status !== "fulfilled") return fallback;
        return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), result.value);
      };

      const orders = getData(ordersRes, "data.orders", []);
      const products = getData(productsRes, "data.products", []);
      const paymentStats = getData(paymentStatsRes, "data.stats", {});
      const bestSellingData = getData(bestSellingRes, "data.bestSelling", []);
      let customerData = getData(customerActivityRes, "data.customers", []);

      // Fallback: derive customer activity from orders if endpoint is unavailable.
      if (!customerData.length && orders.length) {
        const byCustomer = {};
        orders.forEach((order) => {
          const key = String(order.user?._id || "unknown");
          if (!byCustomer[key]) {
            byCustomer[key] = {
              customerId: key,
              name: order.user?.name || "Guest",
              orders: 0,
              spend: 0,
            };
          }
          byCustomer[key].orders += 1;
          byCustomer[key].spend += Number(order.total || 0);
        });
        customerData = Object.values(byCustomer)
          .sort((a, b) => b.spend - a.spend || b.orders - a.orders)
          .slice(0, 5);
      }

      setAllOrders(orders);
      setBestsellers(bestSellingData);
      setCustomers(customerData);

      setStats({
        totalOrders: orders.length,
        totalRevenue: Number(paymentStats.totalRevenue || 0),
        totalProducts: products.length,
        pendingOrders: orders.filter((o) => PENDING_STATUSES.includes(o.orderStatus)).length,
        failedPayments: Number(paymentStats.failedPayments || 0),
      });
      const failedEndpoints = [];
      if (ordersRes.status === "rejected") failedEndpoints.push("orders");
      if (productsRes.status === "rejected") failedEndpoints.push("products");
      if (paymentStatsRes.status === "rejected") failedEndpoints.push("payments");
      if (bestSellingRes.status === "rejected") failedEndpoints.push("bestsellers");
      if (customerActivityRes.status === "rejected") failedEndpoints.push("customer activity");

      if (failedEndpoints.length) {
        const isCritical = failedEndpoints.includes("orders") && failedEndpoints.includes("products");
        setError(
          isCritical
            ? `Failed to load dashboard data (${failedEndpoints.join(", ")}).`
            : `Some widgets could not load (${failedEndpoints.join(", ")}).`
        );
      }
    } catch (err) {
      console.error("Error fetching ecommerce dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterRange === "custom" && !rangeDates) return;
    fetchDashboardData();
  }, [filterRange, customStartDate, customEndDate]);

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "#6B46C1",
      navigateTo: "/admin/ecommerce/orders",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "💰",
      color: "#16a34a",
      navigateTo: "/admin/ecommerce/payments",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: "🛍️",
      color: "#6B46C1",
      navigateTo: "/admin/ecommerce/products",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      color: "#f59e0b",
      navigateTo: "/admin/ecommerce/orders",
    },
    {
      title: "Failed Payments",
      value: stats.failedPayments,
      icon: "❌",
      color: "#dc2626",
      navigateTo: "/admin/ecommerce/payments",
    },
  ];

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>E-commerce Management Dashboard</h2>
          <p>Live operational and sales insights from orders, products, and payments.</p>
        </div>
      </div>

      {error && <div className="dashboard-error-banner">{error}</div>}

      {/* KPI row */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <button
            key={card.title}
            type="button"
            className="stat-card clickable"
            style={{ borderTopColor: card.color }}
            onClick={() => navigate(card.navigateTo)}
          >
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{card.value}</h3>
              <p className="stat-title">{card.title}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Graph filter row */}
      <div className="dashboard-filter-bar">
        <label htmlFor="dashboardRange">Graph Window</label>
        <select
          id="dashboardRange"
          className="filter-select"
          value={filterRange}
          onChange={(e) => setFilterRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="custom">Custom range</option>
        </select>
        {filterRange === "custom" && (
          <>
            <input
              type="date"
              className="date-input"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              aria-label="Custom start date"
            />
            <input
              type="date"
              className="date-input"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              aria-label="Custom end date"
            />
          </>
        )}
      </div>

      {/* charts row */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Orders Per Day</h3>
            <p>Live orders trend for selected range</p>
          </div>
          {loading ? (
            <div className="chart-loading">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#6B46C1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Trend</h3>
            <p>Live revenue trend for selected range</p>
          </div>
          {loading ? (
            <div className="chart-loading">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: "#16a34a", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* bestsellers + customers row */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Bestsellers</h3>
            <p>Top products by quantity sold</p>
          </div>
          <div className="analytics-list">
            {loading ? (
              <div className="chart-loading">Loading bestsellers...</div>
            ) : bestsellers.length === 0 ? (
              <p>No bestseller data available.</p>
            ) : (
              bestsellers.map((item, idx) => (
                <div className="analytics-list-row with-image" key={`${item.productId}-${idx}`}>
                  <div className="analytics-product">
                    <img
                      src={item.image || "https://via.placeholder.com/48x48?text=Item"}
                      alt={item.name || "Product"}
                      className="analytics-product-image"
                    />
                    <span>{item.name}</span>
                  </div>
                  <strong>{item.totalSold} sold</strong>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Customer Activity</h3>
            <p>Top customers by spend and orders</p>
          </div>
          <div className="analytics-list">
            {loading ? (
              <div className="chart-loading">Loading customer activity...</div>
            ) : customers.length === 0 ? (
              <p>No customer activity available.</p>
            ) : (
              customers.map((item) => (
                <div className="analytics-list-row" key={item.customerId || item.id}>
                  <span>
                    {item.name} ({item.orders} orders)
                  </span>
                  <strong>{formatCurrency(item.spend)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* quick actions row */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate("/admin/ecommerce/products")}>
            <span className="action-icon">➕</span>
            <span>Add Product</span>
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/ecommerce/coupons")}>
            <span className="action-icon">🎟️</span>
            <span>Create Coupon</span>
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/ecommerce/orders")}>
            <span className="action-icon">📋</span>
            <span>View Orders</span>
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/ecommerce/reports")}>
            <span className="action-icon">📊</span>
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
