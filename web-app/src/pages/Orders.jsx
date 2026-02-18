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
                orders.map(order => (
                    <div key={order._id} className="order-card">
                        <div className="order-header">
                            <div>
                                <div className="order-number">#{order.orderNumber}</div>
                                <div className="order-date">{formatDate(order.createdAt)}</div>
                            </div>
                            <span className={`order-status ${order.status}`}>
                                {order.status?.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div className="order-items-summary">
                            {order.items?.length} item{order.items?.length > 1 ? 's' : ''} •{' '}
                            {order.items?.map(i => i.name).join(', ')}
                        </div>
                        <div className="order-footer">
                            <div className="order-total">₹{order.totalAmount?.toFixed(2)}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['placed', 'confirmed'].includes(order.status) && (
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '6px 14px', fontSize: '12px', width: 'auto' }}
                                        onClick={() => handleCancel(order._id)}
                                    >
                                        <XCircle size={14} /> Cancel
                                    </button>
                                )}
                                {order.status === 'delivered' && (
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '6px 14px', fontSize: '12px', width: 'auto' }}
                                        onClick={() => handleReorder(order._id)}
                                    >
                                        <RotateCcw size={14} /> Reorder
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Orders;
