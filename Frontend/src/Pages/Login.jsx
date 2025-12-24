import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Login success", formData);
      // Navigate to home page after successful login
      navigate("/home");
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
            
            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold block text-left">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
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
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
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
              >
                Forgot Your Password?
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
            >
              Sign In
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
