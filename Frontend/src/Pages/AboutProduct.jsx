import React, { useState } from "react";
import { 
  FaShoppingCart, 
  FaStar, 
  FaHeart, 
  FaBalanceScale,
  FaCheckCircle,
  FaShippingFast,
  FaUndo,
  FaShieldAlt,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaDesktop
} from "react-icons/fa";
import { SiIntel, SiNvidia, SiAmd } from "react-icons/si";
import Navbar from "../src/Component/Navbar";
import Footer from "../src/Component/Footer";

const AboutProduct = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  // Product data
  const product = {
    id: 1,
    name: "MSI MEG Trident X",
    brand: "MSI",
    model: "Trident X 10SD-1012AU",
    price: "Rs. 185,000",
    originalPrice: "Rs. 215,000",
    rating: 4.5,
    reviews: 256,
    inStock: true,
    stockCount: 12,
    sku: "MSI-TRX-1012",
    category: "Desktop PCs",
    images: [
      "product1.jpg",
      "product2.jpg", 
      "product3.jpg",
      "product4.jpg"
    ],
    description: `
      Experience ultimate gaming performance with the MSI MEG Trident X. 
      This compact yet powerful gaming desktop delivers uncompromising power 
      in a sleek chassis. Featuring the latest Intel Core processor and NVIDIA 
      graphics, it's designed for gamers who demand the best.
    `,
    specifications: {
      processor: "Intel Core i7-10700K (8-Core, 16MB Cache, up to 5.1 GHz)",
      graphics: "NVIDIA GeForce RTX 2070 SUPER 8GB GDDR6",
      memory: "16GB DDR4 2933MHz (Dual Channel)",
      storage: "512GB NVMe M.2 SSD + 2TB 7200RPM HDD",
      motherboard: "MSI MEG Z490I UNIFY",
      cooling: "MSI Silent Storm Cooling 3",
      power: "650W 80+ Gold Certified",
      os: "Windows 10 Home",
      ports: "USB 3.2 Gen2 Type-C x1, USB 3.2 Gen2 x4, USB 3.2 Gen1 x2",
      wifi: "Wi-Fi 6 AX (802.11ax) + Bluetooth 5.1"
    },
    features: [
      "Compact gaming desktop with premium components",
      "RGB Mystic Light customization",
      "Silent Storm Cooling 3 for optimal thermal performance",
      "Tool-less design for easy upgrades",
      "VR Ready for immersive gaming experiences"
    ]
  };

  const handleQuantityChange = (type) => {
    if (type === "increase" && quantity < product.stockCount) {
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto text-xs sm:text-sm text-gray-600">
            <span>Home</span> / <span>Desktop PCs</span> / <span>Gaming Desktops</span> / 
            <span className="text-gray-900 font-medium"> {product.name}</span>
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
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Product Image {selectedImage + 1}</span>
                  </div>
                  {/* Badges */}
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded">
                    SAVE 14%
                  </span>
                  {product.inStock && (
                    <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                      <FaCheckCircle /> In Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-white rounded-lg p-3 border-2 transition-all ${
                      selectedImage === index 
                        ? "border-blue-600" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
                {/* Product Name & Rating */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.brand}
                    </span>
                    <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`text-sm ${
                            i < Math.floor(product.rating) 
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl lg:text-4xl font-bold text-blue-600">
                      {product.price}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    You save Rs. 30,000 (14% off)
                  </p>
                </div>

                {/* Short Description */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Key Features:
                  </h3>
                  <ul className="space-y-1.5">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

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
                        <span className="text-green-600 font-medium ml-1">
                          {product.stockCount} in stock
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <FaHeart />
                      Wishlist
                    </button>
                    <button className="border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                      <FaBalanceScale />
                      Compare
                    </button>
                  </div>

                  <button className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Service Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaShippingFast className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Free Delivery</h4>
                  <p className="text-xs text-gray-600">On orders above Rs. 10,000</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaUndo className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Easy Returns</h4>
                  <p className="text-xs text-gray-600">7 days return policy</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <FaShieldAlt className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Warranty</h4>
                  <p className="text-xs text-gray-600">3 years manufacturer warranty</p>
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
                  Reviews ({product.reviews})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                {activeTab === "description" && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Outplay the Competition
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {product.description}
                    </p>
                    
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
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      {/* Rating Summary */}
                      <div className="md:w-1/3 text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {product.rating}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={`text-lg ${
                                i < Math.floor(product.rating) 
                                  ? "text-yellow-400" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Based on {product.reviews} reviews
                        </p>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-600 w-12">
                              {stars} star
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${Math.random() * 60 + 20}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {Math.floor(Math.random() * 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                      
                      {/* Sample Review */}
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">U</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">User {review}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className="text-xs text-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            Great product! Excellent performance and build quality. 
                            Highly recommended for gaming and professional work.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Reviewed 2 weeks ago</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="relative p-4 bg-gray-50">
                    <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Product {item}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-xs text-yellow-400" />
                      ))}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Related Product {item}
                    </h3>
                    <p className="text-base font-bold text-blue-600">Rs. 95,000</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AboutProduct;