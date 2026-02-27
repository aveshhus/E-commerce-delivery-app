import React, { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPackage, FiCheckCircle, FiChevronRight, FiMapPin, FiTruck, FiNavigation, FiX } from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryOrders.css';

const DeliveryOrders = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        fetchActiveOrder();
    }, []);

    const fetchActiveOrder = async () => {
        try {
            const res = await deliveryService.getCurrentDelivery();
            if (res.success) {
                setOrder(res.data.order);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 3) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleUpdateStatus = async (status, deliveryOtp = null) => {
        try {
            setActionLoading(true);
            const res = await deliveryService.updateStatus(order._id, status, '', deliveryOtp);
            if (res.success) {
                toast.success(`Order marked as ${status.replace('_', ' ')}`);
                if (status === 'delivered') {
                    setOrder(null);
                    setShowOTPModal(false);
                    setOtp(['', '', '', '']);
                } else {
                    setOrder(res.data.order);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(false);
        }
    };

    const openNavigation = () => {
        const address = `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    if (loading) return <div className="loading-state-v3"><div className="loader-v3"></div><p>Fetching Task Details...</p></div>;

    if (!order) {
        return (
            <div className="empty-orders-v3 fade-in">
                <div className="radar-v3">
                    <div className="r-beam"></div>
                    {[1, 2, 3].map(i => <div key={i} className="r-ring-v3"></div>)}
                    <div className="r-center-v3"></div>
                </div>
                <h2>Waiting for Orders</h2>
                <p>You are in a high-demand area. New assignments will appear here.</p>
                <button className="refresh-hero-btn" onClick={fetchActiveOrder}>Refresh Queue</button>
            </div>
        );
    }

    return (
        <div className="manage-order-container fade-in">
            <div className="order-top-bar">
                <h1 className="page-title">Current Task</h1>
                <span className="order-time-badge glow-text">Est. 15 mins</span>
            </div>

            <div className="order-details-card glass-v3">
                <div className="card-header">
                    <div className="tracking-id">ORD #{order.orderNumber}</div>
                    <div className={`status-pill-indicator ${order.status}`}>{order.status.replace('_', ' ')}</div>
                </div>

                <section className="detail-section">
                    <div className="section-header">
                        <h3><FiMapPin className="icon-gold" /> Destination</h3>
                        <button className="nav-shortcut-v3" onClick={openNavigation}>
                            <FiNavigation /> Navigate
                        </button>
                    </div>
                    <div className="address-box-premium-v3">
                        <div className="customer-main">
                            <div>
                                <p className="customer-name">{order.deliveryAddress.fullName}</p>
                                <p className="customer-phone">{order.deliveryAddress.phone}</p>
                            </div>
                            <a href={`tel:${order.deliveryAddress.phone}`} className="call-btn-v3">
                                <FiPhone />
                            </a>
                        </div>
                        <p className="address-text">{order.deliveryAddress.addressLine1}</p>
                        <div className="landmark-tag-v3">
                            <span className="pulse-dot"></span>
                            Near {order.deliveryAddress.landmark}
                        </div>
                    </div>
                </section>

                <section className="detail-section">
                    <h3><FiPackage className="icon-blue" /> Items Summary</h3>
                    <div className="items-list-v3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="item-row-v3">
                                <span className="item-q">x{item.quantity}</span>
                                <span className="item-n">{item.name}</span>
                                <span className="item-p">₹{item.total}</span>
                            </div>
                        ))}
                    </div>
                    <div className="payment-footer-v3">
                        <div className="bill-total">
                            <span>Collect</span>
                            <span className="amt">₹{order.totalAmount}</span>
                        </div>
                        {order.paymentMethod === 'cod' ? (
                            <div className="payment-tag-v3 cod">CASH ON DELIVERY</div>
                        ) : (
                            <div className="payment-tag-v3 paid">PREPAID ORDER</div>
                        )}
                    </div>
                </section>

                <div className="timeline-container-v3">
                    <div className="timeline-v3">
                        {['out_for_delivery', 'picked_up', 'arrived', 'delivered'].map((s, i) => {
                            const statuses = ['out_for_delivery', 'picked_up', 'arrived', 'delivered'];
                            const currentIndex = statuses.indexOf(order.status);
                            const isCompleted = currentIndex >= i;
                            const isActive = currentIndex === i;
                            return (
                                <div key={s} className={`step-v3 ${isCompleted ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                    <div className="circle-v3">{isCompleted ? <FiCheckCircle /> : (i + 1)}</div>
                                    <span className="label-v3">{s.split('_').join(' ')}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="action-hub-v3">
                        {order.status === 'out_for_delivery' && (
                            <button className="btn-v3 pick" onClick={() => handleUpdateStatus('picked_up')} disabled={actionLoading}>
                                <FiTruck /> Confirm Pickup
                            </button>
                        )}
                        {order.status === 'picked_up' && (
                            <button className="btn-v3 arrive" onClick={() => handleUpdateStatus('arrived')} disabled={actionLoading}>
                                <FiMapPin /> I have Arrived
                            </button>
                        )}
                        {order.status === 'arrived' && (
                            <button className="btn-v3 deliver" onClick={() => setShowOTPModal(true)} disabled={actionLoading}>
                                <FiCheckCircle /> Complete Delivery
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showOTPModal && (
                <div className="otp-portal-v3">
                    <div className="otp-card-v3 glass">
                        <button className="otp-close-v3" onClick={() => setShowOTPModal(false)}><FiX /></button>
                        <div className="otp-icon-v3"><FiCheckCircle /></div>
                        <h2>Verification</h2>
                        <p>Ask customer for delivery code</p>

                        <div className="otp-boxes-v3">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={otpRefs[idx]}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="otp-box-v3"
                                    autoFocus={idx === 0}
                                />
                            ))}
                        </div>

                        <button
                            className="otp-submit-v3"
                            disabled={otp.some(d => !d) || actionLoading}
                            onClick={() => handleUpdateStatus('delivered', otp.join(''))}
                        >
                            {actionLoading ? 'Verifying...' : 'Finish Delivery'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
