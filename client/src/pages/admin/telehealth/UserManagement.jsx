import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBan,
  FaCheckCircle,
  FaKey,
  FaTrash,
  FaEye,
  FaHistory,
  FaFilePrescription,
} from "react-icons/fa";
import api from "../../../services/api";
import "./UserManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    activity: "",
    location: "",
    registrationDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewType, setViewType] = useState("profile"); // "profile", "appointments", "prescriptions"

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: "user", // Only get regular users
      });
      if (filters.search) params.append("q", filters.search);
      if (filters.activity) params.append("active", filters.activity === "active" ? "true" : "false");

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
        pages: Math.ceil((response.data.total || 0) / pagination.limit),
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/deactivate`);
      fetchUsers();
      alert("User suspended successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to suspend user");
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm("Are you sure you want to activate this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/activate`);
      fetchUsers();
      alert("User activated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to activate user");
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Reset password for this user? They will need to set a new password.")) return;
    try {
      const response = await api.post(`/admin/users/${id}/reset-password`);
      if (response.data.tempPassword) {
        alert(`Temporary password: ${response.data.tempPassword}`);
      } else {
        alert("Password reset email sent successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    const confirm = window.prompt("Type 'DELETE' to confirm:");
    if (confirm !== "DELETE") return;
    try {
      // Note: Delete endpoint may not exist, using deactivate as fallback
      await api.patch(`/admin/users/${id}/deactivate`).catch(() => {
        throw new Error("Delete endpoint not available. User deactivated instead.");
      });
      fetchUsers();
      alert("User deleted/deactivated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const viewUserDetails = async (user) => {
    setSelectedUser(user);
    setViewType("profile");
    setShowModal(true);
      // Fetch user's appointments and prescriptions
      try {
        const userId = user._id || user.id;
        const [appointmentsRes, prescriptionsRes] = await Promise.all([
          api.get(`/telehealth/admin/appointments?user=${userId}`).catch(() => ({ data: { appointments: [] } })),
          api.get(`/telehealth/admin/prescriptions?user=${userId}`).catch(() => ({ data: { prescriptions: [] } })),
        ]);
      setSelectedUser({
        ...user,
        appointments: appointmentsRes.data.appointments || [],
        prescriptions: prescriptionsRes.data.prescriptions || [],
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management</h2>
        <p>Manage users, activity logs, and history</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <FaSearch className="filter-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />
        </div>
        <select
          value={filters.activity}
          onChange={(e) => setFilters({ ...filters, activity: e.target.value })}
          className="filter-select"
        >
          <option value="">All Activity</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input
          type="date"
          value={filters.registrationDate}
          onChange={(e) => setFilters({ ...filters, registrationDate: e.target.value })}
          className="filter-input"
          placeholder="Registration Date"
        />
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((user) => {
                  if (filters.search) {
                    const search = filters.search.toLowerCase();
                    return (
                      user.name?.toLowerCase().includes(search) ||
                      user.email?.toLowerCase().includes(search)
                    );
                  }
                  return true;
                })
                .map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-name">{user.name || "N/A"}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "badge-active" : "badge-inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => viewUserDetails(user)}
                        >
                          <FaEye />
                        </button>
                        {user.isActive ? (
                          <button
                            className="btn-suspend"
                            onClick={() => handleSuspend(user._id)}
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            className="btn-activate"
                            onClick={() => handleActivate(user._id)}
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          className="btn-reset"
                          onClick={() => handleResetPassword(user._id)}
                        >
                          <FaKey />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="modal-tabs">
              <button
                className={viewType === "profile" ? "active" : ""}
                onClick={() => setViewType("profile")}
              >
                Profile
              </button>
              <button
                className={viewType === "appointments" ? "active" : ""}
                onClick={() => setViewType("appointments")}
              >
                Appointments <span>({selectedUser.appointments?.length || 0})</span>
              </button>
              <button
                className={viewType === "prescriptions" ? "active" : ""}
                onClick={() => setViewType("prescriptions")}
              >
                Prescriptions <span>({selectedUser.prescriptions?.length || 0})</span>
              </button>
            </div>

            {viewType === "profile" && (
              <div className="user-details">
                <div className="detail-row">
                  <strong>Name:</strong> {selectedUser.name}
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div className="detail-row">
                  <strong>Phone:</strong> {selectedUser.phone || "N/A"}
                </div>
                <div className="detail-row">
                  <strong>Registration Date:</strong> {formatDate(selectedUser.createdAt)}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${
                      selectedUser.isActive ? "badge-active" : "badge-inactive"
                    }`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            )}

            {viewType === "appointments" && (
              <div className="appointments-list">
                {selectedUser.appointments?.length === 0 ? (
                  <p className="no-data">No appointments found</p>
                ) : (
                  selectedUser.appointments?.map((apt) => (
                    <div key={apt._id} className="appointment-item">
                      <div className="appointment-header">
                        <strong>Appointment #{apt.appointmentNumber}</strong>
                        <span className="status-badge">{apt.status}</span>
                      </div>
                      <p>Date: {formatDate(apt.scheduledAt)}</p>
                      <p>Doctor: {apt.doctor?.specialization || "N/A"}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {viewType === "prescriptions" && (
              <div className="prescriptions-list">
                {selectedUser.prescriptions?.length === 0 ? (
                  <p className="no-data">No prescriptions found</p>
                ) : (
                  selectedUser.prescriptions?.map((prescription) => (
                    <div key={prescription._id} className="prescription-item">
                      <div className="prescription-header">
                        <strong>Prescription</strong>
                        <span>{formatDate(prescription.createdAt)}</span>
                      </div>
                      {prescription.diagnosis && (
                        <p>
                          <strong>Diagnosis:</strong> {prescription.diagnosis}
                        </p>
                      )}
                      {prescription.medications?.length > 0 && (
                        <div>
                          <strong>Medications:</strong>
                          <ul>
                            {prescription.medications.map((med, idx) => (
                              <li key={idx}>
                                {med.name} - {med.dosage} ({med.frequency})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            <button className="btn-close" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
