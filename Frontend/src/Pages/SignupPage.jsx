import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = "Please fill the required field";
    if (!formData.email) newErrors.email = "Please fill the required field";
    if (!formData.password) newErrors.password = "Please fill the required field";
    
    // Additional validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (validate()) {
      setLoading(true);

      try {
        const response = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: "user", // Default role
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Signup successful", data);
          
          // Show success message or navigate to login
          alert("Account created successfully! Please login.");
          navigate("/login");
        } else {
          // Handle error responses
          setApiError(data.error || data.message || "Signup failed. Please try again.");
        }
      } catch (error) {
        console.error("Signup error:", error);
        setApiError("Unable to connect to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white px-8 md:px-10 py-10">
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-10">Customer Sign Up</h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

        {/* LEFT – New Customer */}
        <div className="bg-[#f7f9ff] p-8 md:p-10 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2">New Customers</h2>
          <p className="text-gray-600 text-sm mb-6">
            If you don't have an account, Sign up with your email address.
          </p>

          <form onSubmit={handleSubmit}>
            
            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            {/* Username */}
            <div className="mb-5">
              <label className="text-sm font-semibold block text-left">Username *</label>
              <input
                type="text"
                name="username"
                placeholder="Your Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold block text-left">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="text-sm font-semibold block text-left">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Your Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* RIGHT – Existing Customer */}
        <div className="bg-[#f7f9ff] p-8 md:p-10 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2">Existing Customer?</h2>
          <p className="text-gray-600 text-sm mb-6">
            Login to an account has many benefits:
          </p>

          <ul className="text-gray-600 text-sm list-disc pl-5 space-y-2 mb-8 text-left">
            <li>Checkout faster</li>
            <li>Keep more than one address</li>
            <li>Track orders and more</li>
          </ul>

          <button 
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
