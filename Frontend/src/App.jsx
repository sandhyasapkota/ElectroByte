import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './Component/Footer';
import Navbar from './Component/Navbar';
import HomePage from './Pages/HomePage';
import ProductCatalog from './Pages/ProductCatalog';
import SignupPage from './Pages/SignupPage';
import Login from './Pages/Login';
import UserProfile from './Pages/UserProfile';
import FAQ from './Pages/FAQ';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import Orders from './Pages/Orders';
import BookRepair from './Pages/BookRepair';
import Contact from './Pages/Contact';
import TermsConditions from './Pages/TermsConditions';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import ForgotPassword from './Pages/ForgotPassword';
import AboutProduct from './Pages/AboutProduct';
import EmailVerification from './Pages/EmailVerification';
import Support from './Pages/Support';

// Admin Pages
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminUsers from './Pages/Admin/AdminUsers';
import AdminOrders from './Pages/Admin/AdminOrders';
import AdminProducts from './Pages/Admin/AdminProducts';
import AdminAppointments from './Pages/Admin/AdminAppointments';
import AdminTechnicians from './Pages/Admin/AdminTechnicians';
import AdminTickets from './Pages/Admin/AdminTickets';
import AdminFAQs from './Pages/Admin/AdminFAQs';

// Technician Pages
import TechnicianDashboard from './Pages/Technician/TechnicianDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - No Navbar/Footer */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/technicians" element={<AdminTechnicians />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/faqs" element={<AdminFAQs />} />
        
        {/* Technician Routes */}
        <Route path="/technician" element={<TechnicianDashboard />} />
        
        {/* Public Routes - With Navbar/Footer */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main className="pt-16 min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/verify-email/:token" element={<EmailVerification />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/product/:id" element={<AboutProduct />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/book-repair" element={<BookRepair />} />
                <Route path="/support" element={<Support />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
