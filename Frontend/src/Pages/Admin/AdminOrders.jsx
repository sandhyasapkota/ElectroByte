import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaTruck, FaCheck, FaTimes, FaBox } from "react-icons/fa";
import { orderAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import Pagination, { usePagination } from "../../Component/Pagination";
import AdminSidebar from "./AdminSidebar";

const AdminOrders = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchOrders();
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
    }
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      setShowModal(false);
      toast.success(`Order status updated to ${newStatus}!`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <AdminSidebar active="Orders" />
      
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Order Management</h1>
          <p className="text-gray-500 mt-2">View and manage all orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
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
                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          itemsPerPage={10}
          itemName="orders"
        />

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Order #{selectedOrder.orderId}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      <div key={idx} className="p-3 flex justify-between">
                        <span>{item.productName} x {item.quantity}</span>
                        <span className="font-medium">Rs. {parseFloat(item.price).toLocaleString()}</span>
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
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;
