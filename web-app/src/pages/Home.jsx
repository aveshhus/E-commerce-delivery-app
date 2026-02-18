import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Zap, Shield, Clock, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productAPI, publicAPI } from '../services/api';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [popular, setPopular] = useState([]);
    const [bannerIndex, setBannerIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const bannerRef = useRef(null);
    const navigate = useNavigate();

    const banners = [
        { cls: 'banner-1', tag: '🎉 Festival Offer', heading: 'Fresh Vegetables at 20% Off!', desc: 'Farm-fresh vegetables delivered to your doorstep', emoji: '🥬' },
        { cls: 'banner-2', tag: '⚡ Lightning Deal', heading: 'Free Delivery Above ₹500', desc: 'No delivery charges on bulk orders', emoji: '🚚' },
        { cls: 'banner-3', tag: '🥛 Dairy Special', heading: '₹50 Off on Dairy Products', desc: 'Stock up on milk, cheese, butter and more', emoji: '🧀' }
    ];

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => {
            setBannerIndex(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (bannerRef.current) {
            bannerRef.current.scrollTo({ left: bannerIndex * bannerRef.current.offsetWidth, behavior: 'smooth' });
        }
    }, [bannerIndex]);

    const fetchData = async () => {
        try {
            const [catRes, featRes, popRes] = await Promise.all([
                productAPI.getCategories(),
                productAPI.getFeatured(),
                productAPI.getPopular()
            ]);
            if (catRes.success) setCategories(catRes.data.categories);
            if (featRes.success) setFeatured(featRes.data.products);
            if (popRes.success) setPopular(popRes.data.products);
        } catch (err) {
            console.error('Data load error:', err);
            // Use demo data if API is not running
            setCategories([
                { _id: '1', name: 'Fruits & Vegetables', icon: '🥬' },
                { _id: '2', name: 'Dairy & Bread', icon: '🥛' },
                { _id: '3', name: 'Snacks & Beverages', icon: '🍿' },
                { _id: '4', name: 'Staples', icon: '🌾' },
                { _id: '5', name: 'Personal Care', icon: '🧴' },
                { _id: '6', name: 'Cleaning', icon: '🧹' },
                { _id: '7', name: 'Masala & Spices', icon: '🌶️' },
                { _id: '8', name: 'Frozen Foods', icon: '🧊' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Banner Slider */}
            <section className="hero-section">
                <div className="banner-slider" ref={bannerRef}>
                    {banners.map((b, i) => (
                        <div key={i} className={`banner-card ${b.cls}`}>
                            <div className="banner-content">
                                <span className="banner-tag">{b.tag}</span>
                                <h2 className="banner-heading">{b.heading}</h2>
                                <p className="banner-desc">{b.desc}</p>
                                <button className="banner-btn" onClick={() => navigate('/products')}>
                                    Shop Now →
                                </button>
                            </div>
                            <span className="banner-emoji">{b.emoji}</span>
                        </div>
                    ))}
                </div>
                <div className="banner-dots">
                    {banners.map((_, i) => (
                        <div key={i} className={`banner-dot ${i === bannerIndex ? 'active' : ''}`} onClick={() => setBannerIndex(i)} />
                    ))}
                </div>
            </section>

            {/* Delivery Info Strip */}
            <div className="delivery-strip">
                <div className="delivery-card">
                    <div className="delivery-icon green"><Clock size={24} color="#1B5E20" /></div>
                    <div>
                        <h4>20 Min Delivery</h4>
                        <p>Within 4KM radius</p>
                    </div>
                </div>
                <div className="delivery-card">
                    <div className="delivery-icon orange"><Shield size={24} color="#E65100" /></div>
                    <div>
                        <h4>100% Fresh</h4>
                        <p>Quality guaranteed</p>
                    </div>
                </div>
                <div className="delivery-card">
                    <div className="delivery-icon blue"><Zap size={24} color="#1565C0" /></div>
                    <div>
                        <h4>Best Prices</h4>
                        <p>Lowest market prices</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Shop by Category</h2>
                    <Link to="/products" className="section-link">View All <ChevronRight size={16} /></Link>
                </div>
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div key={cat._id} className="category-card" onClick={() => navigate(`/products?category=${cat._id}`)}>
                            <span className="category-icon">{cat.icon || '🛒'}</span>
                            <h3 className="category-name">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            {featured.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">⭐ Featured Products</h2>
                        <Link to="/products?featured=true" className="section-link">View All <ChevronRight size={16} /></Link>
                    </div>
                    <div className="products-grid">
                        {featured.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* Popular Products */}
            {popular.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">🔥 Popular Right Now</h2>
                        <Link to="/products?popular=true" className="section-link">View All <ChevronRight size={16} /></Link>
                    </div>
                    <div className="products-grid">
                        {popular.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* Demo products when API is not connected */}
            {featured.length === 0 && popular.length === 0 && !loading && (
                <section className="section">
                    <div className="section-header">
                        <h2 className="section-title">🛒 Our Products</h2>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</p>
                        <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Connect your backend to see products</h3>
                        <p>Start MongoDB and run <code style={{ background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px' }}>npm run seed</code> then <code style={{ background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px' }}>npm run dev</code> in the backend folder</p>
                    </div>
                </section>
            )}

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default Home;
