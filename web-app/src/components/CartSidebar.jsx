import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = ({ isOpen, onClose }) => {
    const { cart, cartTotal, cartCount, updateQuantity, removeItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const deliveryCharge = cartTotal >= 500 ? 0 : 30;
    const total = cartTotal + deliveryCharge - (cart.couponDiscount || 0);

    const handleCheckout = () => {
        onClose();
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/checkout');
        }
    };

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <div className={`cart-sidebar ${isOpen ? 'active' : ''}`}>
                <div className="cart-header">
                    <h3>🛒 My Cart ({cartCount})</h3>
                    <button className="cart-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="cart-items">
                    {cart.items?.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <h4>Your cart is empty</h4>
                            <p>Add some fresh groceries to your cart!</p>
                        </div>
                    ) : (
                        cart.items?.map((item) => (
                            <div key={item._id} className="cart-item">
                                <div className="cart-item-image">
                                    {item.product?.images?.[0] ? (
                                        <img src={item.product.images[0].url} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                    ) : '🛍️'}
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-name">{item.product?.name || 'Product'}</div>
                                    <div className="cart-item-price">₹{(item.variant?.price || item.price) * item.quantity}</div>
                                    <div className="cart-item-controls">
                                        <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                                            <Minus size={14} />
                                        </button>
                                        <span className="cart-item-qty">{item.quantity}</span>
                                        <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                                            <Plus size={14} />
                                        </button>
                                        <button className="cart-remove" onClick={() => removeItem(item._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.items?.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Delivery</span>
                            <span style={{ color: deliveryCharge === 0 ? 'var(--success)' : 'inherit' }}>
                                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                            </span>
                        </div>
                        {cart.couponDiscount > 0 && (
                            <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
                                <span>Coupon Discount</span>
                                <span>-₹{cart.couponDiscount}</span>
                            </div>
                        )}
                        <div className="cart-summary-row total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        {cartTotal < 500 && (
                            <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '8px', textAlign: 'center' }}>
                                Add ₹{(500 - cartTotal).toFixed(0)} more for free delivery!
                            </p>
                        )}
                        <button className="cart-checkout-btn" onClick={handleCheckout}>
                            <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
