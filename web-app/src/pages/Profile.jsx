import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Calendar, Mail, Phone, Lock } from 'lucide-react';

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
        </div>
    );
};

export default Profile;
