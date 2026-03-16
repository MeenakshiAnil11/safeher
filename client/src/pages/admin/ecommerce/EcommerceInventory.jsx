import React, { useState, useEffect } from "react";
import api from "../../../api";
import StockUpdateModal from "./StockUpdateModal";
import "./EcommercePages.css";

export default function EcommerceInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, low-stock, out-of-stock
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get("/products?includeInactive=true&limit=1000");
      setInventory(response.data.products || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      // Fallback
      try {
        const response = await api.get("/products?limit=1000");
        setInventory(response.data.products || []);
      } catch (err) {
        console.error("Error fetching inventory (fallback):", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await api.put(`/products/${productId}`, { stock: newStock });
      alert("Stock updated successfully!");
      fetchInventory();
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  };

  const handleMarkOutOfStock = async (product) => {
    if (!window.confirm(`Mark "${product.name}" as out of stock?`)) {
      return;
    }

    try {
      await api.put(`/products/${product._id}`, { stock: 0 });
      alert("Product marked as out of stock");
      fetchInventory();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === "all" ? true :
      filter === "low-stock" ? item.stock > 0 && item.stock <= lowStockThreshold :
      filter === "out-of-stock" ? item.stock === 0 :
      true;
    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "#ef4444", icon: "❌" };
    if (stock <= lowStockThreshold) return { label: "Low Stock", color: "#f59e0b", icon: "⚠️" };
    return { label: "In Stock", color: "#10b981", icon: "✅" };
  };

  const lowStockCount = inventory.filter(i => i.stock > 0 && i.stock <= lowStockThreshold).length;
  const outOfStockCount = inventory.filter(i => i.stock === 0).length;

  if (loading) {
    return <div className="ecommerce-page-loading">Loading inventory...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p>Track stock levels, prevent overselling, and manage inventory</p>
        </div>
        <div className="header-actions">
          <div className="threshold-setting">
            <label>Low Stock Threshold:</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 10))}
              min="1"
              className="threshold-input"
            />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="inventory-alerts">
          {lowStockCount > 0 && (
            <div className="alert alert-warning">
              <span className="alert-icon">⚠️</span>
              <span><strong>{lowStockCount}</strong> product{lowStockCount !== 1 ? "s" : ""} with low stock (≤{lowStockThreshold})</span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="alert alert-danger">
              <span className="alert-icon">❌</span>
              <span><strong>{outOfStockCount}</strong> product{outOfStockCount !== 1 ? "s" : ""} out of stock</span>
            </div>
          )}
        </div>
      )}

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Items</option>
          <option value="low-stock">Low Stock (≤{lowStockThreshold})</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <div className="inventory-summary">
          <span className="summary-item">
            <span className="summary-label">Total:</span>
            <span className="summary-value">{inventory.length}</span>
          </span>
          <span className="summary-item warning">
            <span className="summary-label">Low Stock:</span>
            <span className="summary-value">{lowStockCount}</span>
          </span>
          <span className="summary-item danger">
            <span className="summary-label">Out of Stock:</span>
            <span className="summary-value">{outOfStockCount}</span>
          </span>
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Low Stock Threshold</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {searchTerm || filter !== "all"
                    ? "No products found matching your filters"
                    : "No inventory items found"}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const status = getStockStatus(item.stock);
                const isLowStock = item.stock > 0 && item.stock <= lowStockThreshold;
                const isOutOfStock = item.stock === 0;
                
                return (
                  <tr 
                    key={item._id}
                    className={`${isOutOfStock ? "row-out-of-stock" : isLowStock ? "row-low-stock" : ""}`}
                  >
                    <td>
                      <div className="product-info">
                        <img
                          src={item.images?.[0]?.url || "/images/placeholder-product.jpg"}
                          alt={item.name}
                          className="product-thumb"
                        />
                        <div>
                          <div className="product-name">{item.name}</div>
                          <div className="product-id">SKU: {item.sku || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stock-display">
                        <strong className="stock-value">{item.stock}</strong>
                        <span className="stock-unit">units</span>
                      </div>
                    </td>
                    <td>
                      <span className="threshold-badge">{lowStockThreshold}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: status.color }}>
                        <span className="status-icon">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit" 
                          onClick={() => setSelectedProduct(item)}
                          title="Update stock quantity"
                        >
                          Update Stock
                        </button>
                        {item.stock > 0 && (
                          <button 
                            className="btn-mark-out" 
                            onClick={() => handleMarkOutOfStock(item)}
                            title="Mark as out of stock"
                          >
                            Mark Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={handleUpdateStock}
        />
      )}
    </div>
  );
}
