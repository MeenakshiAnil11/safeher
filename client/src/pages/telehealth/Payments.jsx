import React, { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaWallet,
  FaRupeeSign,
  FaDownload,
  FaUndo,
  FaShieldAlt,
  FaMobileAlt,
  FaUniversity,
  FaFileInvoice,
  FaSearch,
  FaFilter,
  FaFilePdf,
  FaEnvelope,
  FaFileCsv,
} from "react-icons/fa";
import api from "../../services/api";
import "./Payments.css";

// Helper to format doctor name (avoid "Dr. Dr." duplication)
const formatDoctorName = (name) => {
  if (!name) return "N/A";
  // If name already starts with "Dr." or "Dr ", return as is
  if (name.toLowerCase().startsWith("dr.") || name.toLowerCase().startsWith("dr ")) {
    return name;
  }
  return `Dr. ${name}`;
};

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
   const [summary, setSummary] = useState(null);
   const [pagination, setPagination] = useState(null);
   const [page, setPage] = useState(1);
   const [filters, setFilters] = useState({
     startDate: "",
     endDate: "",
     consultationType: "all",
     paymentStatus: "all",
     search: "",
   });
   const [showInvoiceModal, setShowInvoiceModal] = useState(false);
   const [invoiceDetails, setInvoiceDetails] = useState(null);
   const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.startDate, filters.endDate, filters.consultationType, filters.paymentStatus, filters.search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.consultationType && filters.consultationType !== "all") {
        params.append("consultationType", filters.consultationType);
      }
      if (filters.paymentStatus && filters.paymentStatus !== "all") {
        params.append("paymentStatus", filters.paymentStatus);
      }
      if (filters.search) params.append("search", filters.search.trim());

      let payments = [];
      let apiSummary = null;
      let apiPagination = null;

      // Fetch from backend API
      try {
        const response = await api.get(`/telehealth/payments?${params.toString()}`);
        payments = response.data.payments || [];
        apiSummary = response.data.summary || null;
        apiPagination = response.data.pagination || null;
      } catch (apiError) {
        console.error("Error fetching payments from API:", apiError);
      }

      // Also get mock payments from localStorage (for mock doctor bookings)
      try {
        const mockAppointments = JSON.parse(localStorage.getItem("mockAppointments") || "[]");
        const mockPayments = mockAppointments
          .filter((apt) => apt.paymentId) // Only include appointments with payments
          .map((apt) => ({
            _id: `mock_pay_${apt._id}`,
            transactionId: apt.paymentId || `TXN-${apt._id}`,
            amount: apt.doctor?.consultationFee || 500,
            consultationFee: apt.doctor?.consultationFee || 500,
            platformFee: 0,
            tax: 0,
            paymentMethod: "upi",
            paymentStatus: "completed",
            createdAt: apt.scheduledAt || new Date().toISOString(),
            doctor: {
              _id: apt.doctor?._id,
              specialization: apt.doctor?.specialization || "General Physician",
              user: {
                name: apt.doctor?.user?.name || apt.doctor?.name || "Doctor",
                email: apt.doctor?.user?.email || "",
              },
            },
            appointment: {
              _id: apt._id,
              scheduledAt: apt.scheduledAt,
              consultationType: apt.consultationType || "video",
              appointmentNumber: apt.appointmentNumber || `APT-${apt._id}`,
            },
            invoice: {
              invoiceNumber: `INV-MOCK-${apt._id?.slice(-8) || Date.now()}`,
            },
            isMock: true, // Flag to identify mock payments
          }));

        // Merge with API payments, avoiding duplicates
        const existingIds = new Set(payments.map((p) => p._id));
        const uniqueMockPayments = mockPayments.filter((p) => !existingIds.has(p._id));
        
        // Apply filters to mock payments
        let filteredMockPayments = uniqueMockPayments;
        
        if (filters.paymentStatus && filters.paymentStatus !== "all") {
          filteredMockPayments = filteredMockPayments.filter(
            (p) => p.paymentStatus === filters.paymentStatus
          );
        }
        
        if (filters.consultationType && filters.consultationType !== "all") {
          filteredMockPayments = filteredMockPayments.filter(
            (p) => p.appointment?.consultationType === filters.consultationType
          );
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredMockPayments = filteredMockPayments.filter((p) => {
            const doctorName = p.doctor?.user?.name?.toLowerCase() || "";
            const invoiceNumber = p.invoice?.invoiceNumber?.toLowerCase() || "";
            const transactionId = p.transactionId?.toLowerCase() || "";
            return (
              doctorName.includes(searchLower) ||
              invoiceNumber.includes(searchLower) ||
              transactionId.includes(searchLower)
            );
          });
        }

        payments = [...payments, ...filteredMockPayments];
        
        // Sort by date (newest first)
        payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Update summary to include mock payments
        if (filteredMockPayments.length > 0) {
          const mockTotal = filteredMockPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          apiSummary = {
            totalPaid: (apiSummary?.totalPaid || 0) + mockTotal,
            pendingPayments: apiSummary?.pendingPayments || 0,
            refundsIssued: apiSummary?.refundsIssued || 0,
            netBalance: (apiSummary?.netBalance || 0) + mockTotal,
          };
        }
      } catch (storageError) {
        console.error("Error reading mock payments from localStorage:", storageError);
      }

      setTransactions(payments);
      setSummary(apiSummary);
      setPagination(apiPagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      consultationType: "all",
      paymentStatus: "all",
      search: "",
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > (pagination.pages || 1)) return;
    setPage(newPage);
  };

  const handleDownloadInvoice = async (payment) => {
    try {
      if (payment.invoice?.invoiceUrl) {
        // If invoice URL exists, download directly
        window.open(payment.invoice.invoiceUrl, "_blank");
      } else {
        // Generate invoice on the fly
        const response = await api.get(`/telehealth/payments/${payment._id}/invoice`, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${payment.invoice?.invoiceNumber || payment.transactionId || payment._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      alert("Failed to download invoice. Please try again later.");
      console.error("Error downloading invoice:", error);
    }
  };

  const handleRefundRequest = (payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const handleViewInvoiceDetails = async (payment) => {
    try {
      setInvoiceLoading(true);
      setShowInvoiceModal(true);
      setInvoiceDetails(null);
      const response = await api.get(`/telehealth/payments/${payment._id}`);
      setInvoiceDetails(response.data.payment);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load invoice details");
      setShowInvoiceModal(false);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "upi":
        return <FaMobileAlt className="payment-icon upi-icon" />;
      case "card":
        return <FaCreditCard className="payment-icon card-icon" />;
      case "wallet":
        return <FaWallet className="payment-icon wallet-icon" />;
      case "netbanking":
        return <FaUniversity className="payment-icon netbanking-icon" />;
      default:
        return <FaCreditCard className="payment-icon" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method?.toLowerCase()) {
      case "upi":
        return "UPI";
      case "card":
        return "Card";
      case "wallet":
        return "Wallet";
      case "netbanking":
        return "Net Banking";
      default:
        return method || "N/A";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      case "failed":
        return "status-failed";
      case "refunded":
        return "status-refunded";
      case "partially_refunded":
        return "status-partial-refund";
      default:
        return "status-pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "refunded":
        return "Refunded";
      case "partially_refunded":
        return "Partially Refunded";
      default:
        return status || "Pending";
    }
  };

  const canRequestRefund = (payment) => {
    return (
      payment.paymentStatus === "completed" &&
      (!payment.refundRequest || payment.refundRequest.status === "rejected")
    );
  };

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h2>Payments & Invoices</h2>
          <p>View your transaction history and manage payments</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="payments-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Date range</label>
            <div className="filter-date-range">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Consultation type</label>
            <select
              value={filters.consultationType}
              onChange={(e) => handleFilterChange("consultationType", e.target.value)}
            >
              <option value="all">All types</option>
              <option value="video">Video</option>
              <option value="chat">Chat</option>
              <option value="audio">Audio</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Payment status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="completed">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
            </select>
          </div>
          <div className="filter-group search-group">
            <label>Search</label>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by doctor or invoice ID"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="filters-actions">
          <button className="btn-filters-primary">
            <FaFilter /> Filters applied
          </button>
          <button className="btn-filters-reset" onClick={handleResetFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Summary section */}
      {summary && (
        <div className="payments-summary">
          <div className="summary-card">
            <span className="summary-label">Total Paid</span>
            <span className="summary-value">
              ₹{summary.totalPaid?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Pending Payments</span>
            <span className="summary-value summary-warning">
              ₹{summary.pendingPayments?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Refunds Issued</span>
            <span className="summary-value summary-danger">
              ₹{summary.refundsIssued?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Net Balance</span>
            <span className="summary-value summary-primary">
              ₹{summary.netBalance?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <FaFileInvoice className="empty-icon" />
          <p>No transactions yet</p>
          <p className="empty-subtitle">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="payments-container">
          {/* Desktop Table View */}
          <div className="table-container desktop-table">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction._id}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                    onClick={() => handleViewInvoiceDetails(transaction)}
                  >
                    <td className="date-cell">
                      <div className="date-content">
                        <span className="date-value">
                          {formatDate(transaction.createdAt || transaction.paymentDate)}
                        </span>
                        {transaction.transactionId && (
                          <span className="transaction-id-small">{transaction.transactionId}</span>
                        )}
                      </div>
                    </td>
                    <td className="doctor-cell">
                      <div className="doctor-info">
                        <span className="doctor-name">
                          {formatDoctorName(transaction.doctor?.user?.name)}
                        </span>
                        {transaction.doctor?.specialization && (
                          <span className="doctor-specialization">{transaction.doctor.specialization}</span>
                        )}
                      </div>
                    </td>
                    <td className="amount-cell">
                      <div className="amount-content">
                        <FaRupeeSign className="rupee-icon" />
                        <span className="amount-value">{transaction.amount?.toFixed(2) || "0.00"}</span>
                      </div>
                    </td>
                    <td className="method-cell">
                      <div className="method-content">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="method-label">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                        <FaShieldAlt className="secure-icon" title="Secure Payment" />
                      </div>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusColor(transaction.paymentStatus)}`}>
                        {getStatusLabel(transaction.paymentStatus)}
                      </span>
                      {transaction.refundRequest?.status && (
                        <span className="refund-badge">
                          Refund: {transaction.refundRequest.status}
                        </span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-invoice"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(transaction);
                          }}
                          title="Download Invoice"
                        >
                          <FaDownload /> Invoice
                        </button>
                        {canRequestRefund(transaction) && (
                          <button
                            className="btn-refund"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRefundRequest(transaction);
                            }}
                            title="Request Refund"
                          >
                            <FaUndo /> Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-cards">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="transaction-card-mobile">
                <div className="card-header-mobile">
                  <div>
                    <h3 className="card-title-mobile">Consultation Payment</h3>
                    <p className="card-date-mobile">{formatDateTime(transaction.createdAt || transaction.paymentDate)}</p>
                  </div>
                  <span className={`status-badge ${getStatusColor(transaction.paymentStatus)}`}>
                    {getStatusLabel(transaction.paymentStatus)}
                  </span>
                </div>
                <div className="card-details-mobile">
                  <div className="detail-item-mobile">
                    <span className="detail-label-mobile">Doctor</span>
                    <span className="detail-value-mobile">
                      {formatDoctorName(transaction.doctor?.user?.name)}
                    </span>
                  </div>
                  <div className="detail-item-mobile">
                    <span className="detail-label-mobile">Amount</span>
                    <span className="detail-value-mobile amount-mobile">
                      <FaRupeeSign /> {transaction.amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="detail-item-mobile">
                    <span className="detail-label-mobile">Payment Method</span>
                    <div className="detail-value-mobile method-mobile">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                      <FaShieldAlt className="secure-icon" />
                    </div>
                  </div>
                  {transaction.transactionId && (
                    <div className="detail-item-mobile">
                      <span className="detail-label-mobile">Transaction ID</span>
                      <span className="detail-value-mobile transaction-id-mobile">{transaction.transactionId}</span>
                    </div>
                  )}
                </div>
                <div className="card-actions-mobile">
                  <button
                    className="btn-invoice-mobile"
                    onClick={() => handleDownloadInvoice(transaction)}
                  >
                    <FaDownload /> Invoice
                  </button>
                  {canRequestRefund(transaction) && (
                    <button
                      className="btn-refund-mobile"
                      onClick={() => handleRefundRequest(transaction)}
                    >
                      <FaUndo /> Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="payments-pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Prev
          </button>
          <span className="page-info">
            Page {page} of {pagination.pages}
          </span>
          <button
            className="page-btn"
            disabled={page === pagination.pages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && selectedPayment && (
        <RefundRequestModal
          payment={selectedPayment}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={() => {
            setShowRefundModal(false);
            setSelectedPayment(null);
            fetchTransactions();
          }}
        />
      )}

      {/* Invoice Details Modal */}
      {showInvoiceModal && (
        <InvoiceDetailsModal
          loading={invoiceLoading}
          payment={invoiceDetails}
          onDownload={() => invoiceDetails && handleDownloadInvoice(invoiceDetails)}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceDetails(null);
          }}
        />
      )}
    </div>
  );
}

function RefundRequestModal({ payment, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  const refundReasons = [
    "Appointment cancelled by doctor",
    "Appointment cancelled by me",
    "Technical issues during consultation",
    "Doctor did not attend",
    "Service not as described",
    "Duplicate payment",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert("Please select a reason for refund");
      return;
    }
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason || finalReason.trim() === "") {
      alert("Please provide a reason for refund");
      return;
    }
    try {
      setLoading(true);
      await api.post(`/telehealth/payments/${payment._id}/refund-request`, {
        reason: finalReason,
      });
      alert("Refund request submitted successfully!");
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit refund request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content refund-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Request Refund</h3>
        <p className="modal-subtitle">
          Payment: <strong>₹{payment.amount?.toFixed(2) || "0.00"}</strong> • {formatDoctorName(payment.doctor?.user?.name)}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="refund-reason">Reason for Refund *</label>
            <select
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="refund-select"
              required
            >
              <option value="">Select a reason</option>
              {refundReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div className="form-group">
              <label htmlFor="custom-reason">Please specify *</label>
              <textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide details..."
                rows="3"
                className="custom-reason-textarea"
                required
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InvoiceDetailsModal({ loading, payment, onDownload, onClose }) {
  if (!payment && !loading) return null;

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "0.00";
    return value.toFixed(2);
  };

  const appointment = payment?.appointment;
  const doctor = payment?.doctor;
  const patient = payment?.user;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-header">
          <div>
            <h3>Invoice Details</h3>
            {payment?.invoice?.invoiceNumber && (
              <p className="invoice-number">Invoice #{payment.invoice.invoiceNumber}</p>
            )}
          </div>
          <button className="invoice-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading || !payment ? (
          <div className="loading-state">Loading invoice details...</div>
        ) : (
          <>
            <div className="invoice-sections">
              <div className="invoice-section">
                <h4>Patient</h4>
                <p className="invoice-primary">{patient?.name || "N/A"}</p>
                <p className="invoice-meta">{patient?.email || "N/A"}</p>
                <p className="invoice-meta">{patient?.phone || "N/A"}</p>
              </div>
              <div className="invoice-section">
                <h4>Doctor</h4>
                <p className="invoice-primary">
                  {formatDoctorName(doctor?.user?.name)}
                </p>
                <p className="invoice-meta">{doctor?.specialization || "N/A"}</p>
                <p className="invoice-meta">{doctor?.user?.email || "N/A"}</p>
              </div>
              <div className="invoice-section">
                <h4>Appointment</h4>
                <p className="invoice-primary">
                  {formatDateTime(appointment?.scheduledAt)}
                </p>
                <p className="invoice-meta">
                  Type: {appointment?.consultationType || "N/A"}
                </p>
                <p className="invoice-meta">
                  Appointment ID: {appointment?.appointmentNumber || "N/A"}
                </p>
              </div>
            </div>

            <div className="invoice-charges">
              <h4>Charges</h4>
              <div className="charges-row">
                <span>Consultation Fee</span>
                <span>₹{formatCurrency(payment.consultationFee || payment.amount || 0)}</span>
              </div>
              <div className="charges-row">
                <span>Platform Fee</span>
                <span>₹{formatCurrency(payment.platformFee || 0)}</span>
              </div>
              <div className="charges-row">
                <span>Tax</span>
                <span>₹{formatCurrency(payment.tax || 0)}</span>
              </div>
              <div className="charges-row charges-total">
                <span>Total Paid</span>
                <span>₹{formatCurrency(payment.amount || 0)}</span>
              </div>
            </div>

            <div className="invoice-meta-grid">
              <div>
                <h4>Payment</h4>
                <p className="invoice-meta">
                  Method: {payment.paymentMethod || "N/A"}
                </p>
                <p className="invoice-meta">
                  Status: {payment.paymentStatus || "N/A"}
                </p>
                <p className="invoice-meta">
                  Transaction ID: {payment.transactionId || "N/A"}
                </p>
                <p className="invoice-meta">
                  Gateway Ref: {payment.paymentId || "N/A"}
                </p>
              </div>
              <div>
                <h4>Session</h4>
                <p className="invoice-meta">
                  Planned Duration: {appointment?.duration || 30} min
                </p>
                <p className="invoice-meta">
                  Notes: {appointment?.notes || "N/A"}
                </p>
                {appointment?.prescription && (
                  <p className="invoice-meta">
                    Prescription:{" "}
                    <button
                      className="link-button"
                      onClick={() =>
                        (window.location.href = `/telehealth/prescriptions/${appointment.prescription}`)
                      }
                    >
                      View prescription
                    </button>
                  </p>
                )}
              </div>
            </div>

            <div className="invoice-actions">
              <button className="btn-invoice-primary" onClick={onDownload} disabled={!payment}>
                <FaFilePdf /> Download PDF
              </button>
              <button
                className="btn-invoice-secondary"
                onClick={() => alert("Sending invoice via email is not implemented yet.")}
              >
                <FaEnvelope /> Send to Patient
              </button>
              <button
                className="btn-invoice-secondary"
                onClick={() => alert("CSV export can be implemented with backend support.")}
              >
                <FaFileCsv /> Export CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

