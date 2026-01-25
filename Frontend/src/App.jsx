import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components (not lazy loaded - used on every page)
import Footer from './Component/Footer';
import Navbar from './Component/Navbar';
import { PageLoader } from './Component/Loading';

// Route Protection Components
import { PublicRoute, PrivateRoute, AdminRoute, TechnicianRoute } from './routes';

// Auth Context
import { useAuth } from './contexts/AuthContext';

// ====================================
// Lazy Loaded Pages - Public
// ====================================
const HomePage = lazy(() => import('./Pages/HomePage'));
const ProductCatalog = lazy(() => import('./Pages/ProductCatalog'));
const AboutProduct = lazy(() => import('./Pages/AboutProduct'));
const FAQ = lazy(() => import('./Pages/FAQ'));
const Contact = lazy(() => import('./Pages/Contact'));
const TermsConditions = lazy(() => import('./Pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy'));
const TrackRepair = lazy(() => import('./Pages/TrackRepair'));

// ====================================
// Lazy Loaded Pages - Auth (Public Only)
// ====================================
const SignupPage = lazy(() => import('./Pages/SignupPage'));
const Login = lazy(() => import('./Pages/Login'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/ResetPassword'));
const EmailVerification = lazy(() => import('./Pages/EmailVerification'));

// ====================================
// Lazy Loaded Pages - Protected (Require Login)
// ====================================
const UserProfile = lazy(() => import('./Pages/UserProfile'));
const Cart = lazy(() => import('./Pages/Cart'));
const Checkout = lazy(() => import('./Pages/Checkout'));
const Orders = lazy(() => import('./Pages/Orders'));
const BookRepair = lazy(() => import('./Pages/BookRepair'));
const Support = lazy(() => import('./Pages/Support'));

// ====================================
// Lazy Loaded Pages - Admin Only
// ====================================
const AdminDashboard = lazy(() => import('./Pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./Pages/Admin/AdminUsers'));
const AdminOrders = lazy(() => import('./Pages/Admin/AdminOrders'));
const AdminProducts = lazy(() => import('./Pages/Admin/AdminProducts'));
const AdminAppointments = lazy(() => import('./Pages/Admin/AdminAppointments'));
const AdminTechnicians = lazy(() => import('./Pages/Admin/AdminTechnicians'));
const AdminTickets = lazy(() => import('./Pages/Admin/AdminTickets'));
const AdminFAQs = lazy(() => import('./Pages/Admin/AdminFAQs'));

// ====================================
// Lazy Loaded Pages - Technician
// ====================================
const TechnicianDashboard = lazy(() => import('./Pages/Technician/TechnicianDashboard'));

// ====================================
// Layout Components
// ====================================
const MainLayout = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Technicians should not access the user side - redirect to technician dashboard
  if (!isLoading && user?.role === 'technician') {
    return <Navigate to="/technician" replace />;
  }
  
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

const AdminLayout = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ================================= */}
          {/* Admin Routes - No Navbar/Footer  */}
          {/* ================================= */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminAppointments />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/technicians"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminTechnicians />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminTickets />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminFAQs />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* ================================= */}
          {/* Technician Routes                */}
          {/* ================================= */}
          <Route
            path="/technician"
            element={
              <TechnicianRoute>
                <AdminLayout>
                  <TechnicianDashboard />
                </AdminLayout>
              </TechnicianRoute>
            }
          />

          {/* ================================= */}
          {/* Public Routes - With Layout      */}
          {/* ================================= */}
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/product/:id" element={<AboutProduct />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route 
                    path="/track-repair" 
                    element={
                      <PrivateRoute>
                        <TrackRepair />
                      </PrivateRoute>
                    } 
                  />

                  {/* Auth Pages - Public Only (redirect if logged in) */}
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <SignupPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password/:token"
                    element={
                      <PublicRoute>
                        <ResetPassword />
                      </PublicRoute>
                    }
                  />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/verify-email/:token" element={<EmailVerification />} />

                  {/* Protected Pages - Require Login */}
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <PrivateRoute>
                        <Cart />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute>
                        <Checkout />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <PrivateRoute>
                        <Orders />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/book-repair"
                    element={
                      <PrivateRoute>
                        <BookRepair />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/support"
                    element={
                      <PrivateRoute>
                        <Support />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
