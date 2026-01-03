import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes, FaLaptop } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  // Initialize isLoggedIn based on token existence
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

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
      const token = localStorage.getItem("access_token");
      if (token) fetchCartCount(token);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Listen for profile updates
    const handleProfileUpdate = () => fetchUserData();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // Set logged in immediately if token exists
    setIsLoggedIn(true);

    try {
      const response = await fetch("http://localhost:5000/api/init", {
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
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
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
      const response = await fetch("http://localhost:5000/api/cart", {
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => navigate("/home")}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <FaLaptop className="text-white text-xl" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ElectroByte
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 md:gap-1 items-center absolute md:relative top-[65px] md:top-0 left-0 md:left-auto w-full md:w-auto p-5 md:p-0 bg-white md:bg-transparent border-b md:border-b-0 border-gray-200 shadow-lg md:shadow-none`}>
          {[
            { name: 'Products', path: '/products' },
            { name: 'Repairs', path: '/book-repair' },
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
        <div className="flex items-center gap-4">
          {/* Search */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
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
          
          {/* User Profile Picture or Icon */}
          {isLoggedIn ? (
            <button 
              className="cursor-pointer" 
              onClick={() => navigate("/profile")}
            >
              {userData?.profileImage ? (
                <img
                  src={userData.profileImage}
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
    </header>
  );
};

// Navbar spacer to prevent content from hiding under fixed navbar
export const NavbarSpacer = () => <div className="h-16"></div>;

export default Navbar;