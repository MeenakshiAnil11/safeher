// client/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEdit,
  FaCamera,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaTrashAlt,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaSignOutAlt,
  FaBox,
  FaHeart,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import api from "../services/api";
import { getImageUrl, getProductImage } from "../utils/imageUtils";
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [personalInfoForm, setPersonalInfoForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
    fetchRecentOrders();
    fetchWishlist();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      const userData = response.data.user;
      setUser(userData);
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
      });
      setPersonalInfoForm({
        fullName: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: userData.gender || "",
      });
      if (userData.profilePicture) {
        setPreview(userData.profilePicture);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/orders?page=1&limit=3");
      setRecentOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlistItems(response.data.products?.slice(0, 3) || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.put("/auth/profile", {
        name: profileForm.name,
      });
      await fetchUserData();
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePersonalInfoUpdate = async () => {
    try {
      await api.put("/auth/profile", {
        name: personalInfoForm.fullName,
        phone: personalInfoForm.phone,
        dateOfBirth: personalInfoForm.dateOfBirth,
        gender: personalInfoForm.gender,
      });
      await fetchUserData();
      setIsEditingPersonalInfo(false);
      alert("Personal information updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update personal information");
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
      // TODO: Upload profile picture to server
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress._id}`, addressForm);
      } else {
        await api.post("/addresses", addressForm);
      }
      await fetchAddresses();
      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressForm({
        label: "Home",
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label || "Home",
      name: address.name || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      isDefault: address.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: "#10b981",
      shipped: "#8b5cf6",
      processing: "#3b82f6",
      confirmed: "#10b981",
      placed: "#f59e0b",
    };
    return colors[status] || "#64748b";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-with-header">
        <UserHeader />
        <div className="profile-loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (showSecuritySettings) {
    return (
      <div className="page-with-header">
        <UserHeader />
        <div className="profile-page">
          <div className="profile-container">
            <div className="security-settings-page">
              <h1 className="security-settings-title">Security & Settings</h1>
              
              <div className="settings-card" onClick={() => navigate("/profile?tab=password")}>
                <FaLock className="settings-icon purple" />
                <div className="settings-content">
                  <h3>Change Password</h3>
                  <p>Update your password regularly for security</p>
                </div>
                <FaChevronRight className="settings-arrow" />
              </div>

              <div className="settings-card" onClick={() => navigate("/profile?tab=notifications")}>
                <FaBell className="settings-icon blue" />
                <div className="settings-content">
                  <h3>Manage Notifications</h3>
                  <p>Control your email and push notifications</p>
                </div>
                <FaChevronRight className="settings-arrow" />
              </div>

              <div className="settings-card" onClick={() => navigate("/profile?tab=privacy")}>
                <FaShieldAlt className="settings-icon green" />
                <div className="settings-content">
                  <h3>Privacy Settings</h3>
                  <p>Manage your privacy and data preferences</p>
                </div>
                <FaChevronRight className="settings-arrow" />
              </div>

              <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt className="logout-icon" />
                Logout
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-with-header">
      <UserHeader />
      <div className="profile-page">
        <div className="profile-container">
          {/* Left Sidebar - Navigation */}
          <div className="profile-sidebar-left">
            <div className="sidebar-nav-header">
              <FaUser className="sidebar-nav-icon" />
              <div>
                <h2>My Profile</h2>
                <p>Manage your account details</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="profile-main-content">

          {/* Profile Summary Card */}
          <div className="profile-summary-card">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                {preview ? (
                  <img src={preview} alt="Profile" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <label htmlFor="profile-pic-upload" className="avatar-camera-icon">
                  <FaCamera />
                </label>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="profile-info">
                {isEditingProfile ? (
                  <>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="profile-name-input"
                    />
                    <p className="profile-email">{profileForm.email}</p>
                    <div className="profile-actions">
                      <button
                        className="btn-primary"
                        onClick={handleProfileUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="profile-name">{user?.name || "User"}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <div className="profile-actions">
                      <button
                        className="btn-primary"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <FaEdit /> Edit Profile
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => navigate("/profile?tab=password")}
                      >
                        Change Password
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="personal-info-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              {!isEditingPersonalInfo && (
                <button
                  className="edit-link"
                  onClick={() => setIsEditingPersonalInfo(true)}
                >
                  <FaEdit /> Edit
                </button>
              )}
            </div>
            <div className="info-fields">
              <div className="info-field">
                <label>Full Name</label>
                {isEditingPersonalInfo ? (
                  <input
                    type="text"
                    value={personalInfoForm.fullName}
                    onChange={(e) =>
                      setPersonalInfoForm({ ...personalInfoForm, fullName: e.target.value })
                    }
                    className="info-input"
                  />
                ) : (
                  <div className="info-display">
                    <FaUser className="info-icon" />
                    <span>{personalInfoForm.fullName || "Not set"}</span>
                  </div>
                )}
              </div>
              <div className="info-field">
                <label>Email</label>
                {isEditingPersonalInfo ? (
                  <input
                    type="email"
                    value={personalInfoForm.email}
                    disabled
                    className="info-input disabled"
                  />
                ) : (
                  <div className="info-display">
                    <FaEnvelope className="info-icon" />
                    <span>{personalInfoForm.email}</span>
                  </div>
                )}
              </div>
              <div className="info-field">
                <label>Phone Number</label>
                {isEditingPersonalInfo ? (
                  <input
                    type="tel"
                    value={personalInfoForm.phone}
                    onChange={(e) =>
                      setPersonalInfoForm({ ...personalInfoForm, phone: e.target.value })
                    }
                    className="info-input"
                  />
                ) : (
                  <div className="info-display">
                    <FaPhone className="info-icon" />
                    <span>{personalInfoForm.phone || "Not set"}</span>
                  </div>
                )}
              </div>
            </div>
            {isEditingPersonalInfo && (
              <div className="info-actions">
                <button className="btn-primary" onClick={handlePersonalInfoUpdate}>
                  Save
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setIsEditingPersonalInfo(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Additional Personal Info */}
          <div className="personal-info-card">
            <div className="info-fields">
              <div className="info-field">
                <label>Date of Birth</label>
                {isEditingPersonalInfo ? (
                  <input
                    type="date"
                    value={personalInfoForm.dateOfBirth}
                    onChange={(e) =>
                      setPersonalInfoForm({ ...personalInfoForm, dateOfBirth: e.target.value })
                    }
                    className="info-input"
                  />
                ) : (
                  <div className="info-display">
                    <FaCalendarAlt className="info-icon" />
                    <span>{personalInfoForm.dateOfBirth || "Not set"}</span>
                  </div>
                )}
              </div>
              <div className="info-field">
                <label>Gender</label>
                {isEditingPersonalInfo ? (
                  <select
                    value={personalInfoForm.gender}
                    onChange={(e) =>
                      setPersonalInfoForm({ ...personalInfoForm, gender: e.target.value })
                    }
                    className="info-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="info-display">
                    <FaUser className="info-icon" />
                    <span>{personalInfoForm.gender || "Not set"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="addresses-section">
            <div className="section-header">
              <h3>Saved Addresses</h3>
              <button
                className="btn-primary"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    label: "Home",
                    name: "",
                    phone: "",
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "India",
                    isDefault: false,
                  });
                  setShowAddressModal(true);
                }}
              >
                <FaPlus /> Add New Address
              </button>
            </div>
            <div className="addresses-list">
              {addresses.length === 0 ? (
                <p className="no-data">No addresses saved yet</p>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className="address-card">
                    <FaMapMarkerAlt className="address-icon" />
                    <div className="address-content">
                      <div className="address-header">
                        <h4>{address.label}</h4>
                        {address.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </div>
                      <p className="address-line">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="address-line">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                    <div className="address-actions">
                      <button
                        className="icon-button"
                        onClick={() => handleEditAddress(address)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => handleDeleteAddress(address._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Orders */}
          <div className="orders-section">
            <div className="section-header">
              <div>
                <FaBox className="section-icon" />
                <h3>My Orders</h3>
              </div>
              <Link to="/shop/orders" className="view-all-link">
                View All <FaChevronRight />
              </Link>
            </div>
            <div className="orders-list">
              {recentOrders.length === 0 ? (
                <p className="no-data">No orders yet</p>
              ) : (
                recentOrders.map((order) => {
                  const firstItem = order.items[0];
                  const imageUrl = firstItem?.image || 
                    firstItem?.product?.images?.[0] || 
                    (firstItem?.product ? getProductImage(firstItem.product) : null);
                  return (
                  <div key={order._id} className="order-item">
                    <img
                      src={imageUrl || "/placeholder.png"}
                      alt={firstItem?.name || "Order"}
                      className="order-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="order-info">
                      <h4>{order.items[0]?.name || "Order"}</h4>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>
                    <span
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Wishlist */}
          <div className="wishlist-section">
            <div className="section-header">
              <div>
                <FaHeart className="section-icon" />
                <h3>Wishlist</h3>
              </div>
              <Link to="/wishlist" className="view-all-link">
                View All <FaChevronRight />
              </Link>
            </div>
            <div className="wishlist-list">
              {wishlistItems.length === 0 ? (
                <p className="no-data">No items in wishlist</p>
              ) : (
                wishlistItems.map((item) => {
                  const imageUrl = getProductImage(item);
                  return (
                  <div key={item._id} className="wishlist-item">
                    <img
                      src={imageUrl || "/placeholder.png"}
                      alt={item.name}
                      className="wishlist-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="wishlist-info">
                      <h4>{item.name}</h4>
                      <p className="wishlist-price">${item.price?.toFixed(2)}</p>
                    </div>
                    <button className="btn-add-to-cart">Add to Cart</button>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          </div>

          {/* Right Sidebar - Security & Settings */}
          <div className="profile-sidebar-right">
            <div className="security-section">
              <div className="section-header">
                <h3>Security & Settings</h3>
              </div>
              <div className="settings-list">
                <div
                  className="settings-item"
                  onClick={() => navigate("/profile?tab=password")}
                >
                  <FaLock className="settings-item-icon purple" />
                  <div className="settings-item-content">
                    <h4>Change Password</h4>
                    <p>Update your password regularly for security</p>
                  </div>
                  <FaChevronRight className="settings-item-arrow" />
                </div>
                <div
                  className="settings-item"
                  onClick={() => navigate("/profile?tab=notifications")}
                >
                  <FaBell className="settings-item-icon blue" />
                  <div className="settings-item-content">
                    <h4>Manage Notifications</h4>
                    <p>Control your email and push notifications</p>
                  </div>
                  <FaChevronRight className="settings-item-arrow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingAddress ? "Edit Address" : "Add New Address"}</h2>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-group">
                <label>Label</label>
                <select
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  required
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, addressLine1: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, addressLine2: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={addressForm.postalCode}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, postalCode: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                  />
                  Set as default address
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingAddress ? "Update" : "Add"} Address
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;
