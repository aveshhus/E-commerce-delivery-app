import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatUnit, getQtyLabel } from '../utils/helpers';

const CartSidebar = ({ isOpen, onClose }) => {
    const { cart, cartTotal, cartCount, updateQuantity, removeItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [tipAmount, setTipAmount] = useState(0);
    const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);

    const deliveryCharge = cartTotal >= 500 ? 0 : 30;
    const handlingCharge = 5;
    const total = cartTotal + deliveryCharge + handlingCharge - (cart.couponDiscount || 0);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            onClose();
            navigate('/login');
            return;
        }

        // Show popup if cart total is less than 500
        if (cartTotal < 500) {
            setShowCheckoutPopup(true);
        } else {
            proceedToCheckout();
        }
    };

    const proceedToCheckout = () => {
        setShowCheckoutPopup(false);
        onClose();
        navigate('/checkout');
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

                <div className="cart-content-scroll">
                    {/* Free Delivery Progress */}
                    {cart.items?.length > 0 && (
                        <div style={{ padding: '12px 16px', background: '#e8f5e9', borderBottom: '1px solid #c8e6c9', fontSize: '13px', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {cartTotal >= 500 ? (
                                <>
                                    <span>🎉</span>
                                    <span>You have unlocked <b>Free Delivery</b>!</span>
                                </>
                            ) : (
                                <>
                                    <span>🚚</span>
                                    <span>Add items worth <b>₹{500 - cartTotal}</b> more for Free Delivery</span>
                                </>
                            )}
                        </div>
                    )}

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
                                            <img
                                                src={item.product.images[0].url.startsWith('http') ? item.product.images[0].url : `http://localhost:5000${item.product.images[0].url}`}
                                                alt={item.product?.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        ) : '🛍️'}
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-name">{item.product?.name || 'Product'}</div>
                                        <div className="cart-item-price">₹{(item.variant?.price || item.price) * item.quantity}</div>
                                        <div className="cart-item-controls">
                                            <button className="cart-qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                                                <Minus size={14} />
                                            </button>
                                            <span className="cart-item-qty">{getQtyLabel(item.quantity, item.product?.unit)}</span>
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
                        <>
                            <div className="cart-bill-section">
                                <div className="cart-bill-header">Bill Details</div>
                                <div className="cart-bill-row">
                                    <span>Item Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="cart-bill-row">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                                </div>
                                <div className="cart-bill-row">
                                    <span>Handling Charge</span>
                                    <span>₹5</span>
                                </div>
                                {tipAmount > 0 && (
                                    <div className="cart-bill-row">
                                        <span>Delivery Tip</span>
                                        <span>₹{tipAmount}</span>
                                    </div>
                                )}
                                <div className="cart-bill-row total">
                                    <span>To Pay</span>
                                    <span>₹{total + tipAmount}</span>
                                </div>
                                <div className="cart-savings-strip">
                                    You saved ₹{(cartTotal * 0.1).toFixed(0)} on this order!
                                </div>
                            </div>

                            <div className="cart-tip-section">
                                <div className="cart-tip-header">Tip your delivery partner</div>
                                <div className="cart-tip-options">
                                    {[20, 30, 50].map(amount => (
                                        <button
                                            key={amount}
                                            className={`tip-btn ${tipAmount === amount ? 'active' : ''}`}
                                            onClick={() => setTipAmount(tipAmount === amount ? 0 : amount)}
                                        >
                                            ₹{amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="cart-policy-text">
                                <p>Cancellation Policy</p>
                                <span>Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.</span>
                            </div>

                            {/* Spacer for fixed footer */}
                            <div style={{ height: '100px' }}></div>
                        </>
                    )}
                </div>

                {cart.items?.length > 0 && (
                    <div className="cart-footer-fixed">
                        <button className="cart-checkout-btn" onClick={handleCheckout}>
                            <div className="btn-content">
                                <span>₹{total + tipAmount}</span>
                                <span style={{ fontSize: '10px', opacity: 0.8 }}>TOTAL</span>
                            </div>
                            <div className="btn-action">
                                Proceed to Pay <ChevronRight size={18} />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Popup Logic */}
            {showCheckoutPopup && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1200,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '350px',
                        textAlign: 'center', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎁</div>
                        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Unlock Free Delivery!</h3>
                        <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
                            You're only <b>₹{500 - cartTotal}</b> away from <b>Free Delivery</b>. Add a few more goodies to save on shipping!
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => setShowCheckoutPopup(false)}
                            >
                                Add More Items
                            </button>
                            <button
                                style={{
                                    width: '100%', padding: '12px', background: 'transparent', border: 'none',
                                    color: '#666', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                                }}
                                onClick={proceedToCheckout}
                            >
                                Continue with Delivery Fee
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartSidebar;
