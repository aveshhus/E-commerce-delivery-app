import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminDelivery from './pages/AdminDelivery';
import AdminOffers from './pages/AdminOffers';
import AdminCoupons from './pages/AdminCoupons';
import AdminNotifications from './pages/AdminNotifications';
import AdminLogin from './pages/AdminLogin';

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/delivery': 'Delivery Agents',
  '/offers': 'Offers & Banners',
  '/coupons': 'Coupons',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics & Reports'
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('km_admin_token');
  return token ? children : <Navigate to="/login" />;
};

const AdminLayout = () => {
  const location = useLocation();
  const adminUser = JSON.parse(localStorage.getItem('km_admin_user') || '{}');

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <div className="topbar">
          <h1>{pageTitles[location.pathname] || 'Dashboard'}</h1>
          <div className="topbar-actions">
            <div className="topbar-user">
              <div className="topbar-avatar">{adminUser.name?.charAt(0) || 'A'}</div>
              {adminUser.name || 'Admin'}
            </div>
          </div>
        </div>
        <div className="admin-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/customers" element={<AdminCustomers />} />
            <Route path="/delivery" element={<AdminDelivery />} />
            <Route path="/offers" element={<AdminOffers />} />
            <Route path="/coupons" element={<AdminCoupons />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/analytics" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
      </Routes>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { background: '#1A1A2E', color: '#fff', borderRadius: '12px', padding: '12px 20px', fontSize: '14px' }
      }} />
    </Router>
  );
}

export default App;
