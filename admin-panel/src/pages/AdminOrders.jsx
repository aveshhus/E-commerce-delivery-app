import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Eye, Truck, Check, X as XIcon, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => { fetchOrders(); }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getOrders({ status: filter, limit: 50 });
            if (res.success) setOrders(res.data.orders);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateStatus = async (orderId, status) => {
        try {
            const res = await adminAPI.updateOrderStatus(orderId, { status });
            if (res.success) {
                toast.success(`Order ${status}`);
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (err) { toast.error(err.message || 'Failed'); }
    };

    const statusColors = {
        placed: 'badge-warning', confirmed: 'badge-info', preparing: 'badge-purple',
        out_for_delivery: 'badge-teal', delivered: 'badge-success', cancelled: 'badge-error'
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                    <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            <div className="card">
                {loading ? <div className="loading"><div className="spinner"></div></div> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o._id}>
                                    <td style={{ fontWeight: 700 }}>#{o.orderNumber}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{o.deliveryAddress?.fullName || o.user?.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{o.deliveryAddress?.phone || o.user?.phone}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                            {o.deliveryAddress?.addressLine1}, {o.deliveryAddress?.city}
                                        </div>
                                    </td>
                                    <td>{o.items?.length} items</td>
                                    <td style={{ fontWeight: 700 }}>₹{o.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {o.paymentMethod?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td><span className={`badge ${statusColors[o.status]}`}>{o.status?.replace(/_/g, ' ')}</span></td>
                                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(o.createdAt)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedOrder(o)}>
                                                <Eye size={14} />
                                            </button>
                                            {o.status === 'placed' && (
                                                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, 'confirmed')}>
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            {o.status === 'confirmed' && (
                                                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, 'preparing')}>
                                                    <Package size={14} />
                                                </button>
                                            )}
                                            {o.status === 'preparing' && (
                                                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, 'out_for_delivery')}>
                                                    <Truck size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && <tr><td colSpan={8} className="empty-state">No orders found</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Order #{selectedOrder.orderNumber}</h3>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}><XIcon size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span className={`badge ${statusColors[selectedOrder.status]}`}>{selectedOrder.status?.replace(/_/g, ' ')}</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(selectedOrder.createdAt)}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Info</h4>
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{selectedOrder.user?.name}</p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedOrder.user?.phone}</p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedOrder.user?.email}</p>
                                </div>
                                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                                    <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Address</h4>
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{selectedOrder.deliveryAddress?.fullName}</p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {selectedOrder.deliveryAddress?.phone}
                                        {selectedOrder.deliveryAddress?.alternatePhone && <span style={{ opacity: 0.6 }}> | {selectedOrder.deliveryAddress.alternatePhone}</span>}
                                    </p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {selectedOrder.deliveryAddress?.addressLine1}<br />
                                        {selectedOrder.deliveryAddress?.addressLine2 && <>{selectedOrder.deliveryAddress.addressLine2}<br /></>}
                                        {selectedOrder.deliveryAddress?.landmark && <span style={{ color: 'var(--primary)' }}>Near {selectedOrder.deliveryAddress.landmark}<br /></span>}
                                        {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                                    </p>
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Items</h4>
                                {selectedOrder.items?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                                        <span>{item.name} × {item.quantity}</span>
                                        <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                                    <span>Total</span>
                                    <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
