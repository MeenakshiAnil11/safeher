import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaSearch, FaEdit, FaTimes, FaCheckCircle } from "react-icons/fa";
import api from "../../../services/api";
import "./AppointmentManagement.css";

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    doctor: "",
    user: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"

  useEffect(() => {
    fetchAppointments();
  }, [filters, pagination.page]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
      });
      const response = await api.get(`/telehealth/admin/appointments?${params}`);
      setAppointments(response.data.appointments);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (id) => {
    const newDate = window.prompt("Enter new date and time (YYYY-MM-DDTHH:mm):");
    if (!newDate) return;
    try {
      await api.put(`/telehealth/admin/appointments/${id}/reschedule`, {
        scheduledAt: newDate,
      });
      fetchAppointments();
      alert("Appointment rescheduled successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reschedule appointment");
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (!reason) return;
    try {
      await api.put(`/telehealth/admin/appointments/${id}/cancel`, { reason });
      fetchAppointments();
      alert("Appointment cancelled successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleResolveDispute = async (id) => {
    const resolution = window.prompt("Enter resolution details:");
    const refundAmount = window.prompt("Enter refund amount (0 for no refund):", "0");
    if (!resolution) return;
    try {
      await api.put(`/telehealth/admin/appointments/${id}/resolve-dispute`, {
        resolution,
        refundAmount: parseFloat(refundAmount) || 0,
      });
      fetchAppointments();
      alert("Dispute resolved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resolve dispute");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      completed: "#8b5cf6",
      cancelled: "#ef4444",
      "no-show": "#64748b",
      disputed: "#f97316",
    };
    return colors[status] || "#64748b";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="appointment-management">
      <div className="page-header">
        <h2>Appointment Management</h2>
        <p>Manage appointments, reschedule, and resolve disputes</p>
      </div>

      <div className="view-toggle">
        <button
          className={viewMode === "list" ? "active" : ""}
          onClick={() => setViewMode("list")}
        >
          <FaCalendarAlt /> List View
        </button>
        <button
          className={viewMode === "calendar" ? "active" : ""}
          onClick={() => setViewMode("calendar")}
        >
          <FaCalendarAlt /> Calendar View
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="disputed">Disputed</option>
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

      {/* Appointments List */}
      {viewMode === "list" && (
        <div className="appointments-list">
          {loading ? (
            <div className="loading-state">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">No appointments found</div>
          ) : (
            appointments.map((apt) => (
              <div key={apt._id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h3>Appointment #{apt.appointmentNumber}</h3>
                    <p className="appointment-date">{formatDateTime(apt.scheduledAt)}</p>
                  </div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(apt.status) }}
                  >
                    {apt.status}
                  </span>
                </div>
                <div className="appointment-details">
                  <div className="detail-item">
                    <strong>Patient:</strong> {apt.user?.name} ({apt.user?.email})
                  </div>
                  <div className="detail-item">
                    <strong>Doctor:</strong> {apt.doctor?.user?.name} - {apt.doctor?.specialization}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {apt.consultationType}
                  </div>
                  {apt.disputeStatus === "pending" && (
                    <div className="dispute-alert">
                      <strong>Dispute:</strong> {apt.disputeReason}
                    </div>
                  )}
                </div>
                <div className="appointment-actions">
                  {apt.status === "confirmed" && (
                    <button
                      className="btn-reschedule"
                      onClick={() => handleReschedule(apt._id)}
                    >
                      <FaEdit /> Reschedule
                    </button>
                  )}
                  {apt.status !== "cancelled" && apt.status !== "completed" && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(apt._id)}
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                  {apt.disputeStatus === "pending" && (
                    <button
                      className="btn-resolve"
                      onClick={() => handleResolveDispute(apt._id)}
                    >
                      <FaCheckCircle /> Resolve Dispute
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === "calendar" && (
        <div className="calendar-view">
          <div className="calendar-placeholder">
            <FaCalendarAlt size={48} />
            <p>Calendar view coming soon</p>
            <p>Use list view for now</p>
          </div>
        </div>
      )}

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
