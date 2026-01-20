import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheck, FaHeadset, FaClock, FaFacebook, FaTwitter, FaInstagram, FaArrowLeft, FaHome, FaTicketAlt } from "react-icons/fa";
import { ticketAPI } from "../services/api";
import { useToast } from "../Component/Toast";


const Contact = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await ticketAPI.contact(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent successfully! We'll get back to you soon.");
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <FaHeadset className="text-4xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Have questions, feedback, or business inquiries? We'd love to hear from you!
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <FaHome className="text-xs" /> Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">Contact</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                Contact Information
              </h2>
              
              <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Phone</h3>
                  <p className="text-gray-600">+977 98XXXXXXXX</p>
                  <p className="text-sm text-gray-500">Mon-Fri 10AM-6PM</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">support@electrobyte.com</p>
                  <p className="text-sm text-gray-500">24/7 Support</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Address</h3>
                  <p className="text-gray-600">Kathmandu, Nepal</p>
                  <p className="text-sm text-gray-500">Visit our store</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-purple-600" />
                Business Hours
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sunday - Friday</span>
                  <span className="font-medium text-gray-800">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-red-500">Closed</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                  <FaFacebook />
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaCheck className="text-4xl text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">Message Sent!</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-medium transition-colors"
                  >
                    <FaPaperPlane />
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Send us a Message</h2>
                    <p className="text-gray-600">Have a general inquiry, feedback, or partnership proposal? Fill out the form below.</p>
                  </div>

                  {/* Note for existing customers */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <FaTicketAlt className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 font-medium">Already a customer?</p>
                        <p className="text-blue-700 text-sm">
                          For order issues, returns, or technical support with tracking, please use our{" "}
                          <Link to="/support" className="underline font-medium hover:text-blue-900">
                            Support Center
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map Section Placeholder */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl h-64 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-5xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Visit Our Store</h3>
              <p className="text-gray-600">Kathmandu, Nepal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
