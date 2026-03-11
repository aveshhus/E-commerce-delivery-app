import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    ChevronLeft, MapPin, Phone, CreditCard,
    Clock, Package, CheckCircle2, Truck,
    ArrowLeft, Receipt, ExternalLink, HelpCircle,
    XCircle
} from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'rate', 'complaint', 'return'
    const [modalData, setModalData] = useState({ score: 5, text: '', category: 'delivery_late' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await orderAPI.getOrder(id);
            if (res.success) setOrder(res.data.order);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async () => {
        try {
            setSubmitting(true);
            const res = await orderAPI.rateOrder(id, { score: modalData.score, review: modalData.text });
            if (res.success) {
                toast.success('Thank you for your rating!');
                fetchOrder();
                setActiveModal(null);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplaint = async () => {
        try {
            setSubmitting(true);
            const res = await orderAPI.submitComplaint(id, { category: modalData.category, message: modalData.text });
            if (res.success) {
                toast.success('Complaint filed. We will investigate.');
                fetchOrder();
                setActiveModal(null);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to file complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async () => {
        try {
            setSubmitting(true);
            const res = await orderAPI.requestReturn(id, { reason: modalData.text });
            if (res.success) {
                toast.success('Return request submitted.');
                fetchOrder();
                setActiveModal(null);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to submit return');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!order) return <div className="error-state">Order not found</div>;

    const isCancelled = order.status === 'cancelled';
    const isDelivered = order.status === 'delivered';

    const getStatusInfo = (status) => {
        switch (status) {
            case 'placed': return { label: 'Order Placed', color: '#f59e0b', icon: <Package size={24} /> };
            case 'confirmed': return { label: 'Confirmed', color: '#10b981', icon: <CheckCircle2 size={24} /> };
            case 'preparing': return { label: 'Packing', color: '#3b82f6', icon: <Package size={24} /> };
            case 'out_for_delivery': return { label: 'Out for Delivery', color: 'var(--primary)', icon: <Truck size={24} /> };
            case 'delivered': return { label: 'Delivered', color: '#10b981', icon: <CheckCircle2 size={24} /> };
            case 'cancelled': return { label: 'Cancelled', color: '#ef4444', icon: <XCircle size={24} /> };
            default: return { label: status, color: '#6b7280', icon: <Clock size={24} /> };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="order-detail-page fade-in">
            {/* Header */}
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/orders')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-meta">
                    <h1>Order Details</h1>
                    <p>Order #{order.orderNumber}</p>
                </div>
                <button className="help-btn">
                    <HelpCircle size={20} />
                    <span>Help</span>
                </button>
            </div>

            <div className="detail-grid">
                {/* Main Content */}
                <div className="detail-main">
                    {/* Status Card */}
                    <div className="status-track-card" style={{ borderLeft: `6px solid ${statusInfo.color}` }}>
                        <div className="status-main">
                            <div className="status-icon-box" style={{ color: statusInfo.color }}>
                                {statusInfo.icon}
                            </div>
                            <div className="status-text">
                                <h2 style={{ color: statusInfo.color }}>{statusInfo.label}</h2>
                                <p>{isDelivered ? `Delivered at ${new Date(order.updatedAt).toLocaleTimeString()}` : 'Order is on its way to you'}</p>
                            </div>
                        </div>

                        {!isCancelled && !isDelivered && (
                            <div className="live-timeline">
                                <div className="timeline-dot-connector">
                                    <div className={`dot ${['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                    <div className={`line ${['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                    <div className={`dot ${['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                    <div className={`line ${['out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                    <div className={`dot ${['out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                </div>
                                <div className="timeline-labels">
                                    <span>Placed</span>
                                    <span>Packed</span>
                                    <span>On way</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delivery Agent */}
                    {order.deliveryAgent && ['out_for_delivery', 'picked_up', 'arrived'].includes(order.status) && (
                        <div className="agent-card">
                            <div className="agent-info">
                                <div className="agent-avatar">
                                    <img src={order.deliveryAgent.avatar || "https://i.pravatar.cc/100?u=rider"} alt="Rider" />
                                </div>
                                <div className="agent-details">
                                    <h3>{order.deliveryAgent.name}</h3>
                                    <p>Your delivery partner</p>
                                </div>
                            </div>
                            <div className="agent-actions">
                                {order.deliveryOTP && (
                                    <div className="otp-badge">
                                        <span>OTP:</span>
                                        <strong>{order.deliveryOTP}</strong>
                                    </div>
                                )}
                                <a href={`tel:${order.deliveryAgent.phone}`} className="call-btn">
                                    <Phone size={18} />
                                    Call
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Items Card */}
                    <div className="items-card detail-card">
                        <h3>Items in this order</h3>
                        <div className="items-list">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="detail-item-row">
                                    <div className="item-img">
                                        <img src={item.image} alt={item.name} onError={(e) => e.target.src = 'https://via.placeholder.com/60'} />
                                    </div>
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="item-price">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bill Details */}
                    <div className="bill-card detail-card">
                        <h3>Bill Summary</h3>
                        <div className="bill-row">
                            <span>Item Total</span>
                            <span>₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="bill-row">
                            <span>Delivery Charges</span>
                            <span style={{ color: order.deliveryCharge === 0 ? '#10b981' : 'inherit' }}>
                                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge.toFixed(2)}`}
                            </span>
                        </div>
                        {order.couponDiscount > 0 && (
                            <div className="bill-row promo">
                                <span>Coupon Discount</span>
                                <span>-₹{order.couponDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="bill-row total">
                            <span>Grand Total</span>
                            <span>₹{order.totalAmount?.toFixed(2)}</span>
                        </div>
                        <div className="payment-tag">
                            <CreditCard size={14} />
                            Paid via {order.paymentMethod?.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="detail-sidebar">
                    {/* Post-Delivery Actions */}
                    {isDelivered && (
                        <div className="post-delivery-card detail-card pulse-border">
                            <h3>Post-Delivery Actions</h3>
                            <div className="action-buttons-v2">
                                {!order.customerRating?.score ? (
                                    <button className="action-row-btn star" onClick={() => setActiveModal('rate')}>
                                        <div className="btn-icon">⭐</div>
                                        <div className="btn-text">
                                            <strong>Rate Order</strong>
                                            <span>Share your experience</span>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="rating-summary-mini">
                                        <span>Your Rating:</span>
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} style={{ color: i < order.customerRating.score ? '#FFB800' : '#ddd' }}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button className="action-row-btn warning" onClick={() => setActiveModal('complaint')}>
                                    <div className="btn-icon">⚠️</div>
                                    <div className="btn-text">
                                        <strong>Report Issue</strong>
                                        <span>Complaint about delivery</span>
                                    </div>
                                </button>

                                <button className="action-row-btn return" onClick={() => setActiveModal('return')}>
                                    <div className="btn-icon">🔄</div>
                                    <div className="btn-text">
                                        <strong>Request Return</strong>
                                        <span>Damaged or Wrong Item</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="address-detail-card detail-card">
                        <div className="card-h-group">
                            <MapPin size={18} className="h-icon" />
                            <h3>Delivery Address</h3>
                        </div>
                        <div className="addr-content">
                            <p className="name">{order.deliveryAddress?.fullName}</p>
                            <p className="phone">
                                {order.deliveryAddress?.phone}
                                {order.deliveryAddress?.alternatePhone && <span style={{ opacity: 0.6 }}> | {order.deliveryAddress.alternatePhone}</span>}
                            </p>
                            <p className="text">
                                {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}<br />
                                {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                            </p>
                        </div>
                    </div>

                    <div className="order-time-card detail-card">
                        <div className="card-h-group">
                            <Receipt size={18} className="h-icon" />
                            <h3>Order Info</h3>
                        </div>
                        <div className="info-bits">
                            <div className="bit">
                                <span>Placed on</span>
                                <p>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="bit">
                                <span>Time</span>
                                <p>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <button className="download-invoice">
                            <ExternalLink size={14} />
                            Download Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeModal && (
                <div className="modal-overlay-v2 fade-in" onClick={() => setActiveModal(null)}>
                    <div className="modal-card-v2 slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-v2">
                            <h2>
                                {activeModal === 'rate' && 'Rate Your Delivery'}
                                {activeModal === 'complaint' && 'Report an Issue'}
                                {activeModal === 'return' && 'Request Return'}
                            </h2>
                            <button className="close-m-btn" onClick={() => setActiveModal(null)}>×</button>
                        </div>

                        <div className="modal-body-v2">
                            {activeModal === 'rate' && (
                                <div className="rating-input">
                                    <div className="stars-picker">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span
                                                key={s}
                                                className={s <= modalData.score ? 'active' : ''}
                                                onClick={() => setModalData({ ...modalData, score: s })}
                                            >★</span>
                                        ))}
                                    </div>
                                    <p className="rating-hint">{['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][modalData.score - 1]}</p>
                                </div>
                            )}

                            {activeModal === 'complaint' && (
                                <div className="field-group">
                                    <label>Issue Category</label>
                                    <select
                                        value={modalData.category}
                                        onChange={e => setModalData({ ...modalData, category: e.target.value })}
                                    >
                                        <option value="delivery_late">Late Delivery</option>
                                        <option value="bad_behavior">Behavioral Issue</option>
                                        <option value="item_missing">Missing Item</option>
                                        <option value="wrong_item">Wrong Item</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}

                            <div className="field-group">
                                <label>
                                    {activeModal === 'rate' ? 'Review (Optional)' : 'Tell us more'}
                                </label>
                                <textarea
                                    placeholder={activeModal === 'return' ? 'Describe the damage or reason for return...' : 'Type here...'}
                                    rows="4"
                                    value={modalData.text}
                                    onChange={e => setModalData({ ...modalData, text: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                className="submit-m-btn"
                                disabled={submitting || (activeModal !== 'rate' && !modalData.text)}
                                onClick={() => {
                                    if (activeModal === 'rate') handleRating();
                                    if (activeModal === 'complaint') handleComplaint();
                                    if (activeModal === 'return') handleReturn();
                                }}
                            >
                                {submitting ? 'Processing...' : 'Submit Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .order-detail-page {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px 0;
                }
                .detail-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 30px;
                }
                .back-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #fff;
                    border: 1px solid #eee;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .header-meta h1 { font-size: 22px; margin: 0; font-weight: 800; }
                .header-meta p { color: #6b7280; font-size: 14px; font-weight: 600; }
                .help-btn {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    border: 1px solid #1A1A2E;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 24px;
                }
                @media (max-width: 900px) {
                    .detail-grid { grid-template-columns: 1fr; }
                }

                .detail-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    border: 1px solid #f1f1f1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .detail-card h3 { font-size: 16px; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }

                .status-track-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .status-main { display: flex; gap: 20px; align-items: center; margin-bottom: 30px; }
                .status-icon-box {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #f9fafb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .status-text h2 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
                .status-text p { color: #6b7280; font-weight: 500; }

                .live-timeline {
                    padding: 0 10px;
                }
                .timeline-dot-connector {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .timeline-dot-connector .dot { width: 14px; height: 14px; border-radius: 50%; background: #e5e7eb; position: relative; }
                .timeline-dot-connector .dot.filled { background: var(--primary); box-shadow: 0 0 0 4px var(--primary-50); }
                .timeline-dot-connector .line { flex: 1; height: 3px; background: #e5e7eb; }
                .timeline-dot-connector .line.filled { background: var(--primary); }
                .timeline-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; }

                .agent-card {
                    background: #1A1A2E;
                    border-radius: 20px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    color: #fff;
                }
                .agent-info { display: flex; gap: 16px; align-items: center; }
                .agent-avatar img { width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--primary); }
                .agent-details h3 { font-size: 16px; margin: 0; }
                .agent-details p { font-size: 12px; opacity: 0.7; }
                .call-btn {
                    background: var(--primary);
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .agent-actions { display: flex; align-items: center; gap: 12px; }
                .otp-badge { background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 12px; display: flex; align-items: center; gap: 6px; font-size: 14px; }
                .otp-badge span { opacity: 0.7; }
                .otp-badge strong { font-size: 16px; letter-spacing: 2px; color: var(--primary); }

                .detail-item-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f9fafb; }
                .item-img img { width: 60px; height: 60px; object-fit: contain; border-radius: 12px; background: #f9fafb; padding: 8px; }
                .item-info { flex: 1; }
                .item-info h4 { font-size: 15px; margin-bottom: 4px; font-weight: 700; }
                .item-info p { font-size: 13px; color: #6b7280; }
                .item-price { font-weight: 800; }

                .bill-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #4b5563; }
                .bill-row.total { border-top: 2px dashed #f1f1f1; padding-top: 16px; margin-top: 16px; font-size: 18px; font-weight: 900; color: #111827; }
                .bill-row.promo { color: #10b981; font-weight: 600; }
                
                .payment-tag {
                    margin-top: 20px;
                    background: #f9fafb;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #4b5563;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .addr-content .name { font-weight: 800; font-size: 15px; margin-bottom: 2px; }
                .addr-content .phone { color: #6b7280; font-size: 13px; margin-bottom: 10px; }
                .addr-content .text { line-height: 1.6; font-size: 14px; color: #374151; }

                .info-bits { display: grid; gap: 16px; margin-bottom: 20px; }
                .bit span { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 800; }
                .bit p { font-size: 14px; font-weight: 700; color: #111827; }
                .download-invoice {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    background: #f3f4f6;
                    border: none;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 13px;
                }

                /* New Premium Styles for Actions & Modals */
                .pulse-border {
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    animation: border-pulse 4s infinite;
                }
                @keyframes border-pulse {
                    0% { border-color: rgba(16, 185, 129, 0.1); }
                    50% { border-color: rgba(16, 185, 129, 0.5); }
                    100% { border-color: rgba(16, 185, 129, 0.1); }
                }

                .action-buttons-v2 { display: grid; gap: 12px; margin-top: 10px; }
                .action-row-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 14px;
                    border: 1px solid #f1f1f1;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                }
                .action-row-btn:hover { background: #f9fafb; border-color: var(--primary); transform: translateX(5px); }
                .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 10px; font-size: 18px; }
                .btn-text strong { display: block; font-size: 14px; color: #111827; }
                .btn-text span { font-size: 11px; color: #6b7280; font-weight: 500; }

                .rating-summary-mini { display: flex; align-items: center; gap: 10px; padding: 12px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbfcce; margin-bottom: 12px; }
                .rating-summary-mini span { font-size: 12px; font-weight: 700; color: #10b981; }
                .rating-summary-mini .stars { font-size: 16px; letter-spacing: 2px; }

                .modal-overlay-v2 {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(5px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .modal-card-v2 {
                    background: #fff;
                    width: 100%;
                    max-width: 400px;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .modal-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .modal-header-v2 h2 { font-size: 18px; font-weight: 800; }
                .close-m-btn { font-size: 24px; border: none; background: none; cursor: pointer; color: #9ca3af; }

                .stars-picker { display: flex; justify-content: center; gap: 8px; margin-bottom: 10px; }
                .stars-picker span { font-size: 40px; cursor: pointer; color: #ddd; transition: scale 0.2s; }
                .stars-picker span.active { color: #FFB800; transform: scale(1.1); }
                .stars-picker span:hover { transform: scale(1.2); }
                .rating-hint { text-align: center; font-weight: 700; color: #10b981; margin-bottom: 20px; }

                .field-group { margin-bottom: 20px; }
                .field-group label { display: block; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
                .field-group textarea, .field-group select {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                }
                .field-group textarea:focus { border-color: var(--primary); }

                .submit-m-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 14px;
                    background: #1A1A2E;
                    color: #fff;
                    border: none;
                    font-weight: 800;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .submit-m-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            ` }} />
        </div >
    );
};

export default OrderDetail;
