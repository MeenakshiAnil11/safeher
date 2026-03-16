import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import SuccessDialog from "../components/SuccessDialog";
import RichTextEditor from "../components/RichTextEditor";
import "./CreatePost.css";

const CreatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general-health-questions");
  const [tags, setTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isQuestion, setIsQuestion] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "success" });
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchPost();
    }
  }, [id]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isEditMode && (title || content)) {
      const timer = setTimeout(() => {
        saveDraftAuto();
      }, 30000); // 30 seconds

      setAutoSaveTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [title, content, category, tags, isAnonymous, isQuestion, images]);

  const saveDraftAuto = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await api.post("/forum/drafts", {
        title,
        content,
        category,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter((t) => t) : [],
        images: imagePreviews,
        isAnonymous,
        isQuestion,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error auto-saving draft:", error);
    }
  };

  const fetchPost = async () => {
    try {
      const res = await api.get(`/forum/posts/${id}`);
      const post = res.data.post;
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setTags(post.tags?.join(", ") || "");
      setIsAnonymous(post.isAnonymous || false);
      setIsQuestion(post.isQuestion || false);
      setImages(post.images || []);
      setImagePreviews(post.images || []);
    } catch (error) {
      console.error("Error fetching post:", error);
      setDialog({
        show: true,
        message: "Error loading post",
        type: "error",
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setDialog({
        show: true,
        message: "Maximum 5 images allowed",
        type: "error",
      });
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setDialog({
          show: true,
          message: "Image size must be less than 5MB",
          type: "error",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews([...imagePreviews, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setDialog({
        show: true,
        message: "Title and content are required",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setDialog({
        show: true,
        message: "Please login to create a post",
        type: "error",
      });
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Check if we have image files to upload
      const hasImageFiles = images.some(img => img instanceof File);
      
      if (hasImageFiles) {
        // Send FormData if we have image files
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        formData.append("category", category);
        if (tags) {
          formData.append("tags", tags);
        }
        formData.append("isAnonymous", isAnonymous);
        formData.append("isQuestion", isQuestion);

        // Add image files
        images.forEach((img) => {
          if (img instanceof File) {
            formData.append("images", img);
          }
        });

        if (isEditMode) {
          await api.put(`/forum/posts/${id}`, formData);
          setDialog({
            show: true,
            message: "Post updated successfully",
            type: "success",
          });
        } else {
          await api.post("/forum/posts", formData);
          setDialog({
            show: true,
            message: "Post created successfully",
            type: "success",
          });
        }
      } else {
        // Send JSON if no image files
        const postData = {
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter((t) => t) : [],
          isAnonymous,
          isQuestion,
          images: images.filter(img => typeof img === 'string'), // Existing image URLs
        };

        if (isEditMode) {
          await api.put(`/forum/posts/${id}`, postData);
          setDialog({
            show: true,
            message: "Post updated successfully",
            type: "success",
          });
        } else {
          await api.post("/forum/posts", postData);
          setDialog({
            show: true,
            message: "Post created successfully",
            type: "success",
          });
        }
      }

      setTimeout(() => {
        if (isEditMode) {
          navigate(`/forum/posts/${id}`);
        } else {
          navigate("/forum");
        }
      }, 1500);
    } catch (error) {
      console.error("Error creating/updating post:", error);
      setDialog({
        show: true,
        message: error.response?.data?.message || error.response?.data?.error || "Error saving post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "period-cycle-health", label: "Period & Cycle Health" },
    { value: "pregnancy-conception", label: "Pregnancy & Conception" },
    { value: "perimenopause-menopause", label: "Perimenopause & Menopause" },
    { value: "mental-health-wellness", label: "Mental Health & Wellness" },
    { value: "general-health-questions", label: "General Health Questions" },
    { value: "product-reviews-recommendations", label: "Product Reviews & Recommendations" },
    { value: "anonymous-support", label: "Anonymous Support" },
  ];

  return (
    <div className="create-post">
      <div className="create-post-container">
        <div className="create-post-header">
          <div>
            <h1>{isEditMode ? "Edit Post" : "Create New Post"}</h1>
            {lastSaved && !isEditMode && (
              <p className="draft-saved-indicator">
                💾 Draft saved {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button className="back-btn" onClick={() => navigate("/forum")}>
            ← Back to Forum
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              maxLength={200}
              required
            />
            <span className="char-count">{title.length}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content... You can use @username to mention others."
              height="300px"
            />
            <div className="editor-help">
              <small>💡 Tip: Use @username to mention other users. They'll be notified!</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., period, health, advice"
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Images (max 5, 5MB each)</label>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="image-preview">
                    <img
                      src={typeof preview === 'string' && preview.startsWith('http') ? preview : typeof preview === 'string' ? `http://localhost:5000${preview}` : preview}
                      alt={`Preview ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Post anonymously</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isQuestion}
                onChange={(e) => setIsQuestion(e.target.checked)}
              />
              <span>This is a question</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/forum")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading ? "Saving..." : isEditMode ? "Update Post" : "Create Post"}
            </button>
          </div>
        </form>
      </div>

      <SuccessDialog
        show={dialog.show}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog({ ...dialog, show: false })}
      />
    </div>
  );
};

export default CreatePost;
