import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, publicAPI, addressAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [addresses, setAddresses] = useState([]);
    const [loyalty, setLoyalty] = useState({ balance: 0, history: [] });
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
        }
        fetchAddresses();
        fetchLoyalty();
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const res = await addressAPI.getAddresses();
            if (res.success) setAddresses(res.data.addresses);
        } catch (err) { console.error(err); }
    };

    const fetchLoyalty = async () => {
        try {
            const res = await publicAPI.getLoyalty();
            if (res.success) setLoyalty(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await authAPI.updateProfile(form);
            if (res.success) {
                updateUser(res.data.user);
                setEditing(false);
                toast.success('Profile updated!');
            }
        } catch (err) {
            toast.error(err.message || 'Update failed');
        }
    };

    return (
        <div className="profile-page fade-in">
            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="profile-name">{user?.name}</h2>
                        <p className="profile-email">{user?.email}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.phone}</p>
                    </div>
                </div>

                {editing ? (
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setEditing(true)}>Edit Profile</button>
                )}
            </div>

            {/* Loyalty Card */}
            <div className="loyalty-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="loyalty-label">Loyalty Points</div>
                        <div className="loyalty-balance">{user?.loyaltyPoints || loyalty.balance || 0}</div>
                        <div className="loyalty-label">Worth ₹{((user?.loyaltyPoints || 0) / 10).toFixed(0)}</div>
                    </div>
                    <Award size={48} style={{ opacity: 0.3 }} />
                </div>
            </div>

            {/* Addresses */}
            <div className="profile-card">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={20} /> My Addresses
                </h3>
                {addresses.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No addresses added yet</p>
                ) : (
                    addresses.map(addr => (
                        <div key={addr._id} className="address-option" style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '13px' }}>
                                    {addr.label} {addr.isDefault && <span style={{ color: 'var(--primary)', fontSize: '11px' }}>• Default</span>}
                                </span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {addr.fullName}, {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}{addr.city} - {addr.pincode}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{addr.phone}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Profile;
