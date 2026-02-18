import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Package, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onCartOpen }) => {
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <div className="navbar-logo">K</div>
                    <div>
                        <div className="navbar-title">Krishna Marketing</div>
                        <div className="navbar-subtitle">Grocery Delivery in 20 min</div>
                    </div>
                </Link>

                <form className="navbar-search" onSubmit={handleSearch}>
                    <Search className="navbar-search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search for groceries, fruits, vegetables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to="/orders" className="nav-btn">
                                <Package size={18} />
                                <span>Orders</span>
                            </Link>
                            <Link to="/profile" className="nav-btn">
                                <User size={18} />
                                <span>{user?.name?.split(' ')[0]}</span>
                            </Link>
                            <button className="nav-btn" onClick={logout}>
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-btn nav-btn-login">
                            <User size={16} />
                            Login
                        </Link>
                    )}
                    <button className="nav-btn nav-btn-cart" onClick={onCartOpen}>
                        <ShoppingCart size={18} />
                        <span>Cart</span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
