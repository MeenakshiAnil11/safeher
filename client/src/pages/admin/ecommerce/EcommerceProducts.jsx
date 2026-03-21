import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import ProductForm from "./ProductForm";
import SuccessDialog from "../../../components/SuccessDialog";
import { resolveApiPath } from "../../../config/apiConfig";
import "./EcommercePages.css";

export default function EcommerceProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      // Get all products including inactive ones for admin
      const response = await api.get("/products?limit=1000&includeInactive=true");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback: try without includeInactive parameter
      try {
        const response = await api.get("/products?limit=1000");
        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Error fetching products (fallback):", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setDeletingProduct(null);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct?._id) return;
    try {
      setIsDeleting(true);
      await api.delete(`/products/${deletingProduct._id}`);
      setDialogMessage("Product deleted successfully!");
      setDialogType("success");
      setShowDialog(true);
      setDeletingProduct(null);
      fetchProducts();
      setTimeout(() => setShowDialog(false), 2000);
    } catch (error) {
      console.error("Error deleting product:", error);
      setDialogMessage(error.response?.data?.message || "Failed to delete product. Please try again.");
      setDialogType("error");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.put(`/products/${product._id}`, {
        isActive: !product.isActive
      });
      setDialogMessage(`Product ${!product.isActive ? "activated" : "deactivated"} successfully!`);
      setDialogType("success");
      setShowDialog(true);
      fetchProducts();
      setTimeout(() => setShowDialog(false), 2000);
    } catch (error) {
      console.error("Error updating product status:", error);
      setDialogMessage("Failed to update product status. Please try again.");
      setDialogType("error");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 3000);
    }
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || 
      product.category?._id === filterCategory || 
      product.category?.slug === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="ecommerce-page-loading">Loading products...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header products-page-header">
        <div className="products-page-title">
          <h2>Product Management</h2>
          <p>Add, edit, delete, and manage your product catalog</p>
        </div>
        <button className="btn-primary add-product-btn" onClick={handleAddProduct}>
          + Add Product
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <div className="products-count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {searchTerm || filterCategory !== "all" 
                    ? "No products found matching your filters" 
                    : "No products found. Click 'Add New Product' to get started."}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-info">
                      <img
                        src={product.images?.[0]?.url ? resolveApiPath(product.images[0].url) : "/images/placeholder-product.jpg"}
                        alt={product.name}
                        className="product-thumb"
                      />
                      <div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-id">ID: {product._id.slice(-8)}</div>
                        {product.isFeatured && <span className="product-badge featured">Featured</span>}
                        {product.isBestSeller && <span className="product-badge bestseller">Best Seller</span>}
                      </div>
                    </div>
                  </td>
                  <td>{product.category?.name || "Uncategorized"}</td>
                  <td>
                    <div className="price-info">
                      <span className="price">₹{product.price.toFixed(2)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock > 10 ? "in-stock" : product.stock > 0 ? "low-stock" : "out-of-stock"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${product.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggleStatus(product)}
                      title={product.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="actions">
                    <div className="action-buttons product-actions-inline">
                      <button 
                        className="ecom-product-action-btn ecom-product-action-btn-edit" 
                        onClick={() => handleEditProduct(product._id)}
                        title="Edit product"
                        aria-label={`Edit ${product.name}`}
                        type="button"
                      >
                        Edit
                      </button>
                      <button 
                        className="ecom-product-action-btn ecom-product-action-btn-delete" 
                        onClick={() => handleDeleteProduct(product)}
                        title="Delete product"
                        aria-label={`Delete ${product.name}`}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingProduct && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          onClick={handleCancelDelete}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="delete-product-title">Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete "{deletingProduct.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" className="btn-submit" onClick={confirmDeleteProduct} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessDialog
        message={dialogMessage}
        show={showDialog}
        type={dialogType}
        onClose={() => setShowDialog(false)}
      />
    </div>
  );
}
