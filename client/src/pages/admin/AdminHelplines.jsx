import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

export default function AdminHelplines() {
  const [helplines, setHelplines] = useState([]);
  const [form, setForm] = useState({
    name: "",
    number: "",
    region: "",
    category: "other",
  });

  const load = async () => {
    const res = await api.get("/admin/helplines");
    setHelplines(res.data.helplines);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.name || !form.number) return alert("Fill required fields");
    await api.post("/admin/helplines", form);
    setForm({ name: "", number: "", region: "", category: "other" });
    load();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this helpline?")) return;
    await api.delete(`/admin/helplines/${id}`);
    load();
  };

  return (
    <AdminLayout pageTitle="Helplines">
      <div className="admin-dashboard">
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Number"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
          />
          <input
            placeholder="Region"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="police">Police</option>
            <option value="ambulance">Ambulance</option>
            <option value="women">Women</option>
            <option value="ngo">NGO</option>
            <option value="other">Other</option>
          </select>
          <button onClick={save}>Add</button>
        </div>

        <table
          border="1"
          cellPadding="5"
          style={{ width: "100%", marginTop: 10 }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Region</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {helplines.map((h) => (
              <tr key={h._id}>
                <td>{h.name}</td>
                <td>{h.number}</td>
                <td>{h.region}</td>
                <td>{h.category}</td>
                <td>
                  <button onClick={() => del(h._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
