import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from "react-icons/fa";
import logo from "../assets/Images/logo.png";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);


  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendMessage("Please enter your email address");
      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const response = await authAPI.resendVerification(resendEmail);
      setResendMessage(response.message || "Verification email sent! Check your inbox.");
      setResendEmail("");
    } catch (error) {
      setResendMessage(error.message || "Failed to send verification email.");
    } finally {
      setResending(false);
    }
  };

  const verifyEmail = async () => {
    try {
      console.log("Verifying email with token:", token);
      const response = await authAPI.verifyEmail(token);
      console.log("Verification response:", response);
      setStatus("success");
      setMessage(response.message || "Email verified successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Verification error:", error);
      
      // Check if it's a network error vs actual verification error
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("Network error") || errorMessage.includes("fetch")) {
        setStatus("error");
        setMessage("Unable to connect to server. Please check your internet connection and try again.");
      } else if (errorMessage.includes("expired")) {
        setStatus("error");
        setMessage("Verification link has expired. Please request a new verification email.");
      } else {
        setStatus("error");
        setMessage(errorMessage || "Failed to verify email. Please try again or request a new verification link.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {/* Logo */}
          <div className="mx-auto mb-6">
            <img src={logo} alt="ElectroByte" className="w-20 h-20 rounded-full object-cover mx-auto" />
          </div>

          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6">
                <FaSpinner className="w-full h-full text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-500">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-500 mb-6">{message}</p>
              <p className="text-sm text-gray-400 mb-4">
                Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="inline-block py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <FaTimesCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-500 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/verify-email"
                  className="inline-block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Resend Verification Email
                </Link>
                <Link
                  to="/login"
                  className="inline-block w-full py-3 px-6 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
