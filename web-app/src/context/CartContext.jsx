import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], couponDiscount: 0 });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ items: [], couponDiscount: 0 });
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await cartAPI.getCart();
            if (res.success) setCart(res.data.cart);
        } catch (err) {
            console.error('Fetch cart error:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1, variant = null) => {
        try {
            const res = await cartAPI.addToCart({ productId, quantity, variant });
            if (res.success) {
                setCart(res.data.cart);
                toast.success('Added to cart!');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to add to cart');
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            const res = await cartAPI.updateItem(itemId, { quantity });
            if (res.success) setCart(res.data.cart);
        } catch (err) {
            toast.error(err.message || 'Failed to update');
        }
    };

    const removeItem = async (itemId) => {
        try {
            const res = await cartAPI.removeItem(itemId);
            if (res.success) {
                setCart(res.data.cart);
                toast.success('Item removed');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to remove');
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clearCart();
            setCart({ items: [], couponDiscount: 0 });
        } catch (err) {
            toast.error('Failed to clear cart');
        }
    };

    const applyCoupon = async (code) => {
        try {
            const res = await cartAPI.applyCoupon({ code });
            if (res.success) {
                setCart(res.data.cart);
                toast.success(res.message);
                return true;
            }
        } catch (err) {
            toast.error(err.message || 'Invalid coupon');
            return false;
        }
    };

    const removeCoupon = async () => {
        try {
            await cartAPI.removeCoupon();
            fetchCart();
            toast.success('Coupon removed');
        } catch (err) {
            toast.error('Failed to remove coupon');
        }
    };

    const cartTotal = cart.items?.reduce((sum, item) => {
        const price = item.variant?.price || item.price;
        return sum + price * item.quantity;
    }, 0) || 0;

    const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart, loading, cartTotal, cartCount,
            addToCart, updateQuantity, removeItem, clearCart,
            applyCoupon, removeCoupon, fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
