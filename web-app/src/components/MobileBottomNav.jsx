import { Home, Grid, ShoppingBag, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
    const { cartCount } = useCart();

    return (
        <div className="mobile-bottom-nav">
            <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Grid size={24} />
                <span>Categories</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={24} />
                <span>Orders</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <User size={24} />
                <span>Account</span>
            </NavLink>
        </div>
    );
};

export default MobileBottomNav;
