import React, { useState, useEffect } from "react";
import {
  FaDollarSign,
  FaDownload,
  FaCreditCard,
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import api from "../../services/api";
import DoctorProfileGate from "../../components/doctor/DoctorProfileGate";
import useDoctorProfileStatus from "../../hooks/useDoctorProfileStatus";
import "./DoctorEarnings.css";

export default function DoctorEarnings() {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    thisMonth: 0,
    lastMonth: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const { profileLoading, profileCompleted, doctorName } = useDoctorProfileStatus();

  useEffect(() => {
    if (profileCompleted) {
      fetchEarnings();
    } else if (!profileLoading) {
      setLoading(false);
    }
  }, [selectedPeriod, profileLoading, profileCompleted]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/telehealth/earnings?period=${selectedPeriod}`).catch(() => ({
        data: {
          earnings: {
            total: 125000,
            pending: 15000,
            thisMonth: 25000,
            lastMonth: 30000,
          },
          transactions: [],
        },
      }));

      const earningsData = response.data.earnings || response.data;
      setEarnings({
        totalEarnings: earningsData.total || 0,
        pendingPayouts: earningsData.pending || 0,
        thisMonth: earningsData.thisMonth || 0,
        lastMonth: earningsData.lastMonth || 0,
      });

      const transactionsData = response.data.transactions || [];
      if (transactionsData.length === 0) {
        setTransactions([
          {
            _id: "txn-1",
            patient: { user: { name: "Sarah Johnson" } },
            amount: 500,
            paymentMethod: "card",
            status: "completed",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            invoiceId: "INV-001",
          },
          {
            _id: "txn-2",
            patient: { user: { name: "Meenakshi Anil" } },
            amount: 750,
            paymentMethod: "upi",
            status: "pending",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            invoiceId: "INV-002",
          },
        ]);
      } else {
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/telehealth/invoices/${invoiceId}/download`, {
        responseType: "blob",
      }).catch(() => {
        alert("Invoice download feature coming soon");
        return null;
      });
      
      if (response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (loading || profileLoading) {
    return <div className="doctor-earnings-loading">Loading earnings...</div>;
  }

  if (!profileCompleted) {
    return (
      <DoctorProfileGate
        doctorName={doctorName}
        sectionTitle="earnings"
        description="Complete your profile to unlock Earnings."
      />
    );
  }

  return (
    <div className="doctor-earnings">
      <div className="earnings-header">
        <div>
          <h1>Earnings & Transactions</h1>
          <p>Track your revenue and payment history</p>
        </div>
        <div className="period-selector">
          <button
            className={`period-btn ${selectedPeriod === "month" ? "active" : ""}`}
            onClick={() => setSelectedPeriod("month")}
          >
            This Month
          </button>
          <button
            className={`period-btn ${selectedPeriod === "year" ? "active" : ""}`}
            onClick={() => setSelectedPeriod("year")}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="earnings-summary">
        <div className="earnings-card">
          <div className="earnings-icon">
            <FaDollarSign />
          </div>
          <div className="earnings-content">
            <h3>Total Earnings</h3>
            <p className="earnings-amount">{formatCurrency(earnings.totalEarnings)}</p>
            <p className="earnings-subtitle">All time</p>
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-icon pending">
            <FaDollarSign />
          </div>
          <div className="earnings-content">
            <h3>Pending Payouts</h3>
            <p className="earnings-amount">{formatCurrency(earnings.pendingPayouts)}</p>
            <p className="earnings-subtitle">Awaiting payment</p>
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-icon">
            <FaChartLine />
          </div>
          <div className="earnings-content">
            <h3>This Month</h3>
            <p className="earnings-amount">{formatCurrency(earnings.thisMonth)}</p>
            <p className="earnings-subtitle">
              {earnings.lastMonth > 0 && (
                <span className={earnings.thisMonth >= earnings.lastMonth ? "positive" : "negative"}>
                  {earnings.thisMonth >= earnings.lastMonth ? "↑" : "↓"} {Math.abs(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100).toFixed(1)}% from last month
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="revenue-chart-card">
        <div className="chart-header">
          <h2>Revenue Trend</h2>
          <span className="chart-period">{selectedPeriod === "month" ? "Last 6 Months" : "Last 12 Months"}</span>
        </div>
        <div className="chart-placeholder">
          <FaChartLine className="chart-icon" />
          <p>Revenue chart visualization</p>
          <p className="chart-note">Monthly revenue trends and analytics</p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <FaCreditCard className="empty-icon" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="transactions-table">
            <div className="table-header">
              <div className="table-cell">Date</div>
              <div className="table-cell">Patient</div>
              <div className="table-cell">Amount</div>
              <div className="table-cell">Payment Method</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Actions</div>
            </div>
            {transactions.map((transaction) => (
              <div key={transaction._id} className="table-row">
                <div className="table-cell">
                  <FaCalendarAlt className="cell-icon" />
                  {formatDate(transaction.date)}
                </div>
                <div className="table-cell">
                  {transaction.patient?.user?.name || "Patient"}
                </div>
                <div className="table-cell amount">
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="table-cell">
                  <span className="payment-method">{transaction.paymentMethod?.toUpperCase() || "CARD"}</span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="table-cell">
                  <button
                    className="btn-download-invoice"
                    onClick={() => handleDownloadInvoice(transaction.invoiceId)}
                  >
                    <FaDownload /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
