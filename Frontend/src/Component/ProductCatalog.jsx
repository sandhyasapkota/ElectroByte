import React, { useState } from "react";
import { FaShoppingCart, FaStar, FaHeart, FaThLarge, FaList, FaChevronDown } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";

const ProductCatalog = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample product data with NPR pricing
  const products = [
    {
      id: 1,
      name: "ASUS TUF Gaming F505",
      price: "Rs. 145,000",
      originalPrice: "Rs. 165,000",
      rating: 4.5,
      reviews: 154,
      image: "laptop1.jpg",
      badge: "SALE",
      inStock: true
    },
    {
      id: 2,
      name: "HP Pavilion 15",
      price: "Rs. 95,000",
      rating: 4.0,
      reviews: 89,
      image: "laptop2.jpg",
      inStock: true
    },
    // Add more products as needed
  ];

  // Repeat products to match the grid in the image (approximately 20 products)
  const allProducts = Array(20).fill(null).map((_, index) => ({
    ...products[index % products.length],
    id: index + 1,
    name: `Laptop Model ${index + 1}`,
    price: `Rs. ${(85000 + Math.floor(Math.random() * 80000)).toLocaleString('en-IN')}`,
    originalPrice: index % 3 === 0 ? `Rs. ${(100000 + Math.floor(Math.random() * 80000)).toLocaleString('en-IN')}` : null,
  }));

  // Filters from the image
  const categories = [
    "All Laptops",
    "Gaming Laptops", 
    "Business Laptops",
    "Ultrabooks",
    "2-in-1 Laptops",
    "Budget Laptops"
  ];

  const brands = [
    { name: "ASUS", count: 42 },
    { name: "HP", count: 35 },
    { name: "Dell", count: 28 },
    { name: "Lenovo", count: 31 },
    { name: "Acer", count: 19 },
    { name: "MSI", count: 15 }
  ];

  const priceRanges = [
    "Rs. 0 - Rs. 50,000",
    "Rs. 50,000 - Rs. 100,000",
    "Rs. 100,000 - Rs. 150,000",
    "Rs. 150,000 - Rs. 200,000",
    "Rs. 200,000+"
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto text-xs sm:text-sm text-gray-600">
            <span>Home</span> / <span className="text-gray-900 font-medium">Laptops (24)</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Sidebar Filters */}
            <aside className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
                
                {/* Categories Filter */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b">
                    Categories
                  </h3>
                  <ul className="space-y-2">
                    {categories.map((category, index) => (
                      <li key={index}>
                        <label className="flex items-center text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                          <input type="radio" name="category" className="mr-2" defaultChecked={index === 0} />
                          {category}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Brand Filter */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b">
                    Brand
                  </h3>
                  <ul className="space-y-2">
                    {brands.map((brand, index) => (
                      <li key={index}>
                        <label className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                          <span className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            {brand.name}
                          </span>
                          <span className="text-xs text-gray-500">({brand.count})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b">
                    Price Range
                  </h3>
                  <ul className="space-y-2">
                    {priceRanges.map((range, index) => (
                      <li key={index}>
                        <label className="flex items-center text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                          <input type="checkbox" className="mr-2" />
                          {range}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Color Filter */}
              

              </div>
            </aside>

            {/* Product Listing */}
            <main className="lg:w-3/4">
              
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Sort By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-600"
                  >
                    <option value="default">Default sorting</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select 
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-600"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                    >
                      <FaThLarge />
                    </button>
                    <button 
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                    >
                      <FaList />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-4 sm:gap-6`}>
                {allProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
                    {/* Product Image */}
                    <div className="relative p-4 bg-gray-50">
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                          {product.badge}
                        </span>
                      )}
                      <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                        <FaHeart className="text-sm" />
                      </button>
                      <div className="w-full h-48 flex items-center justify-center">
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Product Image</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`text-xs ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                        <span className="text-base font-bold text-blue-600">
                          {product.price}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <FaShoppingCart className="text-sm" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  Previous
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">1</button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">2</button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">3</button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  Next
                </button>
              </div>

              {/* Feature Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaShoppingCart className="text-2xl text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Free Delivery</h4>
                  <p className="text-xs text-gray-600">Orders over Rs. 10,000</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaStar className="text-2xl text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Guaranteed Savings</h4>
                  <p className="text-xs text-gray-600">Best price guarantee</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaHeart className="text-2xl text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Customer Support</h4>
                  <p className="text-xs text-gray-600">24/7 support available</p>
                </div>
              </div>
            </main>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductCatalog;