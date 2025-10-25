import React, { useState } from "react";
import api from "../services/api";
import "./ResourceSubmitModal.css"; // optional for modal styling

export default function ResourceSubmitModal({ show, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Legal Rights & Laws");
  const [type, setType] = useState("Article");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !type || !category) {
      alert("Title, Type, and Category are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("language", language);
    formData.append("tags", tags);
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);

    setLoading(true);
    try {
      await api.post("/resources/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Resource submitted for approval!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit resource.");
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Submit a Resource</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title*" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Legal Rights & Laws</option>
            <option>Health & Wellness</option>
            <option>Safety & Security</option>
            <option>Education & Skills</option>
            <option>Support Networks</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Article</option>
            <option>PDF</option>
            <option>Guide</option>
            <option>Video</option>
            <option>External Link</option>
            <option>Checklist</option>
          </select>
          {type === "PDF" && <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />}
          {type !== "PDF" && <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
          <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
