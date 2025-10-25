// client/src/pages/MyContacts.jsx
import React, { useEffect, useMemo, useState } from "react";
import UserHeader from "../components/UserHeader";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import api from "../services/api";

export default function MyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const emptyForm = { id: null, name: "", relationship: "", number: "", email: "" };
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

  useEffect(() => {
    load();
  }, []);

  const isEdit = useMemo(() => !!form.id, [form.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        const { id, name, relationship, number, email } = form;
        const res = await api.put(`/contacts/${id}`, { name, relationship, number, email });
        setContacts((prev) => prev.map((c) => (c._id === id ? res.data.contact : c)));
      } else {
        const { name, relationship, number, email } = form;
        const res = await api.post(`/contacts`, { name, relationship, number, email });
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
    });
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="dashboard-container">
      <UserHeader />
      <div className="dashboard-body">
        <UserSidebar />
        <main className="dashboard-main">
          <h1 className="dashboard-title">My Emergency Contacts</h1>
          <p className="dashboard-subtitle">Add trusted people we can notify during SOS.</p>

          {error && (
            <div style={{ background: "#ffe2e2", color: "#a10000", padding: 10, borderRadius: 6, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <button className="btn primary" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
              + Add New Contact
            </button>
          </div>

          {showForm && (
            <form onSubmit={onSubmit} style={{ background: "#fff", padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn primary" type="submit">{isEdit ? "Save Changes" : "Add Contact"}</button>
                <button className="btn ghost" type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : contacts.length === 0 ? (
            <p>No contacts yet. Click "Add New Contact" to get started.</p>
          ) : (
            <table style={{ width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#f7f7f7" }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Relation</th>
                  <th style={{ padding: 12 }}>Phone</th>
                  <th style={{ padding: 12 }}>Email</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c._id}>
                    <td style={{ padding: 12 }}>{c.name}</td>
                    <td style={{ padding: 12 }}>{c.relationship || "-"}</td>
                    <td style={{ padding: 12 }}>{c.number}</td>
                    <td style={{ padding: 12 }}>{c.email || "-"}</td>
                    <td style={{ padding: 12 }}>
                      <button className="btn small" onClick={() => onEdit(c)}>Edit</button>
                      <button className="btn ghost small" onClick={() => onDelete(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}