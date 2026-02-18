import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Truck, Tag,
    Ticket, Bell, BarChart3, Settings, LogOut, Box
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('km_admin_token');
        localStorage.removeItem('km_admin_user');
        navigate('/login');
    };

    const links = [
        {
            label: 'MAIN', items: [
                { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            ]
        },
        {
            label: 'MANAGEMENT', items: [
                { to: '/products', icon: <Package size={18} />, label: 'Products' },
                { to: '/categories', icon: <Box size={18} />, label: 'Categories' },
                { to: '/orders', icon: <ShoppingCart size={18} />, label: 'Orders' },
                { to: '/customers', icon: <Users size={18} />, label: 'Customers' },
                { to: '/delivery', icon: <Truck size={18} />, label: 'Delivery Agents' },
            ]
        },
        {
            label: 'MARKETING', items: [
                { to: '/offers', icon: <Tag size={18} />, label: 'Offers & Banners' },
                { to: '/coupons', icon: <Ticket size={18} />, label: 'Coupons' },
                { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
            ]
        },
        {
            label: 'ANALYTICS', items: [
                { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Reports' },
            ]
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h2>
                    <span className="sidebar-brand-icon">K</span>
                    Krishna Marketing
                </h2>
                <p>Admin Dashboard</p>
            </div>

            <nav className="sidebar-nav">
                {links.map((group, gi) => (
                    <div key={gi}>
                        <div className="sidebar-label">{group.label}</div>
                        {group.items.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === '/'}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                {link.icon}
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
