import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FaShoppingCart, 
  FaStar, 
  FaHeart,
  FaRegHeart,
  FaBalanceScale,
  FaCheckCircle,
  FaShippingFast,
  FaUndo,
  FaShieldAlt,
  FaSpinner,
  FaBox,
  FaPen,
  FaUser,
  FaArrowLeft,
  FaHome
} from "react-icons/fa";
import { SiIntel, SiNvidia } from "react-icons/si";
import { FaMemory, FaHdd } from "react-icons/fa";
import { productAPI, cartAPI, feedbackAPI, wishlistAPI } from "../services/api";
import { useToast } from "../Component/Toast";
import { getToken } from "../lib/storage";
import { API_ORIGIN } from "../lib/config";
import { fetchRatingsForProducts, getRatingData } from "../lib/ratings";

const API_BASE = API_ORIGIN;

const AboutProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Write review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  
  // Wishlist states
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const renderDescription = (text, className) => {
    const paragraphs = String(text || "")
      .split(/\r?\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return null;
    }

    return paragraphs.map((paragraph, index) => (
      <p
        key={`${index}-${paragraph.slice(0, 16)}`}
        className={`${className} ${index === paragraphs.length - 1 ? "" : "mb-2"}`}
      >
        {paragraph}
      </p>
    ));
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlistStatus();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productAPI.getById(id);
      console.log("Product response:", response);
      const productData = response.data || response;
      if (productData) {
        setProduct(productData);
        fetchRelatedProducts(productData);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await feedbackAPI.getProductRatings(id);
      if (response.data) {
        setReviews(response.data.feedbacks || []);
        setAverageRating(parseFloat(response.data.averageRating) || 0);
        setTotalReviews(response.data.totalReviews || 0);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkWishlistStatus = async () => {
    const token = getToken();
    if (!token) {
      setIsInWishlist(false);
      return;
    }
    
    try {
      const response = await wishlistAPI.check(id);
      console.log("Wishlist check response:", response);
      setIsInWishlist(response.isInWishlist === true);
    } catch (err) {
      console.error("Error checking wishlist:", err);
      setIsInWishlist(false);
    }
  };

  const fetchRelatedProducts = async (productData) => {
    if (!productData?.id) return;
    setLoadingRelated(true);
    try {
      const response = await productAPI.getAll();
      const allProducts = Array.isArray(response) ? response : response.data || [];
      const relatedMap = new Map();

      allProducts.forEach((item) => {
        if (!item || item.id === productData.id) return;
        const matchesCategory = productData.category_id && item.category_id === productData.category_id;
        const matchesBrand = productData.brand_id && item.brand_id === productData.brand_id;
        if (matchesCategory || matchesBrand) {
          relatedMap.set(item.id, item);
        }
      });

      const relatedList = Array.from(relatedMap.values());
      const fallbackList = relatedList.length > 0
        ? relatedList
        : allProducts.filter((item) => item && item.id !== productData.id);
      const selected = fallbackList.slice(0, 4);

      const ratingMap = await fetchRatingsForProducts(selected);
      const relatedWithRatings = selected.map((item) => {
        const ratingData = getRatingData(ratingMap, item.id);
        return {
          ...item,
          rating: ratingData.averageRating,
          reviewCount: ratingData.totalReviews,
        };
      });

      setRelatedProducts(relatedWithRatings);
    } catch (err) {
      console.error("Error fetching related products:", err);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleToggleWishlist = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Store current state in case we need to revert
    const wasInWishlist = isInWishlist;
    
    // Optimistically update UI
    setIsInWishlist(!isInWishlist);
    setWishlistLoading(true);
    
    try {
      const response = await wishlistAPI.toggle(parseInt(id));
      console.log("Wishlist toggle response:", response);
      // Update state based on actual response
      if (response.isInWishlist !== undefined) {
        setIsInWishlist(response.isInWishlist);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      // Revert to previous state on error
      setIsInWishlist(wasInWishlist);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      await feedbackAPI.create({
        type: 'product',
        referenceId: parseInt(id),
        rating: reviewRating,
        comment: reviewComment
      });
      
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment("");
      fetchReviews(); // Refresh reviews
      toast.success("Review submitted successfully!");
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper to get image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };

  const getProductPrimaryImage = (item) => {
    if (!item) return null;
    if (item.images && item.images.length > 0) {
      const primaryImage = item.images.find((img) => img.isPrimary) || item.images[0];
      return getImageUrl(primaryImage?.imageUrl);
    }
    return getImageUrl(item.image_url || item.image);
  };

  // Get all product images
  const getProductImages = () => {
    const images = [];
    if (product?.images && product.images.length > 0) {
      product.images.forEach(img => {
        images.push(getImageUrl(img.imageUrl));
      });
    } else if (product?.image_url) {
      images.push(getImageUrl(product.image_url));
    }
    return images.length > 0 ? images : [null]; // Return null placeholder if no images
  };

  const handleQuantityChange = (type) => {
    const stockCount = product?.stock_quantity || 10;
    if (type === "increase" && quantity < stockCount) {
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (!product?.id) {
      toast.error("Product not available");
      return;
    }
    
    setAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await cartAPI.add(product.id, 1);
      }
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Product not found</p>
          <button 
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = product ? getProductImages() : [];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb with Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
              </button>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
                  <FaHome className="text-xs" /> Home
                </Link>
                <span className="text-gray-400">/</span>
                <Link to="/products" className="text-gray-500 hover:text-blue-600">
                  {product?.Category?.name || 'Products'}
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-800 font-medium">{product?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left - Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
                <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  {productImages[selectedImage] ? (
                    <img 
                      src={productImages[selectedImage]} 
                      alt={product?.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                      <FaBox className="text-6xl text-gray-400 mb-2" />
                      <span className="text-gray-400">No Image Available</span>
                    </div>
                  )}
                  {/* Badges */}
                  {product?.stock_quantity > 0 && (
                    <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                      <FaCheckCircle /> In Stock
                    </span>
                  )}
                  {product?.stock_quantity === 0 && (
                    <span className="absolute top-4 right-4 bg-red-600 text-white text-xs px-3 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      {img ? (
                        <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaBox className="text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
                {/* Product Name & Rating */}
                <div className="mb-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {product?.name}
                  </h1>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`text-sm ${
                            i < Math.floor(averageRating || 0) 
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({averageRating.toFixed(1)}) · {totalReviews} reviews
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl lg:text-4xl font-bold text-blue-600">
                      NPR {Number(product?.price || 0).toLocaleString()}
                    </span>
                  </div>
                  {product?.warranty_months && (
                    <p className="text-sm text-green-600 font-medium">
                      {product.warranty_months} months warranty included
                    </p>
                  )}
                </div>

                {/* Description */}
                {product?.description && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Description:
                    </h3>
                    {renderDescription(product.description, "text-sm text-gray-600")}
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="mb-6 pb-6 border-b">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Quantity Selector */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quantity:
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange("decrease")}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={quantity}
                          readOnly
                          className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange("increase")}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        Availability: 
                        <span className={`font-medium ml-1 ${(product?.stock_quantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(product?.stock_quantity || 0) > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart || !product?.stock_quantity}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaShoppingCart />
                        {!product?.stock_quantity ? 'Out of Stock' : 'Add to Cart'}
                      </>
                    )}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleToggleWishlist}
                      disabled={wishlistLoading}
                      className={`border py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${
                        isInWishlist 
                          ? 'border-red-500 bg-red-500 text-white hover:bg-red-600 shadow-md' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-300'
                      }`}
                    >
                      {wishlistLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          {isInWishlist ? (
                            <FaHeart className="text-white" />
                          ) : (
                            <FaRegHeart className="text-red-500" />
                          )}
                          {isInWishlist ? 'In Wishlist ❤️' : 'Add to Wishlist'}
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => navigate("/products")}
                      className="border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <FaBalanceScale />
                      More Products
                    </button>
                  </div>

                  <button 
                    onClick={handleBuyNow}
                    disabled={addingToCart || !product?.stock_quantity}
                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Service Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaShippingFast className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Free Delivery</h4>
                  <p className="text-xs text-gray-600">On orders above NPR 10,000</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaUndo className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Easy Returns</h4>
                  <p className="text-xs text-gray-600">7 days return policy</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaShieldAlt className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Warranty</h4>
                  <p className="text-xs text-gray-600">{product?.warranty_months || 12} months warranty</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaCheckCircle className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Authentic</h4>
                  <p className="text-xs text-gray-600">100% genuine products</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Tabs Header */}
              <div className="border-b flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "description"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("specifications")}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "specifications"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "reviews"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Reviews ({totalReviews})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                {activeTab === "description" && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Product Details
                    </h2>
                    {product?.description ? (
                      <div className="mb-6">
                        {renderDescription(product.description, "text-gray-700 leading-relaxed")}
                      </div>
                    ) : (
                      <p className="text-gray-700 leading-relaxed mb-6">
                        No description available.
                      </p>
                    )}
                    
                    {product?.features && product.features.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Features
                        </h3>
                        <ul className="space-y-2 mb-6">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Feature Icons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 bg-black text-white rounded-lg p-6">
                      <div className="text-center">
                        <SiIntel className="text-4xl mx-auto mb-2" />
                        <p className="text-sm">Intel Core i7</p>
                        <p className="text-xs text-gray-400">10th Gen Processor</p>
                      </div>
                      <div className="text-center">
                        <SiNvidia className="text-4xl mx-auto mb-2" />
                        <p className="text-sm">RTX 2070 SUPER</p>
                        <p className="text-xs text-gray-400">8GB GDDR6</p>
                      </div>
                      <div className="text-center">
                        <FaMemory className="text-4xl mx-auto mb-2" />
                        <p className="text-sm">16GB RAM</p>
                        <p className="text-xs text-gray-400">DDR4 2933MHz</p>
                      </div>
                      <div className="text-center">
                        <FaHdd className="text-4xl mx-auto mb-2" />
                        <p className="text-sm">512GB SSD</p>
                        <p className="text-xs text-gray-400">+ 2TB HDD</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Technical Specifications
                    </h2>
                    {product?.specifications ? (
                      <div className="space-y-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-gray-200">
                            <div className="font-semibold text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="md:col-span-2 text-gray-600">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-gray-200">
                          <div className="font-semibold text-gray-700">Category</div>
                          <div className="md:col-span-2 text-gray-600">{product?.Category?.name || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-gray-200">
                          <div className="font-semibold text-gray-700">Brand</div>
                          <div className="md:col-span-2 text-gray-600">{product?.Brand?.name || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-gray-200">
                          <div className="font-semibold text-gray-700">Warranty</div>
                          <div className="md:col-span-2 text-gray-600">{product?.warranty_months || 0} months</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-gray-200">
                          <div className="font-semibold text-gray-700">Stock</div>
                          <div className="md:col-span-2 text-gray-600">{product?.stock_quantity || 0} units available</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      {/* Rating Summary */}
                      <div className="md:w-1/3 text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={`text-lg ${
                                i < Math.floor(averageRating) 
                                  ? "text-yellow-400" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Based on {totalReviews} reviews
                        </p>
                        
                        {/* Write Review Button */}
                        <button
                          onClick={() => {
                            const token = getToken();
                            if (!token) {
                              navigate("/login");
                              return;
                            }
                            setShowReviewModal(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto"
                        >
                          <FaPen />
                          Write a Review
                        </button>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-gray-600 w-12">
                                {stars} star
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                      
                      {loadingReviews ? (
                        <div className="text-center py-8">
                          <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto" />
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <FaStar className="text-4xl text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
                          <button
                            onClick={() => {
                              const token = getToken();
                              if (!token) {
                                navigate("/login");
                                return;
                              }
                              setShowReviewModal(true);
                            }}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            Write a Review
                          </button>
                        </div>
                      ) : (
                        reviews.map((review) => {
                          // Helper to get user profile image URL
                          const getUserImageUrl = (imageUrl) => {
                            if (!imageUrl) return null;
                            if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) return imageUrl;
                            return `${API_BASE}${imageUrl}`;
                          };
                          
                          return (
                          <div key={review.id} className="border-b border-gray-200 pb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                                {review.User?.profileImage ? (
                                  <img 
                                    src={getUserImageUrl(review.User.profileImage)} 
                                    alt={review.User.username}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span 
                                  className={`text-white font-medium ${review.User?.profileImage ? 'hidden' : 'flex'}`}
                                  style={{ display: review.User?.profileImage ? 'none' : 'flex' }}
                                >
                                  {review.User?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {review.User?.username || 'Anonymous User'}
                                </p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                      key={i} 
                                      className={`text-xs ${
                                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )})
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            {loadingRelated ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                Loading related products...
              </div>
            ) : relatedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                No related products found.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((item) => {
                  const ratingValue = Number.isFinite(Number(item.rating)) ? Number(item.rating) : 0;
                  const reviewCount = Number.isFinite(Number(item.reviewCount)) ? Number(item.reviewCount) : 0;
                  const imageUrl = getProductPrimaryImage(item);

                  return (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                    >
                      <div className="relative p-4 bg-gray-50">
                        <div className="aspect-square bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-gray-400 text-xs">No Image</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-xs ${i < Math.floor(ratingValue) ? "text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            ({ratingValue.toFixed(1)}{reviewCount > 0 ? ` | ${reviewCount}` : ""})
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-base font-bold text-blue-600">
                          Rs. {Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {productImages[0] ? (
                  <img src={productImages[0]} alt={product?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBox className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{product?.name}</h4>
                <p className="text-sm text-gray-500">{product?.Category?.name}</p>
              </div>
            </div>

            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <FaStar 
                      className={`text-3xl ${
                        star <= reviewRating ? "text-yellow-400" : "text-gray-300"
                      }`} 
                    />
                  </button>
                ))}
                <span className="ml-3 text-gray-600 font-medium">{reviewRating}/5</span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {reviewError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {reviewError}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AboutProduct;
