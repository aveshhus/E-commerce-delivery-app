import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    FiNavigation,
    FiMapPin,
    FiClock,
    FiZap,
    FiTarget,
    FiChevronRight,
    FiActivity,
    FiMap
} from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const { isOnline } = useOutletContext();
    const [stats, setStats] = useState({
        todayDeliveries: 0,
        pendingOrders: 0,
        onlineHours: '0.0',
        avgDeliveryTime: '--',
        rating: 5.0,
        shiftGoal: 20 // Fixed shift target
    });
    const [prevOrderId, setPrevOrderId] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => {
            clearInterval(interval);
            document.title = "Krishna Marketing";
        };
    }, [isOnline]);

    const playNotification = () => {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime);
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.5);
        } catch (e) { console.log("Audio not supported"); }
    };

    const fetchDashboardData = async () => {
        try {
            const [orderRes, profileRes] = await Promise.all([
                deliveryService.getCurrentDelivery(),
                deliveryService.getProfile()
            ]);

            if (orderRes.success) {
                const newOrder = orderRes.data.order;
                setCurrentOrder(newOrder);

                if (newOrder && newOrder._id !== prevOrderId) {
                    setPrevOrderId(newOrder._id);
                    if (prevOrderId !== null) {
                        playNotification();
                        toast.success("🚨 NEW TASK ASSIGNED!", { duration: 6000 });
                        document.title = "🚨 NEW TASK - KM";
                    } else if (newOrder) {
                        setPrevOrderId(newOrder._id);
                    }
                } else if (!newOrder) {
                    setPrevOrderId(null);
                    document.title = isOnline ? "ONLINE - KM Partner" : "OFFLINE - KM Partner";
                }
            }

            if (profileRes.success) {
                const agent = profileRes.data.agent;
                setStats(prev => ({
                    ...prev,
                    todayDeliveries: agent.totalDeliveries || prev.todayDeliveries,
                    pendingOrders: agent.pendingOrders || prev.pendingOrders,
                    onlineHours: agent.onlineHours || prev.onlineHours,
                    avgDeliveryTime: agent.avgDeliveryTime || prev.avgDeliveryTime,
                    rating: agent.rating?.average || prev.rating
                }));
            }
        } catch (error) {
            console.error("Dashboard sync error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOnline && !currentOrder) {
        return (
            <div className="zep-dashboard-content">
                <div className="zep-offline-hero">
                    <div className="zep-offline-badge">Currently Offline</div>
                    <h1>{greeting}, Partner!</h1>
                    <p>You've completed <strong>{stats.todayDeliveries} orders</strong> today. Go online to start your shift.</p>
                </div>

                <div className="zep-stats-overview">
                    <div className="zep-stat-box">
                        <div className="zep-stat-val">{stats.todayDeliveries}</div>
                        <div className="zep-stat-lbl">Orders</div>
                    </div>
                    <div className="zep-stat-box">
                        <div className="zep-stat-val">{stats.avgDeliveryTime}</div>
                        <div className="zep-stat-lbl">Avg Time</div>
                    </div>
                    <div className="zep-stat-box">
                        <div className="zep-stat-val">{stats.onlineHours}h</div>
                        <div className="zep-stat-lbl">Active Time</div>
                    </div>
                </div>

                <div className="zep-section">
                    <h3 className="zep-section-title">Shift Performance</h3>
                    <div className="zep-feature-card">
                        <div className="zep-fc-icon target"><FiTarget /></div>
                        <div className="zep-fc-content">
                            <h4>Daily Target</h4>
                            <p>Maintain an average delivery time under 15 mins</p>
                            <div className="zep-progress-wrap">
                                <div className="zep-pb"><div className="zep-fill" style={{ width: `${Math.min((stats.todayDeliveries / stats.shiftGoal) * 100, 100)}%` }}></div></div>
                                <span>{stats.todayDeliveries}/{stats.shiftGoal} Orders</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="zep-dashboard-content">
            <div className="zep-header-stats">
                <div className="zep-hs-left">
                    <span className="zep-hs-lbl">Completed Orders</span>
                    <h2 className="zep-hs-val">{stats.todayDeliveries}</h2>
                </div>
                <div className="zep-hs-right">
                    <div className="zep-mini-stat">
                        <span>Avg Time</span>
                        <strong>{stats.avgDeliveryTime}</strong>
                    </div>
                    <div className="zep-mini-stat">
                        <span>Active</span>
                        <strong>{stats.onlineHours}h</strong>
                    </div>
                </div>
            </div>

            {currentOrder ? (
                <div className="zep-active-task-wrapper">
                    <div className="zep-active-task-card">
                        <div className="zep-atc-header">
                            <div className="zep-pulse-dot"></div>
                            <span>Active Order Assigned</span>
                        </div>
                        <div className="zep-atc-body">
                            <div className="zep-location-row">
                                <FiMapPin className="zep-icon-pin" />
                                <div>
                                    <h4>{currentOrder.deliveryAddress.fullName}</h4>
                                    <p>{currentOrder.deliveryAddress.landmark}, {currentOrder.deliveryAddress.city}</p>
                                </div>
                            </div>
                            <div className="zep-task-meta">
                                <div className="zep-tm-item">
                                    <span>Items</span>
                                    <strong>{currentOrder.items.length}</strong>
                                </div>
                                <div className="zep-tm-item">
                                    <span>Assigned</span>
                                    <strong>{new Date(currentOrder.updatedAt || currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                </div>
                                <div className="zep-tm-item">
                                    <span>Target</span>
                                    <strong className="zep-highlight">15 mins</strong>
                                </div>
                            </div>
                        </div>
                        <Link to="/delivery/orders" className="zep-btn-primary">
                            View Task Details <FiChevronRight />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="zep-scanning-wrapper">
                    <div className="zep-radar-container">
                        <div className="zep-radar-ring r1"></div>
                        <div className="zep-radar-ring r2"></div>
                        <div className="zep-radar-ring r3"></div>
                        <div className="zep-radar-core">
                            <FiActivity />
                        </div>
                    </div>
                    <h3>Finding nearby orders</h3>
                    <p>Stay near the dark store for faster pairing</p>
                </div>
            )}

            <div className="zep-section">
                <div className="zep-section-header">
                    <h3 className="zep-section-title">Store Operations</h3>
                </div>
                <div className="zep-stats-overview" style={{ marginBottom: 0 }}>
                    <div className="zep-stat-box">
                        <div className="zep-stat-val" style={{ color: '#E23744' }}>{stats.pendingOrders}</div>
                        <div className="zep-stat-lbl">Pending</div>
                    </div>
                    <div className="zep-stat-box">
                        <div className="zep-stat-val">{stats.avgDeliveryTime}</div>
                        <div className="zep-stat-lbl">Store Avg</div>
                    </div>
                    <div className="zep-stat-box">
                        <div className="zep-stat-val">⭐ {stats.rating}</div>
                        <div className="zep-stat-lbl">Rating</div>
                    </div>
                </div>
            </div>

            <div className="zep-section">
                <h3 className="zep-section-title">Shift Progress</h3>
                <div className="zep-target-card">
                    <div className="zep-tc-header">
                        <div>
                            <h4>Daily Goal: {stats.shiftGoal} Orders</h4>
                            <p>Maintain fast and safe deliveries</p>
                        </div>
                        <div className="zep-tc-badge" style={{ background: '#E3F2FD', color: '#1E88E5' }}>On Track</div>
                    </div>
                    <div className="zep-progress-wrap large">
                        <div className="zep-pb">
                            <div className="zep-fill" style={{ width: `${Math.min((stats.todayDeliveries / stats.shiftGoal) * 100, 100)}%` }}></div>
                        </div>
                        <span className="zep-prog-text">{stats.todayDeliveries} / {stats.shiftGoal} Orders Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
