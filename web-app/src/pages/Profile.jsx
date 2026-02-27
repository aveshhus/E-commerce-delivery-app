import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Calendar, Mail, Phone, Lock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: ''
    });

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || ''
            });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.updateProfile(form);
            if (res.success) {
                updateUser(res.data.user);
                toast.success('Profile updated successfully!');
            }
        } catch (err) {
            toast.error(err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Personal Information</h2>
            <div className="profile-card">
                <form onSubmit={handleUpdate}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    className="form-input"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div className="input-with-icon">
                                <Phone size={18} className="input-icon" />
                                <input
                                    className="form-input"
                                    value={form.phone}
                                    disabled
                                    style={{ background: 'var(--bg)', cursor: 'not-allowed' }}
                                />
                                <Lock size={14} className="input-status-icon" />
                            </div>
                            <span className="input-hint">Phone number cannot be changed.</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <div className="input-with-icon">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    className="form-input"
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <div className="gender-options">
                                {['male', 'female', 'other'].map(g => (
                                    <label key={g} className={`gender-radio ${form.gender === g ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={form.gender === g}
                                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                            style={{ display: 'none' }}
                                        />
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '24px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {['delivery', 'admin', 'superadmin'].includes(user?.role?.toLowerCase()) ? (
                <div className="partner-mode-card" style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, rgba(20, 255, 236, 0.1) 0%, rgba(0, 210, 255, 0.1) 100%)', borderRadius: '16px', border: '1px solid rgba(20, 255, 236, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={20} color="var(--primary)" />
                            Partner Dashboard
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Manage deliveries and track your earnings.
                        </p>
                    </div>
                    <Link to="/delivery" className="btn btn-primary" style={{ background: 'var(--primary)', color: '#000', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700' }}>
                        Open Portal
                    </Link>
                </div>
            ) : (
                <div className="partner-mode-card" style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, rgba(255, 159, 28, 0.1) 0%, rgba(255, 75, 75, 0.1) 100%)', borderRadius: '16px', border: '1px solid rgba(255, 159, 28, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={20} color="#FF9F1C" />
                            Earn with Us
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Become a Delivery Partner and start earning today.
                        </p>
                    </div>
                    <Link to="/partner-apply" className="btn btn-primary" style={{ background: '#FF9F1C', color: '#000', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700' }}>
                        Apply Now
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Profile;
