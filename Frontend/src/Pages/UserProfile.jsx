import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaCamera,
  FaTimes,
  FaSignOutAlt,
  FaEdit,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaBell,
  FaShieldAlt,
  FaGift,
  FaHeadset,
  FaChevronRight,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaBox,
  FaTruck,
  FaClipboardList,
  FaSpinner,
  FaTrash,
  FaArrowLeft,
  FaHome,
} from "react-icons/fa";
import { feedbackAPI, userAPI, wishlistAPI, cartAPI, orderAPI } from "../services/api";
import { useToast } from "../Component/Toast";
import { useAuth } from "../contexts/AuthContext";
import { getToken, clearAuth } from "../lib/storage";
import { API_BASE_URL, API_ORIGIN } from "../lib/config";

const UserProfile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Image upload states
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Reviews states
  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);

  // Wishlist states
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [removingFromWishlist, setRemovingFromWishlist] = useState(null);
  const [addingToCartFromWishlist, setAddingToCartFromWishlist] = useState(null);

  // Orders states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const sidebarItems = [
    { id: "overview", name: "Overview", icon: FaUser },
    { id: "orders", name: "My Orders", icon: FaShoppingBag },
    { id: "wishlist", name: "Wishlist", icon: FaHeart },
    { id: "addresses", name: "Addresses", icon: FaMapMarkerAlt },
    { id: "reviews", name: "My Reviews", icon: FaStar },
    { id: "security", name: "Security", icon: FaShieldAlt },
  ];

  const quickActions = [
    {
      icon: FaBox,
      title: "Track Order",
      description: "View your order status",
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/orders"),
    },
    {
      icon: FaTruck,
      title: "Delivery Info",
      description: "Manage delivery preferences",
      color: "from-green-500 to-green-600",
      action: () => setActiveTab("addresses"),
    },
    {
      icon: FaHeadset,
      title: "Get Support",
      description: "24/7 customer service",
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/contact"),
    },
    {
      icon: FaGift,
      title: "Rewards",
      description: "View your rewards points",
      color: "from-orange-500 to-orange-600",
      action: () => {},
    },
  ];

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch reviews, wishlist, and orders when tab changes
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchMyReviews();
    }
    if (activeTab === "wishlist") {
      fetchWishlist();
    }
    if (activeTab === "orders") {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/init`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("API Response:", response.status, data);

      if (response.ok && data.data) {
        setUserData(data.data);
        setEditFormData({
          username: data.data.username || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
        });
        setLoading(false);
      } else {
        // Only redirect to login if token is actually invalid
        if (response.status === 401 || response.status === 403) {
          clearAuth();
          window.dispatchEvent(new Event("userLogout"));
          navigate("/login");
        } else {
          console.error("API Error:", data.error || data.message);
          setError(data.error || data.message || "Failed to fetch user data");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Network/Fetch Error:", error);
      // Network error - show error but don't redirect (server might be down)
      setError("Unable to connect to server. Please try again later.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch user's orders
  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getMyOrders();
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Fetch user's reviews
  const fetchMyReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await feedbackAPI.getMyReviews();
      if (response.data) {
        setMyReviews(response.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    setDeletingReview(reviewId);
    try {
      await feedbackAPI.deleteReview(reviewId);
      setMyReviews(myReviews.filter(r => r.id !== reviewId));
      toast.success("Review deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete review");
    } finally {
      setDeletingReview(null);
    }
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const response = await wishlistAPI.get();
      if (response.data) {
        setWishlist(response.data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    setRemovingFromWishlist(productId);
    try {
      await wishlistAPI.remove(productId);
      setWishlist(wishlist.filter(item => item.productId !== productId));
      toast.success("Removed from wishlist!");
    } catch (error) {
      toast.error(error.message || "Failed to remove from wishlist");
    } finally {
      setRemovingFromWishlist(null);
    }
  };

  // Add to cart from wishlist
  const handleAddToCartFromWishlist = async (productId) => {
    setAddingToCartFromWishlist(productId);
    try {
      await cartAPI.add(productId, 1);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCartFromWishlist(null);
    }
  };

  // Edit Profile Handlers
  const handleEditProfile = () => {
    setShowEditModal(true);
    setFormErrors({});
    setSuccessMessage("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage("");

    const errors = {};
    if (!editFormData.username.trim()) errors.username = "Username is required";
    if (!editFormData.email.trim()) errors.email = "Email is required";
    if (editFormData.email && !/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editFormData.username,
          email: editFormData.email,
          phone: editFormData.phone,
          address: editFormData.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData({
          ...userData,
          username: editFormData.username,
          email: editFormData.email,
          phone: editFormData.phone,
          address: editFormData.address,
        });
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMessage("");
        }, 1500);
      } else {
        setFormErrors({
          api: data.error || data.message || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormErrors({ api: "Unable to connect to server" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Password Change Handlers
  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setSuccessMessage("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData({ ...passwordFormData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage("");

    const errors = {};
    if (!passwordFormData.currentPassword)
      errors.currentPassword = "Current password is required";
    if (!passwordFormData.newPassword)
      errors.newPassword = "New password is required";
    if (passwordFormData.newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";
    if (!passwordFormData.confirmPassword)
      errors.confirmPassword = "Please confirm password";
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          password: passwordFormData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password changed successfully!");
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccessMessage("");
          setPasswordFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }, 1500);
      } else {
        setFormErrors({
          api: data.error || data.details || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setFormErrors({ api: "Unable to connect to server" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingImage(true);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await userAPI.uploadProfileImage(formData);
      
      if (response.data?.profileImage) {
        setUserData({ ...userData, profileImage: response.data.profileImage });
        window.dispatchEvent(new Event("profileUpdated"));
        toast.success("Profile image updated!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
            <FaUser className="absolute inset-0 m-auto text-2xl text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimes className="text-3xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to get profile image URL (handles both file URLs and base64)
  const getProfileImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's a base64 string or external URL, return as is
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If it's a relative path, prepend the API base
    return `${API_ORIGIN}${imageUrl}`;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Profile Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white p-1.5 shadow-2xl">
                {userData?.profileImage || imagePreview ? (
                  <img
                    src={imagePreview || getProfileImageUrl(userData.profileImage)}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-4xl lg:text-5xl font-bold">
                      {getInitials(userData?.username)}
                    </span>
                  </div>
                )}
              </div>

              {/* Camera Button */}
              <label
                htmlFor="profile-upload"
                className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group-hover:bg-blue-50"
              >
                {uploadingImage ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCamera className="text-blue-600" />
                )}
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left text-white">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {userData?.username || "User"}
              </h1>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-blue-100">
                <span className="flex items-center gap-2">
                  <FaEnvelope className="text-sm" />
                  {userData?.email}
                </span>
                {userData?.phone && (
                  <span className="flex items-center gap-2">
                    <FaPhone className="text-sm" />
                    {userData.phone}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {userData?.role === "admin" ? "Administrator" : userData?.role === "technician" ? "Technician" : "Member"}
                </span>
                {userData?.isEmailVerified ? (
                  <span className="px-4 py-1.5 bg-green-400/20 backdrop-blur-sm rounded-full text-sm font-medium text-green-100">
                    <FaCheck className="inline mr-1.5" />
                    Email Verified
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-yellow-400/20 backdrop-blur-sm rounded-full text-sm font-medium text-yellow-100">
                    Email Not Verified
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEditProfile}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FaEdit />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <FaHome className="text-xs" /> Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">My Profile</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      className={`text-lg ${
                        activeTab === item.id ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                    {activeTab === item.id && (
                      <FaChevronRight className="ml-auto text-sm" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t p-4">
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <FaLock className="text-gray-400" />
                  <span className="font-medium">Change Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all group text-left"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="text-white text-xl" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Account Details Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                      Account Details
                    </h2>
                    <button
                      onClick={handleEditProfile}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <FaEdit className="text-sm" />
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900 font-medium">
                          {userData?.username || "Not set"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">
                          Email Address
                        </label>
                        <p className="text-gray-900 font-medium">
                          {userData?.email || "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-900 font-medium">
                          {userData?.phone || "Not set"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">
                          Account Type
                        </label>
                        <p className="text-gray-900 font-medium capitalize">
                          {userData?.role || "User"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                      Default Address
                    </h2>
                    <button
                      onClick={handleEditProfile}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <FaEdit className="text-sm" />
                      Edit
                    </button>
                  </div>

                  {userData?.address ? (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Home Address
                        </p>
                        <p className="text-gray-600 mt-1">{userData.address}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaMapMarkerAlt className="text-2xl text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">
                        No address added yet
                      </p>
                      <button
                        onClick={handleEditProfile}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        + Add Address
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                    Account Activity
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaCheck className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Account Created
                        </p>
                        <p className="text-sm text-gray-500">
                          Your account is active and verified
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaBell className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Notifications Enabled
                        </p>
                        <p className="text-sm text-gray-500">
                          You'll receive updates about orders and offers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                    My Orders
                    {orders.length > 0 && (
                      <span className="text-sm font-normal text-gray-500">({orders.length} orders)</span>
                    )}
                  </h2>
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All <FaChevronRight className="text-xs" />
                  </button>
                </div>
                
                {loadingOrders ? (
                  <div className="flex justify-center py-12">
                    <FaSpinner className="animate-spin text-3xl text-blue-600" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaClipboardList className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <button
                      onClick={() => navigate("/products")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div 
                        key={order.id} 
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate("/orders")}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">Order #{order.orderId || order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {order.OrderItems?.length || 0} item(s)
                          </span>
                          <p className="font-semibold text-blue-600">
                            NPR {parseFloat(order.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        {order.OrderItems && order.OrderItems.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="space-y-2">
                              {order.OrderItems.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 truncate flex-1">
                                    {item.productName || item.Product?.name} x {item.quantity}
                                  </span>
                                  <span className="text-gray-800 font-medium ml-2">
                                    NPR {parseFloat(item.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              {order.OrderItems.length > 3 && (
                                <p className="text-xs text-gray-400">
                                  +{order.OrderItems.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {orders.length > 5 && (
                      <button
                        onClick={() => navigate("/orders")}
                        className="w-full py-3 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors"
                      >
                        View All {orders.length} Orders
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></span>
                  My Wishlist
                  {wishlist.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">({wishlist.length} items)</span>
                  )}
                </h2>
                
                {loadingWishlist ? (
                  <div className="flex justify-center py-12">
                    <FaSpinner className="animate-spin text-3xl text-blue-600" />
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaHeart className="text-3xl text-red-300" />
                    </div>
                    <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                    <button
                      onClick={() => navigate("/products")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => {
                      const product = item.Product;
                      const primaryImage = product?.images?.find(img => img.isPrimary) || product?.images?.[0];
                      const imageUrl = primaryImage?.imageUrl 
                        ? (primaryImage.imageUrl.startsWith('http') ? primaryImage.imageUrl : `${API_ORIGIN}${primaryImage.imageUrl}`)
                        : 'https://via.placeholder.com/200';
                      
                      return (
                        <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all group">
                          <div className="relative">
                            <img
                              src={imageUrl}
                              alt={product?.name}
                              className="w-full h-40 object-cover rounded-lg mb-3 cursor-pointer"
                              onClick={() => navigate(`/product/${product?.id}`)}
                            />
                            <button
                              onClick={() => handleRemoveFromWishlist(item.productId)}
                              disabled={removingFromWishlist === item.productId}
                              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                            >
                              {removingFromWishlist === item.productId ? (
                                <FaSpinner className="animate-spin text-sm" />
                              ) : (
                                <FaHeart className="text-sm" />
                              )}
                            </button>
                          </div>
                          
                          <h3 
                            className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 line-clamp-2"
                            onClick={() => navigate(`/product/${product?.id}`)}
                          >
                            {product?.name}
                          </h3>
                          
                          <p className="text-sm text-gray-500 mb-2">
                            {product?.Brand?.name || 'Unknown Brand'}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-blue-600">
                              NPR {product?.price?.toLocaleString()}
                            </span>
                            {product?.stock_quantity > 0 ? (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">In Stock</span>
                            ) : (
                              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Out of Stock</span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleAddToCartFromWishlist(product?.id)}
                            disabled={addingToCartFromWishlist === product?.id || !product?.stock_quantity}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {addingToCartFromWishlist === product?.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaShoppingBag className="text-sm" />
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                    Saved Addresses
                  </h2>
                  <button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>+</span> Add Address
                  </button>
                </div>

                {userData?.address ? (
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FaMapMarkerAlt className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">Home</p>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                              Default
                            </span>
                          </div>
                          <p className="text-gray-600">{userData.address}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleEditProfile}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaMapMarkerAlt className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">
                      No addresses saved yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                  My Reviews ({myReviews.length})
                </h2>
                
                {loadingReviews ? (
                  <div className="text-center py-12">
                    <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading your reviews...</p>
                  </div>
                ) : myReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaStar className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">
                      You haven't written any reviews yet
                    </p>
                    <button
                      onClick={() => navigate("/products")}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Browse products to review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          <div 
                            className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => review.product && navigate(`/product/${review.product.id}`)}
                          >
                            {review.product?.image_url ? (
                              <img 
                                src={review.product.image_url.startsWith('http') ? review.product.image_url : `${API_ORIGIN}${review.product.image_url}`}
                                alt={review.product?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaBox className="text-gray-400 text-xl" />
                              </div>
                            )}
                          </div>
                          
                          {/* Review Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 
                                  className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate"
                                  onClick={() => review.product && navigate(`/product/${review.product.id}`)}
                                >
                                  {review.product?.name || `${review.type} Review`}
                                </h3>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                      key={i} 
                                      className={`text-sm ${
                                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                                      }`} 
                                    />
                                  ))}
                                  <span className="text-sm text-gray-500 ml-2">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                              
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={deletingReview === review.id}
                                className="text-gray-400 hover:text-red-500 transition p-2"
                                title="Delete review"
                              >
                                {deletingReview === review.id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaTrash />
                                )}
                              </button>
                            </div>
                            
                            {review.comment && (
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {review.comment}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-400 mt-2">
                              Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaLock className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">
                          Last changed: Never
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaShieldAlt className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Account Status
                        </p>
                        <p className="text-sm text-gray-500">
                          Your account is secure
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <FaCheck className="text-green-600" />
                  <span className="text-green-700 font-medium">
                    {successMessage}
                  </span>
                </div>
              )}

              {formErrors.api && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <FaTimes className="text-red-600" />
                  <span className="text-red-700">{formErrors.api}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      formErrors.username ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      formErrors.email ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditChange}
                    rows="3"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <FaCheck className="text-green-600" />
                  <span className="text-green-700 font-medium">
                    {successMessage}
                  </span>
                </div>
              )}

              {formErrors.api && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <FaTimes className="text-red-600" />
                  <span className="text-red-700">{formErrors.api}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      formErrors.currentPassword
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      formErrors.newPassword
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      formErrors.confirmPassword
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
