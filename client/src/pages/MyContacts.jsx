// client/src/pages/MyContacts.jsx
import React, { useEffect, useMemo, useState } from "react";
import UserHeader from "../components/UserHeader";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import "./MyContacts.css";

const defaultChannels = { sms: true, email: true, push: true };

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EC";

const formatDateTime = (value) => {
  if (!value) return "—";
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
};

export default function MyContacts({ embedded = false }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fcmToken, setFcmToken] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [otpCodes, setOtpCodes] = useState({});

  const emptyForm = {
    id: null,
    name: "",
    relationship: "",
    number: "",
    email: "",
    priority: "secondary",
    otpEnabled: false,
    notificationChannels: { ...defaultChannels },
  };
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/contacts")
      .then((res) => setContacts(res.data?.contacts || []))
      .catch(() => setError("Failed to load contacts"))
      .finally(() => setLoading(false));
  };

  // Request FCM token and permission
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BEl62iUYgUivxIkv69yViEuiBIa-IHI9Hf1Aq7zUbhdnryT99PUbMIXv6Q2yZmy3TdhVjj6dSX4M5X8iN0jd2uM'
        });
        
        if (token) {
          setFcmToken(token);
          console.log('FCM Token:', token);
          return token;
        }
      } else {
        alert('❌ Notification permission denied. You won\'t receive SOS alerts.');
      }
    } catch (error) {
      console.error('FCM error:', error);
      alert('Failed to enable notifications');
    }
    return null;
  };

  // Listen for FCM messages
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      // Show notification
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo192.png'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    load();
  }, []);

  const isEdit = useMemo(() => !!form.id, [form.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        const { id, name, relationship, number, email, priority, otpEnabled, notificationChannels } = form;
        const res = await api.put(`/contacts/${id}`, {
          name,
          relationship,
          number,
          email,
          priority,
          otpEnabled,
          notificationChannels,
          fcmToken,
        });
        setContacts((prev) => prev.map((c) => (c._id === id ? res.data.contact : c)));
      } else {
        const { name, relationship, number, email, priority, otpEnabled, notificationChannels } = form;
        const res = await api.post(`/contacts`, {
          name,
          relationship,
          number,
          email,
          priority,
          otpEnabled,
          notificationChannels,
          fcmToken,
        });
        setContacts((prev) => [res.data.contact, ...prev]);
      }
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const onEdit = (contact) => {
    setForm({
      id: contact._id,
      name: contact.name || "",
      relationship: contact.relationship || "",
      number: contact.number || "",
      email: contact.email || "",
      priority: contact.priority || "secondary",
      otpEnabled: Boolean(contact.otpVerification?.enabled),
      notificationChannels: {
        sms: contact.notificationChannels?.sms ?? true,
        email: contact.notificationChannels?.email ?? true,
        push: contact.notificationChannels?.push ?? true,
      },
    });
    setShowForm(true);
  };

  const onDeleteClick = (contact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    
    try {
      await api.delete(`/contacts/${contactToDelete._id}`);
      setContacts((prev) => prev.filter((c) => c._id !== contactToDelete._id));
      setSuccessMessage(`✅ Contact "${contactToDelete.name}" deleted successfully!`);
      setShowDeleteDialog(false);
      setContactToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete contact");
      setShowDeleteDialog(false);
      setContactToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setContactToDelete(null);
  };

  const sendOTP = async (contactId) => {
    try {
      const res = await api.post(`/contacts/${contactId}/send-otp`);
      setSuccessMessage(
        `OTP sent successfully. Expires in ${res.data?.expiresInMinutes || 10} minutes. Preview code: ${res.data?.otpPreview || "sent"}`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async (contactId) => {
    const otpCode = otpCodes[contactId];
    if (!otpCode) {
      setError("Enter OTP code before verifying");
      return;
    }
    try {
      const res = await api.post(`/contacts/${contactId}/verify-otp`, { otpCode });
      setContacts((prev) => prev.map((c) => (c._id === contactId ? res.data.contact : c)));
      setOtpCodes((prev) => ({ ...prev, [contactId]: "" }));
      setSuccessMessage("Contact verified successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  const updateAcknowledgement = async (contactId, status) => {
    try {
      const res = await api.post(`/contacts/${contactId}/acknowledge-sos`, { status });
      setContacts((prev) => prev.map((c) => (c._id === contactId ? res.data.contact : c)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update acknowledgement status");
    }
  };

  const contactsContent = (
    <main className={`contacts-main ${embedded ? "embedded" : ""}`}>
      <h1 className="contacts-title">My Emergency Contacts</h1>
      <p className="contacts-subtitle">Add trusted people we can notify during SOS.</p>

      {error && <div className="contacts-alert error">{error}</div>}
      {successMessage && <div className="contacts-alert success">✅ {successMessage}</div>}

      <div className="contacts-toolbar">
        <button className="btn primary" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
          + Add New Contact
        </button>
        <button className="btn secondary" onClick={requestNotificationPermission}>
          🔔 Enable Notifications
        </button>
      </div>

      {fcmToken && (
        <div className="contacts-alert success">
          ✅ Notifications enabled! You will receive SOS alerts.
        </div>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="contacts-form-card">
          <div className="contacts-form-grid">
            <div>
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label>Relation</label>
              <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
            </div>
            <div>
              <label>Phone</label>
              <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </div>
            <div>
              <label>Email (optional)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.otpEnabled}
                  onChange={(e) => setForm({ ...form, otpEnabled: e.target.checked })}
                />
                Enable OTP verification (optional)
              </label>
            </div>
          </div>
          <div className="notification-section">
            <span className="section-label">Notification Settings</span>
            <div className="channel-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.notificationChannels.sms}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      notificationChannels: { ...prev.notificationChannels, sms: e.target.checked },
                    }))
                  }
                />
                SMS
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.notificationChannels.email}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      notificationChannels: { ...prev.notificationChannels, email: e.target.checked },
                    }))
                  }
                />
                Email
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.notificationChannels.push}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      notificationChannels: { ...prev.notificationChannels, push: e.target.checked },
                    }))
                  }
                />
                Push Notification
              </label>
            </div>
          </div>
          <div className="contacts-form-actions">
            <button className="btn primary" type="submit">{isEdit ? "Save Changes" : "Add Contact"}</button>
            <button className="btn ghost" type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="contacts-empty">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="contacts-empty">No contacts yet. Click "Add New Contact" to get started.</p>
      ) : (
        <div className="contacts-table-wrap">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Relation</th>
                <th>Priority</th>
                <th>Notifications</th>
                <th>Verification</th>
                <th>SOS Status</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id}>
                  <td data-label="Contact">
                    <div className="contact-cell">
                      <div className="contact-avatar">{getInitials(c.name)}</div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td data-label="Relation">{c.relationship || "-"}</td>
                  <td data-label="Priority">
                    <span className={`priority-badge ${c.priority || "secondary"}`}>
                      {(c.priority || "secondary").toUpperCase()}
                    </span>
                  </td>
                  <td data-label="Notifications">
                    <div className="channels-list">
                      {c.notificationChannels?.sms && <span>SMS</span>}
                      {c.notificationChannels?.email && <span>Email</span>}
                      {c.notificationChannels?.push && <span>Push</span>}
                      {!c.notificationChannels?.sms &&
                        !c.notificationChannels?.email &&
                        !c.notificationChannels?.push && <span>—</span>}
                    </div>
                  </td>
                  <td data-label="Verification">
                    <div className="verify-stack">
                      {c.otpVerification?.enabled ? (
                        c.otpVerification?.isVerified ? (
                          <span className="status-pill success">Verified</span>
                        ) : (
                          <span className="status-pill warning">Pending OTP</span>
                        )
                      ) : (
                        <span className="status-pill muted">Not enabled</span>
                      )}
                      {c.otpVerification?.enabled && !c.otpVerification?.isVerified && (
                        <div className="verify-actions">
                          <button className="btn small" onClick={() => sendOTP(c._id)}>Send OTP</button>
                          <input
                            value={otpCodes[c._id] || ""}
                            onChange={(e) => setOtpCodes((prev) => ({ ...prev, [c._id]: e.target.value }))}
                            placeholder="OTP"
                            className="otp-input"
                          />
                          <button className="btn small action-edit" onClick={() => verifyOTP(c._id)}>Verify</button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td data-label="SOS Status">
                    <div className="ack-stack">
                      <span className={`status-pill ${c.sosAcknowledgement?.status === "acknowledged" ? "success" : "warning"}`}>
                        {c.sosAcknowledgement?.status === "acknowledged" ? "Acknowledged" : "Pending"}
                      </span>
                      <small>{formatDateTime(c.sosAcknowledgement?.acknowledgedAt)}</small>
                    </div>
                  </td>
                  <td data-label="Phone">{c.number}</td>
                  <td data-label="Email">{c.email || "-"}</td>
                  <td data-label="Actions">
                    <div className="contacts-actions">
                      <button className="btn small action-edit" onClick={() => onEdit(c)}>✏️ Edit</button>
                      <button
                        className="btn small"
                        onClick={() =>
                          updateAcknowledgement(
                            c._id,
                            c.sosAcknowledgement?.status === "acknowledged" ? "pending" : "acknowledged"
                          )
                        }
                      >
                        {c.sosAcknowledgement?.status === "acknowledged" ? "↩ Reset" : "✅ Ack"}
                      </button>
                      <button className="btn ghost small action-delete" onClick={() => onDeleteClick(c)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteDialog && (
        <div className="dialog-overlay" onClick={cancelDelete}>
          <div className="contacts-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="contacts-delete-icon">⚠️</div>
            <h3>Delete Contact?</h3>
            <p>
              Are you sure you want to delete <strong>"{contactToDelete?.name}"</strong>? This action cannot be undone.
            </p>
            <div className="contacts-delete-actions">
              <button className="btn" onClick={cancelDelete}>Cancel</button>
              <button className="btn action-delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  if (embedded) return <section className="contacts-embedded-page">{contactsContent}</section>;

  return (
    <div className="dashboard-container contacts-page-shell">
      <UserHeader />
      <div className="dashboard-body">
        <UserSidebar />
        {contactsContent}
      </div>
      <Footer />
    </div>
  );
}