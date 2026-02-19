import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatUnit, getQtyLabel } from '../utils/helpers';

const ProductCard = ({ product }) => {
    const { cart, addToCart, updateQuantity } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const cartItem = cart.items?.find(item =>
        (item.product?._id || item.product) === product._id
    );

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        addToCart(product._id, 1);
    };

    const handleQtyChange = (e, newQty) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem) updateQuantity(cartItem._id, newQty);
    };

    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const emoji = getCategoryEmoji(product.category?.name);

    return (
        <Link to={`/product/${product._id}`} className="product-card fade-in">
            {product.discount > 0 && (
                <div className="product-badge">{product.discount}% OFF</div>
            )}
            <div className="product-image">
                {primaryImage?.url ? (
                    <img
                        src={primaryImage.url.startsWith('http') ? primaryImage.url : `http://localhost:5000${primaryImage.url}`}
                        alt={product.name}
                    />
                ) : (
                    <div className="product-image-placeholder">{emoji}</div>
                )}
            </div>
            <div className="product-info">
                <div className="product-category">{product.category?.name || 'Grocery'}</div>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-unit">{formatUnit(product.unitValue, product.unit)}</div>
                <div className="product-pricing">
                    <span className="product-price">₹{product.price}</span>
                    {product.mrp > product.price && (
                        <span className="product-mrp">₹{product.mrp}</span>
                    )}
                    {product.discount > 0 && (
                        <span className="product-discount">{product.discount}% off</span>
                    )}
                </div>
                {cartItem ? (
                    <div className="qty-controls">
                        <button className="qty-btn" onClick={(e) => handleQtyChange(e, cartItem.quantity - 1)}>
                            <Minus size={16} />
                        </button>
                        <span className="qty-value">{getQtyLabel(cartItem.quantity, product.unit)}</span>
                        <button className="qty-btn" onClick={(e) => handleQtyChange(e, cartItem.quantity + 1)}>
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                )}
            </div>
        </Link>
    );
};

function getCategoryEmoji(category) {
    const map = {
        'Fruits & Vegetables': '🥬',
        'Dairy & Bread': '🥛',
        'Snacks & Beverages': '🍿',
        'Staples': '🌾',
        'Personal Care': '🧴',
        'Cleaning': '🧹',
        'Masala & Spices': '🌶️',
        'Frozen Foods': '🧊'
    };
    return map[category] || '🛒';
}

export default ProductCard;
