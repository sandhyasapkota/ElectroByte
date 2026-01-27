import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUsers, FaShoppingCart, FaTools, FaTicketAlt, 
  FaChartLine, FaBox, FaUserCog, FaDollarSign,
  FaArrowUp, FaArrowDown, FaCalendarAlt, FaClock
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { getUser } from "../../lib/storage";
import AdminSidebar from "./AdminSidebar";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Gradient definitions for cards
const gradients = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600',
  cyan: 'from-cyan-500 to-cyan-600',
  indigo: 'from-indigo-500 to-indigo-600'
};

const AdminDashboard = () => {
  const navigate = useNavigate();
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
    const isAdmin = checkAdminAccess();
    if (isAdmin) fetchDashboardData();
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      console.log('Dashboard response:', response);
      console.log('Recent orders:', response.data?.recentOrders);
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

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, link, trend }) => (
    <Link to={link || "#"} className="block group">
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white opacity-10"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {subtitle && (
              <p className="text-xs text-white/70 mt-2 flex items-center gap-1">
                <FaClock className="text-xs" />
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
                {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                <span>{Math.abs(trend)}% from last month</span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all">
            <Icon className="text-3xl" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <AdminSidebar active="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Stats Grid - All same size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={FaUsers} 
            gradient={gradients.blue}
            link="/admin/users"
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={FaShoppingCart} 
            gradient={gradients.green}
            subtitle={`${stats.pendingOrders} pending`}
            link="/admin/orders"
          />
          <StatCard 
            title="Products" 
            value={stats.totalProducts} 
            icon={FaBox} 
            gradient={gradients.orange}
            link="/admin/products"
          />
          <StatCard 
            title="Revenue" 
            value={`Rs. ${stats.totalRevenue?.toLocaleString() || 0}`} 
            icon={FaDollarSign} 
            gradient={gradients.purple}
          />
          <StatCard 
            title="Appointments" 
            value={stats.totalAppointments} 
            icon={FaTools} 
            gradient={gradients.pink}
            subtitle={`${stats.pendingAppointments} pending`}
            link="/admin/appointments"
          />
          <StatCard 
            title="Open Tickets" 
            value={stats.openTickets || 0} 
            icon={FaTicketAlt} 
            gradient={gradients.red}
            link="/admin/tickets"
          />
          <StatCard 
            title="Growth" 
            value={`+${((stats.totalOrders / (stats.totalUsers || 1)) * 10).toFixed(1)}%`} 
            icon={FaChartLine} 
            gradient={gradients.cyan}
          />
          <StatCard 
            title="Technicians" 
            value={stats.totalTechnicians || 0} 
            icon={FaUserCog} 
            gradient={gradients.indigo}
            link="/admin/technicians"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Orders Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Monthly Revenue & Orders</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Orders
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Revenue
                </span>
              </div>
            </div>
            {charts.monthlyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.monthlyOrders}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]} 
                  />
                  <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} fill="url(#colorOrders)" name="Orders" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                <FaChartLine className="text-5xl mb-3 opacity-50" />
                <p>No data available yet</p>
              </div>
            )}
          </div>

          {/* Order Status Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status Distribution</h2>
            {charts.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.ordersByStatus} barRadius={[8, 8, 0, 0]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" name="Orders" radius={[8, 8, 0, 0]}>
                    {charts.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                <FaShoppingCart className="text-5xl mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Products by Category */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Products by Category</h2>
            {charts.productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.productsByCategory} layout="vertical" barRadius={[0, 8, 8, 0]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="products" fill="url(#purpleGradient)" name="Products" radius={[0, 8, 8, 0]}>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                <FaBox className="text-5xl mb-3 opacity-50" />
                <p>No categories yet</p>
              </div>
            )}
          </div>

          {/* User Registration Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">User Registration Trend</h2>
            {charts.userTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.userTrend}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#EC4899" strokeWidth={3} fill="url(#colorUsers)" name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                <FaUsers className="text-5xl mb-3 opacity-50" />
                <p>No data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        {charts.topProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Top Selling Products</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.topProducts} barRadius={[8, 8, 0, 0]}>
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="sold" fill="url(#orangeGradient)" name="Units Sold" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
              <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-gray-400 text-center py-8 flex flex-col items-center">
                  <FaShoppingCart className="text-4xl mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {order.User?.username?.charAt(0)?.toUpperCase() || order.orderId?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{order.User?.username || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{order.User?.email || order.orderId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">Rs. {parseFloat(order.totalAmount).toLocaleString()}</p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
              <Link to="/admin/appointments" className="text-pink-600 hover:text-pink-700 text-sm font-medium px-4 py-2 bg-pink-50 rounded-lg hover:bg-pink-100 transition-all">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <div className="text-gray-400 text-center py-8 flex flex-col items-center">
                  <FaTools className="text-4xl mb-3 opacity-50" />
                  <p>No appointments yet</p>
                </div>
              ) : (
                recentAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white">
                        <FaTools />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{apt.User?.username || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{apt.User?.email || `${apt.deviceType} - ${apt.deviceBrand}`}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                        <FaCalendarAlt className="text-xs" />
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-600' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)}
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
