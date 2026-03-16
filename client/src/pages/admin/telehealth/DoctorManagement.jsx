import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaBan,
  FaCheckCircle,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import api from "../../../services/api";
import "./DoctorManagement.css";

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    specialization: "",
    location: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [filters, pagination.page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const response = await api.get(`/telehealth/admin/doctors?${params}`);
      setDoctors(response.data.doctors);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this doctor?")) return;
    try {
      await api.put(`/telehealth/admin/doctors/${id}/approve`);
      fetchDoctors();
      alert("Doctor approved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve doctor");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason) return;
    try {
      await api.put(`/telehealth/admin/doctors/${id}/reject`, { reason });
      fetchDoctors();
      alert("Doctor rejected successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject doctor");
    }
  };

  const handleSuspend = async (id) => {
    const reason = window.prompt("Please provide a reason for suspension:");
    if (!reason) return;
    try {
      await api.put(`/telehealth/admin/doctors/${id}/suspend`, { reason });
      fetchDoctors();
      alert("Doctor suspended successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to suspend doctor");
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Are you sure you want to reactivate this doctor?")) return;
    try {
      await api.put(`/telehealth/admin/doctors/${id}/reactivate`);
      fetchDoctors();
      alert("Doctor reactivated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reactivate doctor");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "badge-pending", label: "Pending" },
      approved: { class: "badge-approved", label: "Approved" },
      suspended: { class: "badge-suspended", label: "Suspended" },
      rejected: { class: "badge-rejected", label: "Rejected" },
    };
    return badges[status] || badges.pending;
  };

  const viewDoctorDetails = async (id) => {
    try {
      const response = await api.get(`/telehealth/admin/doctors/${id}`);
      setSelectedDoctor(response.data.doctor);
      setShowModal(true);
    } catch (error) {
      alert("Failed to fetch doctor details");
    }
  };

  return (
    <div className="doctor-management">
      <div className="page-header">
        <h2>Doctor Management</h2>
        <p>Manage doctor profiles, approvals, and status</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Search by specialization..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="filter-input"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Location..."
          value={filters.location}
          onChange={(e) =>
            setFilters({ ...filters, location: e.target.value })
          }
          className="filter-input"
        />
      </div>

      {/* Doctors Table */}
      <div className="doctors-table-container">
        {loading ? (
          <div className="loading-state">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">No doctors found</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Specialization</th>
                <th>Location</th>
                <th>Consultation Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => {
                const badge = getStatusBadge(doctor.status);
                return (
                  <tr key={doctor._id}>
                    <td>
                      <div className="doctor-name">
                        {doctor.user?.name || "N/A"}
                      </div>
                      <div className="doctor-email">{doctor.user?.email}</div>
                    </td>
                    <td>{doctor.specialization}</td>
                    <td>
                      {doctor.location?.city
                        ? `${doctor.location.city}, ${doctor.location.state}`
                        : "N/A"}
                    </td>
                    <td>₹{doctor.consultationFee}</td>
                    <td>
                      <span className={`status-badge ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => viewDoctorDetails(doctor._id)}
                        >
                          <FaEye />
                        </button>
                        {doctor.status === "pending" && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(doctor._id)}
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReject(doctor._id)}
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {doctor.status === "approved" && (
                          <button
                            className="btn-suspend"
                            onClick={() => handleSuspend(doctor._id)}
                          >
                            <FaBan />
                          </button>
                        )}
                        {doctor.status === "suspended" && (
                          <button
                            className="btn-reactivate"
                            onClick={() => handleReactivate(doctor._id)}
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            Next
          </button>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Doctor Details</h3>
            <div className="doctor-details">
              <div className="detail-row">
                <strong>Name:</strong> {selectedDoctor.user?.name}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedDoctor.user?.email}
              </div>
              <div className="detail-row">
                <strong>Phone:</strong> {selectedDoctor.user?.phone || "N/A"}
              </div>
              <div className="detail-row">
                <strong>Specialization:</strong> {selectedDoctor.specialization}
              </div>
              <div className="detail-row">
                <strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee}
              </div>
              <div className="detail-row">
                <strong>Languages:</strong>{" "}
                {selectedDoctor.languages?.join(", ") || "N/A"}
              </div>
              <div className="detail-row">
                <strong>Experience:</strong> {selectedDoctor.experience || 0} years
              </div>
              {selectedDoctor.qualifications?.length > 0 && (
                <div className="detail-row">
                  <strong>Qualifications:</strong>
                  <ul>
                    {selectedDoctor.qualifications.map((q, idx) => (
                      <li key={idx}>
                        {q.degree} - {q.institution} ({q.year})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              className="btn-close"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
