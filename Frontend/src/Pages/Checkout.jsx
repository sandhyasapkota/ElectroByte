import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCheck, FaArrowLeft, FaHome } from "react-icons/fa";
import { orderAPI, addressAPI, cartAPI } from "../services/api";

const API_BASE = "http://localhost:5000";

// Helper to get image URL
const getImageUrl = (url) => {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

// Helper to get product image (check images array first, then image_url)
const getProductImageUrl = (product) => {
  if (!product) return "/placeholder.jpg";
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    return getImageUrl(primaryImage?.imageUrl);
  }
  return getImageUrl(product.image_url);
};

const Checkout = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  
  const [formData, setFormData] = useState({
    shippingAddress: "",
    contactPhone: "",
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        cartAPI.get(),
        addressAPI.getAll()
      ]);
      
      setCartItems(cartRes.data.items || []);
      setSubtotal(cartRes.data.subtotal || 0);
      setAddresses(addressRes.data || []);
      
      // Set default address
      const defaultAddr = addressRes.data.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        setFormData(prev => ({
          ...prev,
          shippingAddress: `${defaultAddr.fullName}, ${defaultAddr.address}, ${defaultAddr.city}`,
          contactPhone: defaultAddr.phone
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    setFormData(prev => ({
      ...prev,
      shippingAddress: `${addr.fullName}, ${addr.address}, ${addr.city}`,
      contactPhone: addr.phone
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shippingAddress || !formData.contactPhone) {
      setError("Please fill in shipping address and contact phone");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      const response = await orderAPI.create(formData);
      setOrderId(response.data.orderId);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>
          <p className="text-blue-100 mt-2">Complete your order</p>
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
            <Link to="/cart" className="text-gray-500 hover:text-blue-600">Cart</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                  Shipping Information
                </h2>
                
                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saved Addresses
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => handleAddressSelect(addr)}
                            className={`p-3 border rounded-lg cursor-pointer ${
                              selectedAddress?.id === addr.id 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-medium">{addr.fullName}</p>
                            <p className="text-sm text-gray-600">{addr.address}</p>
                            <p className="text-sm text-gray-600">{addr.city}</p>
                            <p className="text-sm text-gray-500">{addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address *
                      </label>
                      <textarea
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows="3"
                        placeholder="Enter full shipping address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows="2"
                        placeholder="Any special instructions..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                    Payment Method
                  </h2>
                  <div className="p-4 border-2 border-blue-500 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" checked readOnly className="text-blue-600" />
                      <span className="font-medium">Cash on Delivery (COD)</span>
                    </label>
                    <p className="text-sm text-gray-500 ml-6 mt-1">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={getProductImageUrl(item.Product)} 
                          alt={item.Product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.Product?.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">NPR {item.Product?.price}</p>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>NPR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NPR {subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Checkout;
