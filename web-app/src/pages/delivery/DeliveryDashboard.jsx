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
    FiMap,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiCoffee,
    FiPower,
    FiTruck
} from 'react-icons/fi';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const { isOnline, isOnBreak, agentData, toggleStatus, toggleBreakMode, loading: contextLoading } = useOutletContext();
    const [stats, setStats] = useState({
        todayDeliveries: 0,
        kmDriven: 0,
        avgDeliveryTime: '--',
        rating: 5.0,
        performance: {
            onTimePercentage: 100,
            grade: 'A'
        },
        attendance: [],
        announcements: [],
        checkInTime: null,
        checkOutTime: null
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
        const interval = setInterval(fetchDashboardData, 10000);
        return () => {
            clearInterval(interval);
            document.title = "KM Operations";
        };
    }, [isOnline, isOnBreak]);

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
                if (!currentOrder && newOrder) {
                    playNotification();
                    toast.success("🚨 NEW TASK ASSIGNED!", { duration: 6000 });
                }
                setCurrentOrder(newOrder);
            }

            if (profileRes.success) {
                setStats({
                    todayDeliveries: agent.totalDeliveries || 0,
                    kmDriven: agent.kmDriven?.today || 0,
                    avgDeliveryTime: agent.avgDeliveryTime || '--',
                    rating: agent.rating?.average || 5.0,
                    performance: agent.performance || { onTimePercentage: 100, grade: 'A' },
                    attendance: agent.attendance || [],
                    announcements: agent.announcements || [],
                    checkInTime: agent.checkInTime,
                    checkOutTime: agent.checkOutTime
                });
            }
        } catch (error) {
            console.error("Dashboard sync error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Status state
    let activeStatus = 'offline';
    if (isOnline) {
        if (currentOrder) activeStatus = 'delivery';
        else if (isOnBreak) activeStatus = 'break';
        else activeStatus = 'available';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = stats.attendance.find(a => a.date === todayStr);

    // Unified status logic is handled via toggleStatus in Layout context

    return (
        <div className="op-dashboard-container">
            {/* Top Identity Section */}
            <div className="op-welcome-card">
                <div className="op-welcome-header">
                    <h2>👋 {greeting}, {agentData?.name?.split(' ')[0] || 'Partner'}</h2>
                    <br />
                    <span className="op-emp-badge">EMP: {agentData?.employeeId || 'KM-PENDING'}</span>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <div style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>⭐ 5 Star Hero</div>
                        <div style={{ background: 'rgba(0,177,79,0.1)', color: '#00B14F', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>🚀 100 Orders Club</div>
                    </div>
                </div>
                <div className="op-shift-details">
                    <div className="op-shift-item">
                        <FiMapPin /> <span>{agentData?.hubName || 'Main Hub'}</span>
                    </div>
                    <div className="op-shift-item">
                        <FiClock /> <span>{agentData?.shiftTime || '09:00 AM - 06:00 PM'}</span>
                    </div>
                </div>

                <div className="op-work-meta" style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <div className={`status-tag ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? 'SHIFT ACTIVE' : 'SHIFT INACTIVE'}
                    </div>
                    {stats.checkInTime && (
                        <div className="check-in-info" style={{ fontSize: '12px', color: 'var(--op-text-secondary)' }}>
                            Started at: <strong>{new Date(stats.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                    )}
                </div>
            </div>

            {/* Current Status Toggle Grid */}
            <div className="op-status-grid">
                <button
                    disabled={contextLoading || currentOrder}
                    onClick={() => { if (!isOnline) toggleStatus(); else if (isOnBreak) toggleBreakMode(); }}
                    className={`op-status-btn ${activeStatus === 'available' ? 'active available' : ''}`}
                >
                    <div className="op-s-dot s-green"></div>
                    Available
                </button>
                <div className={`op-status-btn disabled ${activeStatus === 'delivery' ? 'active delivery' : ''}`}>
                    <div className="op-s-dot s-yellow"></div>
                    On Delivery
                </div>
                <button
                    disabled={contextLoading || currentOrder || !isOnline}
                    onClick={toggleBreakMode}
                    className={`op-status-btn ${activeStatus === 'break' ? 'active break' : ''}`}
                >
                    <div className="op-s-dot s-red"></div>
                    Break
                </button>
                <button
                    disabled={contextLoading || currentOrder}
                    onClick={() => { if (isOnline) toggleStatus(); }}
                    className={`op-status-btn ${activeStatus === 'offline' ? 'active offline' : ''}`}
                >
                    <div className="op-s-dot s-black"></div>
                    Offline
                </button>
            </div>

            {/* Performance Snapshot */}
            <h3 className="op-section-title">Performance Snapshot</h3>
            <div className="op-perf-grid">
                <div className="op-perf-box">
                    <strong>{stats.todayDeliveries}</strong>
                    <span>Orders Today</span>
                </div>
                <div className="op-perf-box">
                    <strong style={{ color: stats.performance.onTimePercentage > 90 ? '#0C831F' : '#E23744' }}>
                        {stats.performance.onTimePercentage}%
                    </strong>
                    <span>On-Time %</span>
                </div>
                <div className="op-perf-box">
                    <strong>{stats.avgDeliveryTime}</strong>
                    <span>Avg Time</span>
                </div>
                <div className="op-perf-box">
                    <strong>{stats.kmDriven} km</strong>
                    <span>KM Covered</span>
                </div>
                <div className="op-perf-box">
                    <strong>⭐ {stats.rating.toFixed(1)}</strong>
                    <span>Rating</span>
                </div>
                <div className="op-perf-box">
                    <strong style={{ color: presentToday ? '#0C831F' : '#E23744' }}>
                        {presentToday ? 'Present' : 'Absent'}
                    </strong>
                    <span>Attendance</span>
                </div>
            </div>

            {/* Task Router Card */}
            {
                currentOrder ? (
                    <div className="op-task-card">
                        <div className="op-tc-head">
                            <span className="op-tc-badge">Active Task</span>
                            <div className="op-tc-timer">15m Left</div>
                        </div>
                        <h4>Delivery to {currentOrder.deliveryAddress?.fullName}</h4>
                        <p>{currentOrder.deliveryAddress?.landmark}, {currentOrder.deliveryAddress?.city}</p>
                        <Link to="/delivery/orders" className="op-btn-primary">
                            Open Order Screen <FiChevronRight />
                        </Link>
                    </div>
                ) : (
                    <div className="op-radar-card">
                        {isOnline && !isOnBreak ? (
                            <>
                                <div className="op-radar-anim">
                                    <FiActivity />
                                </div>
                                <h4>Scanning for Orders</h4>
                                <p>Stay within 2km of {agentData?.hubName || 'Main Hub'}</p>
                            </>
                        ) : (
                            <div className="op-radar-inactive">
                                {isOnBreak ? <FiCoffee className="inactive-icon" /> : <FiPower className="inactive-icon" />}
                                <h4>{isOnBreak ? "You're on Break" : "Currently Offline"}</h4>
                                <p>{isOnBreak ? "Enjoy your coffee. End break to resume." : "Go online to start receiving orders."}</p>
                            </div>
                        )}
                    </div>
                )
            }

            <div className="op-perf-warning-card">
                <div className="op-pwc-left">
                    <span>Performance Grade</span>
                    <h1 style={{ color: stats.performance.grade === 'A' ? '#0C831F' : '#E23744' }}>{stats.performance.grade}</h1>
                </div>
                <div className="op-pwc-right">
                    <p>Keep your On-Time delivery above 95% to maintain Grade A.</p>
                </div>
            </div>

            {/* Announcements Section */}
            {
                stats.announcements && stats.announcements.length > 0 && (
                    <div className="announcements-section" style={{ marginTop: '32px' }}>
                        <h3 className="op-section-title">📢 Announcements</h3>
                        <div className="announcements-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.announcements.map(ann => (
                                <div key={ann._id} className="announcement-card" style={{ background: 'var(--op-card-bg)', border: '1px solid var(--op-border)', borderRadius: '12px', padding: '16px' }}>
                                    <h4 style={{ color: '#FFB800', marginBottom: '8px', fontSize: '15px' }}>{ann.title}</h4>
                                    <p style={{ color: 'var(--op-text-secondary)', fontSize: '13px', lineHeight: '1.4' }}>{ann.content}</p>
                                    <small style={{ color: 'var(--op-border)', fontSize: '11px', marginTop: '8px', display: 'block' }}>
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            <br /><br /><br />
        </div >
    );
};

export default DeliveryDashboard;
