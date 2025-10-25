// client/src/pages/SubmitResource.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";
import "./SubmitResource.css";

const CATEGORIES = [
  "Legal Rights & Laws",
  "Health & Wellness",
  "Safety & Security",
  "Education & Skills",
  "Support Networks",
];

const TYPES = ["Article", "PDF", "Guide", "Video", "Checklist", "External Link"];

export default function SubmitResource() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState("Article");
  const [description, setDescription] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setPdfFile(null);
    } else {
      setError("");
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description || !category || !type) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!url && (type !== "PDF" || !pdfFile)) {
      setError("Please provide a Resource URL. (For PDFs, you can provide a URL or upload a file.)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("region", sourceName);
      if (url) formData.append("url", url);
      if (pdfFile) formData.append("pdfFile", pdfFile);

      await api.post("/resources/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Resource submitted successfully! It is now pending admin approval and will appear in the Resource Hub once approved.");
      setTimeout(() => navigate("/resources"), 1500);
    } catch (err) {
      setError("Failed to submit resource. Please try again.");
    }
  };

  return (
    <div className="submit-resource-page">
      <Header />
      <main className="submit-resource-content">
        <section className="container submit-form">
          <h1>Submit a Resource</h1>
          <p>Provide a link or upload a PDF to contribute to the resource hub.</p>

          <form onSubmit={handleSubmit}>
            <label>
              Title<span className="required">*</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label>
              Category<span className="required">*</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Type<span className="required">*</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Description<span className="required">*</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>

            <label>
              Source Name
              <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
            </label>

            <label>
              Resource URL{type !== "PDF" || !pdfFile ? <span className="required">*</span> : ""}
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/resource"
                required={type !== "PDF" || !pdfFile}
              />
            </label>

            {type === "PDF" && (
              <>
                <label>
                  Or Upload PDF (alternative to URL)
                  <input type="file" accept="application/pdf" onChange={handleFileChange} />
                  {pdfFile && <span className="file-name">{pdfFile.name}</span>}
                  <small>If uploading, URL above is optional.</small>
                </label>
              </>
            )}

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="form-actions">
              <button type="submit" className="btn primary">Submit Resource</button>
              <button type="button" className="btn ghost" onClick={() => navigate("/resources")}>Cancel</button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
