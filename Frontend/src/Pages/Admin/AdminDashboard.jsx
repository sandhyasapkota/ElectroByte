import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUsers, FaShoppingCart, FaTools, FaTicketAlt, 
  FaChartLine, FaBox, FaUserCog, FaSignOutAlt,
  FaBars, FaTimes, FaHome, FaDollarSign, FaExclamationCircle
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalAppointments: 0,
    pendingOrders: 0,
    pendingAppointments: 0,
    openTickets: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [charts, setCharts] = useState({
    monthlyOrders: [],
    ordersByStatus: [],
    productsByCategory: [],
    userTrend: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    fetchDashboardData();
  }, []);

  const checkAdminAccess = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/login");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data) {
        setStats(response.data.stats || stats);
        setRecentOrders(response.data.recentOrders || []);
        setRecentAppointments(response.data.recentAppointments || []);
        
        // Process chart data
        if (response.data.charts) {
          const { monthlyOrders, ordersByStatus, productsByCategory, userTrend, topProducts } = response.data.charts;
          
          // Format monthly orders for chart
          const formattedMonthly = (monthlyOrders || []).map(item => ({
            month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
            orders: parseInt(item.count),
            revenue: parseFloat(item.revenue) || 0
          }));
          
          // Format order status
          const formattedStatus = (ordersByStatus || []).map(item => ({
            name: item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown',
            value: parseInt(item.count)
          }));
          
          // Format products by category
          const formattedCategory = (productsByCategory || []).map(item => ({
            name: item['Category.name'] || 'Uncategorized',
            products: parseInt(item.count)
          }));
          
          // Format user trend
          const formattedUserTrend = (userTrend || []).map(item => ({
            month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
            users: parseInt(item.count)
          }));
          
          // Format top products
          const formattedTopProducts = (topProducts || []).map(item => ({
            name: item['Product.name'] || 'Unknown',
            sold: parseInt(item.totalSold)
          }));
          
          setCharts({
            monthlyOrders: formattedMonthly,
            ordersByStatus: formattedStatus,
            productsByCategory: formattedCategory,
            userTrend: formattedUserTrend,
            topProducts: formattedTopProducts
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: FaChartLine, path: "/admin" },
    { name: "Users", icon: FaUsers, path: "/admin/users" },
    { name: "Orders", icon: FaShoppingCart, path: "/admin/orders" },
    { name: "Products", icon: FaBox, path: "/admin/products" },
    { name: "Appointments", icon: FaTools, path: "/admin/appointments" },
    { name: "Technicians", icon: FaUserCog, path: "/admin/technicians" },
    { name: "Tickets", icon: FaTicketAlt, path: "/admin/tickets" },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle, link }) => (
    <Link to={link || "#"} className="block">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="text-2xl" style={{ color }} />
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 fixed h-full z-50`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">ElectroByte</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
            >
              <item.icon className="text-lg" />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
          
          <div className="border-t border-gray-700 mt-6 pt-4">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition">
              <FaHome className="text-lg" />
              {sidebarOpen && <span>Back to Site</span>}
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition w-full text-left text-red-400"
            >
              <FaSignOutAlt className="text-lg" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={FaUsers} 
            color="#3B82F6"
            link="/admin/users"
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={FaShoppingCart} 
            color="#10B981"
            subtitle={`${stats.pendingOrders} pending`}
            link="/admin/orders"
          />
          <StatCard 
            title="Products" 
            value={stats.totalProducts} 
            icon={FaBox} 
            color="#F59E0B"
            link="/admin/products"
          />
          <StatCard 
            title="Revenue" 
            value={`Rs. ${stats.totalRevenue?.toLocaleString() || 0}`} 
            icon={FaDollarSign} 
            color="#8B5CF6" 
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Appointments" 
            value={stats.totalAppointments} 
            icon={FaTools} 
            color="#EC4899"
            subtitle={`${stats.pendingAppointments} pending`}
            link="/admin/appointments"
          />
          <StatCard 
            title="Open Tickets" 
            value={stats.openTickets || 0} 
            icon={FaTicketAlt} 
            color="#EF4444"
            link="/admin/tickets"
          />
          <StatCard 
            title="Growth" 
            value={`+${((stats.totalOrders / (stats.totalUsers || 1)) * 10).toFixed(1)}%`} 
            icon={FaChartLine} 
            color="#06B6D4"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Orders Line Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Revenue & Orders</h2>
            {charts.monthlyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available yet
              </div>
            )}
          </div>

          {/* Order Status Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
            {charts.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Orders">
                    {charts.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No orders yet
              </div>
            )}
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Products by Category */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Products by Category</h2>
            {charts.productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.productsByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="products" fill="#8B5CF6" name="Products" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No categories yet
              </div>
            )}
          </div>

          {/* User Registration Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Registration Trend</h2>
            {charts.userTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.userTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#EC4899" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available yet
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        {charts.topProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sold" fill="#F59E0B" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm">View All</Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{order.orderId}</p>
                      <p className="text-sm text-gray-500">{order.User?.username || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs. {parseFloat(order.totalAmount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Appointments</h2>
              <Link to="/admin/appointments" className="text-blue-600 hover:underline text-sm">View All</Link>
            </div>
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments yet</p>
              ) : (
                recentAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{apt.deviceType} - {apt.deviceBrand}</p>
                      <p className="text-sm text-gray-500">{apt.User?.username || 'User'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-600' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
