import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';

const Favorites = () => {
    // Professional empty state - no mocked data
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await userAPI.getFavorites();
                if (res.success) {
                    setFavorites(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">My Favorites</h2>

            {favorites.length === 0 ? (
                <div className="profile-empty-state">
                    <div className="empty-icon-container" style={{ background: '#ffebee', color: '#e53935' }}>
                        <Heart size={32} />
                    </div>
                    <h3 className="empty-title">Your wishlist is empty</h3>
                    <p className="empty-desc">
                        Seems like you haven't saved any items yet. Browse our categories and heart items you love!
                    </p>
                    <Link to="/products" className="primary-btn">
                        <ShoppingBag size={18} />
                        Start Shopping
                        <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Render favorites if they exist */}
                    {favorites.map(item => (
                        <div key={item.id} className="favorite-card">
                            {/* Card content */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
