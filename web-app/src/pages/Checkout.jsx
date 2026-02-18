import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, cartTotal, applyCoupon, removeCoupon, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [couponCode, setCouponCode] = useState('');
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: ''
    });

    const deliveryCharge = cartTotal >= 500 ? 0 : 30;
    const loyaltyDiscount = loyaltyPoints / 10;
    const total = Math.max(0, cartTotal + deliveryCharge - (cart.couponDiscount || 0) - loyaltyDiscount);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await addressAPI.getAddresses();
            if (res.success) {
                setAddresses(res.data.addresses);
                const defaultAddr = res.data.addresses.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr._id);
                else if (res.data.addresses.length > 0) setSelectedAddress(res.data.addresses[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await addressAPI.addAddress(newAddress);
            if (res.success) {
                toast.success('Address added');
                fetchAddresses();
                setShowAddAddress(false);
                setSelectedAddress(res.data.address._id);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to add address');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }
        setLoading(true);
        try {
            const res = await orderAPI.createOrder({
                addressId: selectedAddress,
                paymentMethod,
                loyaltyPointsToUse: loyaltyPoints
            });
            if (res.success) {
                toast.success('Order placed successfully! 🎉');
                fetchCart();
                navigate('/orders');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page fade-in">
            <div>
                {/* Delivery Address */}
                <div className="checkout-section">
                    <h3><MapPin size={20} /> Delivery Address</h3>
                    {addresses.map(addr => (
                        <div
                            key={addr._id}
                            className={`address-option ${selectedAddress === addr._id ? 'selected' : ''}`}
                            onClick={() => setSelectedAddress(addr._id)}
                        >
                            <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '13px', marginBottom: '4px' }}>
                                {addr.label} {addr.isDefault && <span style={{ color: 'var(--primary)' }}>• Default</span>}
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{addr.fullName} — {addr.addressLine1}, {addr.city} - {addr.pincode}</p>
                        </div>
                    ))}
                    {!showAddAddress ? (
                        <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={() => setShowAddAddress(true)}>
                            + Add New Address
                        </button>
                    ) : (
                        <form onSubmit={handleAddAddress} style={{ marginTop: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><input className="form-input" placeholder="Full Name" required value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} /></div>
                                <div className="form-group"><input className="form-input" placeholder="Phone" required value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><input className="form-input" placeholder="Address Line 1" required value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} /></div>
                            <div className="form-group"><input className="form-input" placeholder="Address Line 2" value={newAddress.addressLine2} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><input className="form-input" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} /></div>
                                <div className="form-group"><input className="form-input" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} /></div>
                                <div className="form-group"><input className="form-input" placeholder="Pincode" required value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Address</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddAddress(false)}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Payment Method */}
                <div className="checkout-section">
                    <h3><CreditCard size={20} /> Payment Method</h3>
                    {[
                        { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={20} />, desc: 'Pay when order arrives' },
                        { id: 'razorpay', label: 'Pay Online (Razorpay)', icon: <CreditCard size={20} />, desc: 'UPI, Cards, Net Banking' },
                        { id: 'stripe', label: 'Pay with Card (Stripe)', icon: <CreditCard size={20} />, desc: 'Credit & Debit Cards' }
                    ].map(opt => (
                        <div
                            key={opt.id}
                            className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod(opt.id)}
                        >
                            <div className="payment-radio" />
                            <span style={{ color: 'var(--primary)' }}>{opt.icon}</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{opt.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div>
                <div className="order-summary-card">
                    <h3 style={{ marginBottom: '20px' }}>🛒 Order Summary</h3>
                    {cart.items?.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.product?.name || 'Product'} × {item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>₹{((item.variant?.price || item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}

                    <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                        <div className="cart-summary-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                        <div className="cart-summary-row">
                            <span>Delivery</span>
                            <span style={{ color: deliveryCharge === 0 ? 'var(--success)' : '' }}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                        </div>
                        {cart.couponDiscount > 0 && (
                            <div className="cart-summary-row" style={{ color: 'var(--success)' }}><span>Coupon</span><span>-₹{cart.couponDiscount}</span></div>
                        )}
                        {loyaltyDiscount > 0 && (
                            <div className="cart-summary-row" style={{ color: 'var(--success)' }}><span>Loyalty Points</span><span>-₹{loyaltyDiscount.toFixed(2)}</span></div>
                        )}
                        <div className="cart-summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                    </div>

                    {/* Coupon */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <input
                            className="form-input"
                            placeholder="Coupon code"
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }}
                        />
                        <button
                            className="btn btn-outline"
                            style={{ width: 'auto', padding: '10px 16px', fontSize: '13px' }}
                            onClick={() => applyCoupon(couponCode)}
                        >
                            Apply
                        </button>
                    </div>

                    {/* Loyalty Points */}
                    {(user?.loyaltyPoints || 0) > 0 && (
                        <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                                Use Loyalty Points (Available: {user.loyaltyPoints})
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={user.loyaltyPoints}
                                step={10}
                                value={loyaltyPoints}
                                onChange={e => setLoyaltyPoints(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Using {loyaltyPoints} points (₹{(loyaltyPoints / 10).toFixed(0)} off)</p>
                        </div>
                    )}

                    <button className="cart-checkout-btn" onClick={handlePlaceOrder} disabled={loading}>
                        {loading ? 'Placing Order...' : `Place Order — ₹${total.toFixed(2)}`}
                    </button>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                        <Truck size={14} style={{ verticalAlign: 'middle' }} /> Estimated delivery: 20 minutes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
