import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../../api";
import "./EcommercePages.css";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

export default function EcommerceReports() {
  const [reportType, setReportType] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [period, setPeriod] = useState("monthly");

  // Sales by Category
  const [salesByCategory, setSalesByCategory] = useState([]);

  // Monthly Revenue
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  // Best Selling Products
  const [bestSelling, setBestSelling] = useState([]);

  // Low Performing Products
  const [lowPerforming, setLowPerforming] = useState([]);

  // Revenue Trend
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Order Trend
  const [orderTrend, setOrderTrend] = useState([]);

  // Summary
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, [dateRange, period]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSalesByCategory(),
        fetchMonthlyRevenue(),
        fetchBestSelling(),
        fetchLowPerforming(),
        fetchRevenueTrend(),
        fetchOrderTrend(),
        fetchSummary(),
      ]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesByCategory = async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.get("/analytics/admin/sales-by-category", { params });
      setSalesByCategory(response.data.salesByCategory || []);
    } catch (error) {
      console.error("Error fetching sales by category:", error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const response = await api.get("/analytics/admin/monthly-revenue", {
        params: { months: 12 },
      });
      setMonthlyRevenue(response.data.monthlyRevenue || []);
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
    }
  };

  const fetchBestSelling = async () => {
    try {
      const params = { limit: 10 };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.get("/analytics/admin/best-selling", { params });
      setBestSelling(response.data.bestSelling || []);
    } catch (error) {
      console.error("Error fetching best selling:", error);
    }
  };

  const fetchLowPerforming = async () => {
    try {
      const params = { limit: 10 };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.get("/analytics/admin/low-performing", { params });
      setLowPerforming(response.data.lowPerforming || []);
    } catch (error) {
      console.error("Error fetching low performing:", error);
    }
  };

  const fetchRevenueTrend = async () => {
    try {
      const response = await api.get("/analytics/admin/revenue-trend", {
        params: { period, months: period === "monthly" ? 12 : period === "weekly" ? 8 : 30 },
      });
      setRevenueTrend(response.data.trend || []);
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
    }
  };

  const fetchOrderTrend = async () => {
    try {
      const response = await api.get("/analytics/admin/order-trend", {
        params: { period, months: period === "monthly" ? 12 : 8 },
      });
      setOrderTrend(response.data.trend || []);
    } catch (error) {
      console.error("Error fetching order trend:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await api.get("/analytics/admin/summary", { params });
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleExport = () => {
    alert("Export functionality coming soon!");
  };

  if (loading && !summary) {
    return <div className="ecommerce-page-loading">Loading reports...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Sales reports, analytics, and business insights</p>
        </div>
        <button className="btn-primary" onClick={handleExport}>
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="analytics-summary-grid">
          <div className="summary-card">
            <div className="summary-label">Total Revenue</div>
            <div className="summary-value">₹{summary.totalRevenue?.toLocaleString() || "0"}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Orders</div>
            <div className="summary-value">{summary.totalOrders || 0}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Average Order Value</div>
            <div className="summary-value">₹{summary.averageOrderValue?.toFixed(2) || "0.00"}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Unique Customers</div>
            <div className="summary-value">{summary.uniqueCustomers || 0}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Products Sold</div>
            <div className="summary-value">{summary.totalProductsSold || 0}</div>
          </div>
        </div>
      )}

      {/* Date Range & Period Selector */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="period-select">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily (Last 30 days)</option>
          </select>
        </div>
        <button className="btn-secondary" onClick={() => setDateRange({ startDate: "", endDate: "" })}>
          Clear Filters
        </button>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button
          className={`report-tab ${reportType === "sales" ? "active" : ""}`}
          onClick={() => setReportType("sales")}
        >
          Sales Report
        </button>
        <button
          className={`report-tab ${reportType === "products" ? "active" : ""}`}
          onClick={() => setReportType("products")}
        >
          Product Performance
        </button>
        <button
          className={`report-tab ${reportType === "trends" ? "active" : ""}`}
          onClick={() => setReportType("trends")}
        >
          Revenue & Order Trends
        </button>
      </div>

      {/* Sales Report Tab */}
      {reportType === "sales" && (
        <div className="reports-content">
          {/* Sales by Category */}
          <div className="report-section">
            <h3>Sales by Category</h3>
            <div className="chart-container">
              {salesByCategory.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="category-sales-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Total Sales</th>
                          <th>Orders</th>
                          <th>Items Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesByCategory.map((category, index) => (
                          <tr key={index}>
                            <td>{category.categoryName}</td>
                            <td>₹{category.totalSales.toFixed(2)}</td>
                            <td>{category.orderCount}</td>
                            <td>{category.itemCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="empty-chart">No sales data available</div>
              )}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="report-section">
            <h3>Monthly Revenue</h3>
            <div className="chart-container">
              {monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No revenue data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Performance Tab */}
      {reportType === "products" && (
        <div className="reports-content">
          {/* Best Selling Products */}
          <div className="report-section">
            <h3>Best Selling Products</h3>
            <div className="products-table">
              {bestSelling.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Units Sold</th>
                      <th>Total Revenue</th>
                      <th>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSelling.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <div className="product-info">
                            <img
                              src={product.image || "/images/placeholder-product.jpg"}
                              alt={product.name}
                              className="product-thumb"
                            />
                            <div className="product-name">{product.name}</div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>
                          <strong>{product.totalSold}</strong>
                        </td>
                        <td>₹{product.totalRevenue.toFixed(2)}</td>
                        <td>{product.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">No best-selling products data available</div>
              )}
            </div>
          </div>

          {/* Low Performing Products */}
          <div className="report-section">
            <h3>Low Performing Products</h3>
            <div className="products-table">
              {lowPerforming.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Units Sold</th>
                      <th>Days Since Creation</th>
                      <th>Sales/Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowPerforming.map((product, index) => (
                      <tr key={index} className={product.totalSold === 0 ? "row-no-sales" : ""}>
                        <td>
                          <div className="product-info">
                            <img
                              src={product.image || "/images/placeholder-product.jpg"}
                              alt={product.name}
                              className="product-thumb"
                            />
                            <div className="product-name">{product.name}</div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>₹{product.price.toFixed(2)}</td>
                        <td>
                          <span className={product.stock === 0 ? "stock-out" : ""}>
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <strong>{product.totalSold}</strong>
                        </td>
                        <td>{product.daysSinceCreation} days</td>
                        <td>{product.salesPerDay.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">No low-performing products found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revenue & Order Trends Tab */}
      {reportType === "trends" && (
        <div className="reports-content">
          {/* Revenue Trend */}
          <div className="report-section">
            <h3>Revenue Trend</h3>
            <div className="chart-container">
              {revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No revenue trend data available</div>
              )}
            </div>
          </div>

          {/* Order Trend */}
          <div className="report-section">
            <h3>Order Trend</h3>
            <div className="chart-container">
              {orderTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={orderTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total Orders" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#8b5cf6" name="Completed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No order trend data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
