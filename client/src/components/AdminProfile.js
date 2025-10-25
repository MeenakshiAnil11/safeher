import React, { useEffect, useState, useRef } from "react";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import api from "../services/api";
import "./AdminProfile.css";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/profile");
        setProfile(res.data);
        setFormData(res.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first!");
      return;
    }
    const fileData = new FormData();
    fileData.append("profilePicture", selectedFile);

    try {
      setUploading(true);
      setUploadError(null);
      const res = await api.post("/admin/profile/upload", fileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, profilePicture: res.data.url }));
      setPreview(null);
      setSelectedFile(null);
      setUploadSuccess("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      setUploadError("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/admin/profile", formData);
      setProfile(res.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setUploadError(null);
      setUploadSuccess(null);
    } else {
      setUploadError("Please drop a valid image file");
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>

      {/* BASIC INFO */}
      <div className="profile-section basic-info">
        <h3>Basic Info</h3>

        {/* Modern Click-to-Upload Avatar with Drag and Drop */}
        <div
          className="profile-picture-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current.click();
          }}
          aria-label="Upload profile picture"
        >
          {preview || profile.profilePicture ? (
            <img
              src={preview || profile.profilePicture}
              alt="Profile Avatar"
              className="profile-avatar"
              aria-live="polite"
            />
          ) : (
            <FaUserCircle className="profile-avatar placeholder-avatar" aria-hidden="true" />
          )}
          <div className="upload-overlay">
            <FaCamera />
          </div>
          <input
            type="file"
            id="avatarUpload"
            className="avatar-input"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {uploading && <div className="upload-spinner" aria-live="assertive" aria-label="Uploading"></div>}
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="upload-btn"
          aria-disabled={uploading || !selectedFile}
        >
          {uploading ? "Uploading..." : "Upload Picture"}
        </button>
        {uploadError && <div className="upload-error" role="alert">{uploadError}</div>}
        {uploadSuccess && <div className="upload-success" role="alert">{uploadSuccess}</div>}

        {editing ? (
          <>
            <div className="info-item">
              <strong>Full Name:</strong>
              <input
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
              />
            </div>

            <div className="info-item">
              <strong>Username / Admin ID:</strong>
              <input
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
              />
            </div>

            <div className="info-item">
              <strong>Email:</strong>
              <input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <div className="info-item">
              <strong>Alternate Email:</strong>
              <input
                name="alternateEmail"
                value={formData.alternateEmail || ""}
                onChange={handleChange}
              />
            </div>

            <div className="info-item">
              <strong>Gender:</strong>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="info-item">
              <strong>Date of Birth:</strong>
              <input
                type="date"
                name="dob"
                value={formData.dob ? formData.dob.split("T")[0] : ""}
                onChange={handleChange}
              />
            </div>

            <div className="info-item">
              <strong>Designation / Department:</strong>
              <input
                name="designation"
                value={formData.designation || ""}
                onChange={handleChange}
              />
            </div>

            <div className="info-item">
              <strong>About Me / Bio:</strong>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio || ""}
                onChange={handleChange}
              ></textarea>
            </div>
          </>
        ) : (
          <>
            <div className="info-item">
              <strong>Full Name:</strong> {profile.fullName}
            </div>
            <div className="info-item">
              <strong>Username / Admin ID:</strong> {profile.username}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {profile.email}
            </div>
            <div className="info-item">
              <strong>Alternate Email:</strong> {profile.alternateEmail || "N/A"}
            </div>
            <div className="info-item">
              <strong>Gender:</strong> {profile.gender || "N/A"}
            </div>
            <div className="info-item">
              <strong>Date of Birth:</strong>{" "}
              {profile.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"}
            </div>
            <div className="info-item">
              <strong>Designation / Department:</strong>{" "}
              {profile.designation || "N/A"}
            </div>
            <div className="info-item">
              <strong>About Me / Bio:</strong> {profile.bio || "No bio available"}
            </div>
          </>
        )}
      </div>

      {/* CONTACT DETAILS */}
      <div className="profile-section contact-details">
        <h3>Contact Details</h3>
        {editing ? (
          <>
            <div className="info-item">
              <strong>Phone Number:</strong>
              <input
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
              />
            </div>
            <div className="info-item">
              <strong>Address:</strong>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>
          </>
        ) : (
          <>
            <div className="info-item">
              <strong>Phone Number:</strong> {profile.phoneNumber || "N/A"}
            </div>
            <div className="info-item">
              <strong>Address:</strong> {profile.address || "N/A"}
            </div>
          </>
        )}
      </div>

      {/* ROLE & STATUS */}
      <div className="profile-section role-status">
        <h3>Role & Status</h3>
        <div className="info-item">
          <strong>Role:</strong> {profile.role}
        </div>
        <div className="info-item">
          <strong>Account Status:</strong> {profile.isActive ? "Active" : "Inactive"}
        </div>
        <div className="info-item">
          <strong>Last Login:</strong> {new Date(profile.lastLogin).toLocaleString()}
        </div>
        <div className="info-item">
          <strong>Created On:</strong> {new Date(profile.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* SECURITY */}
      <div className="profile-section security">
        <h3>Security</h3>
        <div className="info-item">
          <strong>2FA Status:</strong> {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="buttons">
        {editing ? (
          <>
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button className="cancel-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

