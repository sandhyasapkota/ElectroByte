import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaStar, FaCamera, FaCheckCircle, FaTimes } from "react-icons/fa";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Account Dashboard");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Form states
  const [editFormData, setEditFormData] = useState({ username: "", email: "", address: "" });
  const [passwordFormData, setPasswordFormData] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const menuItems = [
    { name: "Account Dashboard", icon: FaUser },
    { name: "Account Information", icon: FaUser },
    { name: "Address Book", icon: FaMapMarkerAlt },
    { name: "My Orders", icon: FaShoppingBag },
    { name: "My Downloadable Products", icon: FaShoppingBag },
    { name: "My Wish List", icon: FaHeart },
    { name: "My Product Reviews", icon: FaStar },
  ];

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/init", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.data);
        setEditFormData({ 
          username: data.data.username, 
          email: data.data.email,
          address: data.data.address || "" 
        });
        setLoading(false);
      } else {
        setError(data.message || "Failed to fetch user data");
        setLoading(false);
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // Edit Profile Handler
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

    // Validation
    const errors = {};
    if (!editFormData.username) errors.username = "Username is required";
    if (!editFormData.email) errors.email = "Email is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    const token = localStorage.getItem("access_token");
 
    try {
      const response = await fetch(`http://localhost:5000/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editFormData.username,
          email: editFormData.email,
          address: editFormData.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData({ 
          ...userData, 
          username: editFormData.username, 
          email: editFormData.email,
          address: editFormData.address 
        });
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          setSuccessMessage("");
        }, 2000);
      } else {
        setFormErrors({ api: data.error || data.message || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormErrors({ api: "Unable to connect to server" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

    // Validation
    const errors = {};
    if (!passwordFormData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordFormData.newPassword) errors.newPassword = "New password is required";
    if (passwordFormData.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    if (!passwordFormData.confirmPassword) errors.confirmPassword = "Please confirm password";
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:5000/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,  // Send current password for verification
          password: passwordFormData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password changed successfully!");
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccessMessage("");
          setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }, 2000);
      } else {
        // Show specific error message from backend
        setFormErrors({ api: data.error || data.details || "Failed to change password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setFormErrors({ api: "Unable to connect to server" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Image upload handler - UPDATE THIS
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    setUploadingImage(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      
      const token = localStorage.getItem("access_token");
      
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileImage: base64String,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setUserData({ ...userData, profileImage: base64String });
          
          // Trigger navbar refresh
          window.dispatchEvent(new Event('profileUpdated'));
          
          alert("Profile image updated successfully!");
        } else {
          alert(data.error || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error && !userData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto text-xs sm:text-sm text-gray-600">
            <span>Home</span> / <span className="text-gray-900 font-medium">My Dashboard</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              My Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar Menu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 text-xs sm:text-sm transition-all ${
                        activeTab === item.name
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="text-sm flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              {/* Account Information Card */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
                  Account Information
                </h2>

                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6 pb-6 border-b">
                  {/* Profile Picture */}
                  <div className="relative mx-auto sm:mx-0">
                    {userData?.profileImage || imagePreview ? (
                      <img
                        src={imagePreview || userData.profileImage}
                        alt="Profile"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-300"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-300">
                        <span className="text-white text-3xl font-bold">
                          {userData?.username?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    
                    <label 
                      htmlFor="profile-image-upload" 
                      className="absolute bottom-0 right-0 bg-white text-gray-700 p-2 rounded-full shadow-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {uploadingImage ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <FaCamera className="text-sm" />
                      )}
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      Contact Information
                    </h3>
                    <p className="text-sm text-gray-700 font-medium">
                      {userData?.username || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      {userData?.email || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Role: {userData?.role || "user"}
                    </p>
                    <div className="space-x-3">
                      <button 
                        onClick={handleEditProfile}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={handleChangePassword}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Address Book */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      My Address
                    </h3>
                    <button 
                      onClick={handleEditProfile}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Edit Address
                    </button>
                  </div>

                  <div>
                    <p className="text-sm text-gray-700">
                      {userData?.address || "No address set yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* My Wish List Card */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  My Wish List
                </h2>
                <p className="text-sm text-gray-600 text-center py-8">
                  You have no items in your wish list.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Product Support */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-2xl text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Product Support
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Up to 3 years on-site warranty available for most products.
                  </p>
                </div>

                {/* Personal Account */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="text-2xl text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Personal Account
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    With big discounts, free delivery and a dedicated support specialist.
                  </p>
                </div>

                {/* Amazing Savings */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-2xl text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Amazing Savings
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Up to 70% off new Products, you can be sure of the best price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {formErrors.api && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {formErrors.api}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                {formErrors.username && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  placeholder="e.g., Tarakeshwor 5, Kathmandu"
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {submitLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {formErrors.api && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {formErrors.api}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                {formErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.currentPassword}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                {formErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.newPassword}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {submitLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Manage Addresses</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-gray-600 text-center py-8">
              Address management feature coming soon!
            </p>
            <button
              onClick={() => setShowAddressModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserProfile;