import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

import FestivalBanner from './components/FestivalBanner';

const AppContent = () => {
  const [cartOpen, setCartOpen] = useState(false);

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
