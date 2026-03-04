import React, { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPackage, FiCheckCircle, FiChevronRight, FiMapPin, FiTruck, FiNavigation, FiX, FiAlertTriangle, FiFilter, FiCalendar, FiArrowRight, FiClock } from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryOrders.css';

const DeliveryOrders = () => {
    const [view, setView] = useState('active'); // 'active' or 'history'

    // Active states
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFailModal, setShowFailModal] = useState(false);
    const [failReason, setFailReason] = useState('Customer Not Available');
    const [otp, setOtp] = useState(['', '', '', '']);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];

    // History states
    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState('All');
    const [timeLeft, setTimeLeft] = useState('15:00');

    useEffect(() => {
        fetchActiveOrder();
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!order) return;
        const interval = setInterval(() => {
            // "Common Sense" Timer: Count down from when the order was last updated/assigned, not created
            const referenceTime = new Date(order.updatedAt || order.createdAt).getTime();
            const targetTime = referenceTime + 30 * 60 * 1000; // 30 minutes from last status change
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft('LATE');
                clearInterval(interval);
                return;
            }
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [order]);

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

    const fetchHistory = async () => {
        try {
            const res = await deliveryService.getHistory();
            if (res.success) {
                setHistory(res.data.orders);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 3) otpRefs[index + 1].current.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current.focus();
    };

    const handleUpdateStatus = async (status, deliveryOtp = null, note = '') => {
        try {
            setActionLoading(true);
            const res = await deliveryService.updateStatus(order._id, status, note, deliveryOtp);
            if (res.success) {
                toast.success(`Order marked as ${status.replace('_', ' ')}`);
                if (status === 'delivered' || status === 'cancelled') {
                    setOrder(null);
                    setShowOTPModal(false);
                    setShowFailModal(false);
                    setOtp(['', '', '', '']);
                    fetchHistory(); // Refresh history
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

    // Filter logic
    const filteredHistory = history.filter(h => {
        if (filter === 'All') return true;
        if (filter === 'Delivered') return h.status === 'delivered';
        if (filter === 'Failed/Cancelled') return h.status === 'cancelled';
        return true;
    });

    if (loading) return <div className="loading-state-v3"><div className="loader-v3"></div><p>Fetching Orders...</p></div>;

    return (
        <div className="manage-order-container fade-in">
            {/* Unified Operations Tabs */}
            <div className="op-tabs">
                <button
                    className={`op-tab-btn ${view === 'active' ? 'active' : ''}`}
                    onClick={() => setView('active')}
                >
                    📦 Active Task
                </button>
                <button
                    className={`op-tab-btn ${view === 'history' ? 'active' : ''}`}
                    onClick={() => setView('history')}
                >
                    📜 Order History
                </button>
            </div>

            {view === 'active' ? (
                <>
                    {!order ? (
                        <div className="empty-orders-v3 fade-in">
                            <div className="radar-v3">
                                <div className="r-center-v3"></div>
                            </div>
                            <h2>System Active</h2>
                            <p>You are ready to receive new delivery assignments.</p>
                            <button className="refresh-hero-btn" onClick={fetchActiveOrder}>Scan for Orders</button>
                        </div>
                    ) : (
                        <div className="order-details-card fade-in">
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2C2F33', borderBottom: 'none', padding: '16px 20px' }}>
                                <div className="tracking-id" style={{ fontSize: '18px', color: 'white' }}>ORD #{order.orderNumber}</div>
                                <div className="order-time-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: timeLeft === 'LATE' ? 'rgba(250, 62, 62, 0.15)' : 'rgba(255, 184, 0, 0.15)', color: timeLeft === 'LATE' ? '#FA3E3E' : '#FFB800', border: timeLeft === 'LATE' ? '1px solid rgba(250, 62, 62, 0.3)' : '1px solid rgba(255, 184, 0, 0.3)' }}>
                                    <FiClock /> {timeLeft}
                                </div>
                            </div>

                            {/* Process Steps Indicator */}
                            <div className="op-process-indicator" style={{ background: '#1C1E20', padding: '16px 20px', display: 'flex', justifyContent: 'center', gap: '12px', borderBottom: '1px solid #2C2F33' }}>
                                <div className={`op-step ${['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'active' : 'done'}`}>1. HUB PICKUP</div>
                                <div className={`op-step ${order.status === 'picked_up' ? 'active' : (['arrived', 'delivered'].includes(order.status) ? 'done' : 'pending')}`}>2. EN ROUTE</div>
                                <div className={`op-step ${order.status === 'arrived' ? 'active' : (order.status === 'delivered' ? 'done' : 'pending')}`}>3. HANDOVER</div>
                            </div>

                            {/* Dynamic Map Preview Area (Common Sense placeholder for routing visual) */}
                            <div className="map-preview-container" style={{ width: '100%', height: '160px', backgroundColor: '#111315', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #2C2F33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#00B14F 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                <FiMapPin style={{ fontSize: '48px', color: '#00B14F', zIndex: 1 }} />
                                <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 2 }}>
                                    <button className="nav-shortcut-v3" onClick={openNavigation} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                        <FiNavigation /> Start Navigation
                                    </button>
                                </div>
                            </div>

                            <section className="detail-section">
                                <div className="section-header">
                                    <h3><FiMapPin style={{ color: '#00B14F' }} /> Destination Address</h3>
                                </div>
                                <div className="address-box-premium-v3">
                                    <div className="customer-main">
                                        <div>
                                            <p className="customer-name">{order.deliveryAddress.fullName}</p>
                                            <p className="customer-phone">{order.deliveryAddress.phone}</p>
                                        </div>
                                        {['picked_up', 'arrived'].includes(order.status) && (
                                            <a href={`tel:${order.deliveryAddress.phone}`} className="call-btn-v3">
                                                <FiPhone />
                                            </a>
                                        )}
                                    </div>
                                    <p className="address-text">{order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</p>
                                    <div className="landmark-tag-v3">
                                        <span className="pulse-dot"></span>
                                        Near {order.deliveryAddress.landmark}
                                    </div>
                                </div>
                            </section>

                            <section className="detail-section">
                                <h3><FiPackage style={{ color: '#FFB800' }} /> Items Summary</h3>
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
                                        <span>Order Value</span>
                                        <span className="amt">₹{order.totalAmount}</span>
                                    </div>
                                    {order.paymentMethod === 'cod' ? (
                                        <div className="payment-tag-v3 cod">COD: COLLECT CASH</div>
                                    ) : (
                                        <div className="payment-tag-v3 paid">PREPAID ORDER</div>
                                    )}
                                </div>
                            </section>

                            <div className="timeline-container-v3" style={{ padding: '0 20px 24px' }}>
                                <div className="action-hub-v3">
                                    {['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
                                        <button className="btn-v3 pick" onClick={() => handleUpdateStatus('picked_up')} disabled={actionLoading}>
                                            <FiPackage /> Picked Up from Hub
                                        </button>
                                    )}
                                    {order.status === 'picked_up' && (
                                        <button className="btn-v3 arrive" onClick={() => handleUpdateStatus('arrived')} disabled={actionLoading}>
                                            <FiMapPin /> Reached Customer Location
                                        </button>
                                    )}
                                    {order.status === 'arrived' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <button className="btn-v3 fail" style={{ margin: 0 }} onClick={() => setShowFailModal(true)} disabled={actionLoading}>
                                                <FiAlertTriangle /> Mark Failed
                                            </button>
                                            <button className="btn-v3 deliver" onClick={() => setShowOTPModal(true)} disabled={actionLoading}>
                                                <FiCheckCircle /> Mark Delivered
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="history-view fade-in">
                    <div className="history-filters">
                        {['All', 'Delivered', 'Failed/Cancelled'].map(f => (
                            <button
                                key={f}
                                className={`h-filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="history-timeline">
                        {filteredHistory.length === 0 ? (
                            <div className="empty-orders-v3 fade-in" style={{ marginTop: '0' }}>
                                <FiCalendar style={{ fontSize: '40px', color: '#535665', marginBottom: '16px' }} />
                                <h3>No records found</h3>
                                <p>No completed or failed orders matching this filter.</p>
                            </div>
                        ) : (
                            filteredHistory.map((hOrder) => (
                                <div key={hOrder._id} className="history-record-premium">
                                    <div className="record-header-v2">
                                        <div className="record-main-info">
                                            <span className="order-number">ORD #{hOrder.orderNumber}</span>
                                            <span className="record-date">{new Date(hOrder.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`record-status-badge ${hOrder.status}`}>
                                            {hOrder.status === 'delivered' ? <FiCheckCircle /> : <FiAlertTriangle />}
                                            {hOrder.status}
                                        </div>
                                    </div>

                                    <div className="record-body-v2">
                                        <div className="location-info">
                                            <FiMapPin />
                                            <span>{hOrder.deliveryAddress.addressLine1}, {hOrder.deliveryAddress.city}</span>
                                        </div>
                                        <div className="earning-info-v2">
                                            <span className="earning-lbl">Value</span>
                                            <span className="earning-val">₹{hOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                    <div className="record-footer">
                                        <span className="item-count">{hOrder.items.length} Items</span>
                                        <FiArrowRight />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="fail-modal-overlay">
                    <div className="fail-modal-content">
                        <button className="otp-close-v3" style={{ background: 'transparent', border: 'none', color: 'white', float: 'right', fontSize: '24px' }} onClick={() => setShowOTPModal(false)}><FiX /></button>
                        <h3 style={{ marginTop: '16px', color: '#00B14F' }}>Verify Delivery Code</h3>
                        <p style={{ color: '#949CA4', fontSize: '14px', marginBottom: '24px' }}>Ask the customer for the 4-digit OTP code sent via SMS to confirm successful handover.</p>

                        <div className="otp-boxes-v3" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
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
                                    style={{ width: '60px', height: '60px', background: '#111315', border: '1px solid #2C2F33', borderRadius: '12px', fontSize: '24px', textAlign: 'center', color: 'white' }}
                                />
                            ))}
                        </div>

                        <button
                            className="btn-v3 deliver"
                            disabled={otp.some(d => !d) || actionLoading}
                            onClick={() => handleUpdateStatus('delivered', otp.join(''))}
                        >
                            {actionLoading ? 'Verifying...' : 'Finish Delivery'}
                        </button>
                    </div>
                </div>
            )}

            {/* Failure Reason Modal */}
            {showFailModal && (
                <div className="fail-modal-overlay">
                    <div className="fail-modal-content">
                        <h3>Report Delivery Failure</h3>
                        <p style={{ color: '#949CA4', fontSize: '14px', marginBottom: '16px' }}>Select the reason why you are unable to successfully deliver this order.</p>

                        <select
                            className="fail-reason-select"
                            value={failReason}
                            onChange={(e) => setFailReason(e.target.value)}
                        >
                            <option value="Customer Not Available">Customer Not Available</option>
                            <option value="Address Not Found">Address Not Found</option>
                            <option value="Customer Refused Order">Customer Refused Order</option>
                            <option value="Damaged Items">Damaged Items</option>
                            <option value="Payment Issue">Payment Issue</option>
                        </select>

                        <div className="fail-actions">
                            <button className="btn-cancel" onClick={() => setShowFailModal(false)}>Cancel</button>
                            <button
                                className="btn-confirm-fail"
                                onClick={() => handleUpdateStatus('cancelled', null, `Failed: ${failReason}`)}
                                disabled={actionLoading}
                            >
                                Submit Failure
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
