import {
    User, MapPin, ShieldCheck, CreditCard, Package, Heart,
    Wallet, Tag, Bell, Share2, HelpCircle, LogOut, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: User, label: 'Personal Information', path: '/profile' },
        ...(user?.role === 'delivery' ? [{ icon: Package, label: 'Delivery Dashboard', path: '/delivery' }] : []),
        { icon: MapPin, label: 'Saved Addresses', path: '/profile/addresses' },
        { icon: ShieldCheck, label: 'Account Security', path: '/profile/security' },
        { icon: CreditCard, label: 'Payment Methods', path: '/profile/payments' },
        { icon: Package, label: 'My Orders', path: '/orders' },
        { icon: Heart, label: 'Favorites', path: '/profile/favorites' },
        { icon: Wallet, label: 'Wallet & Credits', path: '/profile/wallet' },
        { icon: Tag, label: 'Offers & Coupons', path: '/profile/offers' },
        { icon: Bell, label: 'Notifications', path: '/profile/notifications' },
        { icon: HelpCircle, label: 'Support & Help', path: '/profile/support' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="profile-sidebar">
            <div className="profile-sidebar-menu">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={index}
                            className={`profile-menu-item ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon size={20} className="menu-icon" />
                            <span className="menu-label">{item.label}</span>
                            <ChevronRight size={16} className="menu-arrow" />
                        </div>
                    );
                })}

                <div className="profile-menu-divider"></div>

                <div className="profile-menu-item logout" onClick={handleLogout}>
                    <LogOut size={20} className="menu-icon" />
                    <span className="menu-label">Log Out</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;
