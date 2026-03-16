import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import api from "../../../api";
import "./EcommercePages.css";

export default function EcommerceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [parentFilter, setParentFilter] = useState("all"); // all, null (top-level), specific parent
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    parentCategory: "",
    isActive: true,
    displayOrder: 0,
  });
  const [parentCategories, setParentCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, [filter, parentFilter, pagination.page]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filter !== "all") {
        params.isActive = filter === "active";
      }

      if (parentFilter !== "all") {
        params.parentCategory = parentFilter === "null" ? "null" : parentFilter;
      }

      const response = await api.get("/categories/admin/all", { params });
      setCategories(response.data.categories || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await api.get("/categories/admin/all", { params: { limit: 1000 } });
      setParentCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      parentCategory: "",
      isActive: true,
      displayOrder: 0,
    });
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      parentCategory: category.parentCategory?._id || "",
      isActive: category.isActive !== undefined ? category.isActive : true,
      displayOrder: category.displayOrder || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/categories/admin/${id}`);
      alert("Category deleted successfully!");
      fetchCategories();
      fetchParentCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        parentCategory: formData.parentCategory || null,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      if (editingCategory) {
        await api.put(`/categories/admin/${editingCategory._id}`, submitData);
        alert("Category updated successfully!");
      } else {
        await api.post("/categories/admin", submitData);
        alert("Category created successfully!");
      }

      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
      fetchParentCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Failed to save category");
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        category.name?.toLowerCase().includes(searchLower) ||
        category.slug?.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && categories.length === 0) {
    return <div className="ecommerce-page-loading">Loading categories...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="page-header">
        <div>
          <h2>Category Management</h2>
          <p>Create and manage product categories</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <FaPlus /> Create Category
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <select
          value={parentFilter}
          onChange={(e) => {
            setParentFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="null">Top-Level Only</option>
          {parentCategories
            .filter((cat) => cat.isActive && !cat.parentCategory)
            .map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} (Subcategories)
              </option>
            ))}
        </select>
      </div>

      <div className="categories-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Parent Category</th>
              <th>Icon</th>
              <th>Display Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  {loading ? "Loading categories..." : "No categories found"}
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="category-name">
                      <strong>{category.name}</strong>
                      {category.description && (
                        <div className="category-description">{category.description}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <code className="slug-code">{category.slug}</code>
                  </td>
                  <td>
                    {category.parentCategory ? (
                      <span className="parent-badge">{category.parentCategory.name}</span>
                    ) : (
                      <span className="text-muted">Top-Level</span>
                    )}
                  </td>
                  <td>
                    {category.icon && (
                      <span className="category-icon">{category.icon}</span>
                    )}
                  </td>
                  <td>{category.displayOrder || 0}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: category.isActive ? "#10b981" : "#6b7280",
                      }}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(category)}
                        title="Edit category"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(category._id)}
                        title="Delete category"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Create Category"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Menstrual Care"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Icon (Emoji or Icon Class)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., 🩸 or fa-heart"
                />
              </div>

              <div className="form-group">
                <label>Parent Category</label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                >
                  <option value="">None (Top-Level)</option>
                  {parentCategories
                    .filter((cat) => !editingCategory || cat._id !== editingCategory._id)
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? "Update" : "Create"} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
