import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBell,
    FiChevronLeft,
    FiDollarSign,
    FiPackage,
    FiInfo,
    FiClock,
    FiCheckCircle
} from 'react-icons/fi';
import './DeliveryDashboard.css';

const DeliveryNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Mock notifications based on user requirements
        const mockNotifs = [
            {
                id: 1,
                title: 'Salary Credited',
                content: 'Your salary for February has been credited to your bank account.',
                type: 'salary',
                time: '2h ago',
                icon: <FiDollarSign />,
                color: '#00B14F'
            },
            {
                id: 2,
                title: 'New Policy Update',
                content: 'Please review the updated safety guidelines for night shifts.',
                type: 'info',
                time: '1d ago',
                icon: <FiInfo />,
                color: '#1A73E8'
            },
            {
                id: 3,
                title: '5 Star Rating!',
                content: 'Customer Rahul gave you a 5-star rating for Order #54321.',
                type: 'success',
                time: '3d ago',
                icon: <FiCheckCircle />,
                color: '#FFB800'
            },
            {
                id: 4,
                title: 'Performance Milestone',
                content: 'Congratulations! You have completed 100 on-time deliveries this month.',
                type: 'achievement',
                time: '1w ago',
                icon: <FiPackage />,
                color: '#9333EA'
            }
        ];
        setNotifications(mockNotifs);
    }, []);

    return (
        <div className="op-dashboard-container fade-in" style={{ paddingBottom: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => navigate('/delivery/menu')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: 0 }}>
                    <FiChevronLeft />
                </button>
                <h2 className="op-section-title" style={{ margin: 0 }}>Notifications</h2>
            </div>

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#949CA4' }}>
                    <FiBell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p>All caught up! No new notifications.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map(notif => (
                        <div key={notif.id} className="op-welcome-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{
                                background: `${notif.color}15`,
                                color: notif.color,
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: '20px'
                            }}>
                                {notif.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, fontSize: '15px', color: 'white' }}>{notif.title}</h4>
                                    <small style={{ color: '#949CA4', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FiClock /> {notif.time}
                                    </small>
                                </div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#949CA4', lineHeight: '1.4' }}>{notif.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="op-logout-btn" style={{ background: 'transparent', border: '1px solid var(--op-border)', color: '#949CA4' }}>
                Clear All Notifications
            </button>

            <br /><br /><br />
        </div>
    );
};

export default DeliveryNotifications;
