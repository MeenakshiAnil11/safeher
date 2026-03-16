import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import api from "../../../services/api";

const buildItem = (form, withWeek) => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  title: form.title.trim(),
  description: form.description.trim(),
  week: withWeek ? Number(form.week) : null,
  updatedAt: new Date().toISOString(),
});

export default function TrackerCrudSection({
  title,
  storageKey,
  moduleKey,
  sectionKey,
  withWeekAssignment = false,
  weekLabel = "Assigned Week",
  defaultItems = [],
}) {
  const [form, setForm] = useState({ title: "", description: "", week: 1 });
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getLocalFallback = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) && saved.length ? saved : defaultItems;
    } catch (error) {
      return defaultItems;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/admin/tracker/${moduleKey}/${sectionKey}`);
        const fetchedItems = Array.isArray(response.data?.items) ? response.data.items : [];
        setItems(fetchedItems);
        localStorage.setItem(storageKey, JSON.stringify(fetchedItems));
      } catch (err) {
        setItems(getLocalFallback());
        setError("API unavailable, showing local cached data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [moduleKey, sectionKey, storageKey]);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (withWeekAssignment) return (a.week ?? 0) - (b.week ?? 0);
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }),
    [items, withWeekAssignment]
  );

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem(storageKey, JSON.stringify(nextItems));
  };

  const resetForm = () => {
    setForm({ title: "", description: "", week: 1 });
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    try {
      setError("");
      if (editingId) {
        const response = await api.put(`/admin/tracker/${moduleKey}/${sectionKey}/${editingId}`, {
          title: form.title.trim(),
          description: form.description.trim(),
          week: withWeekAssignment ? Number(form.week) : null,
          metadata: {},
        });
        const updated = response.data?.item;
        if (updated) {
          const next = items.map((item) => (item._id === editingId || item.id === editingId ? updated : item));
          persist(next);
        }
      } else {
        const response = await api.post(`/admin/tracker/${moduleKey}/${sectionKey}`, {
          title: form.title.trim(),
          description: form.description.trim(),
          week: withWeekAssignment ? Number(form.week) : null,
          metadata: {},
        });
        const created = response.data?.item;
        if (created) {
          persist([created, ...items]);
        } else {
          persist([buildItem(form, withWeekAssignment), ...items]);
        }
      }
      resetForm();
    } catch (err) {
      setError("Failed to save using API. Changes were not synced.");
      if (!editingId) {
        const next = [buildItem(form, withWeekAssignment), ...items];
        persist(next);
        resetForm();
      }
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      week: item.week || 1,
    });
  };

  const onDelete = async (id) => {
    try {
      setError("");
      await api.delete(`/admin/tracker/${moduleKey}/${sectionKey}/${id}`);
    } catch (err) {
      setError("Delete failed on API. Removed from local view.");
    }
    persist(items.filter((item) => item._id !== id && item.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <section className="tracker-crud-card">
      <div className="tracker-crud-header">
        <h3>{title}</h3>
        <span>{loading ? "Loading..." : `${items.length} items`}</span>
      </div>
      {error ? <p className="tracker-error">{error}</p> : null}

      <form onSubmit={submit} className="tracker-crud-form">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        {withWeekAssignment ? (
          <input
            type="number"
            min={1}
            max={40}
            value={form.week}
            onChange={(e) => setForm((prev) => ({ ...prev, week: e.target.value }))}
            placeholder={weekLabel}
          />
        ) : null}
        <div className="tracker-form-actions">
          <button type="submit">{editingId ? "Update" : "Add"}</button>
          {editingId ? (
            <button type="button" className="ghost" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="tracker-crud-table-wrap">
        <table className="tracker-crud-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              {withWeekAssignment ? <th>{weekLabel}</th> : null}
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length ? (
              sortedItems.map((item) => (
                <tr key={item._id || item.id}>
                  <td>{item.title}</td>
                  <td>{item.description || "-"}</td>
                  {withWeekAssignment ? <td>{item.week ? `Week ${item.week}` : "-"}</td> : null}
                  <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}</td>
                  <td className="actions-cell">
                    <button type="button" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => onDelete(item._id || item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={withWeekAssignment ? 5 : 4}>No records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
