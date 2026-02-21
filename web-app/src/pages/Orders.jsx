import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { Package, RotateCcw, XCircle, CheckCircle2, ChevronRight, Truck, MapPin, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderAPI.getOrders({ status: filter });
            if (res.success) setOrders(res.data.orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            const res = await orderAPI.cancelOrder(orderId, { reason: 'Customer requested cancellation' });
            if (res.success) {
                toast.success('Order cancelled');
                fetchOrders();
            }
        } catch (err) {
            toast.error(err.message || 'Failed to cancel');
        }
    };

    const handleReorder = async (orderId) => {
        try {
            const res = await orderAPI.reorder(orderId);
            if (res.success) toast.success('Items added to cart!');
        } catch (err) {
            toast.error(err.message || 'Failed to reorder');
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        }) + ' at ' + d.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'placed': return 'Order Placed';
            case 'confirmed': return 'Confirmed';
            case 'preparing': return 'Packing';
            case 'out_for_delivery': return 'On the way';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const statusFilters = [
        { id: '', label: 'All' },
        { id: 'placed', label: 'Placed' },
        { id: 'preparing', label: 'Packing' },
        { id: 'out_for_delivery', label: 'On Way' },
        { id: 'delivered', label: 'Delivered' }
    ];

    return (
        <div className="orders-page fade-in" style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>My Orders</h2>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{orders.length} orders total</div>
            </div>

            {/* Modern Tab Filters */}
            <div className="order-filters-scroll" style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '8px' }}>
                {statusFilters.map(s => (
                    <button
                        key={s.id}
                        className={`order-filter-tab ${filter === s.id ? 'active' : ''}`}
                        onClick={() => setFilter(s.id)}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner" style={{ minHeight: '300px' }}><div className="spinner"></div></div>
            ) : orders.length === 0 ? (
                <div className="empty-orders-state">
                    <div className="empty-icon"><ReceiptText size={48} /></div>
                    <h3>No orders yet!</h3>
                    <p>When you place an order, it will appear here for you to track.</p>
                    <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
                        Order Now
                    </Link>
                </div>
            ) : (
                <div className="orders-container">
                    {orders.map(order => {
                        const isCancelled = order.status === 'cancelled';
                        const isDelivered = order.status === 'delivered';

                        return (
                            <div key={order._id} className="modern-order-card">
                                <Link to={`/orders/${order._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {/* Card Header */}
                                    <div className="card-top">
                                        <div className="vendor-info">
                                            <div className="vendor-logo-box">
                                                <Package size={20} className="vendor-icon" />
                                            </div>
                                            <div>
                                                <div className="status-label-group">
                                                    <span className={`status-pill ${order.status}`}>{getStatusText(order.status)}</span>
                                                    <span className="order-dot">•</span>
                                                    <span className="order-id">#{order.orderNumber}</span>
                                                </div>
                                                <p className="order-time">{formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="order-pricing">
                                            <span className="amount">₹{order.totalAmount?.toFixed(0)}</span>
                                            <ChevronRight size={18} className="chevron" />
                                        </div>
                                    </div>

                                    {/* Order Item Thumbnails */}
                                    <div className="order-items-preview">
                                        <div className="items-row">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="item-thumb-container">
                                                    <img
                                                        src={item.image || 'https://via.placeholder.com/50'}
                                                        alt={item.name}
                                                        className="item-thumb"
                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                                    />
                                                    <span className="item-count">{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="items-count-text">
                                            {order.items?.length} {order.items?.length === 1 ? 'Item' : 'Items'} ordered
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    <div className="delivery-summary">
                                        <div className="info-row">
                                            <MapPin size={14} className="info-icon" />
                                            <span>{order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}</span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Tracking Timeline (Only for active orders) */}
                                {!isCancelled && !isDelivered && (
                                    <div className="modern-timeline">
                                        <div className="timeline-labels">
                                            <span className={['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'active' : ''}>Placed</span>
                                            <span className={['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'active' : ''}>Packed</span>
                                            <span className={['out_for_delivery'].includes(order.status) ? 'active' : ''}>On Way</span>
                                        </div>
                                        <div className="timeline-bar">
                                            <div className={`segment ${['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                            <div className={`segment ${['confirmed', 'preparing', 'out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                            <div className={`segment ${['out_for_delivery'].includes(order.status) ? 'filled' : ''}`}></div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="card-actions">
                                    {isDelivered || isCancelled ? (
                                        <button className="reorder-btn" onClick={() => handleReorder(order._id)}>
                                            <RotateCcw size={16} /> Reorder
                                        </button>
                                    ) : (
                                        <div className="active-actions">
                                            <button className="track-btn" onClick={() => navigate(`/orders/${order._id}`)}>
                                                <Truck size={16} /> Track Order
                                            </button>
                                            {['placed', 'confirmed'].includes(order.status) && (
                                                <button className="cancel-order-btn" onClick={() => handleCancel(order._id)}>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <Link to={`/orders/${order._id}`} className="view-details-link">
                                        Details
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Additional CSS needed for this high-end look */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .order-filter-tab {
                    white-space: nowrap;
                    padding: 8px 20px;
                    border-radius: 8px;
                    background: #f3f4f6;
                    border: 1px solid transparent;
                    font-size: 14px;
                    font-weight: 600;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .order-filter-tab.active {
                    background: #fff;
                    border-color: var(--primary);
                    color: var(--primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .modern-order-card {
                    background: #fff;
                    border-radius: 16px;
                    border: 1px solid #f1f1f1;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                    transition: transform 0.2s;
                }
                .modern-order-card:hover {
                    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
                }
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .vendor-info {
                    display: flex;
                    gap: 12px;
                }
                .vendor-logo-box {
                    width: 40px;
                    height: 40px;
                    background: #f9fafb;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    border: 1px solid #f3f4f6;
                }
                .status-label-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 2px;
                }
                .status-pill {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-pill.delivered { color: #10b981; }
                .status-pill.placed, .status-pill.confirmed { color: #f59e0b; }
                .status-pill.preparing, .status-pill.out_for_delivery { color: var(--primary); }
                .status-pill.cancelled { color: #ef4444; }
                
                .order-dot { color: #d1d5db; font-size: 10px; }
                .order-id { font-size: 12px; font-weight: 700; color: #1f2937; }
                .order-time { font-size: 11px; color: #6b7280; font-weight: 500; }
                
                .order-pricing {
                    text-align: right;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .order-pricing .amount { font-size: 18px; font-weight: 800; color: #111827; }
                .chevron { color: #9ca3af; }

                .order-items-preview {
                    background: #f9fafb;
                    border-radius: 12px;
                    padding: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .items-row {
                    display: flex;
                    gap: 8px;
                }
                .item-thumb-container {
                    position: relative;
                    width: 40px;
                    height: 40px;
                }
                .item-thumb {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    border-radius: 6px;
                    background: #fff;
                    border: 1px solid #eee;
                }
                .item-count {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #374151;
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .items-count-text {
                    font-size: 12px;
                    font-weight: 600;
                    color: #4b5563;
                }

                .delivery-summary {
                    margin-bottom: 16px;
                    padding: 0 4px;
                }
                .info-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 500;
                }
                .info-icon { color: #9ca3af; }

                .modern-timeline {
                    margin-bottom: 20px;
                }
                .timeline-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 11px;
                    color: #9ca3af;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .timeline-labels .active { color: var(--primary); }
                .timeline-bar {
                    display: flex;
                    gap: 4px;
                }
                .timeline-bar .segment {
                    height: 4px;
                    flex: 1;
                    background: #e5e7eb;
                    border-radius: 2px;
                }
                .timeline-bar .segment.filled {
                    background: var(--primary);
                }

                .card-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f3f4f6;
                    padding-top: 16px;
                }
                .reorder-btn, .track-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--primary);
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(255, 78, 12, 0.2);
                }
                .active-actions { display: flex; gap: 10px; }
                .cancel-order-btn {
                    background: #fff;
                    color: #ef4444;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    border: 1px solid #fee2e2;
                    cursor: pointer;
                }
                .view-details-link {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--primary);
                    text-decoration: none;
                }
                
                .empty-orders-state {
                    text-align: center;
                    padding: 60px 40px;
                    background: #fff;
                    border-radius: 24px;
                    border: 1px dashed #d1d5db;
                }
                .empty-icon {
                    width: 80px;
                    height: 80px;
                    background: #f3f4f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: #9ca3af;
                }
            ` }} />
        </div>
    );
};

export default Orders;

