import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBox, FaTruck, FaCheck, FaTimes, FaClock, FaShoppingBag, FaArrowLeft, FaHome } from "react-icons/fa";
import { orderAPI } from "../services/api";
import { useToast } from "../Component/Toast";
import Pagination, { usePagination } from "../Component/Pagination";
import { API_ORIGIN } from "../lib/config";

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
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    return getImageUrl(primaryImage?.imageUrl);
  }
  return getImageUrl(product.image_url);
};

const Orders = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const { currentPage, totalPages, totalItems, paginatedItems: paginatedOrders, goToPage } = usePagination(orders, 10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      await orderAPI.cancel(id);
      fetchOrders();
      toast.success("Order cancelled successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'confirmed': return <FaBox className="text-blue-500" />;
      case 'shipped': return <FaTruck className="text-purple-500" />;
      case 'delivered': return <FaCheck className="text-green-500" />;
      case 'cancelled': return <FaTimes className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderTotals = (order) => {
    const subtotal = (order?.OrderItems || []).reduce((sum, item) => {
      return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
    }, 0);
    return {
      subtotal,
      total: Number(order?.totalAmount) || subtotal,
    };
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <FaShoppingBag className="text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">My Orders</h1>
            <p className="text-blue-100 text-lg">Track and manage all your orders in one place</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <FaHome className="text-xs" /> Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBox className="text-4xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <Link 
              to="/products" 
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Order ID</span>
                      <p className="font-semibold text-gray-800">{order.orderId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => cancelOrder(order.id)}
                          className="text-red-500 text-sm hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="space-y-3">
                      {order.OrderItems?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                              src={getProductImageUrl(item.Product)} 
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-800">NPR {item.price}</p>
                        </div>
                      ))}
                    </div>
                    
                    <hr className="my-5" />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{order.shippingAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NPR {order.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={goToPage}
                itemName="orders"
              />
            </div>
          )}
        </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <p className="text-xs text-gray-500">Order Details</p>
                <h3 className="text-lg font-bold text-gray-800">{selectedOrder.orderId}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center">
                    {getStatusIcon(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800 capitalize">{selectedOrder.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Ordered On</p>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                  <p className="text-gray-800 text-sm">{selectedOrder.shippingAddress || 'N/A'}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Contact Phone</p>
                  <p className="text-gray-800 text-sm">{selectedOrder.contactPhone || 'N/A'}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                  <p className="text-gray-800 text-sm">
                    {selectedOrder.estimatedDeliveryDate
                      ? new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Order Notes</p>
                  <p className="text-gray-800 text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.OrderItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={getProductImageUrl(item.Product)} 
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-semibold text-gray-800">NPR {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(() => {
                const totals = getOrderTotals(selectedOrder);
                return (
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>NPR {totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold mt-3">
                      <span>Total</span>
                      <span className="text-blue-600">NPR {totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
