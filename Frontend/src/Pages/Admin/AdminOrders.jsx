import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaTruck, FaCheck, FaTimes, FaBox } from "react-icons/fa";
import { orderAPI } from "../../services/api";
import { API_ORIGIN } from "../../lib/config";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import Pagination, { usePagination } from "../../Component/Pagination";
import AdminSidebar from "./AdminSidebar";

const API_BASE = API_ORIGIN;

const getImageUrl = (url) => {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

const getProductImageUrl = (item) => {
  const product = item?.Product || item?.product;
  if (product?.images?.length) {
    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
    return getImageUrl(primaryImage?.imageUrl);
  }
  return getImageUrl(product?.image_url || item?.image_url || item?.imageUrl);
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    const isAdmin = checkAdminAccess();
    if (isAdmin) fetchOrders();
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAllOrders();
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, dateOverride, closeModal = true) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus, dateOverride);
      setOrders(orders.map(o => 
        o.id === orderId 
          ? { 
              ...o, 
              status: newStatus || o.status, 
              estimatedDeliveryDate: dateOverride || o.estimatedDeliveryDate 
            } 
          : o
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus || selectedOrder.status,
          estimatedDeliveryDate: dateOverride || selectedOrder.estimatedDeliveryDate
        });
      }
      if (closeModal) setShowModal(false);
      if (newStatus && newStatus !== selectedOrder?.status) {
        toast.success(`Order status updated to ${newStatus}!`);
      } else if (dateOverride) {
        toast.success("Estimated delivery date updated!");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.User?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedOrders,
    goToPage
  } = usePagination(filteredOrders, 10);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'confirmed': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:flex-row">
      <AdminSidebar active="Orders" />
      {/* Main Content */}
      <main className="flex-1 w-full ml-0 lg:ml-64 px-2 sm:px-4 md:px-8 py-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Order Management</h1>
          <p className="text-gray-500 mt-2">View and manage all orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 md:p-6 mb-4 md:mb-6 flex flex-wrap gap-2 md:gap-4 items-center border border-gray-100">
          <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-x-auto border border-gray-100">
          <table className="min-w-[700px] w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <FaBox className="mx-auto text-4xl mb-2 text-gray-300" />
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.User?.username || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">{order.User?.email || order.contactPhone}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">Rs. {parseFloat(order.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { 
                          setSelectedOrder(order); 
                          setDeliveryDate(order.estimatedDeliveryDate ? order.estimatedDeliveryDate.slice(0, 10) : ""); 
                          setShowModal(true); 
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-2 md:mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={totalItems}
            itemsPerPage={10}
            itemName="orders"
          />
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2">
            <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl md:shadow-2xl border border-gray-100">
              <div className="p-4 md:p-6 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Order #{selectedOrder.orderId}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
                  <FaTimes />
                </button>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedOrder.User?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium uppercase">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-lg">Rs. {parseFloat(selectedOrder.totalAmount).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="font-medium">{selectedOrder.shippingAddress}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery Date</p>
                  <p className="font-medium">
                    {selectedOrder.estimatedDeliveryDate
                      ? new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Order Items</p>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.OrderItems?.map((item, idx) => (
                      <div key={idx} className="p-3 flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                          <img
                            src={getProductImageUrl(item)}
                            alt={item.productName || item.Product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.productName || item.Product?.name || "Unnamed product"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} • Rs. {parseFloat(item.price).toLocaleString()} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="font-medium">
                            Rs. {parseFloat(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status, deliveryDate || undefined, true)}
                        className={`px-4 py-2 rounded-xl capitalize font-medium transition-all ${
                          selectedOrder.status === status 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Set Estimated Delivery</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, selectedOrder.status, deliveryDate || undefined, false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Date
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
