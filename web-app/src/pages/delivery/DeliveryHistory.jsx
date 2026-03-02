import React, { useState, useEffect } from 'react';
import {
    FiCheckCircle,
    FiXCircle,
    FiCalendar,
    FiMapPin,
    FiArrowRight,
    FiFilter,
    FiClock,
    FiBox
} from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import './DeliveryHistory.css';

const DeliveryHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await deliveryService.getHistory();
            if (res.success) {
                setHistory(res.data.orders);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Fetching your records...</p></div>;

    return (
        <div className="history-container fade-in">
            <div className="history-header">
                <h1 className="page-title">Work History</h1>
                <button className="filter-btn"><FiFilter /></button>
            </div>

            <div className="history-summary-marquee">
                <div className="h-card-mini">
                    <span className="h-lbl">Total Deliveries</span>
                    <span className="h-val">{history.length}</span>
                </div>
                <div className="h-divider"></div>
                <div className="h-card-mini">
                    <span className="h-lbl">Avg Time</span>
                    <span className="h-val">
                        {history.length > 0 && history.some(o => o.actualDeliveryTime) ? (
                            Math.round(history.filter(o => o.actualDeliveryTime).reduce((acc, curr) => acc + (new Date(curr.actualDeliveryTime) - new Date(curr.createdAt)) / 60000, 0) / history.filter(o => o.actualDeliveryTime).length) + ' mins'
                        ) : '--'}
                    </span>
                </div>
            </div>

            <div className="history-timeline">
                {history.length === 0 ? (
                    <div className="empty-history">
                        <FiCalendar className="empty-icon" />
                        <h3>No records found</h3>
                        <p>Your completed deliveries will appear here.</p>
                    </div>
                ) : (
                    history.map((order) => (
                        <div key={order._id} className="history-record-premium">
                            <div className="record-header-v2">
                                <div className="record-main-info">
                                    <span className="order-number">ORD #{order.orderNumber}</span>
                                    <span className="record-date">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`record-status-badge ${order.status}`}>
                                    {order.status === 'delivered' ? <FiCheckCircle /> : <FiXCircle />}
                                    {order.status}
                                </div>
                            </div>

                            <div className="record-body-v2">
                                <div className="location-info">
                                    <FiMapPin />
                                    <span>
                                        {[
                                            order.deliveryAddress.addressLine1,
                                            order.deliveryAddress.addressLine2,
                                            order.deliveryAddress.landmark,
                                            order.deliveryAddress.city,
                                            order.deliveryAddress.pincode
                                        ].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                                <div className="earning-info-v2">
                                    <span className="earning-lbl">Time Taken</span>
                                    <span className="earning-val">
                                        {order.actualDeliveryTime ? Math.round((new Date(order.actualDeliveryTime) - new Date(order.createdAt)) / 60000) + ' min' : '--'}
                                    </span>
                                </div>
                            </div>

                            <div className="record-footer">
                                <span className="item-count">{order.items.length} Items Delivered</span>
                                <FiArrowRight className="arrow-icon" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;
