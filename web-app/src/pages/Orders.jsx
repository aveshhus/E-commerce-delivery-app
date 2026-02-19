import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { Package, Eye, RotateCcw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

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

    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusFilters = ['', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    return (
        <div className="orders-page fade-in">
            <h2 className="section-title" style={{ marginBottom: '24px' }}>📦 My Orders</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {statusFilters.map(s => (
                    <button
                        key={s}
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-full)',
                            fontSize: '12px', fontWeight: filter === s ? '700' : '500',
                            background: filter === s ? 'var(--primary)' : 'white',
                            color: filter === s ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border)', cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                        onClick={() => setFilter(s)}
                    >
                        {s || 'All Orders'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Package size={64} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3>No orders found</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Start shopping to see your orders here</p>
                    <Link to="/products" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
                        Browse Products
                    </Link>
                </div>
            ) : (
                orders.map(order => {
                    const steps = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];
                    const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);
                    const isCancelled = order.status === 'cancelled';

                    return (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-meta">
                                    <div className="order-number">ORDER #{order.orderNumber}</div>
                                    <div className="order-date">{formatDate(order.createdAt)}</div>
                                </div>
                                <div className="order-total-badge">₹{order.totalAmount?.toFixed(0)}</div>
                            </div>

                            {/* Order Timeline */}
                            {!isCancelled && (
                                <div className="order-timeline">
                                    <div className="timeline-track">
                                        <div
                                            className="timeline-progress"
                                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="timeline-steps">
                                        <div className={`timeline-step ${currentStepIndex >= 0 ? 'active' : ''}`}>
                                            <div className="step-dot"></div>
                                            <span>Placed</span>
                                        </div>
                                        <div className={`timeline-step ${currentStepIndex >= 1 ? 'active' : ''}`}>
                                            <div className="step-dot"></div>
                                            <span>Packed</span>
                                        </div>
                                        <div className={`timeline-step ${currentStepIndex >= 2 ? 'active' : ''}`}>
                                            <div className="step-dot"></div>
                                            <span>On Way</span>
                                        </div>
                                        <div className={`timeline-step ${currentStepIndex >= 3 ? 'active' : ''}`}>
                                            <div className="step-dot"></div>
                                            <span>Delivered</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCancelled && (
                                <div className="order-cancelled-banner">
                                    <XCircle size={16} /> This order was cancelled
                                </div>
                            )}

                            <div className="order-items-list">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <div className="order-item-qty">{item.quantity}x</div>
                                        <div className="order-item-name">{item.product?.name || 'Product'}</div>
                                        <div className="order-item-price">₹{(item.variant?.price || item.price) * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                {['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && !isCancelled && (
                                    <button className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-md)' }}>
                                        <Package size={16} /> Track Live
                                    </button>
                                )}

                                {['placed', 'confirmed'].includes(order.status) && !isCancelled && (
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleCancel(order._id)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    );
};

export default Orders;
