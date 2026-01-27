import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes, FaLaptop, FaSpinner, FaCog } from "react-icons/fa";
import { productAPI } from "../services/api";
import { getToken, getUser, clearAuth } from "../lib/storage";
import logo from "../assets/Images/logo.png";
import { API_BASE_URL, API_ORIGIN } from "../lib/config";

// Helper to get profile image URL (handles both file URLs and base64)
const getProfileImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's a base64 string or external URL, return as is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // If it's a relative path, prepend the API base
  return `${API_ORIGIN}${imageUrl}`;
};

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  // Initialize isLoggedIn based on token existence
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      const token = getToken();
      if (token) fetchCartCount(token);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Listen for profile updates
    const handleProfileUpdate = () => fetchUserData();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Listen for logout events
    const handleLogout = () => {
      setUserData(null);
      setIsLoggedIn(false);
      setCartCount(0);
    };
    window.addEventListener('userLogout', handleLogout);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  const fetchUserData = async () => {
    const token = getToken();

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // Set logged in immediately if token exists
    setIsLoggedIn(true);

    try {
      const response = await fetch(`${API_BASE_URL}/init`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data.data);
        setIsLoggedIn(true);
        // Try to get cart count
        fetchCartCount(token);
      } else {
        // Only logout if token is actually invalid
        if (response.status === 401 || response.status === 403) {
          clearAuth();
          setIsLoggedIn(false);
          window.dispatchEvent(new Event("userLogout"));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Keep logged in state if there's a network error - don't logout user
      // They still have a token, server might just be temporarily unavailable
    }
  };

  const fetchCartCount = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.data?.items) {
        setCartCount(data.data.items.length);
      }
    } catch (error) {
      console.log("Could not fetch cart");
    }
  };

  // Search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await productAPI.search(query);
      const products = response.data || response;
      setSearchResults(Array.isArray(products) ? products.slice(0, 6) : []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_ORIGIN}${url}`;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate("/home")}
        >
          <img src={logo} alt="ElectroByte" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ElectroByte
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 md:gap-1 items-center absolute md:relative top-[65px] md:top-0 left-0 md:left-auto w-full md:w-auto p-5 md:p-0 bg-white md:bg-transparent border-b md:border-b-0 border-gray-200 shadow-lg md:shadow-none`}>
          {[
            { name: 'Products', path: '/products' },
            { name: 'Repairs', path: '/book-repair' },
            { name: 'Track Repair', path: '/track-repair' },
            { name: 'Orders', path: '/orders' },
            { name: 'Support', path: '/support' },
            { name: 'FAQ', path: '/faq' },
            { name: 'Contact', path: '/contact' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all w-full md:w-auto text-left md:text-center"
            >
              {item.name}
            </button>
          ))}
          <button 
            className="ml-2 py-2.5 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full cursor-pointer text-sm font-semibold hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
            onClick={() => { navigate("/book-repair"); setMenuOpen(false); }}
          >
            Book Appointment
          </button>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Admin Dashboard Button - Only for admins */}
          {isLoggedIn && userData?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
              title="Admin Panel"
            >
              <FaCog className="text-purple-600" />
            </button>
          )}
          
          <div className="flex items-center gap-1">
            {/* Search */}
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setShowSearch(true)}
            >
              <FaSearch className="text-gray-600 hover:text-blue-600 transition" />
            </button>
            
            {/* Cart with count badge */}
            <button 
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
              onClick={() => navigate("/cart")}
            >
              <FaShoppingCart className="text-gray-600 hover:text-blue-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          
          {/* User Profile Picture or Icon */}
          {isLoggedIn ? (
            <button 
              className="cursor-pointer" 
              onClick={() => navigate("/profile")}
            >
              {userData?.profileImage ? (
                <img
                  src={getProfileImageUrl(userData.profileImage)}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition ring-2 ring-gray-200 hover:ring-blue-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 hover:ring-blue-200 transition shadow-md">
                  <span className="text-white text-sm font-bold">
                    {userData?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </button>
          ) : (
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => navigate("/login")} 
            >
              <FaUser className="text-gray-600 hover:text-blue-600 transition" />
            </button>
          )}

          {/* Mobile Menu Icon */}
          <button 
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm" onClick={() => setShowSearch(false)}>
          <div 
            className="absolute top-0 left-0 right-0 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto px-4 py-6">
              <form onSubmit={handleSearchSubmit} className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </form>

              {/* Search Results */}
              {searching && (
                <div className="mt-4 text-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto" />
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Products</h3>
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition text-left"
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img 
                              src={getImageUrl(product.image_url)} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.Category?.name || 'Product'}</p>
                        </div>
                        <div className="text-blue-600 font-bold">
                          NPR {Number(product.price).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {searchQuery && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  )}
                </div>
              )}

              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="mt-4 text-center py-8 text-gray-500">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Navbar spacer to prevent content from hiding under fixed navbar
export const NavbarSpacer = () => <div className="h-16"></div>;

export default Navbar;
