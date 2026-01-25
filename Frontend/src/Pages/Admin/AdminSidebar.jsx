import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaChartLine, FaUsers, FaShoppingCart, FaBox, 
  FaTools, FaUserCog, FaTicketAlt, FaHome, 
  FaSignOutAlt, FaBars, FaTimes, FaQuestionCircle
} from "react-icons/fa";
import logo from "../../assets/Images/logo.png";
import { useAuth } from "../../contexts/AuthContext";

const AdminSidebar = ({ active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
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
    { name: "FAQs", icon: FaQuestionCircle, path: "/admin/faqs" },
  ];

  const isActive = (item) => {
    return active === item.name || location.pathname === item.path;
  };

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 fixed h-full z-50 shadow-2xl`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <img src={logo} alt="ElectroByte" className="w-8 h-8 rounded-full object-cover" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ElectroByte
            </h1>
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700/50 rounded-lg transition-all">
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 my-1 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 ${
              isActive(item) ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-l-4 border-blue-500' : ''
            }`}
          >
            <item.icon className={`text-lg ${isActive(item) ? 'text-blue-400' : 'text-gray-400'}`} />
            {sidebarOpen && <span className="font-medium">{item.name}</span>}
          </Link>
        ))}
        
        <div className="border-t border-gray-700/50 mt-6 pt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 my-1 rounded-xl hover:bg-gray-700/50 transition-all">
            <FaHome className="text-lg text-green-400" />
            {sidebarOpen && <span>Back to Site</span>}
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 my-1 rounded-xl hover:bg-red-600/20 transition-all w-full text-left text-red-400"
          >
            <FaSignOutAlt className="text-lg" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
