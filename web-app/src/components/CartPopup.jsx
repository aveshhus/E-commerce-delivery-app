import { useEffect, useState, useRef } from 'react';
import { ShoppingCart, ChevronRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';

const CartPopup = ({ onCartOpen, isCartOpen }) => {
    const { cartCount, cartTotal, cart } = useCart();
    const [visible, setVisible] = useState(false);
    const [animate, setAnimate] = useState(false);
    const prevCount = useRef(cartCount);
    const location = useLocation();

    // Hide on checkout page or when cart sidebar is open
    const isCheckout = location.pathname === '/checkout';

    useEffect(() => {
        if (cartCount > 0 && !isCheckout && !isCartOpen) {
            setVisible(true);
        } else {
            setVisible(false);
        }

        // Trigger bounce animation when count increases
        if (cartCount > prevCount.current) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 600);
            prevCount.current = cartCount;
            return () => clearTimeout(timer);
        }
        prevCount.current = cartCount;
    }, [cartCount, isCheckout, isCartOpen]);

    if (!visible) return null;

    const lastItem = cart.items?.[cart.items.length - 1];
    const lastItemName = lastItem?.product?.name || lastItem?.name || 'Item';

    return (
        <div className={`cart-popup ${animate ? 'cart-popup-bounce' : ''}`}>
            <div className="cart-popup-inner">
                <div className="cart-popup-left">
                    <div className="cart-popup-icon">
                        <ShoppingCart size={20} />
                        <span className="cart-popup-count">{cartCount}</span>
                    </div>
                    <div className="cart-popup-info">
                        <span className="cart-popup-items">
                            {cartCount} item{cartCount > 1 ? 's' : ''} added
                        </span>
                        <span className="cart-popup-added">
                            {lastItemName.length > 28
                                ? lastItemName.substring(0, 28) + '...'
                                : lastItemName}
                        </span>
                    </div>
                </div>
                <button className="cart-popup-btn" onClick={onCartOpen}>
                    <span>View Cart</span>
                    <span className="cart-popup-total">₹{cartTotal.toFixed(0)}</span>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default CartPopup;
