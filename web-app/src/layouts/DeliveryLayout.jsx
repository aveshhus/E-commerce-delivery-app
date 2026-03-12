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

    const NavItems = [
        { path: '/delivery', icon: <FiHome />, label: 'Home' },
        { path: '/delivery/orders', icon: <FiPackage />, label: 'Orders' },
        { path: '/delivery/route', icon: <FiMapPin />, label: 'Route' },
        { path: '/delivery/performance', icon: <FiBarChart2 />, label: 'Performance' },
        { path: '/delivery/menu', icon: <FiMenu />, label: 'Menu' },
    ];

    return (
        <div className="delivery-container">
            {/* Desktop Sidebar */}
            <aside className="delivery-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">KM</div>
                    <span>Operations</span>
                </div>
                
                <div className="sidebar-agent-card">
                    <div className="agent-avatar">
                        {user?.name?.charAt(0) || 'D'}
                    </div>
                    <div className="agent-info">
                        <h3>{user?.name || 'Partner'}</h3>
                        <p>{agentData?.employeeId || 'KM-PENDING'}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NavItems.map(item => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            className={`sidebar-item ${location.pathname === item.path || (item.path !== '/delivery' && location.pathname.startsWith(item.path)) ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className={`status-toggle ${isOnline ? 'online' : 'offline'}`} onClick={toggleStatus}>
                        <div className="status-indicator"></div>
                        <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <FiLogOut /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="delivery-content-wrapper">
                {/* Mobile/Tablet Header */}
                {location.pathname !== '/delivery' && (
                    <header className="delivery-header mobile-only">
                        <div className="header-left">
                            <div className="agent-avatar small">
                                {user?.name?.charAt(0) || 'D'}
                            </div>
                            <div className="agent-info">
                                <h3>{user?.name || 'Partner'}</h3>
                            </div>
                        </div>
                        <div className="header-right">
                            <div className={`status-pill ${isOnline ? (isOnBreak ? 'break' : 'online') : 'offline'}`} onClick={toggleStatus}>
                                <span className="status-dot"></span>
                                {isOnline ? (isOnBreak ? 'BRK' : 'ON') : 'OFF'}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content Area */}
                <main className={`delivery-main ${location.pathname === '/delivery' ? 'is-dashboard' : ''}`}>
                    <div className="content-inner">
                        <Outlet context={{ isOnline, isOnBreak, agentData, toggleStatus, toggleBreakMode, loading }} />
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="delivery-bottom-nav">
                    {NavItems.map(item => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path || (item.path !== '/delivery' && location.pathname.startsWith(item.path)) ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default DeliveryLayout;
