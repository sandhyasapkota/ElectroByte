import React, { useState } from "react";
import { FaUser, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaStar, FaCamera, FaCheckCircle } from "react-icons/fa";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Account Dashboard");

  const menuItems = [
    { name: "Account Dashboard", icon: FaUser },
    { name: "Account Information", icon: FaUser },
    { name: "Address Book", icon: FaMapMarkerAlt },
    { name: "My Orders", icon: FaShoppingBag },
    { name: "My Downloadable Products", icon: FaShoppingBag },
    { name: "My Wish List", icon: FaHeart },
    { name: "My Product Reviews", icon: FaStar },
  ];

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
            My Dashboard
          </h1>

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
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                      <FaCamera className="text-3xl text-gray-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white text-gray-700 p-2 rounded-full shadow-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors">
                      <FaCamera className="text-sm" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      Contact Information
                    </h3>
                    <p className="text-sm text-gray-700">Alex Ochue</p>
                    <p className="text-sm text-gray-500 mb-3">Patrickchad@gmail.com</p>
                    <div className="space-x-3">
                      <button className="text-sm text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button className="text-sm text-blue-600 hover:underline">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Address Book */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      Address Book
                    </h3>
                    <button className="text-sm text-blue-600 hover:underline">
                      Manage Addresses
                    </button>
                  </div>

                  {/* Default Shipping Address */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Default Shipping Address
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      You have not set a default shipping address.
                    </p>
                    <button className="text-sm text-blue-600 hover:underline">
                      Edit Address
                    </button>
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

      <Footer />
    </>
  );
};

export default UserProfile;