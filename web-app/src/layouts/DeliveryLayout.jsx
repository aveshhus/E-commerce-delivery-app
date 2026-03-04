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
    FiXCircle,
    FiMapPin,
    FiBarChart2,
    FiMenu
} from 'react-icons/fi';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';
import './DeliveryLayout.css';

const DeliveryLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOnline, setIsOnline] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agentData, setAgentData] = useState(null);

    // Initial load: Sync with backend status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await deliveryService.getProfile();
                if (res.success) {
                    setIsOnline(res.data.agent.isOnline);
                    setIsOnBreak(res.data.agent.isOnBreak);
                    setAgentData(res.data.agent);
                    localStorage.setItem('delivery_online_status', res.data.agent.isOnline);
                }
            } catch (error) {
                console.error("Failed to fetch agent status:", error);
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
                setIsOnline(res.data.agent.isOnline);
                setIsOnBreak(res.data.agent.isOnBreak);
                setAgentData(res.data.agent);
                localStorage.setItem('delivery_online_status', res.data.agent.isOnline);
                toast.success(res.data.agent.isOnline ? "You are now ONLINE" : "You are now OFFLINE");
            }
        } catch (error) {
            console.error("Toggle error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBreakMode = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await deliveryService.toggleBreak();
            if (res.success) {
                setIsOnBreak(res.data.agent.isOnBreak);
                setAgentData(res.data.agent);
                toast.success(res.data.agent.isOnBreak ? "You are on break" : "Break ended. Back online.");
            } else {
                toast.error(res.message || "Cannot toggle break");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Server error");
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
            {/* Header hidden on dashboard to rebuild custom one */}
            {location.pathname !== '/delivery' && (
                <header className="delivery-header">
                    <div className="header-left">
                        <div className="agent-avatar">
                            {user?.name?.charAt(0) || 'D'}
                        </div>
                        <div className="agent-info">
                            <h3>{user?.name || 'Delivery Partner'}</h3>
                            <p>ID: {agentData?.employeeId || '#AG' + user?._id?.substring(0, 6)}</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className={`status-pill ${isOnline ? (isOnBreak ? 'break' : 'online') : 'offline'}`} onClick={toggleStatus}>
                            <span className="status-dot"></span>
                            {isOnline ? (isOnBreak ? 'BREAK' : 'ONLINE') : 'OFFLINE'}
                        </div>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="delivery-main" style={{ paddingTop: location.pathname === '/delivery' ? '0' : '65px' }}>
                <Outlet context={{ isOnline, isOnBreak, agentData, toggleStatus, toggleBreakMode, loading }} />
            </main>

            {/* Bottom Navigation */}
            <nav className="delivery-bottom-nav">
                <Link to="/delivery" className={`nav-item ${location.pathname === '/delivery' ? 'active' : ''}`}>
                    <FiHome />
                    <span>Home</span>
                </Link>
                <Link to="/delivery/orders" className={`nav-item ${location.pathname.includes('/orders') || location.pathname.includes('/history') ? 'active' : ''}`}>
                    <FiPackage />
                    <span>Orders</span>
                </Link>
                <Link to="/delivery/route" className={`nav-item ${location.pathname === '/delivery/route' ? 'active' : ''}`}>
                    <FiMapPin />
                    <span>Route</span>
                </Link>
                <Link to="/delivery/performance" className={`nav-item ${location.pathname === '/delivery/performance' ? 'active' : ''}`}>
                    <FiBarChart2 />
                    <span>Perf</span>
                </Link>
                <Link to="/delivery/menu" className={`nav-item ${location.pathname === '/delivery/menu' ? 'active' : ''}`}>
                    <FiMenu />
                    <span>Menu</span>
                </Link>
            </nav>
        </div>
    );
};

export default DeliveryLayout;
