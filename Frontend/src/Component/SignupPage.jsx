import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!username) newErrors.username = "Please fill the required field";
    if (!email) newErrors.email = "Please fill the required field";
    if (!password) newErrors.password = "Please fill the required field";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "user", // default role for new users
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
        setErrors({});
      } else {
        setErrors({ form: data.error || "Failed to create account" });
      }
    } catch (error) {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white px-8 md:px-10 py-10">
      <h1 className="text-3xl font-bold mb-10">Customer Sign Up</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {/* LEFT – New Customer */}
        <div className="bg-[#f7f9ff] p-8 md:p-10 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2">New Customers</h2>
          <p className="text-gray-600 text-sm mb-6">
            If you don't have an account, Sign up with your email address.
          </p>

          <form onSubmit={handleSubmit}>
            {success && (
              <p className="text-green-600 text-sm mb-4">{success}</p>
            )}
            {errors.form && (
              <p className="text-red-500 text-sm mb-4">{errors.form}</p>
            )}

            {/* Username */}
            <div className="mb-5">
              <label className="text-sm font-semibold block text-left">
                Username *
              </label>
              <input
                type="text"
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="text-sm font-semibold block text-left">
                Email *
              </label>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6 relative">
              <label className="text-sm font-semibold block text-left">
                Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 p-3 pr-16 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              />
              {/* Show/Hide Password Button */}
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[45px] text-sm text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
          onClick={() => navigate("/login")} // redirect to Login.jsx
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
