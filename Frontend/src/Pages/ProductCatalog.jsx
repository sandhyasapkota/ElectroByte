import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaShoppingCart, FaStar, FaHeart, FaRegHeart, FaThLarge, FaList, FaSpinner, FaSearch, FaTimes, FaArrowLeft, FaHome } from "react-icons/fa";
import { productAPI, categoryAPI, brandAPI, cartAPI, wishlistAPI } from "../services/api";
import { useToast } from "../Component/Toast";
import { getToken } from "../lib/storage";
import Pagination, { usePagination } from "../Component/Pagination";
import { API_ORIGIN } from "../lib/config";
import { fetchRatingsForProducts, getRatingData } from "../lib/ratings";

const API_BASE = API_ORIGIN;

// Helper to get image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

// Helper to get product image (check images array first, then image_url)
const getProductImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    return getImageUrl(primaryImage?.imageUrl);
  }
  return getImageUrl(product.image_url);
};

const ProductCatalog = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [togglingWishlist, setTogglingWishlist] = useState(null);

  useEffect(() => {
    fetchData();
    fetchWishlist();
  }, []);

  // Handle URL search param changes
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        brandAPI.getAll()
      ]);
      
      const rawProducts = Array.isArray(productsRes) ? productsRes : productsRes.data || [];
      const ratingMap = await fetchRatingsForProducts(rawProducts);
      const productsWithRatings = rawProducts.map((product) => {
        const ratingData = getRatingData(ratingMap, product.id);
        return {
          ...product,
          rating: ratingData.averageRating,
          reviewCount: ratingData.totalReviews,
        };
      });

      setProducts(productsWithRatings);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.data || []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : brandsRes.data || []);
    } catch (err) {
      setError(err.message);
      setProducts(getSampleProducts());
      setCategories(getSampleCategories());
      setBrands(getSampleBrands());
    } finally {
      setLoading(false);
    }
  };

  const getSampleProducts = () => [
    { id: 1, name: "ASUS TUF Gaming F15", price: 145000, image_url: null, rating: 4.5, reviewCount: 120, stock_quantity: 10 },
    { id: 2, name: "HP Pavilion 15", price: 95000, image_url: null, rating: 4.0, reviewCount: 89, stock_quantity: 15 },
    { id: 3, name: "Dell Inspiron 14", price: 85000, image_url: null, rating: 4.2, reviewCount: 65, stock_quantity: 8 },
    { id: 4, name: "Lenovo IdeaPad 3", price: 75000, image_url: null, rating: 4.1, reviewCount: 150, stock_quantity: 20 },
    { id: 5, name: "Acer Nitro 5", price: 125000, image_url: null, rating: 4.6, reviewCount: 200, stock_quantity: 5 },
    { id: 6, name: "MSI GF63 Thin", price: 135000, image_url: null, rating: 4.4, reviewCount: 70, stock_quantity: 7 },
    { id: 7, name: "ASUS ROG Strix G15", price: 185000, image_url: null, rating: 4.8, reviewCount: 55, stock_quantity: 3 },
    { id: 8, name: "HP Victus 16", price: 155000, image_url: null, rating: 4.3, reviewCount: 90, stock_quantity: 12 },
  ];

  const getSampleCategories = () => [
    { id: 1, name: "Gaming Laptops" },
    { id: 2, name: "Business Laptops" },
    { id: 3, name: "Ultrabooks" },
    { id: 4, name: "Budget Laptops" },
  ];

  const getSampleBrands = () => [
    { id: 1, name: "ASUS" },
    { id: 2, name: "HP" },
    { id: 3, name: "Dell" },
    { id: 4, name: "Lenovo" },
    { id: 5, name: "Acer" },
    { id: 6, name: "MSI" },
  ];

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    
    setAddingToCart(productId);
    try {
      await cartAPI.add(productId, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const sortProducts = (products) => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

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

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();
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

  const filterProducts = (products) => {
    let filtered = products;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.Category?.name?.toLowerCase().includes(query) ||
        p.Brand?.name?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand_id));
    }
    return filtered;
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const displayProducts = sortProducts(filterProducts(products));

  // Pagination - 12 products per page for grid layout
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedProducts,
    goToPage
  } = usePagination(displayProducts, 12);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {searchQuery ? `Search Results` : 'Shop Our Products'}
          </h1>
          <p className="text-blue-100 text-lg">
            {searchQuery ? `Showing results for "${searchQuery}"` : 'Find the perfect laptop for your needs'}
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <FaHome className="text-xs" /> Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">Products ({displayProducts.length})</span>
            {searchQuery && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600">Search: "{searchQuery}"</span>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Using sample data - Backend connection failed
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-24">
              
              {/* Categories Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                  Categories
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        !selectedCategory ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          selectedCategory === category.id ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                  Brands
                </h3>
                <ul className="space-y-2">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <label className="flex items-center text-sm text-gray-700 hover:text-blue-600 cursor-pointer px-3 py-1">
                        <input 
                          type="checkbox" 
                          className="mr-3 w-4 h-4 text-blue-600 rounded" 
                          checked={selectedBrands.includes(brand.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand.id]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                            }
                          }}
                        />
                        {brand.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedBrands.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedBrands([]);
                  }}
                  className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Listing */}
          <main className="lg:w-3/4">
            
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{displayProducts.length}</span> products
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <FaThLarge />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {displayProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FaShoppingCart className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
                {paginatedProducts.map((product) => {
                  const ratingValue = Number.isFinite(Number(product.rating)) ? Number(product.rating) : 0;
                  const reviewCount = Number.isFinite(Number(product.reviewCount)) ? Number(product.reviewCount) : 0;

                  return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {/* Product Image */}
                    <div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                      {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Low Stock
                        </span>
                      )}
                      {product.stock_quantity === 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                      <button 
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${
                          wishlistIds.includes(product.id)
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-white hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100'
                        } ${wishlistIds.includes(product.id) ? 'opacity-100' : ''}`}
                        onClick={(e) => toggleWishlist(e, product.id)}
                        disabled={togglingWishlist === product.id}
                      >
                        {togglingWishlist === product.id ? (
                          <FaSpinner className="text-sm animate-spin" />
                        ) : wishlistIds.includes(product.id) ? (
                          <FaHeart className="text-sm" />
                        ) : (
                          <FaRegHeart className="text-sm" />
                        )}
                      </button>
                      <div className="w-full h-48 flex items-center justify-center">
                        {getProductImageUrl(product) ? (
                          <img src={getProductImageUrl(product)} alt={product.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-blue-300 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`text-sm ${i < Math.floor(ratingValue) ? "text-yellow-400" : "text-gray-200"}`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-2">({ratingValue.toFixed(1)}{reviewCount > 0 ? ` | ${reviewCount}` : ""})</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-blue-600">
                          NPR {Number(product.price).toLocaleString()}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        onClick={(e) => handleAddToCart(product.id, e)}
                        disabled={addingToCart === product.id || product.stock_quantity === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {addingToCart === product.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaShoppingCart />
                            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalItems}
              itemsPerPage={12}
              itemName="products"
            />

            {/* Features Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="text-xl text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Free Delivery</h4>
                <p className="text-sm text-gray-500">On orders over NPR 10,000</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaStar className="text-xl text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Best Prices</h4>
                <p className="text-sm text-gray-500">Guaranteed lowest prices</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FaHeart className="text-xl text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                <p className="text-sm text-gray-500">Expert help anytime</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
