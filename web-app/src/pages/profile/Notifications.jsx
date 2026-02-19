import { useState, useEffect } from 'react';
import { Bell, Truck, Tag, CreditCard, Inbox } from 'lucide-react';
import { userAPI } from '../../services/api';

const Notifications = () => {
    // Professional empty state - no mocked data
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await userAPI.getNotifications();
                if (res.success) {
                    setNotifications(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Notifications</h2>

            {notifications.length === 0 ? (
                <div className="profile-empty-state">
                    <div className="empty-icon-container" style={{ background: '#f5f5f5', color: '#bdbdbd' }}>
                        <Inbox size={32} />
                    </div>
                    <h3 className="empty-title">All caught up!</h3>
                    <p className="empty-desc">
                        You have no new notifications. Activity on your orders and offers will show up here.
                    </p>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'read' : ''}`}
                        >
                            <div className="notif-icon" style={{
                                background: notification.type === 'Order' ? '#e3f2fd' :
                                    notification.type === 'Offer' ? '#fff3e0' :
                                        notification.type === 'Wallet' ? '#e8f5e9' : '#f5f5f5',
                                color: notification.type === 'Order' ? '#1976d2' :
                                    notification.type === 'Offer' ? '#ff9800' :
                                        notification.type === 'Wallet' ? '#2e7d32' : '#757575'
                            }}>
                                {notification.type === 'Order' && <Truck size={18} />}
                                {notification.type === 'Offer' && <Tag size={18} />}
                                {notification.type === 'Wallet' && <CreditCard size={18} />}
                                {notification.type === 'System' && <Bell size={18} />}
                            </div>
                            <div className="notif-content">
                                <div className="notif-header">
                                    <h4 className="notif-title">{notification.title}</h4>
                                    <span className="notif-date">{notification.date}</span>
                                </div>
                                <p className="notif-desc">{notification.desc}</p>
                            </div>
                        </div>
                    ))}

                    <button
                        className="btn-text"
                        style={{ width: '100%', textAlign: 'center', marginTop: '16px', display: 'block' }}
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    >
                        Mark all as read
                    </button>

                </div>
            )}
        </div>
    );
};

export default Notifications;
