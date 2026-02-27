import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome,
    FiPackage,
    FiClock,
    FiSettings,
    FiLogOut,
    FiBell,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryLayout.css';

const DeliveryLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial load: Sync with backend status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await deliveryService.getProfile();
                if (res.success) {
                    setIsOnline(res.data.agent.isOnline);
                    localStorage.setItem('delivery_online_status', res.data.agent.isOnline);
                }
            } catch (error) {
                console.error("Failed to fetch agent status:", error);
                // Fallback to localStorage if API fails
                const saved = localStorage.getItem('delivery_online_status');
                if (saved) setIsOnline(saved === 'true');
            }
        };
        fetchStatus();
    }, []);

    const toggleStatus = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await deliveryService.toggleAvailability();
            if (res.success) {
                const newStatus = res.data.agent.isOnline;
                setIsOnline(newStatus);
                localStorage.setItem('delivery_online_status', newStatus);
                toast.success(newStatus ? "You are now ONLINE" : "You are now OFFLINE", {
                    icon: newStatus ? '🟢' : '🔴'
                });
            } else {
                toast.error(res.message || "Failed to toggle status");
            }
        } catch (error) {
            console.error("Toggle error:", error);
            toast.error(error.response?.data?.message || "Server connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="delivery-container">
            {/* Header */}
            <header className="delivery-header">
                <div className="header-left">
                    <div className="agent-avatar">
                        {user?.name?.charAt(0) || 'D'}
                    </div>
                    <div className="agent-info">
                        <h3>{user?.name || 'Delivery Partner'}</h3>
                        <p>ID: #AG{user?._id?.substring(0, 6)}</p>
                    </div>
                </div>

                <div className="header-right">
                    <div className={`status-pill ${isOnline ? 'online' : 'offline'}`} onClick={toggleStatus}>
                        {loading ? (
                            <div className="mini-spinner"></div>
                        ) : (
                            <>
                                <span className="status-dot"></span>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </>
                        )}
                    </div>
                    <button className="nav-icon-btn">
                        <FiBell />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="delivery-main">
                <Outlet context={{ isOnline }} />
            </main>

            {/* Bottom Navigation */}
            <nav className="delivery-bottom-nav">
                <Link to="/delivery" className={`nav-item ${location.pathname === '/delivery' ? 'active' : ''}`}>
                    <FiHome />
                    <span>Dashboard</span>
                </Link>
                <Link to="/delivery/orders" className={`nav-item ${location.pathname === '/delivery/orders' ? 'active' : ''}`}>
                    <FiPackage />
                    <span>Active</span>
                </Link>
                <Link to="/delivery/history" className={`nav-item ${location.pathname === '/delivery/history' ? 'active' : ''}`}>
                    <FiClock />
                    <span>History</span>
                </Link>
                <button onClick={handleLogout} className="nav-item logout-btn">
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default DeliveryLayout;
