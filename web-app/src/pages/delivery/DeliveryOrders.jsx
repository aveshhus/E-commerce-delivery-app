import React, { useState, useEffect } from 'react';
import { FiPhone, FiPackage, FiCheckCircle, FiChevronRight, FiMapPin, FiTruck, FiNavigation, FiX } from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryOrders.css';

const DeliveryOrders = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState('');

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

    const handleUpdateStatus = async (status, deliveryOtp = null) => {
        try {
            setActionLoading(true);
            const res = await deliveryService.updateStatus(order._id, status, '', deliveryOtp);
            if (res.success) {
                toast.success(`Order marked as ${status.replace('_', ' ')}`);
                if (status === 'delivered') {
                    setOrder(null);
                    setShowOTPModal(false);
                    setOtp('');
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

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading active order...</p></div>;

    if (!order) {
        return (
            <div className="empty-orders fade-in">
                <div className="empty-illustration">🚴</div>
                <h2>Ready for new orders?</h2>
                <p>Stay online and keep your location permissions active.</p>
                <button className="refresh-btn" onClick={fetchActiveOrder}>Check for assignments</button>
            </div>
        );
    }

    return (
        <div className="manage-order-container fade-in">
            <div className="order-top-bar">
                <h1 className="page-title">Current Task</h1>
                <span className="order-time-badge">Est. 15 mins</span>
            </div>

            <div className="order-details-card glass">
                <div className="card-header">
                    <div className="tracking-id">ORD #{order.orderNumber}</div>
                    <div className={`status-pill-indicator ${order.status}`}>{order.status.replace('_', ' ')}</div>
                </div>

                <section className="detail-section">
                    <div className="section-header">
                        <h3><FiMapPin /> Destination</h3>
                        <button className="nav-shortcut" onClick={openNavigation}>
                            <FiNavigation /> Navigate
                        </button>
                    </div>
                    <div className="address-box-premium">
                        <div className="customer-main">
                            <p className="customer-name">{order.deliveryAddress.fullName}</p>
                            <a href={`tel:${order.deliveryAddress.phone}`} className="call-circle">
                                <FiPhone />
                            </a>
                        </div>
                        <p className="address-text">{order.deliveryAddress.addressLine1}</p>
                        {order.deliveryAddress.addressLine2 && <p className="address-text secondary">{order.deliveryAddress.addressLine2}</p>}
                        <div className="landmark-tag">
                            <span className="dot"></span>
                            Near {order.deliveryAddress.landmark}
                        </div>
                    </div>
                </section>

                <section className="detail-section">
                    <h3><FiPackage /> Items Preview</h3>
                    <div className="items-scroll">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="item-row-minimal">
                                <span className="item-qty-badge">{item.quantity}</span>
                                <span className="item-name-text">{item.name}</span>
                                <span className="item-price-text">₹{item.total}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bill-summary">
                        <div className="bill-row total">
                            <span>Collect from Customer</span>
                            <span className="amount">₹{order.totalAmount}</span>
                        </div>
                        {order.paymentMethod === 'cod' ? (
                            <div className="payment-alert cod">
                                <span className="pulse"></span> CASH PAYMENT REQUIRED
                            </div>
                        ) : (
                            <div className="payment-alert paid">
                                <FiCheckCircle /> PAID ONLINE
                            </div>
                        )}
                    </div>
                </section>

                <section className="status-timeline-v2">
                    <div className="timeline-steps">
                        {['out_for_delivery', 'picked_up', 'arrived', 'delivered'].map((s, i) => (
                            <div key={s} className={`t-step ${order.status === s || (['out_for_delivery', 'picked_up', 'arrived', 'delivered'].indexOf(order.status) > i) ? 'completed' : ''}`}>
                                <div className="t-circle">{i + 1}</div>
                                <span className="t-label">{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="next-action-area">
                        {order.status === 'out_for_delivery' && (
                            <button
                                className="action-btn-main pick"
                                onClick={() => handleUpdateStatus('picked_up')}
                                disabled={actionLoading}
                            >
                                <FiTruck /> Pickup Completed
                            </button>
                        )}
                        {order.status === 'picked_up' && (
                            <button
                                className="action-btn-main arrive"
                                onClick={() => handleUpdateStatus('arrived')}
                                disabled={actionLoading}
                            >
                                <FiMapPin /> I have Arrived
                            </button>
                        )}
                        {order.status === 'arrived' && (
                            <button
                                className="action-btn-main deliver"
                                onClick={() => setShowOTPModal(true)}
                                disabled={actionLoading}
                            >
                                <FiCheckCircle /> Complete Delivery
                            </button>
                        )}
                    </div>
                </section>
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal glass">
                        <div className="modal-header">
                            <h2>Verify Delivery</h2>
                            <button className="close-modal" onClick={() => setShowOTPModal(false)}><FiX /></button>
                        </div>
                        <p>Ask customer for the 4-digit OTP</p>
                        <div className="otp-input-container">
                            <input
                                type="text"
                                maxLength="4"
                                placeholder="0 0 0 0"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                autoFocus
                            />
                        </div>
                        <button
                            className="confirm-delivery-btn"
                            disabled={otp.length !== 4 || actionLoading}
                            onClick={() => handleUpdateStatus('delivered', otp)}
                        >
                            {actionLoading ? 'Verifying...' : 'Confirm Delivery'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
