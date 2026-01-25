import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaDiscord, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import logo from "../assets/Images/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Stay Updated with ElectroByte</h2>
              <p className="text-blue-100">Be the first to hear about the latest offers and new arrivals.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 md:w-80 px-5 py-3 rounded-l-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-r-full hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="ElectroByte" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-xl font-bold">ElectroByte</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your trusted destination for premium laptops, desktops, and professional repair services. Quality tech, exceptional service.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaDiscord].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  <Icon className="text-gray-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/products", label: "All Products" },
                { to: "/book-repair", label: "Book Repair" },
                { to: "/orders", label: "My Orders" },
                { to: "/faq", label: "FAQ" },
                { to: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-white hover:pl-2 transition-all text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              Account
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/login", label: "Login" },
                { to: "/signup", label: "Register" },
                { to: "/profile", label: "My Profile" },
                { to: "/cart", label: "Shopping Cart" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-white hover:pl-2 transition-all text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="text-blue-400 text-sm" />
                </div>
                <span className="text-gray-400 text-sm">Newroad, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaPhone className="text-blue-400 text-sm" />
                </div>
                <span className="text-gray-400 text-sm">+977 9705439512</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaEnvelope className="text-blue-400 text-sm" />
                </div>
                <span className="text-gray-400 text-sm">support@electrobyte.com</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
              <p className="text-sm text-gray-300 font-medium mb-2">Business Hours</p>
              <p className="text-xs text-gray-400">Mon-Fri: 9:00 AM - 6:00 PM</p>
              <p className="text-xs text-gray-400">Sat: 11:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ElectroByte. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/faq" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
