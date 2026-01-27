import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCheck, FaArrowLeft, FaHome } from "react-icons/fa";
import { orderAPI, addressAPI, cartAPI } from "../services/api";
import { API_ORIGIN } from "../lib/config";
import { orderSchema } from "../validations";

const API_BASE = API_ORIGIN;

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
    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
    return getImageUrl(primaryImage?.imageUrl);
  }
  return getImageUrl(product.image_url);
};

const buildShippingAddress = (data) => {
  const parts = [
    data.fullName,
    data.street,
    data.landmark ? `Landmark: ${data.landmark}` : null,
    data.ward ? `Ward ${data.ward}` : null,
    data.municipality,
    data.district,
    data.province ? `Province ${data.province}` : null,
    data.postalCode ? `Postal ${data.postalCode}` : null,
  ].filter(Boolean);

  return parts.join(", ");
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
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    contactPhone: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    street: "",
    landmark: "",
    postalCode: "",
    notes: "",
  });

  const getFieldError = (field) => {
    const error = formErrors[field];
    return Array.isArray(error) ? error[0] : error;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        cartAPI.get(),
        addressAPI.getAll(),
      ]);

      setCartItems(cartRes.data.items || []);
      setSubtotal(cartRes.data.subtotal || 0);
      setAddresses(addressRes.data || []);

      const defaultAddr = addressRes.data.find((a) => a.isDefault);
      if (defaultAddr) {
        handleAddressSelect(defaultAddr);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    setFormErrors({});
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName || "",
      contactPhone: addr.phone || "",
      province: addr.state || "",
      district: addr.city || "",
      municipality: "",
      ward: "",
      street: addr.address || "",
      landmark: "",
      postalCode: addr.zipCode || "",
    }));
  };

  const clearSelectedAddress = () => {
    setSelectedAddress(null);
  };

  const validateFields = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.contactPhone.trim()) errors.contactPhone = "Contact phone is required";
    if (!formData.province.trim()) errors.province = "Province is required";
    if (!formData.district.trim()) errors.district = "District is required";
    if (!formData.municipality.trim()) errors.municipality = "Municipality/VDC is required";
    if (!formData.ward.trim()) errors.ward = "Ward number is required";
    if (!formData.street.trim()) errors.street = "Street/Tole is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setFormErrors(fieldErrors);
      return;
    }

    const shippingAddress = buildShippingAddress(formData);
    const payload = {
      shippingAddress,
      contactPhone: formData.contactPhone,
      notes: formData.notes,
    };

    const validation = orderSchema.safeParse(payload);
    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await orderAPI.create(payload);
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaCheck className="text-4xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Your order ID is:{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {orderId}
            </span>
          </p>
          <p className="text-gray-500 mb-6">
            We'll send you a confirmation email with order details.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/home")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                    Shipping Information (Nepal)
                  </h2>
                  {selectedAddress && (
                    <button
                      type="button"
                      onClick={clearSelectedAddress}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear saved address
                    </button>
                  )}
                </div>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use a saved address
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <button
                          type="button"
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`text-left p-3 border rounded-lg transition-all ${
                            selectedAddress?.id === addr.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium">{addr.fullName}</p>
                          <p className="text-sm text-gray-600">{addr.address}</p>
                          <p className="text-sm text-gray-600">{addr.city}</p>
                          <p className="text-sm text-gray-500">{addr.phone}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Full name"
                      required
                    />
                    {getFieldError("fullName") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("fullName")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, contactPhone: e.target.value });
                        setFormErrors((prev) => ({ ...prev, contactPhone: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="98XXXXXXXX"
                      required
                    />
                    {getFieldError("contactPhone") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("contactPhone")}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => {
                        setFormData({ ...formData, province: e.target.value });
                        setFormErrors((prev) => ({ ...prev, province: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Province 1, Madhesh, Bagmati..."
                      required
                    />
                    {getFieldError("province") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("province")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => {
                        setFormData({ ...formData, district: e.target.value });
                        setFormErrors((prev) => ({ ...prev, district: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kathmandu, Lalitpur..."
                      required
                    />
                    {getFieldError("district") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("district")}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Municipality/VDC *</label>
                    <input
                      type="text"
                      value={formData.municipality}
                      onChange={(e) => {
                        setFormData({ ...formData, municipality: e.target.value });
                        setFormErrors((prev) => ({ ...prev, municipality: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kathmandu Metro"
                      required
                    />
                    {getFieldError("municipality") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("municipality")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward No. *</label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => {
                        setFormData({ ...formData, ward: e.target.value });
                        setFormErrors((prev) => ({ ...prev, ward: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ward number"
                      required
                    />
                    {getFieldError("ward") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("ward")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street/Tole *</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => {
                        setFormData({ ...formData, street: e.target.value });
                        setFormErrors((prev) => ({ ...prev, street: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street/Tole"
                      required
                    />
                    {getFieldError("street") && (
                      <p className="text-xs text-red-600 mt-1">{getFieldError("street")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nearby landmark"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Any special instructions..."
                  />
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
