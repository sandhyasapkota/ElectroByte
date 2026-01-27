import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI, wishlistAPI } from '../services/api';
import { useToast } from '../Component/Toast';
import { getToken } from '../lib/storage';
import { FaHeart, FaRegHeart, FaSpinner, FaLaptop, FaTools, FaShieldAlt, FaTruck, FaHeadset, FaStar, FaArrowRight, FaPlay, FaQuestionCircle, FaUserShield, FaTags } from 'react-icons/fa';
import { API_ORIGIN } from '../lib/config';
import { fetchRatingsForProducts, getRatingData } from '../lib/ratings';
// import laptopImg from '../assets/Images/laptop.png';
import legionImg from '../assets/Images/legion.png';

// --- Brand logos ---
import brandMsi from '../assets/images/brandMsi.png';
import brandRazer from '../assets/images/brandRazer.png';
import brandGigabyte from '../assets/images/brandGigabyte.png';
import brandRog from '../assets/images/brandRog.png';
import legion from '../assets/images/brandLegion.png';
import acer from '../assets/images/brandAcer.png';

// --- Static page data ---
const brands = [brandMsi, brandRazer, brandGigabyte, brandRog, legion, acer];

const testimonials = [
  { quote: "My first order arrived today, in perfect condition. From the time I sent in a question about the item to making the purchase to the shipping and now the delivery, your company has stayed in touch. Such great service, I look forward to shopping on your site in the future and would highly recommend it.", author: "- Happy Buyer" },
  { quote: "Absolutely fantastic service and the PC is a beast! It runs everything I throw at it flawlessly. The team was super helpful.", author: "- Thrilled Gamer" },
  { quote: "The delivery was faster than expected and the packaging was top-notch. Everything was secure. Highly professional.", author: "- Satisfied Customer" },
];

const features = [
  { icon: <FaQuestionCircle />, title: 'Product Support', description: 'Up to 3 years on-site warranty available for your peace of mind.' },
  { icon: <FaUserShield />, title: 'Personal Account', description: 'With big discounts, free delivery and a dedicated support specialist.' },
  { icon: <FaTags />, title: 'Amazing Savings', description: 'Up to 70% off new products, you can be sure of the best price.' },
];

// Helper to get image URL
const getImageUrl = (url) => {
  if (!url || url === 'null' || url === 'undefined') return null;
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
};

// --- Reusable Components ---
const ProductCard = ({ id, image, name, price, oldPrice, rating, reviews, onAddToCart, isInWishlist, onToggleWishlist, togglingWishlist }) => {
  const ratingValue = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const reviewCount = Number.isFinite(Number(reviews)) ? Number(reviews) : 0;

  return (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0 w-64 shadow-sm hover:shadow-lg transition-all duration-300 group relative">
    {/* Wishlist Heart Button */}
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist && onToggleWishlist(id); }}
      disabled={togglingWishlist === id}
      className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all ${
        isInWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
      } ${isInWishlist ? 'opacity-100' : ''}`}
    >
      {togglingWishlist === id ? (
        <FaSpinner className="w-4 h-4 animate-spin" />
      ) : isInWishlist ? (
        <FaHeart className="w-4 h-4" />
      ) : (
        <FaRegHeart className="w-4 h-4" />
      )}
    </button>
    
    <Link to={`/product/${id}`} className="block">
      <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-40 object-contain group-hover:scale-105 transition-transform duration-300" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-40 flex flex-col items-center justify-center text-gray-400 ${image ? 'hidden' : 'flex'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">No Image</span>
        </div>
        {oldPrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Sale
          </span>
        )}
      </div>
    </Link>
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-sm ${i < Math.floor(ratingValue) ? "text-yellow-400" : "text-gray-200"}`}
          />
        ))}
      </div>
      <span className="text-gray-400">({reviewCount})</span>
    </div>
    <Link to={`/product/${id}`}>
      <h3 className="text-sm font-medium h-10 overflow-hidden mb-2 hover:text-blue-600 transition-colors line-clamp-2">{name}</h3>
    </Link>
    <div className="flex items-center justify-between">
      <div>
        {oldPrice && <p className="text-sm text-gray-400 line-through">Rs. {oldPrice.toLocaleString()}</p>}
        <p className="text-lg font-bold text-blue-600">Rs. {(price || 0).toLocaleString()}</p>
      </div>
      <button 
        onClick={(e) => { e.preventDefault(); onAddToCart && onAddToCart(id); }}
        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
        title="Add to cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>
  </div>
  );
};

const ProductCarousel = ({ products, onAddToCart, wishlistIds, onToggleWishlist, togglingWishlist }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') current.scrollLeft -= 300;
    else current.scrollLeft += 300;
  };
  return (
   
    
    <div className="relative">
      <div 
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/90 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-10 shadow-md text-2xl text-gray-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 select-none transition-colors"
        onClick={() => scroll('left')}
      >
        ‹
      </div>
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-5 pb-5 scroll-smooth scrollbar-hide"
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            {...product} 
            onAddToCart={onAddToCart} 
            isInWishlist={wishlistIds.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
            togglingWishlist={togglingWishlist}
          />
        ))}
      </div>
      <div 
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/90 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-10 shadow-md text-2xl text-gray-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 select-none transition-colors"
        onClick={() => scroll('right')}
      >
        ›
      </div>
    </div>
  );
};

// --- Main HomePage Component ---
const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [togglingWishlist, setTogglingWishlist] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const response = await wishlistAPI.get();
      if (response.data) {
        const ids = response.data.map(item => item.productId);
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const handleToggleWishlist = async (productId) => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setTogglingWishlist(productId);
    try {
      const response = await wishlistAPI.toggle(productId);
      if (response.isInWishlist) {
        setWishlistIds([...wishlistIds, productId]);
      } else {
        setWishlistIds(wishlistIds.filter(id => id !== productId));
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setTogglingWishlist(null);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      console.log("Full API Response:", response);
      // Handle both array response and wrapped response
      const fetchedProducts = Array.isArray(response) ? response : (response.data?.products || response.data || []);
      console.log("Fetched Products:", fetchedProducts);
      
      const normalizedProducts = fetchedProducts.map(p => {
        // Get primary image from images array or fallback to image_url
        let imageUrl = null;
        if (p.images && p.images.length > 0) {
          const primaryImage = p.images.find(img => img.isPrimary) || p.images[0];
          imageUrl = primaryImage?.imageUrl;
          console.log(`Product ${p.id} (${p.name}): found image - ${imageUrl}`);
        }
        if (!imageUrl) {
          imageUrl = p.image_url || p.image;
        }
        
        const finalImage = getImageUrl(imageUrl);
        
        return {
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : null,
          image: finalImage,
          rating: 0,
          reviews: 0
        };
      });

      const ratingMap = await fetchRatingsForProducts(fetchedProducts);
      const productsWithRatings = normalizedProducts.map((product) => {
        const ratingData = getRatingData(ratingMap, product.id);
        return {
          ...product,
          rating: ratingData.averageRating,
          reviews: ratingData.totalReviews,
        };
      });

      setProducts(productsWithRatings);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use fallback sample products if API fails
      const placeholderImg = 'https://via.placeholder.com/200x150?text=Laptop';
      setProducts([
        { id: 1, name: 'ASUS TUF Gaming F15', price: 145000, rating: 5, reviews: 120, image: placeholderImg },
        { id: 2, name: 'HP Pavilion 15', price: 95000, rating: 4, reviews: 89, image: placeholderImg },
        { id: 3, name: 'Dell Inspiron 14', price: 85000, rating: 4, reviews: 65, image: placeholderImg },
        { id: 4, name: 'Lenovo IdeaPad 3', price: 65000, rating: 4, reviews: 150, image: placeholderImg },
        { id: 5, name: 'Acer Nitro 5', price: 125000, rating: 5, reviews: 200, image: placeholderImg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toast = useToast();

  const handleAddToCart = async (productId) => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await cartAPI.addToCart(productId, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Split products into sections
  const featuredProducts = products.slice(0, 5);
  const gamingProducts = products.filter(p => p.name?.toLowerCase().includes('gaming') || p.name?.toLowerCase().includes('rog') || p.name?.toLowerCase().includes('nitro') || p.name?.toLowerCase().includes('victus'));
  const businessProducts = products.filter(p => p.name?.toLowerCase().includes('thinkpad') || p.name?.toLowerCase().includes('xps') || p.name?.toLowerCase().includes('inspiron'));
  const budgetProducts = products.filter(p => p.price < 100000);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* --- Main Content --- */}
      <div className="px-6 lg:px-12 py-8 font-['Poppins']">
        {/* --- Hero Banner --- */}
        <div className="w-full mb-12 relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/90 to-purple-900/85"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 py-16 lg:py-24 px-8 lg:px-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white">🎉 New Year Sale - Up to 30% Off!</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
              Your One-Stop
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">Tech Destination</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover premium laptops, expert repair services, and cutting-edge tech solutions. Quality you can trust.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link 
                to="/products" 
                className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <FaLaptop />
                Shop Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/book-repair" 
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center gap-2"
              >
                <FaTools />
                Book a Repair
              </Link>
            </div>
            
            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
              {[
                { value: "10K+", label: "Happy Customers", icon: "😊" },
                { value: "500+", label: "Products", icon: "💻" },
                { value: "5+", label: "Years Experience", icon: "⭐" },
                { value: "24/7", label: "Support", icon: "🎧" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/60 flex items-center justify-center gap-1">
                    <span>{stat.icon}</span> {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Quick Features Bar --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 -mt-8 relative z-20 px-4">
          {[
            { icon: <FaTruck />, title: "Free Delivery", desc: "On orders above Rs. 50K", color: "from-blue-500 to-blue-600" },
            { icon: <FaShieldAlt />, title: "Genuine Products", desc: "100% Authentic", color: "from-green-500 to-emerald-600" },
            { icon: <FaTools />, title: "Expert Repair", desc: "Certified Technicians", color: "from-purple-500 to-violet-600" },
            { icon: <FaHeadset />, title: "24/7 Support", desc: "Always here to help", color: "from-orange-500 to-red-500" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group">
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white text-xl mb-3 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <p className="font-bold text-gray-800">{feature.title}</p>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* --- Loading State --- */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* --- Featured Products Section --- */}
            <div className="mb-12 pb-10 border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Featured Products</h2>
                  <p className="text-gray-500 mt-1">Handpicked laptops for you</p>
                </div>
                <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                  See All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <ProductCarousel products={featuredProducts.length > 0 ? featuredProducts : products} onAddToCart={handleAddToCart} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} togglingWishlist={togglingWishlist} />
            </div>

            {/* --- Gaming Laptops Section --- */}
            {gamingProducts.length > 0 && (
              <div className="mb-12 pb-10 border-b border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">🎮 Gaming Laptops</h2>
                    <p className="text-gray-500 mt-1">Power up your gaming experience</p>
                  </div>
                  <Link to="/products?category=1" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    See All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                <ProductCarousel products={gamingProducts} onAddToCart={handleAddToCart} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} togglingWishlist={togglingWishlist} />
              </div>
            )}

            {/* --- Business Laptops Section --- */}
            {businessProducts.length > 0 && (
              <div className="mb-12 pb-10 border-b border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">💼 Business Laptops</h2>
                    <p className="text-gray-500 mt-1">Professional solutions for work</p>
                  </div>
                  <Link to="/products?category=2" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    See All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                <ProductCarousel products={businessProducts} onAddToCart={handleAddToCart} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} togglingWishlist={togglingWishlist} />
              </div>
            )}

            {/* --- Budget Laptops Section --- */}
            {budgetProducts.length > 0 && (
              <div className="mb-12 pb-10 border-b border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">💰 Budget Friendly</h2>
                    <p className="text-gray-500 mt-1">Great value for your money</p>
                  </div>
                  <Link to="/products?category=4" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                    See All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                <ProductCarousel products={budgetProducts} onAddToCart={handleAddToCart} wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} togglingWishlist={togglingWishlist} />
              </div>
            )}
          </>
        )}

        {/* --- Brands Section --- */}
        <div className="my-16">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Trusted by the best brands</p>
          </div>
          <div className="flex justify-around items-center py-8 bg-white rounded-2xl shadow-lg gap-8 flex-wrap px-8">
            {brands.map((brand, index) => (
              <img 
                key={index} 
                src={brand} 
                alt={`brand-${index}`} 
                className="h-12 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer" 
              />
            ))}
          </div>
        </div>

        {/* --- Services Section --- */}
        <div className="my-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">What We Offer</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">From premium laptops to expert repair services, we've got everything you need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/products" className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  💻
                </div>
                <h3 className="text-2xl font-bold mb-3">Shop Laptops</h3>
                <p className="opacity-90 mb-6 leading-relaxed">Browse our curated collection of premium laptops from top brands like ASUS, HP, Dell, and more.</p>
                <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all">
                  Explore Now <FaArrowRight />
                </div>
              </div>
            </Link>
            <Link to="/book-repair" className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  🔧
                </div>
                <h3 className="text-2xl font-bold mb-3">Book Repair</h3>
                <p className="opacity-90 mb-6 leading-relaxed">Expert technicians ready to fix your device. Fast turnaround with genuine parts and warranty.</p>
                <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all">
                  Schedule Now <FaArrowRight />
                </div>
              </div>
            </Link>
            <Link to="/contact" className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  📞
                </div>
                <h3 className="text-2xl font-bold mb-3">Contact Us</h3>
                <p className="opacity-90 mb-6 leading-relaxed">Have questions? Our friendly support team is here 24/7 to assist you with any inquiries.</p>
                <div className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all">
                  Get in Touch <FaArrowRight />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* --- Special Offer Banner --- */}
        <div className="my-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-1">
          <div className="bg-gray-900 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 rounded-full px-4 py-2 mb-4">
                <span className="animate-pulse">🔥</span>
                <span className="text-sm font-semibold">Limited Time Offer</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">New Year Special Sale!</h3>
              <p className="text-gray-400 mb-6 max-w-lg">Get up to 30% off on selected gaming laptops. Don't miss out on these amazing deals!</p>
              <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold hover:opacity-90 transition-opacity">
                Shop the Sale <FaArrowRight />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl opacity-30"></div>
              <img src={legionImg} alt="Gaming Laptop" className="relative z-10 w-64 lg:w-80 hover:scale-105 transition-transform" />
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-full text-lg animate-bounce">
                -30%
              </div>
            </div>
          </div>
        </div>

        {/* --- Testimonial Section --- */}
        <div className="my-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-gray-500">Don't just take our word for it</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 -translate-x-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 translate-x-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center gap-1 text-yellow-400 text-2xl mb-6">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <blockquote className="text-xl lg:text-2xl text-white italic leading-relaxed mb-8 min-h-[80px]">
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <cite className="font-semibold text-white text-lg not-italic">{testimonials[currentTestimonial].author}</cite>
              </div>
              <div className="flex justify-center gap-3">
                {testimonials.map((_, index) => (
                  <button 
                    key={index} 
                    className={`h-3 rounded-full cursor-pointer transition-all duration-300 ${currentTestimonial === index ? 'bg-white w-10' : 'bg-white/40 w-3 hover:bg-white/60'}`}
                    onClick={() => setCurrentTestimonial(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- Features Section --- */}
        <div className="my-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Why Choose ElectroByte?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We're committed to providing the best products and services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white inline-flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Newsletter Section --- */}
        <div className="my-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-9xl">📧</div>
            <div className="absolute bottom-10 right-10 text-9xl">💻</div>
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Stay Updated!</h2>
            <p className="text-gray-400 mb-8">Subscribe to our newsletter for exclusive deals, new arrivals, and tech tips.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
