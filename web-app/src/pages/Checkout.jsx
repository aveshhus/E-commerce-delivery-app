import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Truck, Tag, ChevronRight, Info, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, cartTotal, applyCoupon, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [couponCode, setCouponCode] = useState('');
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [deliveryNote, setDeliveryNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'home', fullName: '', phone: '', alternatePhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: ''
    });

    const deliveryCharge = cartTotal >= 500 ? 0 : 30;
    const handlingFee = 5;
    const loyaltyDiscount = loyaltyPoints / 10;
    const total = Math.max(0, cartTotal + deliveryCharge + handlingFee - (cart.couponDiscount || 0) - loyaltyDiscount);

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
        } catch (err) { console.error(err); }
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
        } catch (err) { toast.error(err.message || 'Failed to add address'); }
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
                loyaltyPointsToUse: loyaltyPoints,
                notes: deliveryNote
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

    const instructionOptions = [
        "Don't ring bell", "Leave at the door", "Leave with security", "Call before delivery"
    ];

    return (
        <div className="checkout-page fade-in">
            <div className="checkout-main">
                {/* 1. Address Selection */}
                <div className="premium-card">
                    <div className="card-header">
                        <div className="h-left">
                            <MapPin size={22} className="h-icon" />
                            <h3>Delivery Address</h3>
                        </div>
                        {!showAddAddress && (
                            <button className="text-btn" onClick={() => setShowAddAddress(true)}>+ Add New</button>
                        )}
                    </div>

                    {!showAddAddress ? (
                        <div className="address-scroll">
                            {addresses.map(addr => (
                                <div
                                    key={addr._id}
                                    className={`address-item ${selectedAddress === addr._id ? 'active' : ''}`}
                                    onClick={() => setSelectedAddress(addr._id)}
                                >
                                    <div className="addr-top">
                                        <span className="label">{addr.label}</span>
                                        {selectedAddress === addr._id && <div className="selected-check" />}
                                    </div>
                                    <p className="name">{addr.fullName}</p>
                                    <p className="desc">{addr.addressLine1}, {addr.city}</p>
                                    <p className="phone">{addr.phone}</p>
                                </div>
                            ))}
                            {addresses.length === 0 && <p className="empty-text">No addresses found. Add one to continue.</p>}
                        </div>
                    ) : (
                        <form onSubmit={handleAddAddress} className="add-addr-form">
                            <div className="form-grid">
                                <input className="p-input full" placeholder="Full Name (e.g. John Doe)" required value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                                <div className="split">
                                    <input className="p-input" placeholder="Primary Phone" required value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                    <input className="p-input" placeholder="Alternate Phone (Optional)" value={newAddress.alternatePhone} onChange={e => setNewAddress({ ...newAddress, alternatePhone: e.target.value })} />
                                </div>
                                <input className="p-input full" placeholder="Flat No. / House No. / Building Name" required value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} />
                                <input className="p-input full" placeholder="Street / Area / Colony Name" value={newAddress.addressLine2} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                                <input className="p-input full" placeholder="Landmark (Optional e.g. Near Big Bazaar)" value={newAddress.landmark} onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })} />
                                <div className="split">
                                    <input className="p-input" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                    <input className="p-input" placeholder="Pincode" required value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                                </div>
                                <div className="label-selector">
                                    <p>Address Type:</p>
                                    <div className="label-chips">
                                        {['home', 'work', 'other'].map(l => (
                                            <button
                                                key={l}
                                                type="button"
                                                className={`l-chip ${newAddress.label === l ? 'active' : ''}`}
                                                onClick={() => setNewAddress({ ...newAddress, label: l })}
                                            >
                                                {l.charAt(0).toUpperCase() + l.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="p-btn-save">Save & Use</button>
                                <button type="button" className="p-btn-cancel" onClick={() => setShowAddAddress(false)}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* 2. Delivery Instructions */}
                <div className="premium-card">
                    <div className="card-header">
                        <MessageSquare size={22} className="h-icon" />
                        <h3>Delivery Instructions</h3>
                    </div>
                    <div className="instruction-chips">
                        {instructionOptions.map(opt => (
                            <button
                                key={opt}
                                className={`chip ${deliveryNote === opt ? 'active' : ''}`}
                                onClick={() => setDeliveryNote(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="note-area"
                        placeholder="Any other instructions for the delivery partner?"
                        value={deliveryNote}
                        onChange={e => setDeliveryNote(e.target.value)}
                    />
                </div>

                {/* 3. Payment Method */}
                <div className="premium-card">
                    <div className="card-header">
                        <CreditCard size={22} className="h-icon" />
                        <h3>Payment Method</h3>
                    </div>
                    <div className="payment-stack">
                        {[
                            { id: 'cod', label: 'Cash on Delivery', icon: <Banknote color="#10b981" /> },
                            { id: 'razorpay', label: 'Online Payment (UPI/Cards)', icon: <div className="razorpay-dot" /> }
                        ].map(m => (
                            <div
                                key={m.id}
                                className={`pay-option ${paymentMethod === m.id ? 'active' : ''}`}
                                onClick={() => setPaymentMethod(m.id)}
                            >
                                <div className="p-icon">{m.icon}</div>
                                <span className="p-label">{m.label}</span>
                                <div className="p-radio" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="checkout-sidebar">
                <div className="bill-card">
                    <h3>Bill Summary</h3>
                    <div className="bill-items">
                        {cart.items?.map(item => (
                            <div key={item._id} className="bill-item">
                                <span className="item-qty">{item.quantity}x</span>
                                <span className="item-name">{item.product?.name}</span>
                                <span className="item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bill-divider"></div>

                    <div className="bill-math">
                        <div className="row"><span>Item Total</span><span>₹{cartTotal.toFixed(0)}</span></div>
                        <div className="row"><span>Handling Fee</span><span>₹{handlingFee}</span></div>
                        <div className="row">
                            <span>Delivery Fee</span>
                            <span className={deliveryCharge === 0 ? 'free' : ''}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                        </div>
                        {cart.couponDiscount > 0 && (
                            <div className="row discount"><span>Coupon Savings</span><span>-₹{cart.couponDiscount}</span></div>
                        )}
                        {loyaltyPoints > 0 && (
                            <div className="row discount"><span>Loyalty Discount</span><span>-₹{(loyaltyPoints / 10).toFixed(0)}</span></div>
                        )}
                        <div className="row total"><span>Grand Total</span><span>₹{total.toFixed(0)}</span></div>
                    </div>

                    {/* Coupons and Loyalty */}
                    <div className="loyalty-box">
                        <div className="box-h"><Tag size={16} /> <span>Offers & Points</span></div>
                        <div className="coupon-mini">
                            <input placeholder="Coupon Code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                            <button onClick={() => applyCoupon(couponCode)}>Apply</button>
                        </div>
                        {(user?.loyaltyPoints || 0) > 0 && (
                            <div className="loyalty-usage">
                                <input type="checkbox" onChange={(e) => setLoyaltyPoints(e.target.checked ? Math.min(user.loyaltyPoints, 500) : 0)} />
                                <span>Use Loyalty Points ({user.loyaltyPoints})</span>
                            </div>
                        )}
                    </div>

                    <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
                        {loading ? 'Processing...' : `Place Order • ₹${total.toFixed(0)}`}
                    </button>

                    <p className="safety-note">
                        <Info size={12} /> Ensuring 100% safe & contactless delivery
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .checkout-page {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px 0;
                }
                @media (max-width: 992px) {
                    .checkout-page { grid-template-columns: 1fr; }
                    .checkout-sidebar { position: static !important; }
                }

                .premium-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    border: 1px solid #f1f1f1;
                }
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .h-left { display: flex; align-items: center; gap: 12px; }
                .h-icon { color: var(--primary); }
                .card-header h3 { font-size: 18px; font-weight: 800; margin: 0; }
                .text-btn { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; font-size: 14px; }

                .address-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px; }
                .address-item {
                    min-width: 200px;
                    background: #f9fafb;
                    border: 2px solid transparent;
                    border-radius: 16px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }
                .address-item.active { border-color: var(--primary); background: #fff; box-shadow: 0 4px 8px rgba(255, 78, 12, 0.05); }
                .addr-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .addr-top .label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #9ca3af; }
                .selected-check { width: 12px; height: 12px; background: var(--primary); border-radius: 50%; }
                .address-item .name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
                .address-item .desc { font-size: 12px; color: #6b7280; line-height: 1.4; }
                .address-item .phone { font-size: 11px; margin-top: 8px; color: #9ca3af; font-weight: 600; }

                .instruction-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
                .chip {
                    padding: 8px 16px;
                    border-radius: 10px;
                    background: #f3f4f6;
                    border: 1px solid transparent;
                    font-size: 13px;
                    font-weight: 600;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .chip.active { background: #fff; border-color: var(--primary); color: var(--primary); }
                .note-area {
                    width: 100%;
                    min-height: 80px;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    background: #f9fafb;
                    font-size: 14px;
                    resize: none;
                }

                .pay-option {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border: 1px solid #f1f1f1;
                    border-radius: 16px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pay-option.active { border-color: var(--primary); background: #fff; }
                .p-label { font-size: 15px; font-weight: 600; flex: 1; }
                .p-radio { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-radius: 50%; position: relative; }
                .pay-option.active .p-radio { border-color: var(--primary); }
                .pay-option.active .p-radio::after {
                    content: '';
                    position: absolute;
                    top: 3px; left: 3px;
                    width: 10px; height: 10px;
                    background: var(--primary);
                    border-radius: 50%;
                }

                .checkout-sidebar { position: sticky; top: 100px; height: fit-content; }
                .bill-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    border: 1px solid #f1f1f1;
                }
                .bill-card h3 { font-size: 16px; font-weight: 800; margin-bottom: 20px; }
                .bill-item { display: flex; gap: 12px; margin-bottom: 12px; font-size: 14px; color: #4b5563; }
                .item-qty { font-weight: 700; color: var(--primary); }
                .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .item-price { font-weight: 700; color: #111827; }

                .bill-divider { margin: 20px 0; border-top: 1px solid #f1f1f1; }
                .bill-math .row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: #6b7280; }
                .bill-math .row.total { margin-top: 20px; padding-top: 20px; border-top: 2px dashed #f1f1f1; font-size: 18px; font-weight: 900; color: #111827; }
                .bill-math .row.discount { color: #10b981; font-weight: 600; }
                .free { color: #10b981; font-weight: 700; }

                .loyalty-box { background: #f9fafb; border-radius: 16px; padding: 16px; margin: 24px 0; }
                .box-h { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; margin-bottom: 12px; }
                .coupon-mini { display: flex; gap: 8px; margin-bottom: 12px; }
                .coupon-mini input { flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; }
                .coupon-mini button { background: var(--primary); color: #fff; border: none; padding: 0 12px; border-radius: 8px; font-weight: 700; font-size: 12px; }
                .loyalty-usage { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #4b5563; }

                .place-order-btn {
                    width: 100%;
                    padding: 16px;
                    border-radius: 16px;
                    background: var(--primary);
                    color: #fff;
                    border: none;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 78, 12, 0.3);
                    transition: transform 0.2s;
                }
                .place-order-btn:active { transform: scale(0.98); }
                .place-order-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .safety-note { text-align: center; margin-top: 16px; font-size: 11px; color: #9ca3af; display: flex; align-items: center; justify-content: center; gap: 4px; }
            ` }} />
        </div>
    );
};

export default Checkout;

