import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import CartPopup from './components/CartPopup';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import ProfileLayout from './layouts/ProfileLayout';
import Security from './pages/profile/Security';
import Payments from './pages/profile/Payments';
import Favorites from './pages/profile/Favorites';
import WalletPage from './pages/profile/Wallet';
import Offers from './pages/profile/Offers';
import Notifications from './pages/profile/Notifications';
import Support from './pages/profile/Support';
import SavedAddresses from './pages/profile/SavedAddresses';
import DeliveryLayout from './layouts/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import DeliveryHistory from './pages/delivery/DeliveryHistory';
import PartnerApplication from './pages/PartnerApplication';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

import FestivalBanner from './components/FestivalBanner';

const AppContent = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const isDeliveryRoute = location.pathname.startsWith('/delivery');

  // 1. Prevent everything until Auth is ready
  if (authLoading) {
    return (
      <div className="global-loader-portal">
        <div className="loader-v3"></div>
        <p>Krishna Marketing</p>
      </div>
    );
  }

  // 2. Absolute Redirection for Delivery Agents
  // If logged in as delivery, they CANNOT see the customer site
  if (isAuthenticated && user?.role === 'delivery' && !isDeliveryRoute) {
    return <Navigate to="/delivery" replace />;
  }

  // 3. Absolute Redirection for Customers
  // Customers cannot see the delivery portal
  if (isAuthenticated && !['delivery', 'admin', 'superadmin'].includes(user?.role) && isDeliveryRoute) {
    return <Navigate to="/" replace />;
  }

  // customers are redirected from delivery routes
  if (isDeliveryRoute) {
    return (
      <main className="delivery-portal-wrapper">
        <Routes>
          <Route path="/delivery" element={
            <ProtectedRoute allowedRoles={['delivery', 'admin', 'superadmin']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DeliveryDashboard />} />
            <Route path="orders" element={<DeliveryOrders />} />
            <Route path="history" element={<DeliveryHistory />} />
          </Route>
          <Route path="*" element={<Navigate to="/delivery" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <>
      <FestivalBanner />
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Profile Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Profile />} />
            <Route path="addresses" element={<SavedAddresses />} />
            <Route path="security" element={<Security />} />
            <Route path="payments" element={<Payments />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="offers" element={<Offers />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="support" element={<Support />} />
            <Route path="*" element={<div style={{ padding: '40px', textAlign: 'center' }}>Page Not Found</div>} />
          </Route>

          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/partner-apply" element={<ProtectedRoute><PartnerApplication /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
      <Footer />
      <CartPopup onCartOpen={() => setCartOpen(true)} isCartOpen={cartOpen} />
      <MobileBottomNav />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1A1A2E',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500'
              }
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
