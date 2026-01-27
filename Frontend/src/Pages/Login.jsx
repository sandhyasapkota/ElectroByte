import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import { useToast } from "../Component/Toast";
import { loginSchema } from "../validations";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import logo from "../assets/Images/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification(getValues("email"));
      setResendSuccess("Verification email sent! Please check your inbox.");
    } catch (error) {
      setApiError(error.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    setNeedsVerification(false);
    setResendSuccess("");

    try {
      const user = await login(data.email, data.password, rememberMe);
      
      toast.success(`Welcome back, ${user?.username || "User"}!`);

      // Navigate based on user role
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "technician") {
        navigate("/technician");
      } else {
        navigate("/home");
      }
    } catch (error) {
      if (error.message?.includes("verify your email")) {
        setNeedsVerification(true);
        setApiError("Please verify your email before logging in");
      } else {
        setApiError(error.message || "Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-100">
              <img src={logo} alt="ElectroByte logo" className="w-16 h-16 rounded-xl object-cover" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              ElectroByte
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Your trusted partner for laptops, repairs & tech solutions
            </p>
            
            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💻</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Wide Selection</h3>
                  <p className="text-sm text-gray-500">Premium laptops from top brands</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Expert Repairs</h3>
                  <p className="text-sm text-gray-500">Professional technicians at your service</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🚚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Fast Delivery</h3>
                  <p className="text-sm text-gray-500">Quick & reliable shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-white/90 border border-gray-100 flex items-center justify-center mx-auto mb-3 shadow">
                <img src={logo} alt="ElectroByte logo" className="w-10 h-10 rounded-lg object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">ElectroByte</h1>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
            <p className="text-gray-500 mb-6">Sign in to continue to your account</p>

            {/* Success Message */}
            {resendSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
                {resendSuccess}
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  {apiError}
                </div>
                {needsVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-12 py-3 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Create Account */}
            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create one
              </Link>
            </p>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-800">Admin: admin@electrobyte.com / admin123</p>
              <p className="text-xs text-blue-800">User: user@test.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
