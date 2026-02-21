import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    FiTrendingUp,
    FiCheckCircle,
    FiDollarSign,
    FiNavigation,
    FiPhone,
    FiMapPin,
    FiAward,
    FiClock,
    FiZap
} from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const { isOnline } = useOutletContext();
    const [stats, setStats] = useState({
        todayEarnings: 160,
        todayDeliveries: 4,
        onlineHours: '5.2',
        rating: 4.9
    });
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await deliveryService.getCurrentDelivery();
            if (res.success) {
                setCurrentOrder(res.data.order);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOnline && !currentOrder) {
        return (
            <div className="offline-state-container fade-in">
                <div className="offline-card glass">
                    <div className="status-badge-offline">Currently Resting</div>
                    <h1>{greeting}, Partner!</h1>
                    <p>You've completed <strong>{stats.todayDeliveries} orders</strong> today. Go online to earn more!</p>

                    <div className="mini-stats-grid">
                        <div className="m-stat glass">
                            <FiDollarSign />
                            <span>₹{stats.todayEarnings}</span>
                        </div>
                        <div className="m-stat glass">
                            <FiCheckCircle />
                            <span>{stats.todayDeliveries}</span>
                        </div>
                        <div className="m-stat glass">
                            <FiClock />
                            <span>{stats.onlineHours}h</span>
                        </div>
                    </div>
                </div>

                <div className="offline-info-cards">
                    <div className="info-card glass">
                        <FiZap />
                        <div className="info-txt">
                            <h4>Peak Hours</h4>
                            <p>6:00 PM - 10:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-content fade-in">
            <div className="welcome-section">
                <span>{greeting},</span>
                <h1>Delivery Partner</h1>
            </div>

            <div className="stats-marquee glass">
                <div className="marquee-item">
                    <div className="m-icon earnings"><FiDollarSign /></div>
                    <div className="m-data">
                        <span className="m-val">₹{stats.todayEarnings}</span>
                        <span className="m-lbl">Earnings</span>
                    </div>
                </div>
                <div className="m-divider"></div>
                <div className="marquee-item">
                    <div className="m-icon orders"><FiCheckCircle /></div>
                    <div className="m-data">
                        <span className="m-val">{stats.todayDeliveries}</span>
                        <span className="m-lbl">Orders</span>
                    </div>
                </div>
                <div className="m-divider"></div>
                <div className="marquee-item">
                    <div className="m-icon rating"><FiAward /></div>
                    <div className="m-data">
                        <span className="m-val">{stats.rating}</span>
                        <span className="m-lbl">Rating</span>
                    </div>
                </div>
            </div>

            {currentOrder ? (
                <div className="order-notification-hero glass pulse-border">
                    <div className="notif-header">
                        <span className="active-dot"></span>
                        <h3>Active Delivery Assigned</h3>
                    </div>
                    <div className="order-preview-card">
                        <div className="order-loc">
                            <FiMapPin className="pin-icon" />
                            <div>
                                <h4>{currentOrder.deliveryAddress.fullName}</h4>
                                <p>{currentOrder.deliveryAddress.landmark}, {currentOrder.deliveryAddress.city}</p>
                            </div>
                        </div>
                        <div className="order-meta">
                            <span>{currentOrder.items.length} Items</span>
                            <span className="dot"></span>
                            <span>₹{currentOrder.totalAmount}</span>
                        </div>
                    </div>
                    <Link to="/delivery/orders" className="hero-action-btn">
                        Manage Task <FiNavigation />
                    </Link>
                </div>
            ) : (
                <div className="searching-hero glass">
                    <div className="radar-v2">
                        <div className="r-ring"></div>
                        <div className="r-ring"></div>
                        <div className="r-center"></div>
                    </div>
                    <h2>Scanning Your Area</h2>
                    <p>New orders will appear here automatically</p>
                </div>
            )}

            <div className="performance-section">
                <h2 className="section-title">Your Performance</h2>
                <div className="perf-grid">
                    <div className="perf-card glass">
                        <div className="perf-header">
                            <span className="perf-lbl">Ontime Delivery</span>
                            <span className="perf-val">98%</span>
                        </div>
                        <div className="progress-bar"><div className="fill" style={{ width: '98%' }}></div></div>
                    </div>
                    <div className="perf-card glass">
                        <div className="perf-header">
                            <span className="perf-lbl">Acceptance Rate</span>
                            <span className="perf-val">92%</span>
                        </div>
                        <div className="progress-bar"><div className="fill" style={{ width: '92%' }}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
