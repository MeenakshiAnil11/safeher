import React, { useMemo, useState, useEffect } from "react";
import {
  FaSearch,
  FaDownload,
  FaCheckCircle,
  FaTimes,
  FaRupeeSign,
  FaCreditCard,
} from "react-icons/fa";
import api from "../../../services/api";
import "./PaymentManagement.css";

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    doctor: "",
    user: "",
    paymentStatus: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingRefunds: 0,
    completedPayments: 0,
  });

  const reconciliation = useMemo(() => {
    const summary = payments.reduce(
      (acc, payment) => {
        const commission = Number(payment.platformCommission ?? payment.platformFee ?? 0);
        const payout = Number(payment.doctorPayout ?? 0);
        const expected = Number(payment.consultationFee ?? 0) + commission + Number(payment.tax ?? 0);
        const amount = Number(payment.amount ?? 0);
        const isBalanced = Math.abs(amount - expected) <= 1;
        acc.platformCommission += commission;
        acc.doctorPayout += payout;
        if (isBalanced) acc.balanced += 1;
        else acc.mismatched += 1;
        return acc;
      },
      { platformCommission: 0, doctorPayout: 0, balanced: 0, mismatched: 0 }
    );
    return summary;
  }, [payments]);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
      });
      const response = await api.get(`/telehealth/admin/payments?${params}`);
      setPayments(response.data.payments);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/telehealth/admin/dashboard");
      if (response.data.metrics) {
        // Count pending refunds from payments
        const paymentsRes = await api.get("/telehealth/admin/payments?paymentStatus=completed").catch(() => ({ data: { payments: [] } }));
        const pendingRefunds = paymentsRes.data.payments?.filter(
          (p) => p.refundRequest?.status === "pending"
        ).length || 0;
        
        setStats({
          totalRevenue: response.data.metrics.totalRevenue || 0,
          pendingRefunds: pendingRefunds,
          completedPayments: response.data.metrics.completedConsultations || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleRefund = async (id, action) => {
    const reason = action === "approve" ? "Approved by admin" : window.prompt("Reason for rejection:");
    if (action === "reject" && !reason) return;
    try {
      await api.put(`/telehealth/admin/payments/${id}/refund`, { action, reason });
      fetchPayments();
      fetchStats();
      alert(`Refund ${action}d successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} refund`);
    }
  };

  const downloadInvoice = async (payment) => {
    if (!payment.invoice?.invoiceUrl) {
      alert("Invoice not available");
      return;
    }
    // Open invoice URL or trigger download
    window.open(payment.invoice.invoiceUrl, "_blank");
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      completed: "#10b981",
      failed: "#ef4444",
      refunded: "#64748b",
      partially_refunded: "#f97316",
    };
    return colors[status] || "#64748b";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReconciliationStatus = (payment) => {
    const commission = Number(payment.platformCommission ?? payment.platformFee ?? 0);
    const expected = Number(payment.consultationFee ?? 0) + commission + Number(payment.tax ?? 0);
    const amount = Number(payment.amount ?? 0);
    return Math.abs(amount - expected) <= 1 ? "balanced" : "mismatch";
  };

  return (
    <div className="payment-management">
      <div className="page-header">
        <h2>Payment & Refunds</h2>
        <p>Manage transactions, refunds, and revenue analytics</p>
      </div>

      {/* Revenue Stats */}
      <div className="revenue-stats">
        <div className="stat-card">
          <FaRupeeSign className="stat-icon" />
          <div>
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaCreditCard className="stat-icon" />
          <div>
            <h3>Completed Payments</h3>
            <p className="stat-value">{stats.completedPayments}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon" />
          <div>
            <h3>Pending Refunds</h3>
            <p className="stat-value">{stats.pendingRefunds}</p>
          </div>
        </div>
      </div>

      <div className="reconciliation-panel">
        <h3>Payout Reconciliation</h3>
        <div className="reconciliation-metrics">
          <div>
            <span>Platform Commission (Page)</span>
            <strong>₹{reconciliation.platformCommission.toLocaleString()}</strong>
          </div>
          <div>
            <span>Doctor Payout (Page)</span>
            <strong>₹{reconciliation.doctorPayout.toLocaleString()}</strong>
          </div>
          <div>
            <span>Balanced Transactions</span>
            <strong>{reconciliation.balanced}</strong>
          </div>
          <div>
            <span>Mismatched Splits</span>
            <strong className={reconciliation.mismatched > 0 ? "text-danger" : ""}>
              {reconciliation.mismatched}
            </strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
          className="filter-select"
        >
          <option value="">All Methods</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
          <option value="netbanking">Net Banking</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="filter-input"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="filter-input"
          placeholder="End Date"
        />
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        {loading ? (
          <div className="loading-state">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="empty-state">No payments found</div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Doctor Payout</th>
                <th>Method</th>
                <th>Status</th>
                <th>Reconcile</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <div className="transaction-id">{payment.transactionId || "N/A"}</div>
                    {payment.invoice?.invoiceNumber && (
                      <div className="invoice-number">
                        Invoice: {payment.invoice.invoiceNumber}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{payment.user?.name || "N/A"}</div>
                    <div className="sub-text">{payment.user?.email}</div>
                  </td>
                  <td>
                    <div>{payment.doctor?.user?.name || "N/A"}</div>
                    <div className="sub-text">{payment.doctor?.specialization}</div>
                  </td>
                  <td>
                    <strong>₹{payment.amount.toLocaleString()}</strong>
                    {payment.refundRequest?.refundAmount > 0 && (
                      <div className="refund-amount">
                        Refund: ₹{payment.refundRequest.refundAmount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>₹{Number(payment.platformCommission ?? payment.platformFee ?? 0).toLocaleString()}</td>
                  <td>₹{Number(payment.doctorPayout ?? 0).toLocaleString()}</td>
                  <td>
                    <span className="method-badge">{payment.paymentMethod.toUpperCase()}</span>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(payment.paymentStatus) }}
                    >
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`reconcile-badge ${getReconciliationStatus(payment)}`}>
                      {getReconciliationStatus(payment)}
                    </span>
                  </td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      {payment.invoice?.invoiceUrl && (
                        <button
                          className="btn-download"
                          onClick={() => downloadInvoice(payment)}
                          title="Download Invoice"
                        >
                          <FaDownload />
                        </button>
                      )}
                      {payment.refundRequest?.requested &&
                        payment.refundRequest?.status === "pending" && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleRefund(payment._id, "approve")}
                              title="Approve Refund"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRefund(payment._id, "reject")}
                              title="Reject Refund"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
