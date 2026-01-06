import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    if (validate()) {
      setLoading(true);
      
      try {
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store the token in localStorage
          localStorage.setItem("access_token", data.data.access_token);
          
          console.log("Login success", data);
          
          // Navigate to home page after successful login
          navigate("/home");
        } else {
          // Handle error responses
          setApiError(data.message || "Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        setApiError("Unable to connect to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white px-8 md:px-10 py-10">
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-10">Customer Login</h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

        {/* LEFT – Registered Customers */}
        <div className="bg-[#f7f9ff] p-8 md:p-10 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2">Registered Customers</h2>
          <p className="text-gray-600 text-sm mb-6">
            If you have an account, log in with your email address.
          </p>

          <form onSubmit={handleSubmit}>
            
            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {apiError}
              </div>
            )}

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
            <div className="mb-4">
              <label className="text-sm font-semibold block text-left">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Your Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="mb-6 text-left">
              <button 
                type="button"
                className="text-blue-600 text-sm hover:underline"
                disabled={loading}
              >
                Forgot Your Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* RIGHT – New Customer */}
        <div className="bg-[#f7f9ff] p-8 md:p-10 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2">New Customer?</h2>
          <p className="text-gray-600 text-sm mb-6">
            Creating an account has many benefits:
          </p>

          <ul className="text-gray-600 text-sm list-disc pl-5 space-y-2 mb-8 text-left">
            <li>Check out faster</li>
            <li>Keep more than one address</li>
            <li>Track orders and more</li>
          </ul>

          <button 
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
          >
            Create An Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
