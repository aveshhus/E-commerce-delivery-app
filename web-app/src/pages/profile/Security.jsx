import { useState } from 'react';
import { Lock, Shield, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const Security = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        setLoading(true);
        try {
            const { authAPI } = await import('../../services/api');
            const res = await authAPI.changePassword({ currentPassword, newPassword });
            if (res.success) {
                toast.success(res.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">Account Security</h2>

            <div className="profile-card mb-6">
                <h3 className="section-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} /> Change Password
                </h3>
                <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            <div className="profile-card">
                <h3 className="section-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} /> Two-Factor Authentication
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Add an extra layer of security to your account.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Smartphone size={24} color="var(--primary)" />
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>SMS Authentication</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Receive a code via SMS to log in</div>
                        </div>
                    </div>
                    <button className="outline-btn" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => toast('Coming soon!')}>Enable</button>
                </div>
            </div>
        </div>
    );
};

export default Security;
