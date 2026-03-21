import React, { useState, useEffect } from "react";
import api from "../../../api";
import CouponForm from "./CouponForm";
import SuccessDialog from "../../../components/SuccessDialog";
import "./EcommercePages.css";

export default function EcommerceCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");

  useEffect(() => {
    fetchCoupons();
  }, [filter, pagination.page]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await api.get("/coupons/admin/all", { params });
      setCoupons(response.data.coupons || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      if (error.response?.status === 403) {
        setDialogMessage("Access denied. Admin privileges required.");
        setDialogType("error");
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      await api.delete(`/coupons/admin/${couponId}`);
      setDialogMessage("Coupon deleted successfully!");
      setDialogType("success");
      setShowDialog(true);
      fetchCoupons();
      setTimeout(() => setShowDialog(false), 2000);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      setDialogMessage(error.response?.data?.message || "Failed to delete coupon");
      setDialogType("error");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 3000);
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const response = await api.put(`/coupons/admin/${couponId}/toggle`);
      const isActive = response.data?.coupon?.isActive;
      setDialogMessage(`Coupon ${isActive ? "activated" : "deactivated"} successfully!`);
      setDialogType("success");
      setShowDialog(true);
      fetchCoupons();
      setTimeout(() => setShowDialog(false), 2000);
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      setDialogMessage(error.response?.data?.message || "Failed to update coupon status");
      setDialogType("error");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 3000);
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        coupon.code?.toLowerCase().includes(searchLower) ||
        coupon.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (coupon) => {
    if (!coupon.isActive) {
      return { label: "Inactive", color: "#6b7280" };
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      return { label: "Expired", color: "#ef4444" };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { label: "Limit Reached", color: "#f59e0b" };
    }
    return { label: "Active", color: "#10b981" };
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%${coupon.maximumDiscount ? ` (Max ₹${coupon.maximumDiscount})` : ""}`;
    }
    return `₹${coupon.discountValue}`;
  };

  if (loading && coupons.length === 0) {
    return <div className="ecommerce-page-loading">Loading coupons...</div>;
  }

  return (
    <div className="ecommerce-page">
      <div className="coupon-header">
        <h2>Coupon & Offers</h2>
        <button className="create-btn" onClick={() => setShowForm(true)}>
          + Create Coupon
        </button>
      </div>
      <p className="coupon-subtitle">Create and manage discount coupons and promotional offers</p>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by code or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="filter-select"
        >
          <option value="all">All Coupons</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="table-container coupons-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  {loading ? "Loading coupons..." : "No coupons found"}
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => {
                const status = getStatusBadge(coupon);
                return (
                  <tr key={coupon._id}>
                    <td>
                      <strong className="coupon-code">{coupon.code}</strong>
                    </td>
                    <td>
                      <div className="coupon-description">
                        {coupon.description || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="discount-display">
                        <strong>{formatDiscount(coupon)}</strong>
                        <span className="discount-type">({coupon.discountType})</span>
                      </div>
                    </td>
                    <td>
                      {coupon.minimumOrderValue > 0 ? (
                        <span>₹{coupon.minimumOrderValue}</span>
                      ) : (
                        <span className="text-muted">No minimum</span>
                      )}
                    </td>
                    <td>
                      <div className="usage-display">
                        {coupon.usedCount || 0}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        {!coupon.usageLimit && " / ∞"}
                      </div>
                    </td>
                    <td>
                      <div className="date-display">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                        {new Date(coupon.expiryDate) < new Date() && (
                          <span className="expired-badge">Expired</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setShowForm(true);
                          }}
                          title="Edit coupon"
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn activate-btn"
                          onClick={() => handleToggleStatus(coupon._id)}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(coupon._id)}
                          title="Delete coupon"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Coupon Form Modal */}
      {showForm && (
        <CouponForm
          coupon={editingCoupon}
          onClose={() => {
            setShowForm(false);
            setEditingCoupon(null);
          }}
          onSuccess={fetchCoupons}
        />
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
